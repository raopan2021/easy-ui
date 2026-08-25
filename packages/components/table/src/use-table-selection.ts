import type { ComputedRef } from 'vue'
import type { TableEmits, TableProps } from './table'

import type { TreeNode } from './use-table-tree'
import { computed, ref } from 'vue'

/**
 * 行选择（多选/单选）composable。
 *
 * 负责：选中行集合（`selectedMap` 以行 key 为索引，保证唯一）、
 * 全选/单选处理、选中态查询、`selection-change` 事件回传，
 * 以及对外暴露 `clearSelection` / `getSelection`（defineExpose 用）。
 *
 * @param props       表格 props
 * @param emit        表格 emit（回传 selection-change）
 * @param displayData 当前页展示数据（上游 useTablePagination 提供）
 * @param treeFlatData 树形扁平数据（上游 useTableTree 提供，树形模式下作为可选数据源）
 */
export function useTableSelection(
  props: TableProps,
  emit: TableEmits,
  displayData: ComputedRef<Record<string, any>[]>,
  treeFlatData: ComputedRef<TreeNode[]>,
) {
  const selectedRows = ref<Record<string, any>[]>([])
  // 使用 Map 存储: key → row，key 为行唯一标识
  const selectedMap = ref<Map<any, Record<string, any>>>(new Map())

  // 获取行的唯一标识 key
  function getRowKey(row: Record<string, any>) {
    return props.rowKey ? row[props.rowKey] : row
  }

  function isRowSelected(row: Record<string, any>) {
    return selectedMap.value.has(getRowKey(row))
  }

  // 用于全选的数据源：树形模式下用 treeFlatData，普通模式下用 displayData
  const selectableData = computed(() => {
    if (props.tree) {
      // 树形模式：使用所有已扁平化的节点
      return treeFlatData.value.map(node => node.row)
    }
    return displayData.value
  })

  const isAllSelected = computed(
    () => selectableData.value.length > 0 && selectableData.value.every(r => selectedMap.value.has(getRowKey(r))),
  )
  const isIndeterminate = computed(
    () => selectableData.value.some(r => selectedMap.value.has(getRowKey(r))) && !isAllSelected.value,
  )

  function handleSelectAll(e: Event) {
    const isChecked = (e.target as HTMLInputElement).checked
    if (isChecked) {
      selectableData.value.forEach((r) => {
        const key = getRowKey(r)
        if (!selectedMap.value.has(key)) {
          selectedMap.value.set(key, r)
        }
      })
    }
    else {
      selectableData.value.forEach((r) => {
        selectedMap.value.delete(getRowKey(r))
      })
    }
    selectedRows.value = [...selectedMap.value.values()]
    emit('selection-change', [...selectedRows.value])
  }

  function handleRowSelect(row: Record<string, any>) {
    const key = getRowKey(row)
    if (selectedMap.value.has(key)) {
      selectedMap.value.delete(key)
    }
    else {
      if (props.selectionMode === 'single') {
        selectedMap.value.clear()
      }
      selectedMap.value.set(key, row)
    }
    selectedRows.value = [...selectedMap.value.values()]
    emit('selection-change', [...selectedRows.value])
  }

  /** 清空选择并回传空数组 */
  function clearSelection() {
    selectedRows.value = []
    emit('selection-change', [])
  }

  /** 获取当前选中行副本 */
  function getSelection() {
    return [...selectedRows.value]
  }

  return {
    selectedRows,
    selectedMap,
    getRowKey,
    isRowSelected,
    selectableData,
    isAllSelected,
    isIndeterminate,
    handleSelectAll,
    handleRowSelect,
    clearSelection,
    getSelection,
  }
}
