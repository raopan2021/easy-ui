import type { SelectOption } from '../../select'

import type { DictOption, DictSelectEmits, DictSelectResolvedProps } from './types'
import { computed, onMounted, ref, watch } from 'vue'
import { fetchDictList } from './dict'

/**
 * 字典选择器核心逻辑：字典加载 + 选项归一化 + 事件派发。
 *
 * 将原本内联在 dict-select.vue 中的「请求状态」「options 映射」「事件处理」三段逻辑
 * 抽离为独立 composable，便于单测复用，并让 .vue 仅承担「组合 + 模板」职责
 * （对齐 markdown / progress 拆分规范）。行为与原实现完全一致。
 *
 * emit 以 DictSelectEmits 可调用接口直接标注（不使用 EmitFn<>）。
 *
 * @param props 字典选择器 props（withDefaults 处理后的响应式对象）
 * @param emit 组件事件（update:modelValue / change / clear）
 */
export function useDictSelect(props: DictSelectResolvedProps, emit: DictSelectEmits) {
  // ──── 状态 ────
  /** 当前字典数据 */
  const dictList = ref<DictOption[]>([])
  /** 字典请求中 */
  const loading = ref(false)

  /** 拉取字典数据；未指定 dictType 时直接跳过，避免无意义请求 */
  async function loadDict() {
    if (!props.dictType)
      return
    loading.value = true
    try {
      dictList.value = await fetchDictList(props.dictType)
    }
    finally {
      loading.value = false
    }
  }

  onMounted(loadDict)
  watch(() => props.dictType, loadDict)

  /**
   * 将字典数据转换为 EasySelect 所需的 options 格式。
   * 字段名映射由 EasySelect 的 valueKey / labelKey 控制。
   */
  const normalizedOptions = computed<SelectOption[]>(() => {
    return dictList.value.map((item) => {
      const retKey = props.returnField as keyof DictOption
      const lblKey = props.labelField as keyof DictOption
      return {
        // 实际返回的字段由 returnField 控制（默认 id，可设为 labelValue 返回英文代码）
        [retKey]: item[retKey],
        [lblKey]: item[lblKey],
        disabled: item.disabled,
      }
    })
  })

  /** valueType 映射：组件属性 valueFormat → EasySelect 的 valueType（单选恒为 array） */
  const valueType = computed(() => {
    if (!props.multiple)
      return 'array'
    return props.valueFormat
  })

  // ──── 事件处理 ────
  /** 值变化：同步 v-model，并附带匹配到的完整字典项 */
  function handleChange(val: any) {
    emit('update:modelValue', val)

    const retKey = props.returnField as keyof DictOption
    // 同时返回完整字典项
    if (props.multiple && Array.isArray(val)) {
      const items = val
        .map((v: string) => dictList.value.find(d => String(d[retKey]) === String(v)))
        .filter((d: any): d is DictOption => Boolean(d))
      emit('change', val, items)
    }
    else if (!props.multiple) {
      const item = dictList.value.find(d => String(d[retKey]) === String(val)) ?? null
      emit('change', val, item)
    }
  }

  /** 清空：多选回退为空数组，单选回退为 null */
  function handleClear() {
    emit('update:modelValue', props.multiple ? [] : null)
    emit('clear')
  }

  return {
    dictList,
    loading,
    loadDict,
    normalizedOptions,
    valueType,
    handleChange,
    handleClear,
  }
}
