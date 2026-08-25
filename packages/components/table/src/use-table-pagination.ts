import type { ComputedRef } from 'vue'
import type { TableEmits, TableProps } from './table'

import { computed, ref, watch } from 'vue'

/**
 * 分页逻辑 composable（前端分页 + 服务端分页兼容）。
 *
 * - 服务端分页（传入 `total > 0`）：直接展示当前 `data`，不切片。
 * - 前端分页：根据 `currentPage / currentPageSize` 对排序后的数据切片。
 * 同时提供页码计算（省略号折叠）、每页条数切换、跳转输入等交互，
 * 并通过 emit 回传 `page-change` / `page-size-change`。
 *
 * @param props      表格 props
 * @param emit       表格 emit
 * @param sortedData 排序后的数据（上游 useTableSort 提供）
 */
export function useTablePagination(
  props: TableProps,
  emit: TableEmits,
  sortedData: ComputedRef<Record<string, any>[]>,
) {
  const currentPage = ref(props.page)
  const currentPageSize = ref(props.pageSize)

  watch(
    () => props.page,
    (v) => {
      currentPage.value = v
    },
  )
  watch(
    () => props.pageSize,
    (v) => {
      currentPageSize.value = v
    },
  )

  // 如果传入了 total（服务端分页），直接用 total；否则用数据长度
  const total = computed(() => (props.total > 0 ? props.total : sortedData.value.length))
  const totalPages = computed(() => Math.max(1, Math.ceil(total.value / currentPageSize.value)))

  const displayData = computed(() => {
    // 服务端分页：直接显示当前 data
    if (props.total > 0)
      return sortedData.value
    // 前端分页
    if (!props.pagination)
      return sortedData.value
    const start = (currentPage.value - 1) * currentPageSize.value
    return sortedData.value.slice(start, start + currentPageSize.value)
  })

  // 每页条数选择器的选项
  const pageSizeSelectOptions = computed(() => {
    return props.pageSizeOptions.map(size => ({
      value: size,
      label: `${size}条/页`,
    }))
  })

  function handlePageChange(page: number) {
    if (page < 1 || page > totalPages.value)
      return
    currentPage.value = page
    emit('page-change', page)
  }

  function handlePageSizeChange(size: number) {
    currentPageSize.value = size
    currentPage.value = 1
    emit('page-size-change', size)
  }

  const pageNumbers = computed(() => {
    const total = totalPages.value
    const current = currentPage.value
    const pages: (number | '...')[] = []

    if (total === 0)
      return pages

    // 总页数少，全部显示
    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i)
      return pages
    }

    // 始终显示第一页
    pages.push(1)

    // 如果当前页离第一页较远，显示省略号
    if (current > 3) {
      pages.push('...')
    }
    else {
      // 当前页靠近开头，显示 2 到 current+1
      for (let i = 2; i <= Math.min(3, current + 1); i++) {
        if (!pages.includes(i))
          pages.push(i)
      }
    }

    // 显示当前页附近的页码
    const start = Math.max(2, current - 1)
    const end = Math.min(total - 1, current + 1)
    for (let i = start; i <= end; i++) {
      if (!pages.includes(i))
        pages.push(i)
    }

    // 如果当前页离最后一页较远，显示省略号
    if (current < total - 2) {
      pages.push('...')
    }
    else {
      // 当前页靠近结尾，显示 total-2 到 total-1
      for (let i = Math.max(total - 2, current); i < total; i++) {
        if (!pages.includes(i))
          pages.push(i)
      }
    }

    // 始终显示最后一页
    if (!pages.includes(total))
      pages.push(total)

    return pages
  })

  const jumpPageInput = ref<number>(currentPage.value)
  watch(
    () => currentPage.value,
    (newVal) => {
      jumpPageInput.value = newVal
    },
  )

  function handleJumpPage() {
    const page = Number(jumpPageInput.value)
    if (page >= 1 && page <= totalPages.value && page !== currentPage.value) {
      handlePageChange(page)
    }
    else {
      jumpPageInput.value = currentPage.value
    }
  }

  function handleJumpPageEnter(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      handleJumpPage()
    }
  }

  return {
    currentPage,
    currentPageSize,
    total,
    totalPages,
    displayData,
    pageSizeSelectOptions,
    handlePageChange,
    handlePageSizeChange,
    pageNumbers,
    jumpPageInput,
    handleJumpPage,
    handleJumpPageEnter,
  }
}
