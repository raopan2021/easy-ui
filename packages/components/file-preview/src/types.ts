/**
 * EasyFilePreview 文件预览组件类型定义
 *
 * 原内联在 file-preview.vue 中的类型（FileItem / FieldNames / FileInputType）
 * 收敛到此文件，供 .vue 与 use-*.ts composable 共用，
 * 并通过 file-preview.vue 的 `export type { ... } from './types'` 保持对外导出兼容。
 */

/** 规范化后的文件项 */
export interface FileItem {
  /** 文件名称 */
  name: string
  /** 文件地址 */
  url: string
  /** 文件大小（KB，兼容字符串） */
  size?: number | string
}

/** 自定义字段名映射（适配后端返回的字段命名） */
export interface FieldNames {
  name?: string
  url?: string
  size?: string
}

/** 文件输入类型：URL 字符串 / 文件对象 / 任意对象（配合 fieldNames 取值） */
export type FileInputType = string | FileItem | Record<string, any>
