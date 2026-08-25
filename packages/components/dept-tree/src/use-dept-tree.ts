import type { DeptTreeEmits, DeptTreeResolvedProps, NodeKey, TreeNode } from './types'

import { computed, ref, watch } from 'vue'

/**
 * 将平铺数据（每条记录携带父级标识）构建为嵌套树结构。
 *
 * 构建策略：
 * 1. 先按 `nodeKey.id` 建立 id → 节点副本的映射，并保证每个节点都持有 children 数组；
 * 2. 再遍历一次，把节点挂到父节点的 children 下；
 * 3. 父级标识为空（undefined / null / 空字符串）视为根节点；
 * 4. 父级标识存在但在映射中找不到父节点时，同样降级为根节点，避免数据脏导致节点丢失。
 *
 * @param list 平铺数据列表
 * @param nodeKey 字段名映射配置
 * @returns 根节点数组
 */
function buildTree(list: TreeNode[], nodeKey: NodeKey): TreeNode[] {
  const idKey = nodeKey.id
  const pidKey = nodeKey.pid || 'pid'
  const childrenKey = nodeKey.children || 'children'

  const map = new Map<string | number, TreeNode>()
  const roots: TreeNode[] = []

  // 建立映射
  list.forEach((item) => {
    const id = item[idKey] as string | number | undefined
    if (id !== undefined) {
      map.set(id, { ...item, [childrenKey]: item[childrenKey] || [] })
    }
  })

  // 构建树
  list.forEach((item) => {
    const id = item[idKey] as string | number | undefined
    const pid = item[pidKey] as string | number | undefined

    if (pid === undefined || pid === null || pid === '') {
      roots.push(map.get(id as string | number)!)
    }
    else {
      const parent = map.get(pid as string | number)
      if (parent) {
        ;(parent[childrenKey] as TreeNode[]).push(map.get(id as string | number)!)
      }
      else {
        roots.push(map.get(id as string | number)!)
      }
    }
  })

  return roots
}

/**
 * 部门树核心逻辑：数据结构归一化 + 选中 / 展开状态维护。
 *
 * 将原本内联在 dept-tree.vue 中的「树构建」「选中态」「展开态」三段逻辑抽离为独立
 * composable，便于单测复用，并让 .vue 仅承担「组合 + 模板」职责
 * （对齐 markdown / progress 拆分规范）。行为与原实现完全一致。
 *
 * emit 以 DeptTreeEmits 可调用接口直接标注（不使用 EmitFn<>）。
 *
 * @param props 部门树 props（withDefaults 处理后的响应式对象）
 * @param emit 组件事件（select / toggle）
 */
export function useDeptTree(props: DeptTreeResolvedProps, emit: DeptTreeEmits) {
  /**
   * 归一化后的树数据。
   *
   * 通过首条记录是否含父级标识字段判断数据形态：
   * 含 `pid` → 平铺数据，需要构建；否则认为已是嵌套结构，直接使用。
   */
  const treeData = computed(() => {
    if (!props.data || props.data.length === 0)
      return []

    // 检查数据格式：如果有 pid 字段则是平铺数据，否则直接返回
    const firstItem = props.data[0]
    if (firstItem[props.nodeKey.pid || 'pid'] !== undefined) {
      return buildTree(props.data, props.nodeKey)
    }

    return props.data as TreeNode[]
  })

  /** 当前选中节点标识（内部副本，跟随 props.selectedId 同步） */
  const selectedId = ref<string | number | null>(props.selectedId)

  /** 已手动展开的节点标识集合（全树共享，向下透传给每个节点） */
  const expandedSet = ref(new Set<string>())

  watch(
    () => props.selectedId,
    (val) => {
      selectedId.value = val
    },
  )

  /** 处理节点选中：更新内部选中态并向外派发 */
  function handleSelect(node: TreeNode) {
    const id = node[props.nodeKey.id] as string | number | undefined
    selectedId.value = id ?? null
    emit('select', node)
  }

  /** 处理节点展开 / 折叠：维护展开集合并向外派发 */
  function handleToggle(node: TreeNode, expanded: boolean) {
    const id = String(node[props.nodeKey.id])
    if (expanded) {
      expandedSet.value.add(id)
    }
    else {
      expandedSet.value.delete(id)
    }
    emit('toggle', node, expanded)
  }

  return {
    treeData,
    selectedId,
    expandedSet,
    handleSelect,
    handleToggle,
  }
}
