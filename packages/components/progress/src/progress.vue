<script setup lang="ts">
import { computed } from 'vue'

import XlyIcon from '../../icon'
import { progressProps } from './progress'

defineOptions({ name: 'EasyProgress' })

const props = defineProps(progressProps)

const displayPercentage = computed(() => {
  return Math.min(Math.max(props.percentage, 0), 100)
})

// 圆形进度条的半径
const radius = computed(() => 50 - props.strokeWidth / 2)

// 圆周长
const circumference = computed(() => 2 * Math.PI * radius.value)

// 半圆周长（仪表盘用）
const halfCircumference = computed(() => Math.PI * radius.value)

// 进度条偏移量
const dashOffset = computed(() => {
  const maxOffset = props.type === 'dashboard' ? halfCircumference.value : circumference.value
  return maxOffset - (displayPercentage.value / 100) * maxOffset
})

// 进度条颜色
const colorValue = computed(() => {
  if (props.status === 'success')
    return '#67c23a'
  if (props.status === 'exception')
    return '#f56c6c'
  if (props.status === 'warning')
    return '#e6a23c'
  if (typeof props.color === 'function') {
    return props.color(displayPercentage.value)
  }
  return props.color || '#4f6ef7'
})

// 轨道颜色
const trackColorValue = computed(() => {
  return props.trackColor || '#e8e8e8'
})

const progressClass = computed(() => [
  `easy-progress--${props.type}`,
  `easy-progress--status-${props.status}`,
  props.customClass,
])

const progressStyle = computed(() => {
  const style: Record<string, string> = {}
  return style
})

const trackStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.type === 'line' && props.trackColor) {
    style.backgroundColor = props.trackColor
  }
  if (props.type === 'line') {
    style.height = `${props.strokeWidth}px`
  }
  return style
})

const barStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.type === 'line' && !props.indeterminate) {
    style.width = `${displayPercentage.value}%`
  }
  if (props.type === 'line') {
    style.height = `${props.strokeWidth}px`
    style.backgroundColor = colorValue.value
  }
  return style
})
</script>

<template>
  <div class="easy-progress" :class="progressClass" :style="progressStyle">
    <!-- 线性进度条 -->
    <template v-if="type === 'line'">
      <div class="easy-progress__track" :style="trackStyle">
        <div class="easy-progress__bar" :style="barStyle">
          <div v-if="indeterminate" class="easy-progress__bar__animation" />
        </div>
      </div>

      <!-- 文本信息 -->
      <div v-if="showInfo" class="easy-progress__text">
        <span v-if="status === 'success'" class="easy-progress__status">
          <XlyIcon name="el:CircleCheck" />
        </span>
        <span v-else-if="status === 'exception'" class="easy-progress__status">
          <XlyIcon name="el:CircleClose" />
        </span>
        <span v-else-if="status === 'warning'" class="easy-progress__status">
          <XlyIcon name="el:Warning" />
        </span>
        <span v-else class="easy-progress__percentage">
          {{ text || `${displayPercentage}%` }}
        </span>
      </div>
    </template>

    <!-- 圆形进度条 -->
    <template v-else-if="type === 'circle'">
      <svg class="easy-progress__svg" viewBox="0 0 120 120" :width="circleSize" :height="circleSize">
        <!-- 轨道 -->
        <circle
          class="easy-progress__track"
          cx="60"
          cy="60"
          :r="radius"
          fill="none"
          :stroke="trackColorValue"
          :stroke-width="strokeWidth"
        />
        <!-- 进度 -->
        <circle
          class="easy-progress__bar"
          cx="60"
          cy="60"
          :r="radius"
          fill="none"
          :stroke="colorValue"
          :stroke-width="strokeWidth"
          :stroke-dasharray="circumference"
          :stroke-dashoffset="dashOffset"
          transform="rotate(-90 60 60)"
          :class="{ 'easy-progress__bar--animated': animated }"
        />
      </svg>

      <!-- 文本信息 -->
      <div v-if="showInfo" class="easy-progress__text">
        <span v-if="status === 'success'" class="easy-progress__status">
          <XlyIcon name="el:CircleCheck" />
        </span>
        <span v-else-if="status === 'exception'" class="easy-progress__status">
          <XlyIcon name="el:CircleClose" />
        </span>
        <span v-else-if="status === 'warning'" class="easy-progress__status">
          <XlyIcon name="el:Warning" />
        </span>
        <span v-else class="easy-progress__percentage">
          {{ text || `${displayPercentage}%` }}
        </span>
      </div>
    </template>

    <!-- 仪表盘进度条 -->
    <template v-else-if="type === 'dashboard'">
      <svg class="easy-progress__svg" viewBox="0 0 120 120" :width="circleSize" :height="circleSize">
        <!-- 轨道（半圆） -->
        <path
          class="easy-progress__track"
          d="M 10 60 A 50 50 0 1 1 110 60"
          fill="none"
          :stroke="trackColorValue"
          :stroke-width="strokeWidth"
          stroke-linecap="round"
        />
        <!-- 进度（半圆） -->
        <path
          class="easy-progress__bar"
          d="M 10 60 A 50 50 0 1 1 110 60"
          fill="none"
          :stroke="colorValue"
          :stroke-width="strokeWidth"
          :stroke-dasharray="halfCircumference"
          :stroke-dashoffset="dashOffset"
          stroke-linecap="round"
          :class="{ 'easy-progress__bar--animated': animated }"
        />
      </svg>

      <!-- 文本信息 -->
      <div v-if="showInfo" class="easy-progress__text">
        <span v-if="status === 'success'" class="easy-progress__status">
          <XlyIcon name="el:CircleCheck" />
        </span>
        <span v-else-if="status === 'exception'" class="easy-progress__status">
          <XlyIcon name="el:CircleClose" />
        </span>
        <span v-else-if="status === 'warning'" class="easy-progress__status">
          <XlyIcon name="el:Warning" />
        </span>
        <span v-else class="easy-progress__percentage">
          {{ text || `${displayPercentage}%` }}
        </span>
      </div>
    </template>
  </div>
</template>

<style scoped lang="scss">
/* ========== 基础进度条 ========== */
.easy-progress {
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;

  &.easy-progress--line {
    width: 100%;
  }

  &.easy-progress--circle,
  &.easy-progress--dashboard {
    display: inline-flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: relative;
  }
}

/* ========== 轨道（线性） ========== */
.easy-progress__track {
  flex: 1;
  background-color: var(--el-fill-color-lighter);
  border-radius: 999px;
  overflow: hidden;
  position: relative;
  transition: height 0.3s ease;
}

/* ========== 进度条（线性） ========== */
.easy-progress__bar {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  background-color: var(--el-color-primary);
  border-radius: 999px;
  transition:
    width 0.3s ease,
    background-color 0.3s ease;

  &.easy-progress__bar--animated {
    transition: stroke-dashoffset 0.3s ease;
  }

  .easy-progress--status-active & {
    background-image: linear-gradient(
      45deg,
      rgba(255, 255, 255, 0.15) 25%,
      transparent 25%,
      transparent 50%,
      rgba(255, 255, 255, 0.15) 50%,
      rgba(255, 255, 255, 0.15) 75%,
      transparent 75%,
      transparent
    );
    background-size: 20px 20px;
    animation: progress-stripe 1s linear infinite;
  }

  /* 不确定进度的动画 */
  .easy-progress__bar__animation {
    position: absolute;
    left: 0;
    top: 0;
    height: 100%;
    width: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    animation: progress-indeterminate 2s ease-in-out infinite;
  }
}

/* ========== SVG 样式 ========== */
.easy-progress__svg {
  display: block;
}

.easy-progress--circle .easy-progress__track,
.easy-progress--circle .easy-progress__bar,
.easy-progress--dashboard .easy-progress__track,
.easy-progress--dashboard .easy-progress__bar {
  transition:
    stroke-dashoffset 0.3s ease,
    stroke 0.3s ease;
}

/* ========== 不确定进度动画 ========== */
@keyframes progress-stripe {
  0% {
    background-position: 20px 0;
  }
  100% {
    background-position: 0 0;
  }
}

@keyframes progress-indeterminate {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

/* ========== 文本信息 ========== */
.easy-progress__text {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  color: var(--el-text-color-regular);
  font-weight: 500;
  white-space: nowrap;
  min-width: 40px;

  .easy-progress--line & {
    justify-content: flex-end;
  }

  .easy-progress--circle &,
  .easy-progress--dashboard & {
    position: absolute;
    font-size: 18px;
    font-weight: 600;
    justify-content: center;
    z-index: 1;
  }

  .easy-progress--dashboard & {
    bottom: 10%;
  }

  .easy-progress__status {
    display: flex;
    align-items: center;
    font-size: 16px;

    .easy-progress--status-success & {
      color: var(--el-color-success);
    }

    .easy-progress--status-exception & {
      color: var(--el-color-danger);
    }

    .easy-progress--status-warning & {
      color: var(--el-color-warning);
    }
  }

  .easy-progress__percentage {
    font-variant-numeric: tabular-nums;
  }
}
</style>

<style lang="scss">
html.dark .easy-progress__track {
  background-color: var(--el-fill-color);
}
html.dark .easy-progress__text {
  color: var(--el-text-color-regular);
}
</style>
