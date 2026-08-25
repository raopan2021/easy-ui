import type { Ref } from 'vue'
import type { FormItemContext } from '../../form'

import type { InputEmits, InputProps } from './input'
import type { InputSanitizeResult } from './use-input-format'
import { inject, nextTick } from 'vue'

/** use-input-events 依赖的上下文（由 use-input-state / use-input-format 提供） */
export interface InputEventsContext {
  /** 原生输入元素引用 */
  inputRef: Ref<HTMLInputElement | HTMLTextAreaElement | null>
  /** 焦点状态（由事件处理器维护） */
  focusing: Ref<boolean>
  /** 输入法组合状态 */
  isComposing: Ref<boolean>
  /** 输入值规范化函数 */
  sanitizeValue: (target: HTMLInputElement | HTMLTextAreaElement) => InputSanitizeResult
  /** 失焦范围收敛函数 */
  clampOnBlur: () => string | null
}

/**
 * 输入框事件处理：值同步、输入法、焦点、清空、键盘事件。
 *
 * 同时负责与外层 EasyFormItem 的联动校验（change / blur 时机），
 * 以及值被规范化后的光标位置恢复。
 *
 * @param props 输入框 props
 * @param emit 组件 emit 函数
 * @param ctx 状态与格式化上下文
 */
export function useInputEvents(props: InputProps, emit: InputEmits, ctx: InputEventsContext) {
  const { inputRef, focusing, isComposing, sanitizeValue, clampOnBlur } = ctx

  // 若被包裹在 EasyFormItem 中，可主动触发字段级校验
  const formItemContext = inject<FormItemContext | null>('easyFormItemContext', null)

  /**
   * 规范化并派发输入值，随后恢复光标位置。
   *
   * @param target 触发事件的原生输入元素
   */
  function emitSanitized(target: HTMLInputElement | HTMLTextAreaElement) {
    const { value, selectionStart, selectionEnd } = sanitizeValue(target)

    emit('update:modelValue', value)
    emit('input', value)
    // 实时校验
    formItemContext?.validateField('change')
    // 下一个 tick DOM 更新后恢复光标位置
    nextTick(() => {
      if (inputRef.value && selectionStart !== null && selectionEnd !== null) {
        inputRef.value.setSelectionRange(selectionStart, selectionEnd)
      }
    })
  }

  /** 原生 input 事件（输入法组合期间跳过，避免拆散拼音） */
  function handleInput(e: Event) {
    if (isComposing.value)
      return
    emitSanitized(e.target as HTMLInputElement | HTMLTextAreaElement)
  }

  /** 输入法组合结束：结束标记并按普通输入处理 */
  function handleCompositionEnd(e: Event) {
    isComposing.value = false
    emitSanitized(e.target as HTMLInputElement | HTMLTextAreaElement)
  }

  /** 派发 change（值以当前 modelValue 为准） */
  function handleChange() {
    emit('change', String(props.modelValue))
  }

  /** 聚焦 */
  function handleFocus(e: FocusEvent) {
    focusing.value = true
    emit('focus', e)
  }

  /** 失焦：先做 min/max 完整范围收敛，再派发 change / blur 并触发校验 */
  function handleBlur(e: FocusEvent) {
    focusing.value = false

    // 失焦时应用 min/max 完整范围限制
    const clamped = clampOnBlur()
    if (clamped !== null) {
      emit('update:modelValue', clamped)
    }

    handleChange()
    emit('blur', e)
    formItemContext?.validateField('blur')
  }

  /** 键盘事件透传 */
  function handleKeydown(e: KeyboardEvent) {
    emit('keydown', e)
  }

  /** 清空并重新聚焦 */
  function clear() {
    emit('update:modelValue', '')
    emit('clear')
    inputRef.value?.focus()
  }

  return {
    handleInput,
    handleCompositionEnd,
    handleChange,
    handleFocus,
    handleBlur,
    handleKeydown,
    clear,
  }
}
