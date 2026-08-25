/**
 * EasyBarcode 条码组件类型定义。
 *
 * 原内联在 barcode.vue 中的 `BarcodeOptions` 与组件 props 完全一致，
 * 此处统一收敛为 `BarcodeProps`（`BarcodeOptions` 作为兼容别名保留导出）。
 */

/** 条码组件 props（与历史 `BarcodeOptions` 同构） */
export interface BarcodeProps {
  /** 条码内容 */
  content?: string
  /** 条码格式，支持：CODE39, CODE128, EAN13, EAN8, UPC, CODE93, ITF14, MSI, POSTNET 等 */
  format?: string
  /** 条码宽度（单个条的宽度），单位 px，默认 2 */
  width?: number
  /** 条码高度，单位 px，默认 100 */
  height?: number
  /** 是否显示文本内容，默认 true */
  displayValue?: boolean
  /** 文本字体，默认 'Courier New' */
  font?: string
  /** 文本字体大小，默认 20 */
  fontSize?: number
  /** 文本对齐方式，默认 'center' */
  textAlign?: 'left' | 'center' | 'right'
  /** 文本距离条的距离，单位 px，默认 10 */
  margin?: number
  /** 背景色，默认 #ffffff */
  background?: string
  /** 条的颜色，默认 #000000 */
  lineColor?: string
}

/** 兼容历史导出名（原 barcode.vue 内联的 `BarcodeOptions` 即 props 定义） */
export type BarcodeOptions = BarcodeProps

/** 条码组件事件（defineEmits 与内部 composable 共用） */
export interface BarcodeEmits {
  /** 生成完成时触发 */
  (e: 'generated', svgElement: SVGElement): void
  /** 生成失败时触发 */
  (e: 'error', error: Error): void
}
