import type { StartEmits, StartProps } from './start-types'

/**
 * 开始节点（Start）属性设置面板组合式逻辑。
 *
 * 从原 start.vue 抽离：表单状态、监听器表格、变更回传。.vue 仅承担组合 + 模板渲染。
 */
import { ref, watch } from 'vue'

export function useStart(props: StartProps, emit: StartEmits) {
  const tabsValue = ref<string | number>('basic')
  const form = ref(props.modelValue)
  const formRef = ref()
  const nodeInput = ref()

  // 监听器表格列配置
  const listenerColumns = [
    { prop: 'listenerType', name: '类型', width: 160 },
    { prop: 'listenerPath', name: '路径' },
  ]

  // 监听器类型下拉选项
  const listenerTypeOptions = [
    { label: '开始', value: 'start' },
    { label: '分派', value: 'assignment' },
    { label: '完成', value: 'finish' },
    { label: '创建', value: 'create' },
  ]

  watch(
    () => form,
    (n) => {
      if (n) {
        emit('change', n)
      }
    },
    { deep: true },
  )

  function nodeNameChange() {
    nodeInput.value?.focus?.()
  }

  // 初始化监听器行数据
  if (form.value.listenerType) {
    const listenerTypes = form.value.listenerType.split(',')
    const listenerPaths = form.value.listenerPath.split('@@')
    form.value.listenerRows = listenerTypes.map((type: string, index: number) => ({
      listenerType: type,
      listenerPath: listenerPaths[index],
    }))
  }

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

  return {
    tabsValue,
    form,
    formRef,
    nodeInput,
    listenerColumns,
    listenerTypeOptions,
    nodeNameChange,
    handleAddRow,
    handleDeleteRow,
  }
}
