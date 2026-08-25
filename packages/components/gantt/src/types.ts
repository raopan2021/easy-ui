/**
 * 甘特图组件类型定义（统一类型模块）。
 *
 * 原 gantt.vue 的 props / emits / 数据契约全部内联在单文件中，
 * 现抽出到本模块，供 `gantt.vue` 与各个 `use-*.ts` composable 共用，
 * 避免循环依赖并保持对外 API 不变。
 */

import type { ExtractPropTypes } from 'vue'

import { buildProps, definePropType } from '../../../utils'

/** 视图模式：日 / 周 / 月 */
export type GanttView = 'day' | 'week' | 'month'

/** 列对齐方式 */
export type GanttColumnAlign = 'left' | 'center' | 'right'

/**
 * 甘特图任务数据项（组件内部与外部消费共用）。
 *
 * 为兼容任意业务字段，保留 `[key: string]: any` 索引签名，
 * 使动态列（`task?.[col.prop]`）与可选业务字段（assignee 等）可正常访问。
 */
export interface GanttTask {
  /** 任务唯一标识 */
  id: string | number
  /** 任务名称（左侧列表首列展示） */
  name?: string
  /** 开始时间（字符串或 Date，组件内部统一 parseDate 解析） */
  startDate?: string | Date
  /** 结束时间（字符串或 Date） */
  endDate?: string | Date
  /** 子任务（树形结构） */
  children?: GanttTask[]
  /** 是否展开（树形分组） */
  expanded?: boolean
  /** 是否分组节点 */
  isGroup?: boolean
  /** 是否里程碑（菱形节点） */
  isMilestone?: boolean
  /** 完成进度（0-100） */
  progress?: number
  /** 配色 class：is-default / is-success / is-warning / is-danger / is-info */
  colorClass?: string
  /** 依赖的任务 id 列表（用于绘制依赖连线） */
  dependencies?: (string | number)[]
  /** 负责人（tooltip 展示） */
  assignee?: string
  /** 其余任意业务字段 */
  [key: string]: any
}

/** 左侧任务列表列配置 */
export interface GanttColumn {
  /** 字段名（首列固定为 name 缩进渲染，其余列走插槽） */
  prop: string
  /** 列标题 */
  label?: string
  /** 列宽（数字按 px 处理，字符串原样作为 CSS 宽度值，'auto' 表示自适应） */
  width?: number | string
  /** 文字对齐方式 */
  align?: GanttColumnAlign
  /** 其余任意扩展配置 */
  [key: string]: any
}

/** 甘特图 props 运行时声明（behavior-preserving，default 与原单文件一致） */
export const ganttProps = buildProps({
  /** 任务数据（支持树形 children） */
  data: {
    type: definePropType<GanttTask[]>(Array),
    default: () => [],
  },
  /** 标题（头部工具栏左侧） */
  title: {
    type: String,
    default: '',
  },
  /** 任务列表标题（首列表头），未直接用于渲染，保留 API */
  taskListTitle: {
    type: String,
    default: '任务名称',
  },
  /** 组件宽度（css 值），通过 v-bind 注入 style */
  width: {
    type: String,
    default: '100%',
  },
  /** 组件高度（css 值），通过 v-bind 注入 style */
  height: {
    type: String,
    default: '100%',
  },
  /** 左侧任务列表宽度（数字按 px，'auto' 表示自适应） */
  sidebarWidth: {
    type: definePropType<number | string>([Number, String]),
    default: 280,
  },
  /** 行高（px） */
  rowHeight: {
    type: Number,
    default: 44,
  },
  /** 任务条高度（px） */
  barHeight: {
    type: Number,
    default: 24,
  },
  /** 任务条最小宽度（px） */
  minBarWidth: {
    type: Number,
    default: 20,
  },
  /** 每日宽度（px，未缩放时的基准值） */
  dayWidth: {
    type: Number,
    default: 40,
  },
  /** 是否显示视图切换（日/周/月） */
  showViewSwitch: {
    type: Boolean,
    default: true,
  },
  /** 是否可缩放 */
  zoomable: {
    type: Boolean,
    default: true,
  },
  /** 默认视图：day | week | month */
  defaultView: {
    type: definePropType<GanttView>(String),
    default: 'day',
  },
  /** 日期格式（占位 API，未用于渲染） */
  dateFormat: {
    type: String,
    default: 'YYYY-MM-DD',
  },
  /** 是否显示今日红线 */
  showToday: {
    type: Boolean,
    default: true,
  },
  /** 左侧列表列配置 */
  columns: {
    type: definePropType<GanttColumn[]>(Array),
    default: () => [{ prop: 'name', label: '任务名称', width: 'auto' }],
  },
} as const)

export type GanttProps = ExtractPropTypes<typeof ganttProps>

/**
 * 组件事件（defineEmits 与内部 composable 共用，采用「可调用接口」形式）。
 * - click: 点击任务条/里程碑时触发，payload 为当前任务
 * - change: 展开/折叠任务时触发，payload 为扁平化后的任务列表
 * - task-click: 点击任务条/里程碑时触发（与 click 同时 emit），payload 为当前任务
 */
export interface GanttEmits {
  (e: 'click', task: GanttTask): void
  (e: 'change', tasks: GanttTask[]): void
  (e: 'task-click', task: GanttTask): void
}
