/** 统计数值配色变体（决定数值与图标的主题色） */
export type StatisticVariant = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'

/** 统计数值尺寸（影响内边距、圆角、数值字号与图标尺寸） */
export type StatisticSize = 'sm' | 'md' | 'lg'

/** 趋势方向：up 上升（绿色 + 上箭头），down 下降（红色 + 下箭头） */
export type StatisticTrend = 'up' | 'down'

/** 统计数值组件 props（与 defineProps 内联定义保持一致的对外类型） */
export interface StatisticProps {
  // 基础
  /** 标题文字，可被 title 插槽覆盖 */
  title?: string
  /** 统计值：number 走千分位格式化（可配合增长动画），string 原样展示 */
  value: number | string
  /** 保留小数位数，仅对 number 类型的 value 生效 */
  precision?: number

  // 前后缀
  /** 数值前缀（如货币符号），可被 prefix 插槽覆盖 */
  prefix?: string
  /** 数值后缀（如单位），可被 suffix 插槽覆盖 */
  suffix?: string

  // 样式
  /** 配色变体 */
  variant?: StatisticVariant
  /** 尺寸 */
  size?: StatisticSize

  // 趋势
  /** 趋势方向，不传则不渲染趋势区域 */
  trend?: StatisticTrend
  /** 趋势说明文字，可被 trendLabel 插槽覆盖 */
  trendLabel?: string

  // 图标
  /** 标题前图标名（Element Plus 图标名，如 el:User） */
  icon?: string

  // 说明
  /** 底部补充说明文字，可被 extra 插槽覆盖 */
  extra?: string

  // 选项
  /** 是否显示边框 */
  bordered?: boolean
  /** 是否开启 hover 悬浮抬起效果 */
  hoverable?: boolean
  /** 是否开启数值增长动画（仅 number 类型 value 生效） */
  animated?: boolean
  /** 增长动画时长，单位 ms */
  animationDuration?: number
}

/** 兼容原 statistic.vue 中导出的类型名（旧代码可能以 Props 引用） */
export type Props = StatisticProps

/** 统计数值组件事件（defineEmits 与内部 composable 共用） */
export interface StatisticEmits {
  /** 数值增长动画播放完毕时触发（仅 animated 且 value 为 number 时会触发） */
  animationComplete: []
}
