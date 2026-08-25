/** 步骤配置 */
export interface TourStep {
  /** 目标元素选择器或 DOM 元素 */
  target: string | HTMLElement
  /** 标题 */
  title?: string
  /** 描述文本 */
  description?: string
  /** 气泡位置 */
  placement?: 'top' | 'bottom' | 'left' | 'right'
  /** 气泡与目标间距 (px) */
  gap?: number
  /** 是否高亮该元素 */
  highlight?: boolean
  /** 高亮圆角 */
  highlightRadius?: number
  /** 是否可跳过该步骤（点击遮罩时） */
  allowSkip?: boolean
}

export interface TourProps {
  /** 是否显示引导 */
  modelValue?: boolean
  /** 步骤列表 */
  steps?: TourStep[]
  /** 默认气泡位置 */
  placement?: 'top' | 'bottom' | 'left' | 'right'
  /** 气泡与目标间距 (px) */
  gap?: number
  /** 是否显示遮罩 */
  mask?: boolean
  /** 遮罩颜色 */
  maskColor?: string
  /** 是否显示箭头 */
  arrow?: boolean
  /** 是否显示关闭按钮 */
  closeBtn?: boolean
  /** 是否显示步骤索引 */
  showIndex?: boolean
  /** 是否显示上一步按钮 */
  prevBtn?: boolean
  /** "下一步"文字 */
  nextText?: string
  /** "上一步"文字 */
  prevText?: string
  /** "完成"文字 */
  finishText?: string
  /** 起始步骤 (0-indexed) */
  startStep?: number
  /** 主题色 */
  color?: string
  /** 点击遮罩是否关闭 */
  closeOnOverlay?: boolean
  /** 气泡最大宽度 */
  maxWidth?: number | string
  /** 自动滚动到目标元素 */
  scrollIntoView?: boolean
  /** 滚动行为 */
  scrollBehavior?: 'auto' | 'smooth' | 'instant'
  /** z-index */
  zIndex?: number
}

/** 组件事件（defineEmits 与内部 composable 共用） */
export interface TourEmits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'change', current: number): void
  (e: 'finish'): void
  (e: 'close'): void
  (e: 'skip'): void
  (e: 'next', current: number): void
  (e: 'prev', current: number): void
}
