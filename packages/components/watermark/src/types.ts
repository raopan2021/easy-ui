/**
 * 水印配置（组件 props 与 v-watermark 指令共用的对外类型）。
 *
 * 组件侧由 watermark.vue 通过 withDefaults 填充默认值；
 * 指令侧由 directive.ts 在解构时就地给出同样的默认值。
 */
export interface WatermarkOptions {
  /** 水印文字内容，支持多行（数组形式） */
  content?: string | string[]
  /** 水印图片 URL（与 content 二选一，图片优先） */
  image?: string
  /** 是否让水印作为容器背景（false 时水印覆盖在内容上方），默认 true */
  fullPage?: boolean
  /** 水印旋转角度，单位度，默认 -22 */
  rotate?: number
  /** 单个水印区域宽度，单位 px，默认 120 */
  width?: number
  /** 单个水印区域高度，单位 px，默认 64（文字）或按图片比例 */
  height?: number
  /** 字体大小，单位 px，默认 14 */
  fontSize?: number
  /** 字体颜色，默认 rgba(0, 0, 0, 0.15) */
  fontColor?: string
  /** 字体族，默认 'sans-serif' */
  fontFamily?: string
  /** 字体粗细，默认 'normal' */
  fontWeight?: string
  /** 水印整体透明度 0~1，默认 1 */
  opacity?: number
  /** 水印之间水平间距，单位 px，默认 100 */
  gapX?: number
  /** 水印之间垂直间距，单位 px，默认 100 */
  gapY?: number
  /** 水印区域在画布中的偏移量 */
  offset?: { x?: number, y?: number }
  /** 图片水印宽度（仅在 image 模式下生效），默认 120 */
  imageWidth?: number
  /** 是否防篡改（监听 DOM 变动自动重建水印），默认 false */
  preventDelete?: boolean
  /** z-index，默认 9 */
  zIndex?: number
}

/**
 * 组件内部使用的 props 类型：经 withDefaults 填充后所有配置项均已有值。
 *
 * WatermarkOptions 的每一项都在 watermark.vue 中声明了默认值，因此这里用
 * Required 去掉可选性，canvas 绘制相关的算术运算无需再逐项兜底。
 */
export type WatermarkResolvedOptions = Required<WatermarkOptions>
