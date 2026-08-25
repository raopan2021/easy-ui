import type { ComputedRef, Slots } from 'vue'
import type { TableEmits, TableProps } from './table'

import { computed, ref, watch } from 'vue'

/**
 * 展开行（非树形）composable。
 *
 * 负责普通模式下的行展开/收起：`expandedRows`（按行索引记录）、
 * 受控初始化（defaultExpandedRows）、展开/收起/全展开/全收起操作，
 * 以及将 `displayData` 加工为带 `expanded` 标记的 `displayDataWithExpand` 供模板渲染。
 *
 * @param props       表格 props
 * @param emit        表格 emit（回传 expand-change）
 * @param displayData 当前页展示数据（上游 useTablePagination 提供）
 * @param slots       插槽对象（判断 expand 插槽是否存在）
 */
export function useTableExpand(
  props: TableProps,
  emit: TableEmits,
  displayData: ComputedRef<Record<string, any>[]>,
  slots: Slots | undefined,
) {
  // 展开状态（按行在 displayData 中的索引记录）
  const expandedRows = ref<Set<number>>(new Set())

  // 检查 expand 插槽是否存在
  const hasExpandSlot = computed(() => !!slots?.expand)

  // 监听默认展开行
  watch(
    () => props.defaultExpandedRows,
    (rows) => {
      expandedRows.value = new Set(rows)
    },
    { immediate: true },
  )

  // 切换展开状态
  function toggleRowExpand(row: Record<string, any>, index: number) {
    const expanded = !expandedRows.value.has(index)
    if (expanded) {
      expandedRows.value.add(index)
    }
    else {
      expandedRows.value.delete(index)
    }
    // 触发 emit
    emit('expand-change', row, expanded)
  }

  // 处理展开行点击（仅 expandTrigger === 'click' 时生效）
  function handleExpandClick(row: Record<string, any>, index: number) {
    if (props.expandTrigger === 'click') {
      toggleRowExpand(row, index)
    }
  }

  // 展开所有行
  function expandAll() {
    displayData.value.forEach((_, index) => {
      expandedRows.value.add(index)
    })
  }

  // 收起所有行
  function collapseAll() {
    expandedRows.value.clear()
  }

  // 展开行处理后的数据
  const displayDataWithExpand = computed(() => {
    const result: Array<{
      row: Record<string, any>
      index: number
      key: string | number
      expanded: boolean
    }> = []
    displayData.value.forEach((row, index) => {
      const key = props.rowKey ? row[props.rowKey] : index
      const expanded = expandedRows.value.has(index)
      result.push({ row, index, key, expanded })
    })
    return result
  })

  return {
    expandedRows,
    hasExpandSlot,
    toggleRowExpand,
    handleExpandClick,
    expandAll,
    collapseAll,
    displayDataWithExpand,
  }
}
