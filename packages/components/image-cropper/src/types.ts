/** 裁剪输出数据 */
export interface CropData {
  /** 裁剪区域的 Canvas */
  canvas: HTMLCanvasElement
  /** 裁剪区域的坐标和尺寸 */
  cropBox: { left: number, top: number, width: number, height: number }
  /** 原图尺寸 */
  naturalSize: { width: number, height: number }
  /** 裁剪后的 Blob 对象 */
  blob: Blob | null
  /** Base64 数据 URL */
  dataURL: string
}

/** 图片裁剪器 props */
export interface ImageCropperProps {
  /** 图片地址 */
  src?: string
  /** 图片 alt */
  alt?: string
  /** 是否显示工具栏 */
  toolbar?: boolean
  /** 是否显示底部操作按钮 */
  showAction?: boolean
  /** 裁剪框宽高比，默认自由 */
  aspectRatio?: number
  /** 初始裁剪区域大小，0-1，默认 0.8 */
  autoCropArea?: number
  /** 视图模式：0-自由，1-限制裁剪框，2-限制画布，3-两边限制 */
  viewMode?: 0 | 1 | 2 | 3
  /** 输出格式 */
  outputType?: 'jpeg' | 'png' | 'webp'
  /** 输出质量 0-1 */
  outputQuality?: number
  /** 输出宽度 */
  outputWidth?: number
  /** 输出高度 */
  outputHeight?: number
  /** 是否显示引导线 */
  guides?: boolean
  /** 是否显示中心指示线 */
  center?: boolean
  /** 是否启用高质量模式 */
  high?: boolean
}

/** 组件事件（defineEmits 与内部 composable 共用） */
export interface ImageCropperEmits {
  /** 裁剪完成，返回裁剪数据 */
  (e: 'cropped', data: CropData): void
  /** 裁剪器就绪 */
  (e: 'ready'): void
  /** 裁剪器销毁 */
  (e: 'destroyed'): void
  /** 确认裁剪 */
  (e: 'confirm', data: CropData): void
  /** 取消 */
  (e: 'cancel'): void
}
