<script setup lang="ts">
import type { InputEmits } from './input'
import EasyIcon from '../../icon'

import { inputProps } from './input'
import { useInputEvents } from './use-input-events'
import { useInputFormat } from './use-input-format'
import { useInputState } from './use-input-state'

defineOptions({ name: 'EasyInput' })

const props = defineProps(inputProps)
const emit = defineEmits<InputEmits>()

const slots = defineSlots()

// ──── 交互状态 / 派生类名与样式 ────
const {
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
} = useInputState(props, slots)

// ──── 值规范化（大写 / 字符过滤 / 数值类型与 range 收敛）────
const { sanitizeValue, clampOnBlur } = useInputFormat(props)

// ──── 事件处理（值同步 / 输入法 / 焦点 / 清空 / 表单校验联动）────
const {
  handleInput,
  handleCompositionEnd,
  handleFocus,
  handleBlur,
  handleKeydown,
  clear,
} = useInputEvents(props, emit, { inputRef, focusing, isComposing, sanitizeValue, clampOnBlur })

defineExpose({ focus, blur, select, inputRef })
</script>

<template>
  <div class="easy-input" :class="wrapperClass">
    <!-- 前置内容 -->
    <div v-if="($slots.prepend || prefix) && type !== 'textarea'" class="easy-input__prepend">
      <slot name="prepend" />
      <span v-if="prefix && !$slots.prepend" class="easy-input__prepend-text">{{ prefix }}</span>
    </div>

    <div class="easy-input__wrapper" :class="[wrapperInnerClass, { 'is-textarea': type === 'textarea' }]"
      @mouseenter="hovering = true" @mouseleave="hovering = false">
      <!-- 前缀图标 -->
      <span v-if="$slots.prefix || prefixIcon" class="easy-input__prefix">
        <slot name="prefix" />
        <EasyIcon v-if="!$slots.prefix && prefixIcon" :name="prefixIcon" />
      </span>

      <!-- textarea -->
      <template v-if="type === 'textarea'">
        <textarea ref="inputRef" class="easy-input__inner easy-input--textarea" :value="modelValue"
          :placeholder="placeholder" :disabled="disabled" :readonly="readonly" :maxlength="maxlength" :rows="rows"
          :style="textareaStyle" @input="handleInput" @focus="handleFocus" @blur="handleBlur" @keydown="handleKeydown"
          @compositionstart="isComposing = true" @compositionend="handleCompositionEnd" />
        <!-- 字数统计 -->
        <span v-if="showWordLimit && maxlength" class="easy-input__word-limit">
          {{ (modelValue as string || '').length }}/{{ maxlength }}
        </span>
      </template>

      <!-- input -->
      <input v-else ref="inputRef" class="easy-input__inner" :type="currentType" :value="modelValue"
        :placeholder="placeholder" :disabled="disabled" :readonly="readonly" :maxlength="maxlength"
        :autocomplete="autocomplete" :inputmode="inputmodeValue" @input="handleInput" @focus="handleFocus"
        @blur="handleBlur" @keydown="handleKeydown" @compositionstart="isComposing = true"
        @compositionend="handleCompositionEnd">

      <!-- 字数统计（非 textarea） -->
      <span v-if="type !== 'textarea' && showWordLimit && maxlength" class="easy-input__word-limit">
        {{ (modelValue as string || '').length }}/{{ maxlength }}
      </span>

      <!-- 后缀图标 / 清除 / 密码切换 -->
      <span v-if="showSuffix" class="easy-input__suffix">
        <!-- 清除按钮 -->
        <span v-if="clearable && modelValue && !disabled && !readonly" class="easy-input__clear" @click="clear">
          <EasyIcon name="el:Close" />
        </span>
        <!-- 密码显示/隐藏切换 -->
        <span v-if="type === 'password' && modelValue" class="easy-input__password-toggle" @click="togglePassword">
          <EasyIcon :name="passwordVisible ? 'el:View' : 'el:Hide'" />
        </span>
        <slot name="suffix" />
        <span v-if="suffix && !$slots.suffix" class="easy-input__suffix-text">{{ suffix }}</span>
        <EasyIcon v-if="!$slots.suffix && suffixIcon" :name="suffixIcon" />
      </span>
    </div>

    <!-- 后置内容 -->
    <div v-if="$slots.append && type !== 'textarea'" class="easy-input__append">
      <slot name="append" />
    </div>
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 input-style.scss） -->
<style scoped src="./input-style.scss" lang="scss"></style>
