import type { InputProps } from './input'

import { computed, ref } from 'vue'
import { parseDecimalPlaces } from './use-input-format'

/** 原生 inputmode 合法值 */
export type InputMode = 'text' | 'search' | 'tel' | 'email' | 'url' | 'none' | 'numeric' | 'decimal'

/**
 * 输入框交互状态与派生样式。
 *
 * 汇总 DOM 引用、焦点 / 悬浮 / 输入法 / 密码可见等 UI 状态，
 * 以及由此派生的类名、行内样式、实际渲染 type 与 inputmode。
 *
 * @param props 输入框 props
 * @param slots 组件插槽对象（用于判断是否存在 prefix / suffix 插槽）
 */
export function useInputState(props: InputProps, slots: Readonly<Record<string, unknown>>) {
  /** 原生输入元素引用（input 或 textarea） */
  const inputRef = ref<HTMLInputElement | HTMLTextAreaElement | null>(null)
  /** 是否聚焦 */
  const focusing = ref(false)
  /** 是否悬浮 */
  const hovering = ref(false)
  /** 是否处于中文输入法组合输入中 */
  const isComposing = ref(false)
  /** 密码是否明文显示 */
  const passwordVisible = ref(false)

  /** textarea 样式 */
  const textareaStyle = computed(() => ({
    resize: props.resize,
  }))

  /** 根节点类名（尺寸 + 禁用 / 聚焦状态） */
  const wrapperClass = computed(() => [
    `easy-input--${props.size}`,
    {
      'is-disabled': props.disabled,
      'is-focus': focusing.value,
    },
  ])

  /** 是否需要渲染后缀区域 */
  const showSuffix = computed(() => {
    return props.clearable || props.type === 'password' || !!props.suffixIcon || !!props.suffix || !!slots.suffix
  })

  /** 输入框容器类名（悬浮 / 聚焦 / 禁用 / 前后缀占位） */
  const wrapperInnerClass = computed(() => ({
    'is-hover': hovering.value && !props.disabled,
    'is-focus': focusing.value,
    'is-disabled': props.disabled,
    'has-prefix': !!props.prefixIcon || !!slots.prefix,
    'has-suffix': showSuffix.value,
  }))

  /** 实际渲染到原生 input 的 type（受限数值类型统一降级为 text） */
  const currentType = computed(() => {
    if (props.type === 'password') {
      return passwordVisible.value ? 'text' : 'password'
    }
    // integer / positiveInteger / decimal(N) 映射到原生 text
    if (props.type === 'integer' || props.type === 'positiveInteger' || parseDecimalPlaces(props.type) !== null) {
      return 'text'
    }
    return props.type
  })

  /** 实际渲染的 inputmode（未显式指定时按数值类型推导） */
  const inputmodeValue = computed((): InputMode | undefined => {
    if (props.inputmode)
      return props.inputmode as InputMode
    if (props.type === 'integer' || props.type === 'positiveInteger')
      return 'numeric'
    if (parseDecimalPlaces(props.type) !== null)
      return 'decimal'
    return undefined
  })

  /** 切换密码明文 / 密文 */
  function togglePassword() {
    passwordVisible.value = !passwordVisible.value
  }

  /** 聚焦 */
  function focus() {
    inputRef.value?.focus()
  }

  /** 失焦 */
  function blur() {
    inputRef.value?.blur()
  }

  /** 选中 */
  function select() {
    inputRef.value?.select()
  }

  return {
    inputRef,
    focusing,
    hovering,
    isComposing,
    passwordVisible,
    textareaStyle,
    wrapperClass,
    showSuffix,
    wrapperInnerClass,
    currentType,
    inputmodeValue,
    togglePassword,
    focus,
    blur,
    select,
  }
}
