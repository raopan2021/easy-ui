/**
 * EasyTimelineItem 时间线项组件类型定义
 *
 * 集中维护 props 与共享类型，供 timeline-item.vue 与 use-timeline-item.ts 共用，
 * 并通过对 timeline-item.ts 的 re-export 保持 `export * from './src/timeline-item'` 对外兼容。
 */

/** 时间线节点状态 */
export type TimelineStatus = 'wait' | 'process' | 'finish' | 'error'

/** 组件 props（defineProps 与内部 composable 共用） */
export interface TimelineItemProps {
  /** 节点状态 */
  status?: TimelineStatus
  /** 时间戳 */
  timestamp?: string
  /** 图标名称（如 el:Check, el:Clock） */
  icon?: string
}

/** 时间线方向 */
export type TimelineDirection = 'horizontal' | 'vertical'

/** 时间线容器组件 props（defineProps 与内部 composable 共用） */
export interface TimelineProps {
  /** 时间线方向 */
  direction?: TimelineDirection
  /** 是否倒序显示 */
  reverse?: boolean
  /** 自定义类名 */
  customClass?: string
}
