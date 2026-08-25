import type { ResolvedProps, SearchFormEmits } from './types'

import { computed, onMounted, reactive, ref, watch } from 'vue'

/**
 * 搜索表单数据管理：初始化、可见项过滤、查询 / 重置、与 v-model 双向同步。
 *
 * 从 search-form.vue 抽离，负责表单值这一单一关注点；
 * 布局测量相关逻辑见 use-search-form-layout.ts。
 *
 * @param props 组件 props（withDefaults 处理后的对象）
 * @param emit 组件 emit 函数
 */
export function useSearchFormData(props: ResolvedProps, emit: SearchFormEmits) {
  /** EasyForm 实例引用（校验 / 重置依赖） */
  const formRef = ref()

  /** 表单数据 */
  const formData = reactive<Record<string, any>>({})

  /** 可见的搜索项（开启展开按钮时过滤掉收起态隐藏项） */
  const visibleItems = computed(() => {
    if (!props.showExpandButton) {
      return props.items
    }
    return props.items.filter(item => !item.hiddenWhenCollapsed)
  })

  /** 初始化表单数据（modelValue 优先，其次 item.defaultValue，最后 null） */
  function initFormData() {
    props.items.forEach((item) => {
      const value = props.modelValue?.[item.prop] ?? item.defaultValue ?? null
      formData[item.prop] = value
      // 初始化范围选择器的结束属性
      if (item.endProp) {
        const endValue = props.modelValue?.[item.endProp] ?? null
        formData[item.endProp] = endValue
      }
    })
  }

  /** 处理搜索：先校验表单，通过后同步 v-model 并派发 search */
  async function handleSearch() {
    // 验证表单
    const isValid = await formRef.value?.validate().catch(() => false)
    if (!isValid)
      return

    const searchData = { ...formData }

    // 更新双向绑定
    emit('update:modelValue', searchData)
    emit('search', searchData)
  }

  /** 处理重置：清空校验状态并回落到各项默认值 */
  function handleReset() {
    formRef.value?.resetFields()

    // 重置为默认值
    props.items.forEach((item) => {
      formData[item.prop] = item.defaultValue ?? null
    })

    emit('update:modelValue', {})
    emit('reset')
  }

  /**
   * 外部设置表单数据（仅覆盖已存在的字段），并同步 v-model。
   *
   * @param data 待写入的字段集合
   */
  function setData(data: Record<string, any>) {
    Object.keys(data).forEach((key) => {
      if (key in formData) {
        formData[key] = data[key]
      }
    })
    emit('update:modelValue', { ...formData })
  }

  // 监听 modelValue 变化
  watch(
    () => props.modelValue,
    (val) => {
      if (val) {
        Object.keys(val).forEach((key) => {
          if (key in formData) {
            formData[key] = val[key]
          }
        })
      }
    },
    { deep: true },
  )

  onMounted(() => {
    initFormData()
  })

  return {
    formRef,
    formData,
    visibleItems,
    initFormData,
    handleSearch,
    handleReset,
    setData,
  }
}
