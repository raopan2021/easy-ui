import type { DeptNodeEmits, DeptNodeResolvedProps, TreeNode } from './types'

import { computed } from 'vue'

/**
 * 单个部门节点的派生状态与交互逻辑。
 *
 * 将原本内联在 DeptNode.vue 中的字段取值、选中判定、展开判定与事件派发抽离为
 * 独立 composable，让 .vue 仅承担「组合 + 模板」职责（对齐 markdown / progress
 * 拆分规范）。行为与原实现完全一致。
 *
 * emit 以 DeptNodeEmits 可调用接口直接标注（不使用 EmitFn<>）。
 *
 * @param props 节点 props（withDefaults 处理后的响应式对象）
 * @param emit 节点事件（select / toggle，由父级逐层向上冒泡）
 */
export function useDeptNode(props: DeptNodeResolvedProps, emit: DeptNodeEmits) {
  // ──── 节点标识与字段取值（按 nodeKey 映射） ────
  /** 节点标识（统一转为字符串，作为展开集合的 key） */
  const nodeId = computed(() => String(props.node[props.nodeKey.id]))
  /** 节点显示文本 */
  const nodeLabel = computed(() => (props.node[props.nodeKey.label || 'label'] as string) || '')
  /** 子节点列表 */
  const nodeChildren = computed(() => (props.node[props.nodeKey.children || 'children'] as TreeNode[]) || [])
  /** 是否为非叶子节点 */
  const hasChildren = computed(() => nodeChildren.value.length > 0)

  // ──── 选中状态 ────
  /** 当前节点是否被选中 */
  const isSelected = computed(() => props.selectedId === props.node[props.nodeKey.id])

  // ──── 展开状态 ────
  /**
   * 是否命中「默认展开」规则。
   * - expandAll 为真：全部展开；
   * - defaultExpandLevel <= 0：等价于全部展开；
   * - 否则仅展开层级小于 defaultExpandLevel 的节点。
   */
  const shouldAutoExpand = computed(() => {
    if (props.expandAll)
      return true
    if (props.defaultExpandLevel <= 0)
      return true
    return props.depth < props.defaultExpandLevel
  })

  /** 展开状态 - 优先使用 expandedSet，否则使用默认展开逻辑 */
  const isExpanded = computed(() => {
    return props.expandedSet.has(nodeId.value) || shouldAutoExpand.value
  })

  // ──── 交互 ────
  /** 点击节点行：向外派发选中事件 */
  function handleClick() {
    emit('select', props.node)
  }

  /** 点击展开图标：取反当前展开状态并向外派发 */
  function handleToggle() {
    const expanded = !isExpanded.value
    emit('toggle', props.node, expanded)
  }

  return {
    nodeId,
    nodeLabel,
    nodeChildren,
    hasChildren,
    isSelected,
    isExpanded,
    handleClick,
    handleToggle,
  }
}
