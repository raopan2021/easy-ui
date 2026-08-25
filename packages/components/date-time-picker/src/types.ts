/**
 * EasyDateTimePicker 日期时间选择器类型定义
 *
 * 原内联在 date-time-picker.vue 中的类型（DateTimePickerProps）收敛到此文件，
 * 供 .vue 与 use-date-time-picker.ts 共用，
 * 并通过 date-time-picker.vue 的 `export type { ... } from './types'` 保持对外导出兼容。
 */

/** 组件 props（defineProps 与内部 composable 共用） */
export interface DateTimePickerProps {
  modelValue?: string
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  clearable?: boolean
  showSeconds?: boolean
  size?: 'large' | 'default' | 'small'
  /** 输出格式，默认 'YYYY-MM-DD HH:mm[:ss]' */
  format?: string
}

/** 组件事件（defineEmits 与内部 composable 共用，callable 形式） */
export interface DateTimePickerEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}
