import type { Rule } from './utils'

/**
 * EasyFormItem 表单项类型定义
 *
 * 原内联在 form-item.vue 中的 FormItemProps 收敛到此文件，
 * 供 .vue 与 use-form-item.ts 共用，
 * 并通过 form-item.vue 的 `export type { ... } from './types'` 保持对外导出兼容。
 */

/** 表单项 props */
export interface FormItemProps {
  label?: string
  prop?: string
  rules?: Rule[]
  required?: boolean
  msg?: string
  /** 栅格占位，默认 24（占满一行），inline 模式下常用 6/8/12 等值控制一行几个 */
  span?: number
}
