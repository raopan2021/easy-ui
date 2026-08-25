import type { DateTimeRangePickerEmits, DateTimeRangePickerProps } from './date-time-range-picker'

/**
 * 日期时间范围选择器逻辑：转发开始 / 结束时间变化并对外 emit。
 *
 * 将原本内联在 date-time-range-picker.vue 中的 handleStartChange / handleEndChange
 * 抽离为独立 composable（对齐 switch 等组件的拆分规范）。
 *
 * @param props 组件 props（读取 start / end 以拼装 change 事件）
 * @param emit  组件事件触发函数（callable 形式，直接标注 DateTimeRangePickerEmits 类型）
 */
export function useDateTimeRangePicker(props: DateTimeRangePickerProps, emit: DateTimeRangePickerEmits) {
  /** 处理开始时间变化 */
  function handleStartChange(value: string) {
    emit('update:start', value)
    emit('change', { start: value, end: props.end ?? '' })
  }

  /** 处理结束时间变化 */
  function handleEndChange(value: string) {
    emit('update:end', value)
    emit('change', { start: props.start ?? '', end: value })
  }

  return {
    handleStartChange,
    handleEndChange,
  }
}
