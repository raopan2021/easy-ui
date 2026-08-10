<script setup lang="ts">
import type { RateEmits } from './rate'

import { computed, ref } from 'vue'

import { rateProps } from './rate'

defineOptions({ name: 'EasyRate' })

const props = defineProps(rateProps)
const emit = defineEmits<RateEmits>()

const hoverValue = ref(0)

/** 当前展示值：hover 优先，否则用绑定值 */
const displayValue = computed(() => hoverValue.value || props.modelValue)

const displayText = computed(() => {
  const idx = displayValue.value
  if (props.texts.length > 0) {
    return props.texts[Math.round(idx) - 1] || ''
  }
  if (props.showText)
    return `${idx}`
  return ''
})

/** 根据鼠标在星星内的水平位置判断半选值 */
function getHalfValue(index: number, e: MouseEvent): number {
  if (!props.allowHalf)
    return index
  const el = e.currentTarget as HTMLElement
  const rect = el.getBoundingClientRect()
  return e.clientX - rect.left <= rect.width / 2 ? index - 0.5 : index
}

function handleHover(index: number, e: MouseEvent) {
  if (props.disabled)
    return
  hoverValue.value = getHalfValue(index, e)
}

function handleMouseMove(index: number, e: MouseEvent) {
  if (props.disabled || !props.allowHalf)
    return
  hoverValue.value = getHalfValue(index, e)
}

function handleLeave() {
  hoverValue.value = 0
}

function handleClick(index: number, e: MouseEvent) {
  if (props.disabled)
    return
  const value = getHalfValue(index, e)

  // 点击已选中的值则取消
  if (value === props.modelValue) {
    emit('update:modelValue', 0)
    emit('change', 0)
  }
  else {
    emit('update:modelValue', value)
    emit('change', value)
  }
}
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
        <path
          d="M908.1 353.1l-253.9-36.9L541.2 85.8c-3.1-6.3-8.2-11.4-14.5-14.5-15.8-7.8-35-1.3-42.9 14.5L370.8 316.2l-253.9 36.9c-7 1-13.4 4.3-18.3 9.3a32.05 32.05 0 0 0 .6 45.3l183.7 179.1-43.4 252.9a31.95 31.95 0 0 0 46.4 33.7L512 754l227.1 119.4c6.2 3.3 13.4 4.4 20.3 3.2 17.4-3 29.1-19.5 26.1-36.9l-43.4-252.9 183.7-179.1c5-4.9 8.3-11.3 9.3-18.3 2.7-17.5-9.5-33.7-27-36.3z"
        />
      </svg>
      <!-- 半星填充（左半边亮色） -->
      <svg
        v-if="allowHalf && i <= Math.ceil(displayValue)"
        class="easy-rate__icon easy-rate__icon-left"
        viewBox="0 0 1024 1024"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M908.1 353.1l-253.9-36.9L541.2 85.8c-3.1-6.3-8.2-11.4-14.5-14.5-15.8-7.8-35-1.3-42.9 14.5L370.8 316.2l-253.9 36.9c-7 1-13.4 4.3-18.3 9.3a32.05 32.05 0 0 0 .6 45.3l183.7 179.1-43.4 252.9a31.95 31.95 0 0 0 46.4 33.7L512 754l227.1 119.4c6.2 3.3 13.4 4.4 20.3 3.2 17.4-3 29.1-19.5 26.1-36.9l-43.4-252.9 183.7-179.1c5-4.9 8.3-11.3 9.3-18.3 2.7-17.5-9.5-33.7-27-36.3z"
        />
      </svg>
      <!-- 满星填充（整星亮色） -->
      <svg
        v-if="i <= displayValue"
        class="easy-rate__icon easy-rate__icon-full"
        viewBox="0 0 1024 1024"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M908.1 353.1l-253.9-36.9L541.2 85.8c-3.1-6.3-8.2-11.4-14.5-14.5-15.8-7.8-35-1.3-42.9 14.5L370.8 316.2l-253.9 36.9c-7 1-13.4 4.3-18.3 9.3a32.05 32.05 0 0 0 .6 45.3l183.7 179.1-43.4 252.9a31.95 31.95 0 0 0 46.4 33.7L512 754l227.1 119.4c6.2 3.3 13.4 4.4 20.3 3.2 17.4-3 29.1-19.5 26.1-36.9l-43.4-252.9 183.7-179.1c5-4.9 8.3-11.3 9.3-18.3 2.7-17.5-9.5-33.7-27-36.3z"
        />
      </svg>
    </div>

    <!-- 文字提示 -->
    <span v-if="showText || texts.length" class="easy-rate__text">
      {{ displayText }}
    </span>
  </div>
</template>

<style scoped lang="scss">
$transition: all 0.15s ease;

.easy-rate {
  display: inline-flex;
  align-items: center;
  gap: 4px;

  &.easy-rate--large .easy-rate__icon {
    width: 28px;
    height: 28px;
  }
  &.easy-rate--default .easy-rate__icon {
    width: 22px;
    height: 22px;
  }
  &.easy-rate--small .easy-rate__icon {
    width: 16px;
    height: 16px;
  }

  &.is-disabled {
    cursor: not-allowed;
    .easy-rate__item {
      cursor: not-allowed;
    }
  }
}

.easy-rate__item {
  position: relative;
  display: inline-flex;
  cursor: pointer;
  transition: transform $transition;

  &:hover {
    transform: scale(1.15);
  }
}

/* 空星背景 */
.easy-rate__icon {
  fill: v-bind(voidColor);
  transition: fill $transition;
  display: block;
}

/* 半星：只显示左半边 */
.easy-rate__icon-left {
  position: absolute;
  top: 0;
  left: 0;
  clip-path: inset(0 50% 0 0);
  fill: v-bind(color);
}

/* 满星：完全覆盖 */
.easy-rate__icon-full {
  position: absolute;
  top: 0;
  left: 0;
  fill: v-bind(color);
}

.easy-rate__text {
  margin-left: 6px;
  font-size: 14px;
  color: var(--el-text-color-regular);
}
</style>
