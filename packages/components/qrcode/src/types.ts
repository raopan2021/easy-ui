/**
 * EasyQrcode 二维码组件类型定义。
 *
 * 原内联在 qrcode.vue 中的 `QrcodeOptions` 与组件 props 完全一致，
 * 此处统一收敛为 `QrcodeProps`（`QrcodeOptions` 作为兼容别名保留导出）。
 */

/** 二维码组件 props（与历史 `QrcodeOptions` 同构） */
export interface QrcodeProps {
  /** 二维码内容（文本、URL等） */
  content?: string
  /** 二维码尺寸（宽度和高度），单位 px，默认 200 */
  size?: number
  /** 前景色，默认 #000000 */
  colorDark?: string
  /** 背景色，默认 #ffffff */
  colorLight?: string
  /** 纠错级别：L/M/Q/H，默认 M */
  correctLevel?: 'L' | 'M' | 'Q' | 'H'
  /** 是否在中心显示 logo */
  logo?: string
  /** logo 尺寸，单位 px，默认尺寸的 15% */
  logoSize?: number
  /** logo 背景色（用于白边），默认白色 */
  logoBackgroundColor?: string
  /** logo 圆角，默认 8px */
  logoRadius?: number
  /** 二维码白边宽度，默认 size * 0.04 */
  margin?: number
}

/** 兼容历史导出名（原 qrcode.vue 内联的 `QrcodeOptions` 即 props 定义） */
export type QrcodeOptions = QrcodeProps

/** 二维码组件事件（defineEmits 与内部 composable 共用） */
export interface QrcodeEmits {
  /** 生成完成时触发 */
  (e: 'generated', dataUrl: string): void
  /** 生成失败时触发 */
  (e: 'error', error: Error): void
}
