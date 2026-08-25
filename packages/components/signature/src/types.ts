/** 签名板 props（与 signature.vue 的 defineProps 共用） */
export interface SignatureProps {
  /** 画布宽度（像素），默认撑满容器 */
  width?: number
  /** 画布高度（像素） */
  height?: number
  /** 画笔颜色 */
  penColor?: string
  /** 画笔粗细（像素） */
  penSize?: number
  /** 画布背景色 */
  canvasBgColor?: string
  /** 占位提示文字 */
  placeholder?: string
  /** 占位提示图标（EasyIcon 格式） */
  placeholderIcon?: string
  /** 是否显示工具栏 */
  showToolbar?: boolean
  /** 是否显示画笔粗细选择 */
  showPenSize?: boolean
  /** 是否显示画笔颜色选择 */
  showPenColor?: boolean
  /** 是否显示撤销按钮 */
  showUndo?: boolean
  /** 是否显示清空按钮 */
  showClear?: boolean
  /** 是否显示确认按钮 */
  showConfirm?: boolean
  /** 是否显示占位提示 */
  showPlaceholder?: boolean
  /** 工具栏按钮是否带文字 */
  toolbarText?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 画布圆角（像素） */
  radius?: number
}

/** 组件事件（defineEmits 与内部 composable 共用） */
export interface SignatureEmits {
  /** 确认签名时触发，返回签名图片 dataURL */
  (e: 'confirm', dataUrl: string): void
  /** 签名内容变化时触发 */
  (e: 'change', hasContent: boolean): void
  /** 撤销 */
  (e: 'undo'): void
  /** 清空 */
  (e: 'clear'): void
}

/** 画布坐标点（相对画布左上角，CSS 像素） */
export interface SignaturePoint {
  x: number
  y: number
}
