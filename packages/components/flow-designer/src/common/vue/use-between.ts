import type { BetweenEmits, BetweenProps } from './between-types'

/**
 * 中间节点（Between）属性设置面板组合式逻辑。
 *
 * 从原 between.vue 抽离：表单状态、监听器表格、动态扩展属性 tab 校验等。
 * .vue 仅承担组合 + 模板渲染，保持对外 props / emits / defineExpose 完全一致。
 */
import { computed, nextTick, reactive, ref, watch } from 'vue'
import { getPreviousNodes } from '../js/tool'

export function useBetween(props: BetweenProps, emit: BetweenEmits) {
  const tabsValue = ref('1')
  // tabsList 只存动态扩展属性 tab（基础/监听已在模板中硬编码）
  const tabsList = ref<{ label: string, name: string }[]>([])
  const form = ref(props.modelValue)
  const buttonList = ref<Record<string, any[]>>({})
  const formRef = ref()

  // 用 Map 管理动态 ref
  const nodeExtRefs = new Map<string, any>()
  function setNodeExtRef(el: any, name: string) {
    if (el)
      nodeExtRefs.set(name, el)
    else nodeExtRefs.delete(name)
  }

  const rules = reactive<Record<string, any[]>>({
    nodeRatio: [
      { required: false, message: '请输入', trigger: 'change' },
      {
        pattern: /^(?:[1-9]\d?|0\.\d{1,3}|[1-9]\d?\.\d{1,3})$/,
        message: '请输入(0, 100)的值，最多保留三位小数',
        trigger: ['change', 'blur'],
      },
    ],
    listenerType: [{ required: true, message: '监听器类型不能为空', trigger: 'change' }],
    listenerPath: [{ required: true, message: '监听器路径不能为空', trigger: 'blur' }],
  })

  // 表格列配置
  const listenerColumns = [
    { prop: 'listenerType', name: '类型', width: 160 },
    { prop: 'listenerPath', name: '路径' },
  ]

  // 监听器类型选项
  const listenerTypeOptions = [
    { label: '开始', value: 'start' },
    { label: '分派', value: 'assignment' },
    { label: '完成', value: 'finish' },
    { label: '创建', value: 'create' },
  ]

  watch(
    () => form.value,
    (n) => {
      if (n)
        emit('update:modelValue', n)
    },
    { deep: true },
  )

  // 增加行
  function handleAddRow() {
    if (!form.value.listenerRows) {
      form.value.listenerRows = []
    }
    form.value.listenerRows.push({ listenerType: '', listenerPath: '' })
  }

  // 删除行
  function handleDeleteRow(index: number) {
    form.value.listenerRows.splice(index, 1)
  }

  const filteredNodes = computed(() => {
    const previousNodes = getPreviousNodes(props.nodes, props.skips, form.value.nodeCode)
    return previousNodes.filter((node: any) => !['start', 'serial', 'parallel'].includes(node.type))
  })

  // 表单必填校验
  async function validate(): Promise<void> {
    tabsValue.value = '1'
    await nextTick()
    await new Promise<void>((resolve, reject) => {
      formRef.value?.validate((valid: boolean) => {
        if (valid)
          resolve()
        else reject(new Error('表单校验未通过'))
      })
    })
    await tabsValidate()
  }

  async function tabsValidate(): Promise<void> {
    const addTabsList = tabsList.value
    if (addTabsList.length === 0)
      return
    for (const e of addTabsList) {
      tabsValue.value = e.name
      await nextTick()
      const extRef = nodeExtRefs.get(e.name)
      if (extRef && !(await extRef.validate())) {
        throw new Error('扩展属性校验未通过')
      }
    }
  }

  return {
    tabsValue,
    tabsList,
    form,
    buttonList,
    formRef,
    rules,
    listenerColumns,
    listenerTypeOptions,
    filteredNodes,
    setNodeExtRef,
    handleAddRow,
    handleDeleteRow,
    validate,
  }
}
