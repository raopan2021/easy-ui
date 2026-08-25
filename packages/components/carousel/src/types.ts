/** 轮播模式 */
export type CarouselMode = 'slide' | '3d'
/** 轮播方向 */
export type CarouselDirection = 'horizontal' | 'vertical'
/** 箭头显示策略 */
export type ArrowDisplay = 'always' | 'hover' | 'never'
/** 指示器位置 */
export type DotPosition = 'bottom' | 'left' | 'right'
/** 指示器类型 */
export type DotType = 'dot' | 'line' | 'number'

/** 滑动方向（内部状态，决定 TransitionGroup 使用的过渡动画名） */
export type CarouselSlideDirection = 'forward' | 'backward'

/** 轮播组件 props（与原 carousel.vue 内联 defineProps 定义保持一致的对外类型） */
export interface CarouselProps {
  /** 轮播数据列表，支持图片 URL 字符串或任意对象 */
  items: (string | Record<string, any>)[]
  /** 轮播模式：slide（滑动）或 3d（3D 透视） */
  mode?: CarouselMode
  /** 自动播放间隔（毫秒），0 表示不自动播放 */
  interval?: number
  /** 是否循环播放 */
  loop?: boolean
  /** 轮播方向 */
  direction?: CarouselDirection
  /** 箭头显示策略 */
  arrow?: ArrowDisplay
  /** 指示器位置 */
  dotPosition?: DotPosition
  /** 指示器样式类型 */
  dotType?: DotType
  /** 是否显示指示器 */
  showDots?: boolean
  /** 是否显示箭头 */
  showArrows?: boolean
  /** 数据中用作唯一 key 的字段名 */
  itemKey?: string
  /** 是否在鼠标悬停时暂停自动播放 */
  pauseOnHover?: boolean
  /** 初始索引 */
  initialIndex?: number
  /** 是否显示标题（取 items 中的 title 字段，或通过 #title 插槽自定义） */
  showTitle?: boolean
  /** 是否在标题旁显示计数器（当前/总数） */
  showCounter?: boolean
  /** 标题字段名，当 items 为对象数组时，从中读取标题文本 */
  titleField?: string
  /** 轮播容器高度，支持 CSS 值如 '200px'、'40vh'、'300' */
  height?: number | string
}

/**
 * 组件内部使用的 props 类型：经 withDefaults 填充后，具备非 undefined 默认值的字段均已有值。
 *
 * `itemKey` 与 `height` 的默认值显式为 `undefined`，故保持可选（composable 内需自行兜底）；
 * 其余字段用 Required 去掉可选性，composable 内可直接消费。
 */
export type CarouselResolvedProps = CarouselProps & Required<Pick<
  CarouselProps,
  | 'mode'
  | 'interval'
  | 'loop'
  | 'direction'
  | 'arrow'
  | 'dotPosition'
  | 'dotType'
  | 'showDots'
  | 'showArrows'
  | 'pauseOnHover'
  | 'initialIndex'
  | 'showTitle'
  | 'showCounter'
  | 'titleField'
>>

/** 组件事件（defineEmits 与内部 composable 共用） */
export interface CarouselEmits {
  /** 轮播索引变化，携带新索引与切换前的索引 */
  (e: 'change', index: number, prevIndex: number): void
}
