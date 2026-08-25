/**
 * EasyDatePicker 日期选择器类型定义
 *
 * 原内联在 date-picker.vue 中的类型（DatePickerProps）收敛到此文件，
 * 供 .vue 与 use-date-picker.ts 共用，
 * 并通过 date-picker.vue 的 `export type { ... } from './types'` 保持对外导出兼容。
 */

/** 组件 props（defineProps 与内部 composable 共用） */
export interface DatePickerProps {
  modelValue?: string
  /** 选择模式：date（日）/ month（月）/ year（年） */
  type?: 'date' | 'month' | 'year'
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  clearable?: boolean
  /** 输出格式，默认 'YYYY-MM-DD'（month/year 模式忽略） */
  format?: string
  size?: 'large' | 'default' | 'small'
}

/** 组件事件（defineEmits 与内部 composable 共用，callable 形式） */
export interface DatePickerEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}
