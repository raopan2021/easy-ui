<script setup lang="ts">
import type { FormItemContext } from '../../form'

import type { InputEmits } from './input'
import { computed, inject, nextTick, ref } from 'vue'
import XlyIcon from '../../icon'

import { inputProps } from './input'

defineOptions({ name: 'EasyInput' })

const props = defineProps(inputProps)
const emit = defineEmits<InputEmits>()

const slots = defineSlots()

const inputRef = ref<HTMLInputElement | HTMLTextAreaElement | null>(null)
const focusing = ref(false)
const hovering = ref(false)
const isComposing = ref(false)
const passwordVisible = ref(false)

// 若被包裹在 XlyFormItem 中，可主动触发字段级校验
const formItemContext = inject<FormItemContext | null>('xlyFormItemContext', null)

// textarea 样式
const textareaStyle = computed(() => ({
  resize: props.resize,
}))

const wrapperClass = computed(() => [
  `easy-input--${props.size}`,
  {
    'is-disabled': props.disabled,
    'is-focus': focusing.value,
  },
])

const showSuffix = computed(() => {
  return props.clearable || props.type === 'password' || !!props.suffixIcon || !!slots.suffix
})

const wrapperInnerClass = computed(() => ({
  'is-hover': hovering.value && !props.disabled,
  'is-focus': focusing.value,
  'is-disabled': props.disabled,
  'has-prefix': !!props.prefixIcon || !!slots.prefix,
  'has-suffix': showSuffix.value,
}))

/** 解析 decimal 类型的小数位数：decimal=2，decimal4=4，其余返回 null */
function parseDecimalPlaces(type: string): number | null {
  if (type === 'decimal')
    return 2
  const m = type.match(/^decimal(\d+)$/)
  return m ? Number(m[1]) : null
}

/** 按类型过滤输入值，返回合法字符串（用于 integer / positiveInteger / decimal(N)） */
function filterByType(raw: string, type: string): string {
  if (type === 'integer') {
    return raw.replace(/\D/g, '')
  }
  if (type === 'positiveInteger') {
    return raw.replace(/\D/g, '').replace(/^0+/, '')
  }
  const places = parseDecimalPlaces(type)
  if (places !== null) {
    // 只保留数字和第一个小数点
    let s = raw.replace(/[^\d.]/g, '')
    const firstDot = s.indexOf('.')
    if (firstDot !== -1) {
      const intPart = s.slice(0, firstDot)
      const decPart = s
        .slice(firstDot + 1)
        .replace(/\./g, '')
        .slice(0, places)
      s = `${intPart}.${decPart}`
    }
    // 去除前导 0（保留单个 0 与 "0." 形式）
    s = s.replace(/^0+(\d)/, '$1')
    return s
  }
  return raw
}

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

/** 原生 inputmode 合法值 */
type InputMode = 'text' | 'search' | 'tel' | 'email' | 'url' | 'none' | 'numeric' | 'decimal'

/** 实际渲染的 inputmode */
const inputmodeValue = computed((): InputMode | undefined => {
  if (props.inputmode)
    return props.inputmode as InputMode
  if (props.type === 'integer' || props.type === 'positiveInteger')
    return 'numeric'
  if (parseDecimalPlaces(props.type) !== null)
    return 'decimal'
  return undefined
})

/** 是否为受限制的数值类型 */
const isNumericType = computed(() => {
  return props.type === 'integer' || props.type === 'positiveInteger' || parseDecimalPlaces(props.type) !== null
})

/** range 有效最小值 */
const effectiveMin = computed(() => props.range?.min)

/** range 有效最大值 */
const effectiveMax = computed(() => props.range?.max)

/** 最小值是否包含等于 */
const effectiveMinInclusive = computed(() => props.range?.minInclusive ?? true)

/** 最大值是否包含等于 */
const effectiveMaxInclusive = computed(() => props.range?.maxInclusive ?? true)

/** 校验并同步当前输入值（含光标位置处理），返回是否发生了修正 */
function sanitizeValue(target: HTMLInputElement | HTMLTextAreaElement) {
  let value = target.value
  let selectionStart = target.selectionStart
  let selectionEnd = target.selectionEnd

  // 自动转大写
  if (props.toUpperCase && props.type !== 'textarea') {
    const uppered = value.toUpperCase()
    if (uppered !== value) {
      value = uppered
      target.value = uppered
    }
  }

  // 仅允许大写字母和数字
  if (props.alphaNumOnly && props.type !== 'textarea') {
    const filtered = value.replace(/[^A-Z0-9]/g, '')
    if (filtered !== value) {
      const beforeCursor = value.slice(0, selectionStart ?? 0)
      const keptBefore = beforeCursor.replace(/[^A-Z0-9]/g, '')
      const cursorPos = keptBefore.length
      value = filtered
      selectionStart = selectionEnd = cursorPos
      target.value = filtered
    }
  }

  // 受限数字类型
  if (isNumericType.value) {
    const result = filterByType(value, props.type)
    if (result !== value) {
      const beforeCursor = value.slice(0, selectionStart ?? 0)
      const keptBefore = filterByType(beforeCursor, props.type)
      const cursorPos = keptBefore.length
      value = result
      selectionStart = selectionEnd = cursorPos
      target.value = result
    }
    // 输入时仅限制最大值
    if (effectiveMax.value !== undefined) {
      const n = Number(value)
      const overMax = effectiveMaxInclusive.value ? n > effectiveMax.value : n >= effectiveMax.value
      if (!Number.isNaN(n) && overMax) {
        const clamped = String(effectiveMax.value)
        selectionStart = selectionEnd = clamped.length
        value = clamped
        target.value = clamped
      }
    }
  }

  return { value, selectionStart, selectionEnd }
}

function handleInput(e: Event) {
  if (isComposing.value)
    return
  const target = e.target as HTMLInputElement | HTMLTextAreaElement
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

function handleCompositionEnd(e: Event) {
  isComposing.value = false
  const target = e.target as HTMLInputElement | HTMLTextAreaElement
  const { value, selectionStart, selectionEnd } = sanitizeValue(target)

  emit('update:modelValue', value)
  emit('input', value)
  formItemContext?.validateField('change')
  nextTick(() => {
    if (inputRef.value && selectionStart !== null && selectionEnd !== null) {
      inputRef.value.setSelectionRange(selectionStart, selectionEnd)
    }
  })
}

function handleChange() {
  emit('change', String(props.modelValue))
}

function handleFocus(e: FocusEvent) {
  focusing.value = true
  emit('focus', e)
}

function handleBlur(e: FocusEvent) {
  focusing.value = false

  // 失焦时应用 min/max 完整范围限制
  if (isNumericType.value && (effectiveMin.value !== undefined || effectiveMax.value !== undefined)) {
    const currentValue = String(props.modelValue ?? '')
    const n = Number(currentValue)
    if (currentValue !== '' && !Number.isNaN(n)) {
      let clamped: string | null = null
      if (effectiveMax.value !== undefined) {
        const overMax = effectiveMaxInclusive.value ? n > effectiveMax.value : n >= effectiveMax.value
        if (overMax)
          clamped = String(effectiveMax.value)
      }
      if (clamped === null && effectiveMin.value !== undefined) {
        const underMin = effectiveMinInclusive.value ? n < effectiveMin.value : n <= effectiveMin.value
        if (underMin)
          clamped = String(effectiveMin.value)
      }
      if (clamped !== null && clamped !== currentValue) {
        emit('update:modelValue', clamped)
      }
    }
  }

  handleChange()
  emit('blur', e)
  formItemContext?.validateField('blur')
}

function handleKeydown(e: KeyboardEvent) {
  emit('keydown', e)
}

function clear() {
  emit('update:modelValue', '')
  emit('clear')
  inputRef.value?.focus()
}

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

defineExpose({ focus, blur, select, inputRef })
</script>

<template>
  <div class="easy-input" :class="wrapperClass">
    <!-- 前置内容 -->
    <div v-if="$slots.prepend && type !== 'textarea'" class="easy-input__prepend">
      <slot name="prepend" />
    </div>

    <div
      class="easy-input__wrapper"
      :class="[wrapperInnerClass, { 'is-textarea': type === 'textarea' }]"
      @mouseenter="hovering = true"
      @mouseleave="hovering = false"
    >
      <!-- 前缀图标 -->
      <span v-if="$slots.prefix || prefixIcon" class="easy-input__prefix">
        <slot name="prefix" />
        <XlyIcon v-if="!$slots.prefix && prefixIcon" :name="prefixIcon" />
      </span>

      <!-- textarea -->
      <template v-if="type === 'textarea'">
        <textarea
          ref="inputRef"
          class="easy-input__inner easy-input__inner--textarea"
          :value="modelValue"
          :placeholder="placeholder"
          :disabled="disabled"
          :readonly="readonly"
          :maxlength="maxlength"
          :rows="rows"
          :style="textareaStyle"
          @input="handleInput"
          @focus="handleFocus"
          @blur="handleBlur"
          @keydown="handleKeydown"
          @compositionstart="isComposing = true"
          @compositionend="handleCompositionEnd"
        />
        <!-- 字数统计 -->
        <span v-if="showWordLimit && maxlength" class="easy-input__word-limit">
          {{ (modelValue as string || '').length }}/{{ maxlength }}
        </span>
      </template>

      <!-- input -->
      <input
        v-else
        ref="inputRef"
        class="easy-input__inner"
        :type="currentType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :readonly="readonly"
        :maxlength="maxlength"
        :autocomplete="autocomplete"
        :inputmode="inputmodeValue"
        @input="handleInput"
        @focus="handleFocus"
        @blur="handleBlur"
        @keydown="handleKeydown"
        @compositionstart="isComposing = true"
        @compositionend="handleCompositionEnd"
      >

      <!-- 字数统计（非 textarea） -->
      <span v-if="type !== 'textarea' && showWordLimit && maxlength" class="easy-input__word-limit">
        {{ (modelValue as string || '').length }}/{{ maxlength }}
      </span>

      <!-- 后缀图标 / 清除 / 密码切换 -->
      <span v-if="showSuffix" class="easy-input__suffix">
        <!-- 清除按钮 -->
        <span v-if="clearable && modelValue && !disabled && !readonly" class="easy-input__clear" @click="clear">
          <XlyIcon name="el:Close" />
        </span>
        <!-- 密码显示/隐藏切换 -->
        <span v-if="type === 'password' && modelValue" class="easy-input__password-toggle" @click="togglePassword">
          <XlyIcon :name="passwordVisible ? 'el:View' : 'el:Hide'" />
        </span>
        <slot name="suffix" />
        <XlyIcon v-if="!$slots.suffix && suffixIcon" :name="suffixIcon" />
      </span>
    </div>

    <!-- 后置内容 -->
    <div v-if="$slots.append && type !== 'textarea'" class="easy-input__append">
      <slot name="append" />
    </div>
  </div>
</template>
