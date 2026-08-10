<script setup lang="ts">
import { computed } from 'vue'

import { buttonEmits, buttonProps } from './button'

defineOptions({ name: 'EasyButton' })

const props = defineProps(buttonProps)
const emit = defineEmits(buttonEmits)

const buttonClass = computed(() => [
  `easy-button--${props.type}`,
  `easy-button--${props.size}`,
  `easy-button--${props.shape}`,
  {
    'is-loading': props.loading,
    'is-disabled': props.disabled,
    'is-bold': props.bold,
    'is-link': props.link,
  },
])

function handleClick(event: MouseEvent) {
  if (props.disabled || props.loading)
    return
  emit('click', event)
}
</script>

<template>
  <button class="easy-button" :class="buttonClass" :disabled="disabled || loading" :type="htmlType" @click="handleClick">
    <span v-if="loading" class="easy-button__loading">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="3"
          stroke-linecap="round"
          stroke-dasharray="31.4 31.4"
          stroke-dashoffset="10"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            values="0 12 12;360 12 12"
            dur="0.75s"
            repeatCount="indefinite"
          />
        </circle>
      </svg>
    </span>
    <span class="easy-button__icon">
      <slot name="icon" />
    </span>
    <span v-if="$slots.default" class="easy-button__content">
      <slot />
    </span>
  </button>
</template>

<style scoped lang="scss">
/* ========== 设计令牌 ========== */
$success-hover: rgba(52, 199, 89, 0.65);
$warning-hover: rgba(245, 166, 35, 0.65);
$danger-hover: rgba(245, 108, 108, 0.65);
$info-hover: rgba(142, 142, 160, 0.65);

$radius: 8px;
$radius-round: 999px;
$transition: all 0.2s ease;

/* ========== 尺寸 ========== */
$size-large-padding: 12px 24px;
$size-large-height: 44px;
$size-large-font: 15px;
$size-large-icon: 18px;
$size-large-loading: 18px;

$size-default-padding: 8px 20px;
$size-default-height: 36px;
$size-default-font: 14px;
$size-default-icon: 16px;
$size-default-loading: 16px;

$size-small-padding: 5px 14px;
$size-small-height: 30px;
$size-small-font: 13px;
$size-small-icon: 14px;
$size-small-loading: 14px;

/* ========== 基础样式 ========== */
.easy-button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  position: relative;
  border: 1px solid transparent;
  outline: none;
  cursor: pointer;
  font-family: inherit;
  white-space: nowrap;
  user-select: none;
  box-sizing: border-box;
  transition: $transition;
  text-decoration: none;

  &::-moz-focus-inner {
    border: 0;
  }

  &.easy-button--large {
    padding: $size-large-padding;
    height: $size-large-height;
    font-size: $size-large-font;
    border-radius: $radius;

    .easy-button__icon,
    .easy-button__loading {
      font-size: $size-large-icon;
    }
    .easy-button__loading svg {
      width: $size-large-loading;
      height: $size-large-loading;
    }
  }

  &.easy-button--default {
    padding: $size-default-padding;
    height: $size-default-height;
    font-size: $size-default-font;
    border-radius: $radius;

    .easy-button__icon,
    .easy-button__loading {
      font-size: $size-default-icon;
    }
    .easy-button__loading svg {
      width: $size-default-loading;
      height: $size-default-loading;
    }
  }

  &.easy-button--small {
    padding: $size-small-padding;
    height: $size-small-height;
    font-size: $size-small-font;
    border-radius: $radius;

    .easy-button__icon,
    .easy-button__loading {
      font-size: $size-small-icon;
    }
    .easy-button__loading svg {
      width: $size-small-loading;
      height: $size-small-loading;
    }
  }

  &.easy-button--round {
    border-radius: $radius-round;
  }
  &.easy-button--circle {
    border-radius: $radius-round;
    padding: 0;

    &.easy-button--large {
      width: $size-large-height;
    }
    &.easy-button--default {
      width: $size-default-height;
    }
    &.easy-button--small {
      width: $size-small-height;
    }

    .easy-button__content {
      display: none;
    }
  }

  &.is-bold .easy-button__content {
    font-weight: 600;
  }

  &.is-loading,
  &.is-disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  /* ---------- Primary ---------- */
  &.easy-button--primary {
    background-color: var(--el-color-primary);
    color: var(--el-color-white);
    border-color: var(--el-color-primary);

    &:hover:not(.is-loading):not(.is-disabled) {
      box-shadow: 0 4px 12px rgba(79, 110, 247, 0.3);
    }
    &.is-link {
      background-color: transparent;
      color: var(--el-color-primary);
      border-color: transparent;
    }
    &.is-link:hover:not(.is-loading):not(.is-disabled) {
      background-color: transparent;
      border-color: transparent;
      box-shadow: none;
    }
  }

  &.easy-button--success {
    background-color: var(--el-color-success);
    color: var(--el-color-white);
    border-color: var(--el-color-success);

    &:hover:not(.is-loading):not(.is-disabled) {
      box-shadow: 0 4px 12px rgba(52, 199, 89, 0.3);
    }
    &.is-link {
      background-color: transparent;
      color: var(--el-color-success);
      border-color: transparent;
    }
    &.is-link:hover:not(.is-loading):not(.is-disabled) {
      background-color: transparent;
      border-color: transparent;
      box-shadow: none;
      color: $success-hover;
    }
  }

  &.easy-button--warning {
    background-color: var(--el-color-warning);
    color: var(--el-color-white);
    border-color: var(--el-color-warning);

    &:hover:not(.is-loading):not(.is-disabled) {
      box-shadow: 0 4px 12px rgba(245, 166, 35, 0.3);
    }
    &.is-link {
      background-color: transparent;
      color: var(--el-color-warning);
      border-color: transparent;
    }
    &.is-link:hover:not(.is-loading):not(.is-disabled) {
      background-color: transparent;
      border-color: transparent;
      box-shadow: none;
      color: $warning-hover;
    }
  }

  &.easy-button--danger {
    background-color: var(--el-color-danger);
    color: var(--el-color-white);
    border-color: var(--el-color-danger);

    &:hover:not(.is-loading):not(.is-disabled) {
      box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
    }
    &.is-link {
      background-color: transparent;
      color: var(--el-color-danger);
      border-color: transparent;
    }
    &.is-link:hover:not(.is-loading):not(.is-disabled) {
      background-color: transparent;
      border-color: transparent;
      box-shadow: none;
      color: $danger-hover;
    }
  }

  &.easy-button--info {
    background-color: var(--el-color-info);
    color: var(--el-color-white);
    border-color: var(--el-color-info);

    &:hover:not(.is-loading):not(.is-disabled) {
      box-shadow: 0 4px 12px rgba(142, 142, 160, 0.3);
    }
    &.is-link {
      background-color: transparent;
      color: var(--el-color-info);
      border-color: transparent;
    }
    &.is-link:hover:not(.is-loading):not(.is-disabled) {
      background-color: transparent;
      border-color: transparent;
      box-shadow: none;
      color: $info-hover;
    }
  }

  &.easy-button--text {
    background-color: transparent;
    color: var(--el-text-color-regular);
    border-color: transparent;
    padding-left: 8px;
    padding-right: 8px;

    &:hover:not(.is-loading):not(.is-disabled) {
      color: var(--el-color-primary);
      background-color: var(--el-fill-color-light);
    }
    &:active:not(.is-loading):not(.is-disabled) {
      color: var(--el-color-primary);
    }
  }

  &.easy-button--ghost {
    background-color: transparent;
    color: var(--el-color-primary);
    border-color: var(--el-color-primary);

    &:hover:not(.is-loading):not(.is-disabled) {
      background-color: rgba(79, 110, 247, 0.08);
    }
  }
}

.easy-button__loading {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
}
.easy-button__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.easy-button__content {
  line-height: 1;
}

.easy-button.is-plain {
  html.dark &:not(.is-disabled) {
    border-color: var(--el-border-color);
    color: var(--el-text-color-regular);
    background: var(--el-bg-color);
  }
  html.dark &:not(.is-disabled):hover {
    border-color: var(--el-color-primary);
    color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
}
</style>
