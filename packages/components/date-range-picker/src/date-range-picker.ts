/**
 * DateRangePicker 日期范围选择器 - 类型与事件定义。
 *
 * 仅声明对外 props / emits 类型，交互逻辑抽离到 use-date-range-picker.ts，
 * 样式独立维护在 date-range-picker-style.scss（对齐 switch 等组件的拆分规范）。
 */

/** 日期范围选择器 props */
export interface DateRangePickerProps {
  /** 开始日期值 */
  start?: string
  /** 结束日期值 */
  end?: string
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
  /** 日期格式 */
  format?: string
  /** 日期值格式 */
  valueFormat?: string
  /** 分隔符 */
  separator?: string
  /** 组件尺寸 */
  size?: 'large' | 'default' | 'small'
}

/** 组件事件（defineEmits 与内部 composable 共用） */
export interface DateRangePickerEmits {
  (e: 'update:start', value: string): void
  (e: 'update:end', value: string): void
  (e: 'change', value: { start: string, end: string }): void
}
