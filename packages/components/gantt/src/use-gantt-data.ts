/**
 * 甘特图核心数据派生 composable。
 *
 * 负责把 props.data 转换为渲染所需的全部「派生状态」：
 *  - 日期解析（parseDate）
 *  - 可见日期范围（含前后留白，避免首尾任务贴边）
 *  - 时间轴总宽度（未乘缩放）
 *  - 日期 → X 坐标映射（含缩放）
 *  - 任务树 → 扁平列表（展开/折叠 + 层级）
 *  - 今日红线 X 坐标
 *  - 按 id 查找任务（含 children 递归）
 *  - 展开/折叠切换（emit change）
 *
 * 把这部分纯逻辑从单文件 gantt.vue 中抽离，便于复用与单测，
 * 同时让 .vue 仅承担「组合 + 模板」职责（对齐 markdown / table 拆分规范）。
 *
 * @param props 甘特图 props（响应式对象，computed 自动追踪依赖）
 * @param emit 甘特图事件发射器（展开切换时 emit change）
 */
import type { GanttEmits, GanttProps, GanttTask } from './types'

import { computed, ref } from 'vue'

export function useGanttData(props: GanttProps, emit: GanttEmits) {
  /** 缩放比例（影响时间轴像素密度，几何计算共用） */
  const scale = ref(1)

  /**
   * 解析日期字符串/对象为 Date。
   * - 空值/非字符串非 Date：返回当前时间（容错，保持原行为）
   * - 支持 `YYYY-MM-DD` / `YYYY/MM/DD` 格式
   * - 其它字符串交给原生 Date 解析
   */
  function parseDate(dateStr: string | number | Date | null | undefined): Date {
    if (!dateStr)
      return new Date()
    if (dateStr instanceof Date)
      return dateStr
    if (typeof dateStr !== 'string')
      return new Date()
    const parts = dateStr.match(/(\d{4})[-/](\d{1,2})[-/](\d{1,2})/)
    if (parts)
      return new Date(parseInt(parts[1]), parseInt(parts[2]) - 1, parseInt(parts[3]))
    return new Date(dateStr)
  }

  /** 可见日期范围（含前后留白，无数据时回退到「本月 + 后两月」） */
  const dateRange = computed(() => {
    if (props.data.length === 0) {
      const today = new Date()
      return {
        start: new Date(today.getFullYear(), today.getMonth(), 1),
        end: new Date(today.getFullYear(), today.getMonth() + 2, 0),
      }
    }
    let minDate: Date | null = null
    let maxDate: Date | null = null
    const findDates = (tasks: GanttTask[]) => {
      tasks.forEach((task) => {
        if (task.startDate) {
          const start = parseDate(task.startDate)
          if (!minDate || start < minDate)
            minDate = start
        }
        if (task.endDate) {
          const end = parseDate(task.endDate)
          if (!maxDate || end > maxDate)
            maxDate = end
        }
        if (task.children)
          findDates(task.children)
      })
    }
    findDates(props.data)
    if (!minDate || !maxDate) {
      const today = new Date()
      return {
        start: new Date(today.getFullYear(), today.getMonth(), 1),
        end: new Date(today.getFullYear(), today.getMonth() + 2, 0),
      }
    }
    const start = new Date(minDate)
    start.setDate(start.getDate() - 7)
    const end = new Date(maxDate)
    end.setDate(end.getDate() + 14)
    return { start, end }
  })

  /** 时间轴总宽度（天 × 每日基准宽度，未乘缩放） */
  const timelineWidth = computed(() => {
    const days = Math.ceil((dateRange.value.end.getTime() - dateRange.value.start.getTime()) / (1000 * 60 * 60 * 24))
    return days * props.dayWidth
  })

  /**
   * 将日期映射为时间轴 X 坐标（已含缩放）。
   * 以 dateRange.start 为原点，按「天数差 × 每日宽度 × 缩放」计算。
   */
  function getTimeX(date: Date): number {
    const diff = Math.ceil((date.getTime() - dateRange.value.start.getTime()) / (1000 * 60 * 60 * 24))
    return diff * props.dayWidth * scale.value
  }

  /** 任务树 → 扁平列表（带层级 / 展开 / 折叠标记，供时间轴与左侧列表共用） */
  const flatTasks = computed(() => {
    const result: GanttTask[] = []
    const flatten = (tasks: GanttTask[], level = 0) => {
      tasks.forEach((task) => {
        result.push({ ...task, level, expanded: task.expanded !== false, collapsed: task.expanded === false })
        if (task.children && task.children.length > 0 && result[result.length - 1].expanded)
          flatten(task.children, level + 1)
      })
    }
    flatten(props.data)
    return result
  })

  /** 今日红线 X 坐标（不可见返回 -1） */
  const todayX = computed(() => {
    if (!props.showToday)
      return -1
    const today = new Date()
    if (today < dateRange.value.start || today > dateRange.value.end)
      return -1
    return getTimeX(today)
  })

  /** 按 id 递归查找任务（含 children） */
  function getTaskById(id: string | number): GanttTask | null {
    const findTask = (tasks: GanttTask[]): GanttTask | null => {
      for (const task of tasks) {
        if (task.id === id)
          return task
        if (task.children) {
          const found = findTask(task.children)
          if (found)
            return found
        }
      }
      return null
    }
    return findTask(props.data)
  }

  /** 切换任务展开/折叠，并 emit change（payload 为当前扁平化列表） */
  function toggleTask(task: GanttTask) {
    task.expanded = !task.expanded
    emit('change', flatTasks.value)
  }

  return {
    scale,
    parseDate,
    dateRange,
    timelineWidth,
    getTimeX,
    flatTasks,
    todayX,
    getTaskById,
    toggleTask,
  }
}
