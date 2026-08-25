import type { ComputedRef, Ref } from 'vue'
import type { GanttProps, GanttView } from './types'

import { computed } from 'vue'

/* eslint-disable no-unmodified-loop-condition */

/**
 * 甘特图时间轴表头 composable
 *
 * 将原本内联在 gantt.vue 中的 timelineHeaders 计算逻辑抽离为独立模块，
 * 返回结构与原实现完全一致（behavior-preserving）：
 *  - day 视图：两级数组，第一级为月份单元格，第二级为天单元格
 *  - week 视图：cells 中混排「月份」与「第 N 周」单元格
 *  - month 视图：cells 为「年-月」单元格
 *
 * 说明：日期遍历使用 `while (current <= end)` + `current.setDate(...)` 模式，
 * 循环通过修改 Date 对象内部状态推进（引用本身不变），
 * ESLint 的 no-unmodified-loop-condition 无法识别，故在此豁免。
 */
/**
 * @param props       甘特图 props（读取 dayWidth 等布局参数）
 * @param currentView 当前视图 ref（day | week | month）
 * @param deps        数据上下文（useGanttData 的 getTimeX / dateRange / scale）
 */
export interface GanttTimelineDeps {
  getTimeX: (date: Date) => number
  dateRange: ComputedRef<{ start: Date, end: Date }>
  scale: Ref<number>
}

/** 时间轴单元格 */
export interface GanttHeaderCell {
  label: string
  x: number
  y: number
  width: number
  height: number
  isWeekend: boolean
}

/** 时间轴行（一组单元格） */
export interface GanttHeaderRow {
  year?: number
  yearLabel?: string
  cells: GanttHeaderCell[]
}

export function useGanttTimeline(props: GanttProps, currentView: Ref<GanttView>, deps: GanttTimelineDeps) {
  const { getTimeX, dateRange, scale } = deps

  /**
   * 计算当前时间轴上的表头单元格（结构与原 gantt.vue 内联实现完全一致）
   */
  const timelineHeaders = computed<GanttHeaderRow[]>(() => {
    const headers: GanttHeaderRow[] = []
    const { start, end } = dateRange.value
    const current = new Date(start)

    // 日视图：第一级为「年-月」单元格，第二级为「天」单元格
    if (currentView.value === 'day') {
      let currentYear: number | null = null
      let currentMonth: number | null = null
      while (current <= end) {
        const y = current.getFullYear()
        const m = current.getMonth()
        if (y !== currentYear) {
          currentYear = y
          headers.push({ year: y, yearLabel: `${y}年`, cells: [] })
        }
        if (m !== currentMonth || headers[headers.length - 1].year !== y) {
          currentMonth = m
          headers[headers.length - 1].cells.push({
            label: `${m + 1}月`,
            x: getTimeX(new Date(y, m, 1)),
            y: 0,
            width: getTimeX(new Date(y, m + 1, 1)) - getTimeX(new Date(y, m, 1)),
            height: 30,
            isWeekend: false,
          })
        }
        current.setDate(current.getDate() + 1)
      }
      const days: GanttHeaderCell[] = []
      const dayCurrent = new Date(start)
      while (dayCurrent <= end) {
        const isWeekend = dayCurrent.getDay() === 0 || dayCurrent.getDay() === 6
        days.push({
          label: dayCurrent.getDate().toString(),
          x: getTimeX(dayCurrent),
          y: 30,
          width: props.dayWidth * scale.value,
          height: 30,
          isWeekend,
        })
        dayCurrent.setDate(dayCurrent.getDate() + 1)
      }
      return [
        { year: headers[0]?.year, yearLabel: headers[0]?.yearLabel, cells: headers.flatMap(h => h.cells) },
        { cells: days },
      ]
    }

    // 周视图：cells 中混排「年-月」与「第 N 周」单元格
    if (currentView.value === 'week') {
      let currentYear: number | null = null
      let currentMonth: number | null = null
      let weekNum = 0
      while (current <= end) {
        const y = current.getFullYear()
        const m = current.getMonth()
        if (y !== currentYear) {
          currentYear = y
          headers.push({ year: y, yearLabel: `${y}年`, cells: [] })
        }
        if (m !== currentMonth || headers[headers.length - 1].year !== y) {
          currentMonth = m
          headers[headers.length - 1].cells.push({
            label: `${y}年${m + 1}月`,
            x: getTimeX(new Date(y, m, 1)),
            y: 0,
            width: getTimeX(new Date(y, m + 1, 1)) - getTimeX(new Date(y, m, 1)),
            height: 30,
            isWeekend: false,
          })
        }
        headers[headers.length - 1].cells.push({
          label: `第${++weekNum}周`,
          x: getTimeX(current),
          y: 30,
          width: 7 * props.dayWidth * scale.value,
          height: 30,
          isWeekend: false,
        })
        current.setDate(current.getDate() + 7)
      }
      return headers
    }

    // 月视图：cells 为「年-月」单元格
    if (currentView.value === 'month') {
      let currentYear: number | null = null
      while (current <= end) {
        const y = current.getFullYear()
        const m = current.getMonth()
        if (y !== currentYear) {
          currentYear = y
          headers.push({ year: y, yearLabel: `${y}年`, cells: [] })
        }
        // 单层结构：直接显示"2026年4月"
        headers[headers.length - 1].cells.push({
          label: `${y}年${m + 1}月`,
          x: getTimeX(new Date(y, m, 1)),
          y: 0,
          width: getTimeX(new Date(y, m + 1, 1)) - getTimeX(new Date(y, m, 1)),
          height: 30,
          isWeekend: false,
        })
        current.setMonth(current.getMonth() + 1)
      }
      return headers
    }

    return []
  })

  return { timelineHeaders }
}
