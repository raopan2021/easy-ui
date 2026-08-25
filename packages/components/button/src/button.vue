<script setup lang="ts">
import type { ButtonEmits } from './button'

import { buttonProps } from './button'
import { useButton } from './use-button'

defineOptions({ name: 'EasyButton' })

const props = defineProps(buttonProps)
const emit = defineEmits<ButtonEmits>()

// ──── 类名 / 点击逻辑（抽离到 composable）────
const { buttonClass, handleClick } = useButton(props, emit)

// 保持对外类型导出兼容（原定义于 button.ts）
export type { ButtonEmits, ButtonProps } from './button'
</script>

<template>
  <button class="easy-button" :class="buttonClass" :disabled="disabled || loading" :type="htmlType" @click="handleClick">
    <span v-if="loading" class="easy-button__loading">
      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle
          cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-linecap="round"
          stroke-dasharray="31.4 31.4" stroke-dashoffset="10"
        >
          <animateTransform
            attributeName="transform" type="rotate" values="0 12 12;360 12 12" dur="0.75s"
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

<!-- 组件核心样式（scoped，独立维护在 button-style.scss） -->
<style scoped src="./button-style.scss" lang="scss"></style>
