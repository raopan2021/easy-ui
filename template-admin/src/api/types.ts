/** 后端统一响应包装（后端 com.xtkg.common.util.bean.Response） */
export interface SystemResponse<T> {
  code?: number
  retCode?: number
  msg: string
  data: T
}

/** 后端分页结果 */
export interface PageQueryResult<T> {
  totalRecordsNum: number
  currentPage: number
  pageNum: number
  totalPage: number
  records: T[]
}
