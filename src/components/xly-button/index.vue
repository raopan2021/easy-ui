<template>
  <button
    class="xly-button"
    :class="buttonClass"
    :disabled="disabled || loading"
    :type="htmlType"
    @click="handleClick"
  >
    <span v-if="loading" class="xly-button__loading">
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
    <span class="xly-button__icon">
      <slot name="icon" />
    </span>
    <span v-if="$slots.default" class="xly-button__content">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'XlyButton' })

/** 按钮类型 */
type ButtonType = 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text' | 'ghost'
/** 按钮尺寸 */
type ButtonSize = 'large' | 'default' | 'small'
/** 按钮形状 */
type ButtonShape = 'default' | 'round' | 'circle'

const props = withDefaults(
  defineProps<{
    /** 按钮类型 */
    type?: ButtonType
    /** 按钮尺寸 */
    size?: ButtonSize
    /** 按钮形状 */
    shape?: ButtonShape
    /** 是否加载中 */
    loading?: boolean
    /** 是否禁用 */
    disabled?: boolean
    /** 是否加粗文字 */
    bold?: boolean
    /** 是否为链接样式按钮（hover 显示下划线） */
    link?: boolean
    /** 原生 button type 属性 */
    htmlType?: 'button' | 'submit' | 'reset'
  }>(),
  {
    type: 'primary',
    size: 'default',
    shape: 'default',
    loading: false,
    disabled: false,
    bold: false,
    link: false,
    htmlType: 'button',
  },
)

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const buttonClass = computed(() => [
  `xly-button--${props.type}`,
  `xly-button--${props.size}`,
  `xly-button--${props.shape}`,
  {
    'is-loading': props.loading,
    'is-disabled': props.disabled,
    'is-bold': props.bold,
    'is-link': props.link,
  },
])

function handleClick(event: MouseEvent) {
  if (props.disabled || props.loading) return
  emit('click', event)
}
</script>

<style scoped lang="scss">
/* ========== 设计令牌 ========== */

$text-hover: var(--el-color-primary);
$text-active: var(--el-color-primary);
$text-light-hover: var(--el-fill-color-light);
$text-light-link-hover: var(--el-fill-color-light);
$success-light-link-hover: rgba(52, 199, 89, 0.65);
$warning-light-link-hover: rgba(245, 166, 35, 0.65);
$danger-light-link-hover: rgba(245, 108, 108, 0.65);
$info-light-link-hover: rgba(142, 142, 160, 0.65);

// link 样式文字颜色（使用主题色，不是白色）
$link-primary: var(--el-color-primary);
$link-success: var(--el-color-success);
$link-warning: var(--el-color-warning);
$link-danger: var(--el-color-danger);
$link-info: var(--el-color-info);

$radius: 8px;
$radius-round: 999px;
$transition: all 0.2s ease;

/* ========== 尺寸 ========== */
$size-large-padding: 12px 24px;
$size-large-height: 44px;
$size-large-font: 15px;
$size-large-icon-size: 18px;
$size-large-loading-size: 18px;

$size-default-padding: 8px 20px;
$size-default-height: 36px;
$size-default-font: 14px;
$size-default-icon-size: 16px;
$size-default-loading-size: 16px;

$size-small-padding: 5px 14px;
$size-small-height: 30px;
$size-small-font: 13px;
$size-small-icon-size: 14px;
$size-small-loading-size: 14px;

/* ========== 基础样式 ========== */
.xly-button {
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

  /* ---------- 尺寸 ---------- */
  &--large {
    padding: $size-large-padding;
    height: $size-large-height;
    font-size: $size-large-font;
    border-radius: $radius;

    .xly-button__icon,
    .xly-button__loading {
      font-size: $size-large-icon-size;
    }
    .xly-button__loading svg {
      width: $size-large-loading-size;
      height: $size-large-loading-size;
    }
  }

  &--default {
    padding: $size-default-padding;
    height: $size-default-height;
    font-size: $size-default-font;
    border-radius: $radius;

    .xly-button__icon,
    .xly-button__loading {
      font-size: $size-default-icon-size;
    }
    .xly-button__loading svg {
      width: $size-default-loading-size;
      height: $size-default-loading-size;
    }
  }

  &--small {
    padding: $size-small-padding;
    height: $size-small-height;
    font-size: $size-small-font;
    border-radius: $radius;

    .xly-button__icon,
    .xly-button__loading {
      font-size: $size-small-icon-size;
    }
    .xly-button__loading svg {
      width: $size-small-loading-size;
      height: $size-small-loading-size;
    }
  }

  /* ---------- 形状 ---------- */
  &--round {
    border-radius: $radius-round;
  }
  &--circle {
    border-radius: $radius-round;
    padding: 0;

    &.xly-button--large {
      width: $size-large-height;
    }
    &.xly-button--default {
      width: $size-default-height;
    }
    &.xly-button--small {
      width: $size-small-height;
    }

    .xly-button__content {
      display: none;
    }
  }

  /* ---------- 加粗 ---------- */
  &.is-bold .xly-button__content {
    font-weight: 600;
  }

  /* ---------- 加载 & 禁用 ---------- */
  &.is-loading,
  &.is-disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }

  /* ---------- Primary ---------- */
  &--primary {
    background-color: var(--el-color-primary);
    color: #fff;
    border-color: var(--el-color-primary);

    &:hover:not(.is-loading):not(.is-disabled) {
      background-color: var(--el-color-primary)-hover;
      border-color: var(--el-color-primary)-hover;
      box-shadow: 0 4px 12px rgba(79, 110, 247, 0.3);
    }
    &:active:not(.is-loading):not(.is-disabled) {
      background-color: var(--el-color-primary)-active;
      border-color: var(--el-color-primary)-active;
    }

    // Primary + Link 组合
    &.is-link {
      background-color: transparent;
      color: $link-primary;
      border-color: transparent;
    }
    &.is-link:hover:not(.is-loading):not(.is-disabled) {
      background-color: transparent;
      border-color: transparent;
      box-shadow: none;
      color: rgba(79, 110, 247, 0.08)-link-hover;
    }
  }

  /* ---------- Success ---------- */
  &--success {
    background-color: var(--el-color-success);
    color: #fff;
    border-color: var(--el-color-success);

    &:hover:not(.is-loading):not(.is-disabled) {
      background-color: var(--el-color-success)-hover;
      border-color: var(--el-color-success)-hover;
      box-shadow: 0 4px 12px rgba(52, 199, 89, 0.3);
    }
    &:active:not(.is-loading):not(.is-disabled) {
      background-color: var(--el-color-success)-active;
      border-color: var(--el-color-success)-active;
    }

    &.is-link {
      background-color: transparent;
      color: $link-success;
      border-color: transparent;
    }
    &.is-link:hover:not(.is-loading):not(.is-disabled) {
      background-color: transparent;
      border-color: transparent;
      box-shadow: none;
      color: $success-light-link-hover;
    }
  }

  /* ---------- Warning ---------- */
  &--warning {
    background-color: var(--el-color-warning);
    color: #fff;
    border-color: var(--el-color-warning);

    &:hover:not(.is-loading):not(.is-disabled) {
      background-color: var(--el-color-warning)-hover;
      border-color: var(--el-color-warning)-hover;
      box-shadow: 0 4px 12px rgba(245, 166, 35, 0.3);
    }
    &:active:not(.is-loading):not(.is-disabled) {
      background-color: var(--el-color-warning)-active;
      border-color: var(--el-color-warning)-active;
    }

    &.is-link {
      background-color: transparent;
      color: $link-warning;
      border-color: transparent;
    }
    &.is-link:hover:not(.is-loading):not(.is-disabled) {
      background-color: transparent;
      border-color: transparent;
      box-shadow: none;
      color: $warning-light-link-hover;
    }
  }

  /* ---------- Danger ---------- */
  &--danger {
    background-color: var(--el-color-danger);
    color: #fff;
    border-color: var(--el-color-danger);

    &:hover:not(.is-loading):not(.is-disabled) {
      background-color: var(--el-color-danger)-hover;
      border-color: var(--el-color-danger)-hover;
      box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
    }
    &:active:not(.is-loading):not(.is-disabled) {
      background-color: var(--el-color-danger)-active;
      border-color: var(--el-color-danger)-active;
    }

    &.is-link {
      background-color: transparent;
      color: $link-danger;
      border-color: transparent;
    }
    &.is-link:hover:not(.is-loading):not(.is-disabled) {
      background-color: transparent;
      border-color: transparent;
      box-shadow: none;
      color: $danger-light-link-hover;
    }
  }

  /* ---------- Info ---------- */
  &--info {
    background-color: var(--el-color-info);
    color: #fff;
    border-color: var(--el-color-info);

    &:hover:not(.is-loading):not(.is-disabled) {
      background-color: var(--el-color-info)-hover;
      border-color: var(--el-color-info)-hover;
      box-shadow: 0 4px 12px rgba(142, 142, 160, 0.3);
    }
    &:active:not(.is-loading):not(.is-disabled) {
      background-color: var(--el-color-info)-active;
      border-color: var(--el-color-info)-active;
    }

    &.is-link {
      background-color: transparent;
      color: $link-info;
      border-color: transparent;
    }
    &.is-link:hover:not(.is-loading):not(.is-disabled) {
      background-color: transparent;
      border-color: transparent;
      box-shadow: none;
      color: $info-light-link-hover;
    }
  }

  /* ---------- Text ---------- */
  &--text {
    background-color: transparent;
    color: var(--el-text-color-regular);
    border-color: transparent;
    padding-left: 8px;
    padding-right: 8px;

    &:hover:not(.is-loading):not(.is-disabled) {
      color: $text-hover;
      background-color: $text-light-hover;
    }
    &:active:not(.is-loading):not(.is-disabled) {
      color: $text-active;
    }
  }

  /* ---------- Ghost ---------- */
  &--ghost {
    background-color: transparent;
    color: var(--el-color-primary);
    border-color: var(--el-color-primary);

    &:hover:not(.is-loading):not(.is-disabled) {
      background-color: rgba(79, 110, 247, 0.08);
      border-color: var(--el-color-primary)-hover;
    }
    &:active:not(.is-loading):not(.is-disabled) {
      background-color: rgba(79, 110, 247, 0.15);
    }
  }
}

/* ========== Loading 动画 ========== */
.xly-button__loading {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;

  svg {
    animation: none;
    color: currentColor;
  }
}

.xly-button__icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.xly-button__content {
  line-height: 1;
}
</style>

<style lang="scss">
/* ========== Dark Mode ========== */
html.dark .xly-button.is-plain:not(.is-disabled) {
  border-color: var(--el-border-color);
  color: var(--el-text-color-regular);
  background: var(--el-bg-color);
}
html.dark .xly-button.is-plain:not(.is-disabled):hover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}
</style>
