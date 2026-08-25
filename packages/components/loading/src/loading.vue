<script setup lang="ts">
import type { LoadingEmits, LoadingProps } from './types'

import { useLoadingStyle } from './use-loading-style'
import { useLoadingVisibility } from './use-loading-visibility'

// 保持对外类型导出兼容（原内联 interface 已提取到 types.ts，loading.ts 依赖此导出）
export type { LoadingProps } from './types'

defineOptions({
  name: 'EasyLoading',
})

const props = withDefaults(defineProps<LoadingProps>(), {
  modelValue: false,
  type: 'wave1',
  text: '',
  mask: true,
  maskColor: 'var(--el-mask-color, rgba(255, 255, 255, 0.3))',
  color: '#4f6ef7',
  backgroundColor: 'transparent',
  textColor: 'var(--el-text-color-primary)',
  size: 'medium',
  fullscreen: false,
  lock: false,
  containerFullscreen: false,
  overlayMode: false,
  customClass: '',
  progress: 0,
})

const emit = defineEmits<LoadingEmits>()

// ──── 可见性 / 滚动锁（含 modelValue ↔ visible 双向同步）────
const { visible } = useLoadingVisibility(props, emit)

// ──── 样式 / 尺寸派生 ────
const {
  wrapperClasses,
  wrapperStyle,
  contentStyle,
  maskStyle,
  spinnerClasses,
  spinnerStyle,
  circumference,
  progressOffset,
  getDotStyle,
  getWaveStyle,
} = useLoadingStyle(props, visible)

// ──── 暴露方法（直接操作内部 visible）────
defineExpose({
  show: () => {
    visible.value = true
  },
  hide: () => {
    visible.value = false
  },
  toggle: () => {
    visible.value = !visible.value
  },
})
</script>

<template>
  <div v-if="visible" class="easy-loading-wrapper" :class="wrapperClasses" :style="wrapperStyle">
    <!-- 遮罩层 -->
    <div v-if="mask" class="easy-loading-mask" :style="maskStyle" />

    <!-- 加载内容区域 -->
    <div class="easy-loading-content" :style="contentStyle">
      <!-- 加载动画 -->
      <div class="easy-loading-spinner" :class="spinnerClasses" :style="spinnerStyle">
        <!-- 加载状态 - 竖条波浪效果（参照 easy-table__loading） -->
        <template v-if="type === 'wave1'">
          <div class="wave1-container">
            <div class="wave1-spinner">
              <div
                v-for="i in 5" :key="i" class="wave1-bar"
                :style="{ animationDelay: `${i * 0.1}s`, backgroundColor: color }"
              />
            </div>
          </div>
        </template>

        <!-- 旋转圆圈 -->
        <template v-else-if="type === 'spinner'">
          <div class="spinner-circle">
            <div v-for="i in 8" :key="i" class="spinner-dot" :style="getDotStyle(i)" />
          </div>
        </template>

        <!-- 波浪效果 -->
        <template v-else-if="type === 'wave'">
          <div class="wave-container">
            <div v-for="i in 5" :key="i" class="wave-bar" :style="getWaveStyle(i)" />
          </div>
        </template>

        <!-- 脉冲效果 -->
        <template v-else-if="type === 'pulse'">
          <div class="pulse-circle" />
        </template>

        <!-- 环形进度 -->
        <template v-else-if="type === 'ring'">
          <div class="ring-container">
            <svg class="ring-svg" viewBox="0 0 50 50">
              <circle class="ring-bg" cx="25" cy="25" r="20" :stroke="backgroundColor" stroke-width="4" fill="none" />
              <circle
                class="ring-progress" cx="25" cy="25" r="20" :stroke="color" stroke-width="4" fill="none"
                stroke-linecap="round" :stroke-dasharray="circumference" :stroke-dashoffset="progressOffset"
              />
            </svg>
          </div>
        </template>

        <!-- 默认双点动画 -->
        <template v-else>
          <div class="default-spinner">
            <div class="dot1" />
            <div class="dot2" />
          </div>
        </template>
      </div>

      <!-- 加载文本 -->
      <div v-if="text" class="easy-loading-text" :style="{ color: textColor }">
        {{ text }}
      </div>

      <!-- 自定义插槽内容 -->
      <div v-if="$slots.default" class="easy-loading-custom">
        <slot />
      </div>
    </div>
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 loading-style.scss，含 html.dark 暗色覆盖） -->
<style scoped src="./loading-style.scss" lang="scss"></style>
