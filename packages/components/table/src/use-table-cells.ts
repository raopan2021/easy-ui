import type { Ref } from 'vue'

import type { TableColumn, TableProps } from './table'

/**
 * 单元格取值与格式化 composable。
 *
 * 提供：嵌套路径取值（`getCellValue`，支持 "a.b.c"）、
 * 列格式化（`formatCell`，优先 formatter，其次 value/prefix/suffix）、
 * 行序号计算（`getRowIndex`，分页时叠加页码偏移）。
 *
 * @param props           表格 props（读取 pagination / rowKey）
 * @param currentPage     当前页码（ref，分页时计算序号用）
 * @param currentPageSize 每页条数（ref，分页时计算序号用）
 */
export function useTableCellRendering(
  props: TableProps,
  currentPage: Ref<number>,
  currentPageSize: Ref<number>,
) {
  /** 按点分隔路径从行对象中取值（支持嵌套） */
  function getCellValue(row: Record<string, any>, prop: string) {
    // 支持 "a.b.c" 嵌套路径
    return prop.split('.').reduce((obj: any, k) => obj?.[k], row)
  }

  /** 格式化单元格显示文本 */
  function formatCell(row: Record<string, any>, col: TableColumn) {
    const value = getCellValue(row, col.prop)
    if (col.formatter)
      return col.formatter(row, value)
    if (value == null)
      return '—'

    const formattedValue = String(value)
    const prefix = col.prefix || ''
    const suffix = col.suffix || ''

    return `${prefix}${formattedValue}${suffix}`
  }

  /** 计算行序号（分页时叠加当前页偏移） */
  function getRowIndex(rowIndex: number) {
    if (!props.pagination)
      return rowIndex + 1
    return (currentPage.value - 1) * currentPageSize.value + rowIndex + 1
  }

  return { getCellValue, formatCell, getRowIndex }
}
