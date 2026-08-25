/**
 * EasyImageUpload 图片上传组件类型定义
 *
 * 原内联在 image-upload.vue 中的类型（UploadStatus / UploadValueMode / UploadFile / Props）
 * 收敛到此文件，供 .vue 与 use-image-upload.ts 共用，
 * 并通过 image-upload.vue 的 `export type { ... } from './types'` 保持对外导出兼容。
 */

/** 上传状态 */
export type UploadStatus = 'ready' | 'uploading' | 'success' | 'error'

/** 返回值模式 */
export type UploadValueMode = 'array' | 'string'

/** 内部文件项 */
export interface UploadFile {
  uid: string
  name: string
  url?: string
  status: UploadStatus
  percent?: number
  raw?: File
}

/** 组件 props */
export interface ImageUploadProps {
  /** v-model 绑定值，支持字符串数组或逗号拼接字符串 */
  modelValue?: string[] | string
  /** 返回值模式：array 返回数组，string 返回逗号拼接（每项 encodeURIComponent 编码） */
  valueMode?: UploadValueMode
  /** 最多上传数量 */
  limit?: number
  /** 是否支持多选 */
  multiple?: boolean
  /** 原生 accept 属性（文件选择框筛选） */
  accept?: string
  /** 图片填充方式 */
  fit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
  /** 缩略图尺寸（px） */
  size?: number
  /** 是否禁用 */
  disabled?: boolean
  /** 是否支持预览 */
  previewable?: boolean
  /** 提示文字 */
  tip?: string
  /** 触发区域文字 */
  triggerText?: string
  // ===== 内置校验配置（无需写 JS） =====
  /** 允许的文件后缀或 MIME 类型，逗号拼接，如 "jpg,png,gif" 或 "image/jpeg,image/png" */
  acceptTypes?: string
  /** 单文件最大尺寸（MB），不设置则不限制 */
  maxSize?: number
  /** 单文件最小尺寸（MB），默认 0 */
  minSize?: number
}

/** 组件事件（defineEmits 与内部 composable 共用，callable 形式） */
export interface ImageUploadEmits {
  (e: 'update:modelValue', value: string[] | string): void
  (e: 'change', fileList: UploadFile[]): void
  (e: 'remove', file: UploadFile, fileList: UploadFile[]): void
  (e: 'success', url: string, file: UploadFile): void
  (e: 'error', error: Error, file: UploadFile): void
  (e: 'exceed', files: File[], limit: number): void
  (e: 'validate-error', msg: string, file: File): void
}
