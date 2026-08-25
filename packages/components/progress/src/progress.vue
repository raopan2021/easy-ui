<script setup lang="ts">
import EasyIcon from '../../icon'

import { progressProps } from './progress'
import { useProgressGeometry } from './use-progress'

defineOptions({ name: 'EasyProgress' })

// ──── props ────
const props = defineProps(progressProps)

// ──── 几何 / 配色（派生计算抽离到 composable）────
const {
  displayPercentage,
  radius,
  circumference,
  halfCircumference,
  dashOffset,
  colorValue,
  trackColorValue,
  progressClass,
  progressStyle,
  trackStyle,
  barStyle,
} = useProgressGeometry(props)
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
          <EasyIcon name="el:CircleCheck" />
        </span>
        <span v-else-if="status === 'exception'" class="easy-progress__status">
          <EasyIcon name="el:CircleClose" />
        </span>
        <span v-else-if="status === 'warning'" class="easy-progress__status">
          <EasyIcon name="el:Warning" />
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
          class="easy-progress__track" cx="60" cy="60" :r="radius" fill="none" :stroke="trackColorValue"
          :stroke-width="strokeWidth"
        />
        <!-- 进度 -->
        <circle
          class="easy-progress__bar" cx="60" cy="60" :r="radius" fill="none" :stroke="colorValue"
          :stroke-width="strokeWidth" :stroke-dasharray="circumference" :stroke-dashoffset="dashOffset"
          transform="rotate(-90 60 60)" :class="{ 'easy-progress__bar--animated': animated }"
        />
      </svg>

      <!-- 文本信息 -->
      <div v-if="showInfo" class="easy-progress__text">
        <span v-if="status === 'success'" class="easy-progress__status">
          <EasyIcon name="el:CircleCheck" />
        </span>
        <span v-else-if="status === 'exception'" class="easy-progress__status">
          <EasyIcon name="el:CircleClose" />
        </span>
        <span v-else-if="status === 'warning'" class="easy-progress__status">
          <EasyIcon name="el:Warning" />
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
          class="easy-progress__track" d="M 10 60 A 50 50 0 1 1 110 60" fill="none" :stroke="trackColorValue"
          :stroke-width="strokeWidth" stroke-linecap="round"
        />
        <!-- 进度（半圆） -->
        <path
          class="easy-progress__bar" d="M 10 60 A 50 50 0 1 1 110 60" fill="none" :stroke="colorValue"
          :stroke-width="strokeWidth" :stroke-dasharray="halfCircumference" :stroke-dashoffset="dashOffset"
          stroke-linecap="round" :class="{ 'easy-progress__bar--animated': animated }"
        />
      </svg>

      <!-- 文本信息 -->
      <div v-if="showInfo" class="easy-progress__text">
        <span v-if="status === 'success'" class="easy-progress__status">
          <EasyIcon name="el:CircleCheck" />
        </span>
        <span v-else-if="status === 'exception'" class="easy-progress__status">
          <EasyIcon name="el:CircleClose" />
        </span>
        <span v-else-if="status === 'warning'" class="easy-progress__status">
          <EasyIcon name="el:Warning" />
        </span>
        <span v-else class="easy-progress__percentage">
          {{ text || `${displayPercentage}%` }}
        </span>
      </div>
    </template>
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 progress-style.scss） -->
<style scoped src="./progress-style.scss" lang="scss"></style>

<!-- 暗色模式覆盖（非 scoped，全局 html.dark 作用域） -->
<style lang="scss">
html.dark .easy-progress__track {
  background-color: var(--el-fill-color);
}
html.dark .easy-progress__text {
  color: var(--el-text-color-regular);
}
</style>
