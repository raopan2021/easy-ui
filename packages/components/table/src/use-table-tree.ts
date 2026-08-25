import type { ComputedRef } from 'vue'
import type { TableEmits, TableProps } from './table'

import { computed, ref, watch } from 'vue'

/** 树形扁平化后的单节点结构（模板渲染用） */
export interface TreeNode {
  /** 原始行数据 */
  row: Record<string, any>
  /** 层级（0 为顶层） */
  level: number
  /** 一级数据中的索引（用于排序序号展示） */
  index: number
  /** 带层级的序号字符串，如 "1", "1-2", "1-2-1" */
  treeIndex: string
  /** 是否展开 */
  expanded: boolean
  /** 是否加载中（懒加载） */
  loading: boolean
  /** 是否显示展开图标（有子节点或可懒加载） */
  hasChildren: boolean
  /** 行唯一 key */
  key: string | number
}

/**
 * 树形数据 composable。
 *
 * 负责：树节点展开/收起状态（`treeExpandedKeys`）、懒加载状态、
 * 展开/收起/全展开/全收起操作、受控初始化（defaultExpandAll / defaultExpandedKeys），
 * 以及将树形（或普通）数据扁平化为带层级信息的 `treeFlatData` 供模板渲染。
 *
 * @param props       表格 props
 * @param emit        表格 emit（回传 tree-expand）
 * @param displayData 当前页展示数据（上游 useTablePagination 提供）
 */
export function useTableTree(
  props: TableProps,
  emit: TableEmits,
  displayData: ComputedRef<Record<string, any>[]>,
) {
  // 树形展开状态 - 使用普通对象，避免 Map/Set 的深层响应式追踪问题
  const treeExpandedKeys = ref<Record<string, boolean>>({})

  // 懒加载中的节点
  const loadingKeys = ref<Record<string, boolean>>({})

  // 已确认的叶子节点（懒加载后返回空数据的节点）
  const confirmedLeafKeys = ref<Record<string, boolean>>({})

  // 获取行的唯一标识
  function getTreeRowKey(row: Record<string, any>): string {
    const key = props.rowKey ? row[props.rowKey] : JSON.stringify(row)
    return String(key)
  }

  // 检查节点是否有子节点
  function hasTreeChildren(row: Record<string, any>): boolean {
    const children = row[props.treeChildrenKey]
    return Array.isArray(children) && children.length > 0
  }

  // 判断行是否展开
  function isTreeExpanded(row: Record<string, any>): boolean {
    const key = getTreeRowKey(row)
    return !!treeExpandedKeys.value[key]
  }

  // 切换树节点展开状态（含懒加载）
  async function toggleTreeExpand(row: Record<string, any>) {
    const key = getTreeRowKey(row)
    const expanded = !treeExpandedKeys.value[key]
    const childrenKey = props.treeChildrenKey
    const hasChildren = row[childrenKey] && Array.isArray(row[childrenKey]) && row[childrenKey].length > 0

    if (expanded) {
      // 展开时，先设置展开状态（避免异步竞态）
      treeExpandedKeys.value = { ...treeExpandedKeys.value, [key]: true }

      // 检查是否需要懒加载
      if (props.lazy && props.load && !hasChildren) {
        // 显示 loading 状态
        loadingKeys.value = { ...loadingKeys.value, [key]: true }
        try {
          const children = await props.load(row)
          // 如果返回空数组，说明是叶子节点
          if (!children || children.length === 0) {
            confirmedLeafKeys.value = { ...confirmedLeafKeys.value, [key]: true }
            // 收起该节点（叶子节点不需要展开）
            const { [key]: _, ...rest } = treeExpandedKeys.value
            treeExpandedKeys.value = rest
          }
        }
        catch (err) {
          console.error('懒加载失败:', err)
          // 加载失败，收起该节点
          const { [key]: _, ...rest } = treeExpandedKeys.value
          treeExpandedKeys.value = rest
        }
        finally {
          // 清除 loading 状态
          const { [key]: _, ...rest } = loadingKeys.value
          loadingKeys.value = rest
        }
      }
    }
    else {
      // 收起 - 移除该 key
      const { [key]: _, ...rest } = treeExpandedKeys.value
      treeExpandedKeys.value = rest
    }

    emit('tree-expand', row, expanded)
  }

  // 处理树节点点击
  function handleTreeNodeClick(row: Record<string, any>) {
    // 只有有子节点或支持懒加载的行才能展开
    if (hasTreeChildren(row) || (props.lazy && props.load)) {
      toggleTreeExpand(row)
    }
  }

  // 展开指定行（根据 key）
  function expandRow(row: Record<string, any>) {
    const key = getTreeRowKey(row)
    treeExpandedKeys.value = { ...treeExpandedKeys.value, [key]: true }
  }

  // 收起指定行
  function collapseRow(row: Record<string, any>) {
    const key = getTreeRowKey(row)
    const { [key]: _, ...rest } = treeExpandedKeys.value
    treeExpandedKeys.value = rest
  }

  // 展开全部树节点
  function expandAllTree() {
    const newKeys: Record<string, boolean> = {}

    function traverse(rows: Record<string, any>[]) {
      rows.forEach((row) => {
        const key = getTreeRowKey(row)
        newKeys[key] = true
        const children = row[props.treeChildrenKey]
        if (Array.isArray(children) && children.length > 0) {
          traverse(children)
        }
      })
    }

    traverse(props.data)
    treeExpandedKeys.value = newKeys
  }

  // 收起全部树节点
  function collapseAllTree() {
    treeExpandedKeys.value = {}
  }

  // 树形数据扁平化处理
  const treeFlatData = computed<TreeNode[]>(() => {
    if (!props.tree) {
      // 非树形模式，返回普通数据
      return displayData.value.map((row, index) => ({
        row,
        level: 0,
        index,
        treeIndex: String(index + 1), // 普通模式：1, 2, 3...
        expanded: false,
        loading: false,
        hasChildren: false,
        key: props.rowKey ? row[props.rowKey] : index,
      }))
    }

    const result: TreeNode[] = []
    const childrenKey = props.treeChildrenKey

    // 顶层节点计数器（从1开始，用于显示序号1,2,3...）
    let topLevelCounter = 0

    function traverse(rows: Record<string, any>[], level: number, parentTreeIndex?: string) {
      rows.forEach((row, idx) => {
        const key = getTreeRowKey(row)
        const children = row[childrenKey] as Record<string, any>[] | undefined
        const hasChildren = Array.isArray(children) && children.length > 0
        const expanded = !!treeExpandedKeys.value[key]
        const loading = !!loadingKeys.value[key]
        const isConfirmedLeaf = !!confirmedLeafKeys.value[key]

        // 判断是否显示展开图标：
        // 1. 有子节点数据
        // 2. 懒加载模式且未确认是叶子节点（未加载过或加载过有数据）
        // 3. 非懒加载模式且无数据则不显示
        const showExpandIcon = hasChildren || (props.lazy && props.load && !isConfirmedLeaf)

        // 序号索引（用于 getRowIndex 计算）
        let nodeIndex: number
        let treeIndex: string

        if (level === 0) {
          // 顶层节点：1, 2, 3...
          nodeIndex = ++topLevelCounter
          treeIndex = String(nodeIndex)
        }
        else {
          // 子节点：从 row._childNum 获取兄弟中的序号
          const childNum = (row as any)._childNum ?? idx + 1
          nodeIndex = (row as any)._parentIndex ?? 0
          treeIndex = parentTreeIndex ? `${parentTreeIndex}-${childNum}` : String(childNum)
        }

        result.push({
          row,
          level,
          index: nodeIndex,
          treeIndex, // 带层级的序号字符串，如 "1", "1-2", "1-2-1"
          expanded,
          loading,
          hasChildren: showExpandIcon ?? false,
          key,
        })

        // 如果已展开且有子节点，递归处理子节点
        if (expanded && hasChildren) {
          // 为子节点设置父节点信息
          children.forEach((child, childIdx) => {
            ;(child as any)._parentIndex = nodeIndex
            ;(child as any)._childNum = childIdx + 1
            ;(child as any)._parentTreeIndex = treeIndex
          })
          traverse(children, level + 1, treeIndex)
        }
      })
    }

    traverse(displayData.value, 0)
    return result
  })

  // 初始化树形数据展开状态
  watch(
    () => props.data,
    (_data) => {
      if (props.tree && props.defaultExpandAll) {
        expandAllTree()
      }
      else if (props.tree && props.defaultExpandedKeys.length > 0) {
        const newKeys: Record<string, boolean> = {}
        props.defaultExpandedKeys.forEach((key) => {
          newKeys[String(key)] = true
        })
        treeExpandedKeys.value = newKeys
      }
    },
    { immediate: true, deep: true },
  )

  return {
    treeExpandedKeys,
    loadingKeys,
    confirmedLeafKeys,
    getTreeRowKey,
    hasTreeChildren,
    isTreeExpanded,
    toggleTreeExpand,
    handleTreeNodeClick,
    expandRow,
    collapseRow,
    expandAllTree,
    collapseAllTree,
    treeFlatData,
  }
}
