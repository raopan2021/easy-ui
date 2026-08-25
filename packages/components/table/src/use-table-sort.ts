import type { SortOrder, TableEmits, TableProps } from './table'

import { computed, ref } from 'vue'

/**
 * 排序状态与排序数据计算 composable。
 *
 * 支持三态切换：无 → 升序(asc) → 降序(desc) → 无(null)，
 * 每次切换通过 `emit('sort-change', key, order)` 通知外部。
 * 排序后的 `sortedData` 供分页/树形/展开等下游使用。
 *
 * @param props 表格 props（读取 data）
 * @param emit  表格 emit（回传 sort-change）
 */
export function useTableSort(props: TableProps, emit: TableEmits) {
  /** 当前排序状态 */
  const sortState = ref<{ key: string, order: SortOrder }>({
    key: '',
    order: null,
  })

  /** 点击列头切换排序状态并回传事件 */
  function handleSort(key: string) {
    if (sortState.value.key !== key) {
      sortState.value = { key, order: 'asc' }
    }
    else if (sortState.value.order === 'asc') {
      sortState.value = { key, order: 'desc' }
    }
    else {
      sortState.value = { key: '', order: null }
    }
    emit('sort-change', sortState.value.key, sortState.value.order)
  }

  /** 排序后的数据（无排序时返回原数据副本） */
  const sortedData = computed(() => {
    const { key, order } = sortState.value
    if (!key || !order)
      return [...props.data]

    return [...props.data].sort((a, b) => {
      const va = a[key]
      const vb = b[key]
      if (va == null && vb == null)
        return 0
      if (va == null)
        return 1
      if (vb == null)
        return -1
      if (typeof va === 'number' && typeof vb === 'number') {
        return order === 'asc' ? va - vb : vb - va
      }
      const sa = String(va)
      const sb = String(vb)
      return order === 'asc' ? sa.localeCompare(sb) : sb.localeCompare(sa)
    })
  })

  return { sortState, handleSort, sortedData }
}
