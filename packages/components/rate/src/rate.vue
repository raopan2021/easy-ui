<script setup lang="ts">
import type { RateEmits, RateProps } from './rate'

import { useRate } from './use-rate'

defineOptions({
  name: 'EasyRate',
})

const props = withDefaults(defineProps<RateProps>(), {
  modelValue: 0,
  max: 5,
  disabled: false,
  allowHalf: false,
  showText: false,
  texts: () => [],
  color: '#f5a623',
  voidColor: '#e2e4ed',
  size: 'default',
})

const emit = defineEmits<RateEmits>()

// 评分交互逻辑（hover / 半星 / 点击）抽离到 composable
const { displayValue, displayText, handleHover, handleMouseMove, handleLeave, handleClick } = useRate(props, emit)

// 保持对外类型导出兼容（原定义在 rate.ts）
export type { RateEmits, RateProps } from './rate'
</script>

<template>
  <div class="easy-rate" :class="[`easy-rate--${size}`, { 'is-disabled': disabled }]">
    <div
      v-for="i in max"
      :key="i"
      class="easy-rate__item"
      :class="{
        'is-active': i <= displayValue,
        'is-half-active': allowHalf && displayValue >= i - 0.5 && displayValue < i,
      }"
      @mouseenter="handleHover(i, $event)"
      @mousemove="handleMouseMove(i, $event)"
      @mouseleave="handleLeave"
      @click="handleClick(i, $event)"
    >
      <!-- 空星背景 -->
      <svg class="easy-rate__icon" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg">
        <path d="M908.1 353.1l-253.9-36.9L541.2 85.8c-3.1-6.3-8.2-11.4-14.5-14.5-15.8-7.8-35-1.3-42.9 14.5L370.8 316.2l-253.9 36.9c-7 1-13.4 4.3-18.3 9.3a32.05 32.05 0 0 0 .6 45.3l183.7 179.1-43.4 252.9a31.95 31.95 0 0 0 46.4 33.7L512 754l227.1 119.4c6.2 3.3 13.4 4.4 20.3 3.2 17.4-3 29.1-19.5 26.1-36.9l-43.4-252.9 183.7-179.1c5-4.9 8.3-11.3 9.3-18.3 2.7-17.5-9.5-33.7-27-36.3z" />
      </svg>
      <!-- 半星填充（左半边亮色） -->
      <svg
        v-if="allowHalf && i <= Math.ceil(displayValue)" class="easy-rate__icon easy-rate__icon-left"
        viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M908.1 353.1l-253.9-36.9L541.2 85.8c-3.1-6.3-8.2-11.4-14.5-14.5-15.8-7.8-35-1.3-42.9 14.5L370.8 316.2l-253.9 36.9c-7 1-13.4 4.3-18.3 9.3a32.05 32.05 0 0 0 .6 45.3l183.7 179.1-43.4 252.9a31.95 31.95 0 0 0 46.4 33.7L512 754l227.1 119.4c6.2 3.3 13.4 4.4 20.3 3.2 17.4-3 29.1-19.5 26.1-36.9l-43.4-252.9 183.7-179.1c5-4.9 8.3-11.3 9.3-18.3 2.7-17.5-9.5-33.7-27-36.3z" />
      </svg>
      <!-- 满星填充（整星亮色） -->
      <svg
        v-if="i <= displayValue" class="easy-rate__icon easy-rate__icon-full" viewBox="0 0 1024 1024"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M908.1 353.1l-253.9-36.9L541.2 85.8c-3.1-6.3-8.2-11.4-14.5-14.5-15.8-7.8-35-1.3-42.9 14.5L370.8 316.2l-253.9 36.9c-7 1-13.4 4.3-18.3 9.3a32.05 32.05 0 0 0 .6 45.3l183.7 179.1-43.4 252.9a31.95 31.95 0 0 0 46.4 33.7L512 754l227.1 119.4c6.2 3.3 13.4 4.4 20.3 3.2 17.4-3 29.1-19.5 26.1-36.9l-43.4-252.9 183.7-179.1c5-4.9 8.3-11.3 9.3-18.3 2.7-17.5-9.5-33.7-27-36.3z" />
      </svg>
    </div>

    <!-- 文字提示 -->
    <span v-if="showText || texts.length" class="easy-rate__text">
      {{ displayText }}
    </span>
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 rate-style.scss） -->
<style scoped src="./rate-style.scss" lang="scss"></style>
