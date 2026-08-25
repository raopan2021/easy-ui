/**
 * EasyInputRange 区间输入框组件类型定义
 *
 * 集中维护 props / emits，供 input-range.vue 与 use-input-range.ts 共用，
 * 并通过对 input-range.vue 的 `export type { ... } from './types'` 保持对外类型导出兼容。
 */

/** 输入框输入类型 */
export type InputRangeType
  = | 'text'
    | 'password'
    | 'number'
    | 'integer'
    | 'positiveInteger'
    | 'decimal'
    | `decimal${number}`
    | 'tel'
    | 'email'
    | 'url'

/** 组件 props（defineProps 与内部 composable 共用） */
export interface InputRangeProps {
  /** 开始值 */
  start?: string | number
  /** 结束值 */
  end?: string | number
  /** 占位符 */
  startPlaceholder?: string
  /** 结束占位符 */
  endPlaceholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 是否可清空 */
  clearable?: boolean
  /** 最大长度 */
  maxlength?: number
  /** 分隔符 */
  separator?: string
  /** 组件尺寸 */
  size?: 'large' | 'default' | 'small'
  /** 输入框类型 */
  inputType?: InputRangeType
}

/** 组件事件（defineEmits 与内部 composable 共用） */
export interface InputRangeEmits {
  (e: 'update:start', value: string | number): void
  (e: 'update:end', value: string | number): void
  (e: 'change', value: { start: string | number, end: string | number }): void
  (e: 'keyup:enter'): void
}
