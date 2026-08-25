import type { BaseNodeEmits, BaseNodeProps } from './base-node-types'

/**
 * 仿钉钉风格基础节点（BaseNode）组合式逻辑。
 *
 * 从原 baseNode.vue 抽离：节点名称编辑、删除/编辑事件。.vue 仅承担组合 + 模板渲染，
 * 保持对外 props / emits 完全一致。
 */
import { ref, watch } from 'vue'

export function useBaseNode(props: BaseNodeProps, emit: BaseNodeEmits) {
  const showSpan = ref(true)
  const baseNodeDiv = ref(null)
  const nodeName = ref('发起人')
  const handler = ref('')
  const nodeNameInput = ref(null)
  const editingNodeName = ref(false)
  // 添加 deleteNode 事件

  function deleteNode() {
    emit('deleteNode') // 触发删除事件，由父组件处理
  }

  watch(
    () => props.text,
    (newVal) => {
      if (newVal) {
        nodeName.value = newVal
      }
    },
    { deep: true, immediate: true },
  )

  watch(
    () => props.permissionFlag,
    (newVal) => {
      if (newVal) {
        handler.value = newVal
      }
      else {
        handler.value = ''
      }
    },
    { immediate: true, deep: true },
  )

  function editNodeName() {
    if (props.chartStatusColor && props.chartStatusColor.length > 0) {
      return
    }
    editingNodeName.value = true
    showSpan.value = false
  }

  function saveNodeName() {
    if (props.chartStatusColor && props.chartStatusColor.length > 0) {
      return
    }
    editingNodeName.value = false
    showSpan.value = true
    emit('updateNodeName', nodeName.value)
  }

  function editNode() {
    emit('editNode')
  }

  return {
    showSpan,
    baseNodeDiv,
    nodeName,
    handler,
    nodeNameInput,
    editingNodeName,
    deleteNode,
    editNodeName,
    saveNodeName,
    editNode,
  }
}
