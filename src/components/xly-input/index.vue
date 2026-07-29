<template>
  <div class="xly-input" :class="wrapperClass">
    <!-- 前置内容 -->
    <div v-if="$slots.prepend && type !== 'textarea'" class="xly-input__prepend">
      <slot name="prepend" />
    </div>

    <div class="xly-input__wrapper" :class="[wrapperInnerClass, { 'is-textarea': type === 'textarea' }]"
      @mouseenter="hovering = true" @mouseleave="hovering = false">
      <!-- 前缀图标 -->
      <span v-if="$slots.prefix || prefixIcon" class="xly-input__prefix">
        <slot name="prefix" />
        <XlyIcon v-if="!$slots.prefix && prefixIcon" :name="prefixIcon" />
      </span>

      <!-- 输入框 -->
      <template v-if="type === 'textarea'">
        <textarea ref="inputRef" class="xly-input__inner xly-input__inner--textarea" :value="modelValue"
          :placeholder="placeholder" :disabled="disabled" :readonly="readonly" :maxlength="maxlength" :rows="rows"
          :style="textareaStyle" @input="handleInput" @focus="handleFocus" @blur="handleBlur" @keydown="handleKeydown"
          @compositionstart="isComposing = true" @compositionend="handleCompositionEnd" />
        <!-- 字数统计 -->
        <span v-if="showWordLimit && maxlength" class="xly-input__word-limit">
          {{ ((modelValue as string) || '').length }}/{{ maxlength }}
        </span>
      </template>

      <!-- 输入框 -->
      <input v-else ref="inputRef" class="xly-input__inner" :type="currentType" :value="modelValue"
        :placeholder="placeholder" :disabled="disabled" :readonly="readonly" :maxlength="maxlength"
        :autocomplete="autocomplete" :inputmode="inputmodeValue" @input="handleInput" @focus="handleFocus"
        @blur="handleBlur" @keydown="handleKeydown" @compositionstart="isComposing = true"
        @compositionend="handleCompositionEnd" />

      <!-- 字数统计（非 textarea） -->
      <span v-if="type !== 'textarea' && showWordLimit && maxlength" class="xly-input__word-limit">
        {{ ((modelValue as string) || '').length }}/{{ maxlength }}
      </span>

      <!-- 后缀图标 / 清除 / 密码切换 -->
      <span v-if="showSuffix" class="xly-input__suffix">
        <!-- 清除按钮 -->
        <span v-if="clearable && modelValue && !disabled && !readonly" class="xly-input__clear" @click="clear">
          <XlyIcon name="el:Close" />
        </span>
        <!-- 密码显示/隐藏切换 -->
        <span v-if="type === 'password' && modelValue" class="xly-input__password-toggle" @click="togglePassword">
          <XlyIcon :name="passwordVisible ? 'el:View' : 'el:Hide'" />
        </span>
        <slot name="suffix" />
        <XlyIcon v-if="!$slots.suffix && suffixIcon" :name="suffixIcon" />
      </span>
    </div>

    <!-- 后置内容 -->
    <div v-if="$slots.append && type !== 'textarea'" class="xly-input__append">
      <slot name="append" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, inject } from 'vue'
import type { FormItemContext } from '@/components/xly-form/utils'
import XlyIcon from '@/components/xly-icon/index.vue'

defineOptions({ name: 'XlyInput' })

export interface InputProps {
  modelValue?: string | number
  type?: 'text' | 'password' | 'textarea' | 'number' | 'integer' | 'positiveInteger' | 'decimal' | `decimal${number}` | 'tel' | 'email' | 'url'
  placeholder?: string
  disabled?: boolean
  readonly?: boolean
  clearable?: boolean
  maxlength?: number
  showWordLimit?: boolean
  /** 前缀图标名称，使用 XlyIcon 的 name 格式，如 `el:Search`、`svg:edit` */
  prefixIcon?: string
  /** 后缀图标名称，使用 XlyIcon 的 name 格式，如 `el:Calendar`、`svg:edit` */
  suffixIcon?: string
  autocomplete?: string
  inputmode?: string
  size?: 'large' | 'default' | 'small'
  /** textarea 初始行数，默认 2 */
  rows?: number
  /** textarea 是否允许拖动调整大小，默认 'vertical'，可选 'none' | 'both' | 'horizontal' | 'vertical' */
  resize?: 'none' | 'both' | 'horizontal' | 'vertical'
  /** 自动转为大写（仅 text 类型有效） */
  toUpperCase?: boolean
  /** 仅允许大写字母和数字，自动删除其他字符（仅 text 类型有效，需配合 to-upper-case） */
  alphaNumOnly?: boolean
  /** 数值范围限制（仅 integer / positiveInteger / decimal(N) 类型生效） */
  range?: { min?: number; max?: number; minInclusive?: boolean; maxInclusive?: boolean }
}

const props = withDefaults(defineProps<InputProps>(), {
  modelValue: '',
  type: 'text',
  placeholder: '',
  disabled: false,
  readonly: false,
  clearable: false,
  maxlength: undefined,
  showWordLimit: false,
  prefixIcon: undefined,
  suffixIcon: undefined,
  autocomplete: 'off',
  inputmode: undefined,
  size: 'default',
  rows: 2,
  resize: 'vertical',
  toUpperCase: false,
  alphaNumOnly: false,
  range: undefined,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'input', value: string): void
  (e: 'change', value: string): void
  (e: 'focus', event: FocusEvent): void
  (e: 'blur', event: FocusEvent): void
  (e: 'clear'): void
  (e: 'keydown', event: KeyboardEvent): void
}>()

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
  `xly-input--${props.size}`,
  {
    'is-disabled': props.disabled,
    'is-focus': focusing.value,
  },
])

const wrapperInnerClass = computed(() => ({
  'is-hover': hovering.value && !props.disabled,
  'is-focus': focusing.value,
  'is-disabled': props.disabled,
  'has-prefix': !!props.prefixIcon || !!slots.prefix,
  'has-suffix': showSuffix.value,
}))

const slots = defineSlots()

/** 解析 decimal 类型的小数位数：decimal=2，decimal4=4，其余返回 null */
function parseDecimalPlaces(type: string): number | null {
  if (type === 'decimal') return 2
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
      const decPart = s.slice(firstDot + 1).replace(/\./g, '').slice(0, places)
      s = intPart + '.' + decPart
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
  // integer / positiveInteger / decimal(N) 映射到原生 text，通过 inputmode + 输入过滤实现限制
  if (props.type === 'integer' || props.type === 'positiveInteger' || parseDecimalPlaces(props.type) !== null) {
    return 'text'
  }
  return props.type
})

/** 原生 inputmode 合法值 */
type InputMode = 'text' | 'search' | 'tel' | 'email' | 'url' | 'none' | 'numeric' | 'decimal'

/** 实际渲染的 inputmode：integer 系列用 numeric，decimal 系列用 decimal（移动端弹带小数点的数字键盘），优先使用外部传入值 */
const inputmodeValue = computed((): InputMode | undefined => {
  if (props.inputmode) return props.inputmode as InputMode
  if (props.type === 'integer' || props.type === 'positiveInteger') return 'numeric'
  if (parseDecimalPlaces(props.type) !== null) return 'decimal'
  return undefined
})

/** 是否为受限制的数值类型（integer / positiveInteger / decimal(N)） */
const isNumericType = computed(() => {
  return props.type === 'integer' || props.type === 'positiveInteger' || parseDecimalPlaces(props.type) !== null
})

/** range 有效最小值 */
const effectiveMin = computed(() => props.range?.min)

/** range 有效最大值 */
const effectiveMax = computed(() => props.range?.max)

/** 最小值是否包含等于（默认 true 即大于等于） */
const effectiveMinInclusive = computed(() => props.range?.minInclusive ?? true)

/** 最大值是否包含等于（默认 true 即小于等于） */
const effectiveMaxInclusive = computed(() => props.range?.maxInclusive ?? true)

const showSuffix = computed(() => {
  return props.clearable || props.type === 'password' || !!props.suffixIcon || !!slots.suffix
})

function handleInput(e: Event) {
  if (isComposing.value) return
  const target = e.target as HTMLInputElement | HTMLTextAreaElement
  let value = target.value
  // 记录当前光标位置，避免 Vue 重新赋值 :value 时光标跳到末尾
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

  // 仅允许大写字母和数字，自动删除其他字符
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

  // 受限数字类型：integer / positiveInteger / decimal(N)，统一过滤非法字符
  if (isNumericType.value) {
    const result = filterByType(value, props.type)
    if (result !== value) {
      // 基于光标前保留下来的字符重新计算光标位置
      const beforeCursor = value.slice(0, selectionStart ?? 0)
      const keptBefore = filterByType(beforeCursor, props.type)
      const cursorPos = keptBefore.length
      value = result
      selectionStart = selectionEnd = cursorPos
      target.value = result
    }
    // 输入时仅限制最大值（最小值允许中间态如 "0." → "0.5"，留给 blur 处理）
    if (effectiveMax.value !== undefined) {
      const n = Number(value)
      const overMax = effectiveMaxInclusive.value ? n > effectiveMax.value : n >= effectiveMax.value
      if (!isNaN(n) && overMax) {
        const clamped = String(effectiveMax.value)
        selectionStart = selectionEnd = clamped.length
        value = clamped
        target.value = clamped
      }
    }
  }

  emit('update:modelValue', value)
  emit('input', value)
  // 实时校验（输入过程中触发 change 规则）
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
  // 输入法结束后，手动触发一次 input 处理，同步最终确认的值
  const target = e.target as HTMLInputElement | HTMLTextAreaElement
  let value = target.value
  // 记录当前光标位置
  let selectionStart = target.selectionStart
  let selectionEnd = target.selectionEnd

  // 自动转大写
  if (props.toUpperCase && props.type !== 'textarea') {
    const uppered = String(value).toUpperCase()
    if (uppered !== value) {
      value = uppered
      target.value = uppered
    }
  }

  // 仅允许大写字母和数字
  if (props.alphaNumOnly && props.type !== 'textarea') {
    const filtered = String(value).replace(/[^A-Z0-9]/g, '')
    if (filtered !== value) {
      const beforeCursor = value.slice(0, selectionStart ?? 0)
      const keptBefore = beforeCursor.replace(/[^A-Z0-9]/g, '')
      const cursorPos = keptBefore.length
      value = filtered
      selectionStart = selectionEnd = cursorPos
      target.value = filtered
    }
  }

  // 受限数字类型：integer / positiveInteger / decimal(N)，统一过滤中文输入法输入的非数字字符
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
      if (!isNaN(n) && overMax) {
        const clamped = String(effectiveMax.value)
        selectionStart = selectionEnd = clamped.length
        value = clamped
        target.value = clamped
      }
    }
  }

  emit('update:modelValue', value)
  emit('input', value)
  // 输入法结束后触发实时校验
  formItemContext?.validateField('change')
  // 恢复光标位置
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
    if (currentValue !== '' && !isNaN(n)) {
      let clamped: string | null = null
      if (effectiveMax.value !== undefined) {
        const overMax = effectiveMaxInclusive.value ? n > effectiveMax.value : n >= effectiveMax.value
        if (overMax) clamped = String(effectiveMax.value)
      }
      if (clamped === null && effectiveMin.value !== undefined) {
        const underMin = effectiveMinInclusive.value ? n < effectiveMin.value : n <= effectiveMin.value
        if (underMin) clamped = String(effectiveMin.value)
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

<style scoped lang="scss">

$border-focus: var(--el-color-primary);
$radius: 8px;

$transition: all 0.2s ease;

.xly-input {
  display: inline-flex;
  width: 100%;
  position: relative;

  // ========== 尺寸 ==========
  &--large .xly-input__wrapper {
    height: 44px;
  }

  &--large .xly-input__inner {
    font-size: 15px;
  }

  &--large .xly-input__prepend,
  &--large .xly-input__append {
    font-size: 14px;
  }

  &--default .xly-input__wrapper {
    height: 36px;
  }

  &--default .xly-input__inner {
    font-size: 14px;
  }

  &--default .xly-input__prepend,
  &--default .xly-input__append {
    font-size: 14px;
  }

  &--small .xly-input__wrapper {
    height: 30px;
  }

  &--small .xly-input__inner {
    font-size: 13px;
  }

  &--small .xly-input__prepend,
  &--small .xly-input__append {
    font-size: 12px;
  }

  // ========== 前后置 ==========
  &__prepend,
  &__append {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0 12px;
    background-color: var(--el-fill-color-light);
    color: var(--el-text-color-regular);
    border: 1px solid var(--el-border-color);
    white-space: nowrap;
    font-weight: 500;
  }

  &__prepend {
    border-right: none;
    border-radius: $radius 0 0 $radius;
  }

  &__append {
    border-left: none;
    border-radius: 0 $radius $radius 0;
  }

  &__prepend+&__wrapper {
    border-radius: 0 $radius $radius 0;
  }

  // ========== 输入区域 ==========
  &__wrapper {
    flex: 1;
    display: inline-flex;
    align-items: center;
    padding: 0 12px;
    background-color: var(--el-bg-color);
    border: 1px solid var(--el-border-color);
    border-radius: $radius;
    transition: $transition;
    box-sizing: border-box;
    cursor: text;

    &.is-hover:not(.is-disabled) {
      border-color: var(--el-border-color-darker);
    }

    &.is-focus:not(.is-disabled) {
      border-color: $border-focus;
      box-shadow: 0 0 0 2px rgba(79, 110, 247, 0.08);
    }

    &.is-disabled {
      background-color: var(--el-fill-color-light);
      cursor: not-allowed;
    }

    &.has-prefix {
      padding-left: 8px;
    }

    &.has-suffix {
      padding-right: 8px;
    }

    // textarea 模式
    &.is-textarea {
      display: flex;
      flex-direction: column;
      padding: 0;
      height: auto;
      min-height: auto;
      position: relative;
    }
  }

  &__inner {
    flex: 1;
    width: 100%;
    height: 100%;
    padding: 0;
    border: none;
    outline: none;
    background: transparent;
    color: var(--el-text-color-regular);
    font-family: inherit;
    box-sizing: border-box;

    &::placeholder {
      color: var(--el-text-color-placeholder);
    }

    &:disabled {
      color: var(--el-text-color-disabled);
      cursor: not-allowed;
    }

    // textarea 样式
    &--textarea {
      padding: 8px 12px;
      line-height: 1.5;
      font-family: inherit;
      min-height: auto;
      box-sizing: border-box;
      overflow: auto;
      height: auto;
      flex: none;
    }
  }

  // ========== 前缀/后缀 ==========
  &__prefix,
  &__suffix {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--el-text-color-placeholder);
    transition: color $transition;
    flex-shrink: 0;
  }

  &__prefix {
    margin-right: 4px;
  }

  &__suffix {
    margin-left: 4px;
  }

  &__clear,
  &__password-toggle {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: var(--el-text-color-placeholder);
    cursor: pointer;
    transition: color $transition;
    border-radius: 50%;

    &:hover {
      color: var(--el-text-color-regular);
    }
  }

  // ========== 字数统计 ==========
  &__word-limit {
    flex-shrink: 0;
    margin-left: 8px;
    font-size: 12px;
    color: var(--el-text-color-placeholder);

    // textarea 模式下的字数统计
    .is-textarea & {
      position: absolute;
      right: 30px;
      bottom: 8px;
      background: rgba(255, 255, 255, 0.85);
      padding: 2px 6px;
      border-radius: 4px;
      margin-left: 0;
      z-index: 10;
      pointer-events: none;
    }
  }
}
</style>

<style lang="scss">
/* ========== Dark Mode ========== */
html.dark .xly-input:not(.is-disabled) .xly-input__inner {
  color: var(--el-text-color-primary);
}
html.dark .xly-input__inner::placeholder {
  color: var(--el-text-color-placeholder);
}
html.dark .xly-input__prefix,
html.dark .xly-input__suffix {
  color: var(--el-text-color-placeholder);
}
html.dark .xly-input__count {
  color: var(--el-text-color-secondary);
}
html.dark .xly-textarea__inner {
  color: var(--el-text-color-primary);
}
html.dark .xly-textarea__inner::placeholder {
  color: var(--el-text-color-placeholder);
}
html.dark .xly-input__inner--password {
  color: var(--el-text-color-secondary);
}
</style>
