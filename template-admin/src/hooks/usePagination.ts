/**
 * 通用分页 Hook
 *
 * 封装表格分页状态（page、pageSize、total）与变更回调，
 * 避免每个表格组件重复写分页逻辑。
 *
 * @example
 * ```ts
 * const { pagination, total, onPageChange, onPageSizeChange, reset } = usePagination();
 * onPageChange(() => fetchData());
 * ```
 */
export interface UsePaginationOptions {
  /** 初始页码，默认 1 */
  initialPage?: number
  /** 初始每页条数，默认 10 */
  initialPageSize?: number
}

export function usePagination(options: UsePaginationOptions = {}) {
  const { initialPage = 1, initialPageSize = 10 } = options

  /** 分页状态 */
  const pagination = reactive({
    page: initialPage,
    pageSize: initialPageSize,
  })
  /** 总记录数 */
  const total: Ref<number> = ref(0)
  /** 加载状态 */
  const loading: Ref<boolean> = ref(false)
  /** 页码变化回调栈 */
  const pageChangeCallbacks: Array<(p: number) => void> = []
  /** 每页条数变化回调栈 */
  const pageSizeChangeCallbacks: Array<(s: number) => void> = []

  /** 触发页码变化 */
  function onPageChange(cb: (p: number) => void) {
    pageChangeCallbacks.push(cb)
  }
  /** 触发每页条数变化 */
  function onPageSizeChange(cb: (s: number) => void) {
    pageSizeChangeCallbacks.push(cb)
  }
  /** 外部修改分页参数并触发回调 */
  function handlePageChange(p: number) {
    pagination.page = p
    pageChangeCallbacks.forEach(cb => cb(p))
  }
  function handlePageSizeChange(s: number) {
    pagination.pageSize = s
    pagination.page = 1
    pageSizeChangeCallbacks.forEach(cb => cb(s))
  }
  /** 重置为初始值并回到第一页 */
  function reset() {
    pagination.page = initialPage
    pagination.pageSize = initialPageSize
    total.value = 0
  }

  return {
    pagination,
    total,
    loading,
    onPageChange,
    onPageSizeChange,
    handlePageChange,
    handlePageSizeChange,
    reset,
  }
}
