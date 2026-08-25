import type { ComputedRef } from 'vue'
import type { TableColumn, TableProps } from './table'

import { computed } from 'vue'

/** 合计行单个单元格的显示信息 */
interface SummaryCell {
  /** 计算类型：'sum' | 'avg' | 'custom' | '' */
  type: 'sum' | 'avg' | 'custom' | ''
  /** 显示的文字 */
  value: string
}

/**
 * 合计行 composable。
 *
 * 根据 `visibleColumns` 中各列的 `summary` / `summaryText` 配置，
 * 计算合计行每列的显示值（`summaryRow`），并派生：
 * - `hasSummary`：是否存在需要合计的列
 * - `summaryMixed`：是否同时混用 sum 与 avg（决定是否显示类型徽标）
 *
 * @param props         表格 props（读取 data / showSummary）
 * @param visibleColumns 当前可见列（上游 useTableColumns 提供）
 */
export function useTableSummary(props: TableProps, visibleColumns: ComputedRef<TableColumn[]>) {
  /**
   * 计算合计行每列的显示值，返回 Map<prop, SummaryCell>：
   * - summaryText 存在 → 直接显示自定义文字
   * - summary = 'sum'  → 对当前 data 求和
   * - summary = 'avg'  → 对当前 data 求平均（保留两位小数）
   * - 其余 → 空字符串
   */
  const summaryRow = computed<Record<string, SummaryCell>>(() => {
    const result: Record<string, SummaryCell> = {}
    if (!props.showSummary)
      return result

    const rows = props.data ?? []

    for (const col of visibleColumns.value) {
      // 优先使用用户自定义文字
      if (col.summaryText !== undefined) {
        result[col.prop] = { type: 'custom', value: col.summaryText }
        continue
      }

      if (col.summary === 'sum') {
        const total = rows.reduce((acc, row) => {
          const v = Number.parseFloat(row[col.prop])
          return acc + (Number.isNaN(v) ? 0 : v)
        }, 0)
        const value = Number.isInteger(total) ? String(total) : total.toFixed(2)
        result[col.prop] = { type: 'sum', value }
      }
      else if (col.summary === 'avg') {
        if (rows.length === 0) {
          result[col.prop] = { type: 'avg', value: '-' }
        }
        else {
          const total = rows.reduce((acc, row) => {
            const v = Number.parseFloat(row[col.prop])
            return acc + (Number.isNaN(v) ? 0 : v)
          }, 0)
          const avg = total / rows.length
          const value = Number.isInteger(avg) ? String(avg) : avg.toFixed(2)
          result[col.prop] = { type: 'avg', value }
        }
      }
      else {
        result[col.prop] = { type: '', value: '' }
      }
    }

    return result
  })

  /** 合计行是否有任何列设置了 summary 或 summaryText */
  const hasSummary = computed(() => {
    if (!props.showSummary)
      return false
    return visibleColumns.value.some(
      col => col.summary === 'sum' || col.summary === 'avg' || col.summaryText !== undefined,
    )
  })

  /** 是否同时存在 sum 和 avg 列 —— 混用时才显示类型标签 */
  const summaryMixed = computed(() => {
    const cols = visibleColumns.value
    return cols.some(c => c.summary === 'sum') && cols.some(c => c.summary === 'avg')
  })

  return { summaryRow, hasSummary, summaryMixed }
}
