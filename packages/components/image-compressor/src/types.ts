/**
 * EasyImageCompressor 图片压缩组件类型定义
 *
 * 压缩选项参考 Caesium Image Compressor（桌面工具）的能力模型，
 * 浏览器端由 compressorjs（HTMLCanvasElement.toBlob）实现。
 */

/** 尺寸调整方式 */
export type SizeMode = 'original' | 'pixel' | 'percent' | 'shortEdge' | 'longEdge' | 'width' | 'height'

/** 输出格式 */
export type OutputFormat = 'auto' | 'jpeg' | 'png' | 'webp'

/** 缩放方式（映射 compressorjs resize） */
export type ResizeMode = 'contain' | 'cover' | 'scale'

/** 透明背景填充色（PNG 等带透明通道转 JPEG 时使用） */
export type FillColor = '' | 'white' | 'black'

/** 压缩选项（对应 UI 面板上的各项配置） */
export interface CompressOptions {
  /** 质量 0-100（映射 compressorjs quality 0-1） */
  quality: number
  /** 一键无损压缩（等价于 quality=1，输出更接近原图） */
  lossless: boolean
  /** 尺寸调整方式 */
  sizeMode: SizeMode
  /** 尺寸数值（配合 sizeMode：percent 为百分比；width/height/shortEdge/longEdge 为像素） */
  sizeValue: number
  /** 指定像素模式：目标宽度 */
  pixelWidth?: number
  /** 指定像素模式：目标高度 */
  pixelHeight?: number
  /** 输出格式 */
  outputFormat: OutputFormat
  /** 添加前缀（重命名输出文件） */
  prefix: string
  /** 添加后缀（重命名输出文件，不含扩展名） */
  suffix: string
  /** 压缩后文件大于源文件时跳过（输出原图） */
  skipLarger: boolean
  /** 读取并修正 JPEG EXIF 方向 */
  checkOrientation: boolean
  /** 保留 EXIF 信息 */
  retainExif: boolean
  /** 缩放方式：contain 保持比例 / cover 裁剪填满 / scale 拉伸 */
  resize: ResizeMode
  /** 透明背景填充色（空串表示不填充） */
  canvasFillColor: FillColor
  /** 大图自动转 JPEG 的类型列表（如 image/png） */
  convertTypes: string[]
  /** 超过此大小（字节）自动转换，默认 5MB */
  convertSize: number
}

/** 默认压缩选项 */
export const DEFAULT_OPTIONS: CompressOptions = {
  quality: 80,
  lossless: false,
  sizeMode: 'original',
  sizeValue: 100,
  pixelWidth: 1920,
  pixelHeight: 1080,
  outputFormat: 'auto',
  prefix: '',
  suffix: '',
  skipLarger: true,
  checkOrientation: true,
  retainExif: false,
  resize: 'contain',
  canvasFillColor: '',
  convertTypes: ['image/png'],
  convertSize: 5 * 1024 * 1024,
}

/** 单张图片压缩结果 */
export interface CompressResult {
  id: string
  /** 输出文件名（含前后缀） */
  name: string
  /** 原始文件名 */
  originalName: string
  /** 原始大小（字节） */
  originalSize: number
  /** 压缩后大小（字节） */
  compressedSize: number
  /** 原图宽高 */
  originalWidth: number
  originalHeight: number
  /** 压缩后宽高 */
  compressedWidth: number
  compressedHeight: number
  /** 节省百分比（0-100，负值表示变大） */
  savedPercent: number
  /** 输出 MIME 类型 */
  mimeType: string
  /** 是否因"输出大于源文件"而跳过 */
  skipped: boolean
  /** 压缩耗时（毫秒） */
  duration: number
  /** 展示信息（压缩率 / 转换等） */
  info: string
  /** 原图 objectURL（用于对比预览） */
  originalUrl: string
  /** 压缩图 objectURL（用于对比预览） */
  compressedUrl: string
  /** 压缩后文件（可下载） */
  file: File
}
