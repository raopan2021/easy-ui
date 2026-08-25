/**
 * EasyImage 图片组件类型定义
 *
 * 集中维护 props / emits / 内部工具类型，供 image.vue 与 use-image.ts 共用，
 * 并通过对 image.vue 的 `export type { ... } from './types'` 保持对外类型导出兼容。
 */

/** 图片填充方式（object-fit 取值） */
export type ImageFit = 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'

/** 预览操作按钮类型 */
export type ImagePreviewAction = 'zoomIn' | 'zoomOut' | 'rotateLeft' | 'rotateRight' | 'reset' | 'prev' | 'next'

/** 组件 props（defineProps 与内部 composable 共用） */
export interface ImageProps {
  /** 图片地址，支持数组或逗号拼接的字符串 */
  src?: string | string[]
  /** 图片 alt */
  alt?: string
  /** 预览图片列表（可单独设置，与 src 互斥） */
  previewSrcList?: string[]
  /** 预览是否开启 */
  preview?: boolean
  /** 预览操作按钮 */
  previewActions?: ImagePreviewAction[] | true
  /** 多图模式下显示数量 */
  max?: number
  /** 图片填充方式 */
  fit?: ImageFit
  /** 预览模式: 单图single/多图grid */
  mode?: 'single' | 'grid'
  /** 图片宽度，支持数字(px)或字符串(如 '120px', '50%') */
  width?: number | string
  /** 图片高度，支持数字(px)或字符串(如 '120px', '50%') */
  height?: number | string
}

/** 组件事件（defineEmits 与内部 composable 共用） */
export interface ImageEmits {
  (e: 'error', event: Event): void
  (e: 'preview', index: number): void
}
