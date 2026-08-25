import type { TreeNodeEmits, TreeNodeProps } from './types'

import { computed } from 'vue'

/**
 * 树节点（TreeNode）核心逻辑：取色、展开/收起、远程加载、样式变量计算。
 *
 * 将原本内联在 tree-node.vue 中的计算属性与交互方法抽离为独立 composable，
 * 便于单测复用，也让 .vue 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 *
 * @param props 响应式 props（需传入 withDefaults 后的对象）
 * @param emit   组件 emit 函数（callable 形式的 TreeNodeEmits）
 */
export function useTreeNode(props: TreeNodeProps, emit: TreeNodeEmits) {
  // 节点颜色 - 经典企业蓝
  const nodeColor = computed(() => {
    if (props.colors && props.colors.length > 0)
      return props.colors[props.level % props.colors.length]
    const colors = ['#1a365d', '#2c5282', '#3182ce', '#4299e1', '#63b3ed', '#90cdf4']
    return colors[props.level % colors.length]
  })

  // 展开状态
  const isExpanded = computed(() => {
    const key = props.node[props.nodeConfig.keyField as string]
    return props.expandedKeys?.has(key) ?? false
  })

  // 是否有子节点
  const hasChildren = computed(() => {
    const children = props.node[props.nodeConfig.childrenField as string]
    return children && Array.isArray(children) && children.length > 0
  })

  // 子节点列表
  const children = computed(() => {
    return props.node[props.nodeConfig.childrenField as string] || []
  })

  // 节点是否处于加载中
  const isLoading = computed(() => {
    const key = props.node[props.nodeConfig.keyField as string]
    return props.loadingKeys?.has(key) ?? false
  })

  // 节点是否有待加载的子节点（没有本地数据但有远程数据）
  const hasRemoteChildren = computed(() => {
    return props.node.hasRemoteChildren === true
  })

  // 节点样式计算（通过 CSS 变量传递给 hover 样式）
  const nodeVars = computed(() => {
    const vars: Record<string, string> = {}

    // 普通样式
    if (props.node.borderColor)
      vars['--node-border-color'] = props.node.borderColor
    if (props.node.backgroundColor)
      vars['--node-bg-color'] = props.node.backgroundColor
    if (props.node.textColor)
      vars['--node-text-color'] = props.node.textColor

    // 激活（hover）样式
    if (props.node.activeBorderColor)
      vars['--node-active-border-color'] = props.node.activeBorderColor
    if (props.node.activeBackgroundColor)
      vars['--node-active-bg-color'] = props.node.activeBackgroundColor
    if (props.node.activeTextColor)
      vars['--node-active-text-color'] = props.node.activeTextColor

    return vars
  })

  // 切换展开
  function toggleExpand() {
    if (!props.expandable)
      return

    // 如果没有本地子节点但标记为有远程子节点，触发远程加载
    if (!hasChildren.value && hasRemoteChildren.value) {
      emit('load-more', props.node)
      return
    }

    if (!hasChildren.value)
      return
    emit('toggle-expand', props.node, !isExpanded.value)
  }

  // 点击节点
  function handleNodeClick() {
    emit('node-click', props.node)
  }

  // 节点类型
  const nodeType = computed(() => {
    if (props.level === 0)
      return 'root'
    if (hasChildren.value || hasRemoteChildren.value)
      return 'parent'
    return 'leaf'
  })

  return {
    nodeColor,
    isExpanded,
    hasChildren,
    children,
    isLoading,
    hasRemoteChildren,
    nodeVars,
    toggleExpand,
    handleNodeClick,
    nodeType,
  }
}
