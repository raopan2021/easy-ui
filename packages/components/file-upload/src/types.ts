/**
 * EasyUpload 上传组件类型定义
 *
 * 原内联在 file-upload.vue 中的类型（UploadStatus / UploadValueMode / UploadFileItem /
 * UploadEmits / UploadProps）收敛到此文件，供 .vue 与 use-*.ts composable 共用，
 * 并通过 file-upload.vue 的 `export type { ... } from './types'` 保持对外导出兼容。
 */

/** 文件上传状态 */
export type UploadStatus = 'ready' | 'uploading' | 'success' | 'error'

/** v-model 返回值模式 */
export type UploadValueMode = 'array' | 'string'

/**
 * 上传文件对象
 * @property id - 文件唯一标识
 * @property name - 文件名称
 * @property url - 文件地址
 * @property size - 文件大小（字节）
 * @property status - 上传状态
 * @property percent - 上传进度
 * @property raw - 原始文件对象
 */
export interface UploadFileItem {
  /** 文件唯一标识 */
  id: string
  /** 文件名称 */
  name: string
  /** 文件地址 */
  url: string
  /** 文件大小（字节） */
  size?: number
  /** 上传状态 */
  status?: UploadStatus
  /** 上传进度 0-100 */
  percent?: number
  /** 原始文件对象 */
  raw?: File
  /** 刚上传成功（触发闪烁动画，动画结束后自动清除） */
  justUploaded?: boolean
}

/** 组件 props（defineProps 与内部 composable 共用） */
export interface UploadProps {
  /** v-model 绑定值，支持对象数组或 JSON 字符串 */
  modelValue?: UploadFileItem[] | string
  /** 返回值模式：array 返回对象数组，string 返回 JSON 字符串 */
  valueMode?: UploadValueMode
  /** 最多上传数量 */
  limit?: number
  /** 是否支持多选 */
  multiple?: boolean
  /** 原生 accept 属性（文件选择框筛选） */
  accept?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否支持下载 */
  downloadable?: boolean
  /** 提示文字 */
  tip?: string
  /** 触发区域文字 */
  triggerText?: string
  /** 列表方向 */
  listType?: 'horizontal' | 'vertical'

  // ===== 内置校验配置（无需写 JS） =====
  /** 允许的文件后缀或 MIME 类型，逗号拼接，如 "pdf,doc,docx" */
  acceptTypes?: string
  /** 单文件最大尺寸（KB），如 2048 表示 2MB */
  maxSize?: number
  /** 单文件最小尺寸（KB），默认 0 */
  minSize?: number

  /** 自动使用接口上传 */
  autoNetworkUpload?: boolean
}

/** 组件事件（defineEmits 与内部 composable 共用，callable 形式便于 emit 直接标注类型） */
export interface UploadEmits {
  (e: 'update:modelValue', value: UploadFileItem[] | string): void
  (e: 'change', fileList: UploadFileItem[]): void
  (e: 'remove', file: UploadFileItem, fileList: UploadFileItem[]): void
  (e: 'success', file: UploadFileItem): void
  (e: 'error', error: Error, file: UploadFileItem): void
  (e: 'exceed', files: File[], limit: number): void
  (e: 'validate-error', msg: string, file: File): void
}
