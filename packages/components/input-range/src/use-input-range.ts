import type { InputRangeEmits, InputRangeProps } from './types'

/**
 * 区间输入框交互逻辑（开始/结束值变更、回车搜索）。
 *
 * 将原本内联在 input-range.vue 中的事件处理方法抽离为独立 composable，
 * 便于单测复用，也让 .vue 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 *
 * @param props 响应式 props（需传入 withDefaults 后的对象）
 * @param emit   组件 emit 函数（callable 形式的 InputRangeEmits）
 */
export function useInputRange(props: InputRangeProps, emit: InputRangeEmits) {
  // 处理开始值变化
  function handleStartChange(value: string | number) {
    emit('update:start', value)
    emit('change', { start: value, end: props.end ?? '' })
  }

  // 处理结束值变化
  function handleEndChange(value: string | number) {
    emit('update:end', value)
    emit('change', { start: props.start ?? '', end: value })
  }

  // 回车触发搜索
  function handleEnter() {
    emit('keyup:enter')
  }

  return {
    handleStartChange,
    handleEndChange,
    handleEnter,
  }
}
