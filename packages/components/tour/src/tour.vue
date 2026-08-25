<script setup lang="ts">
import type { TourEmits, TourProps } from './types'

import { useTourNavigation } from './use-tour-navigation'
import { useTourPosition } from './use-tour-position'
import { useTourState } from './use-tour-state'
import { useTourStyle } from './use-tour-style'

// 保持对外类型导出兼容（原定义在 tour.vue）
export type { TourProps, TourStep } from './types'

defineOptions({ name: 'EasyTour' })

const props = withDefaults(defineProps<TourProps>(), {
  modelValue: false,
  steps: () => [],
  placement: 'bottom',
  gap: 12,
  mask: true,
  maskColor: 'rgba(0, 0, 0, 0.45)',
  arrow: true,
  closeBtn: true,
  showIndex: true,
  prevBtn: true,
  nextText: '下一步',
  prevText: '上一步',
  finishText: '完成',
  startStep: 0,
  color: '#4f6ef7',
  closeOnOverlay: true,
  maxWidth: 360,
  scrollIntoView: true,
  scrollBehavior: 'smooth',
  zIndex: 9000,
})

const emit = defineEmits<TourEmits>()

// ──── 步骤状态（显隐 / 当前步骤 / 总数）────
const state = useTourState(props)
const { visible, current, total, currentStep, isLast } = state

// ──── 气泡定位（目标解析 / 翻转 / 边界约束 / 滚动跟随）────
const position = useTourPosition(props, state)
const { popoverRef, effectivePlacement, positionReady, updatePosition } = position

// ──── 流程控制（上一步 / 下一步 / 跳转 / 完成 / 关闭 / 遮罩跳过）────
const {
  handleNext,
  handlePrev,
  handleFinish,
  handleClose,
  onOverlayClick,
  start,
  goTo,
} = useTourNavigation(props, emit, state, position)

// ──── 样式与显隐派生 ────
const {
  showPrev,
  showArrow,
  showMask,
  showClose,
  showStepIndex,
  overlayStyle,
  highlightStyle,
  popoverStyle,
} = useTourStyle(props, state, position)

/** 暴露方法 */
defineExpose({
  start,
  next: handleNext,
  prev: handlePrev,
  goTo,
  finish: handleFinish,
  close: handleClose,
  updatePosition,
})
</script>

<template>
  <Teleport to="body">
    <!-- 遮罩层 -->
    <div v-if="visible && steps.length > 0 && currentStep" class="easy-tour-overlay" :style="overlayStyle"
      @click.self="onOverlayClick">
      <!-- 高亮区域 -->
      <div v-if="showMask" class="easy-tour-highlight" :class="{ 'is-round': currentStep.highlightRadius }"
        :style="highlightStyle" />
    </div>

    <!-- 气泡卡片：始终在 visible 时渲染，用 opacity/visibility 控制显隐 -->
    <div
      v-show="visible && steps.length > 0 && currentStep"
      ref="popoverRef"
      class="easy-tour-popover"
      :class="[
        `easy-tour-popover--${effectivePlacement}`,
        { 'is-arrow-hidden': !showArrow, 'is-visible': positionReady },
      ]"
      :style="popoverStyle"
    >
      <!-- 箭头 -->
      <div v-if="showArrow && positionReady" class="easy-tour-arrow" />

      <!-- 内容区 -->
      <div class="easy-tour-content">
        <!-- 标题栏 -->
        <div v-if="currentStep?.title" class="easy-tour-header">
          <div class="easy-tour-title">
            <span class="easy-tour-title__text">{{ currentStep?.title }}</span>
            <span v-if="showStepIndex" class="easy-tour-title__index"> {{ current + 1 }} / {{ total }} </span>
          </div>
          <button v-if="showClose" class="easy-tour-close" @click="handleClose">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <!-- 描述内容 -->
        <div class="easy-tour-body">
          <p v-if="currentStep?.description" class="easy-tour-description">
            {{ currentStep?.description }}
          </p>
          <slot :current="current" :step="currentStep" :total="total" />
        </div>

        <!-- 底部操作栏 -->
        <div class="easy-tour-footer">
          <div class="easy-tour-footer__left">
            <slot name="prev" :current="current" :step="currentStep" :total="total">
              <button v-if="showPrev" class="easy-tour-btn easy-tour-btn--default" @click="handlePrev">
                {{ prevText }}
              </button>
            </slot>
          </div>
          <div class="easy-tour-footer__right">
            <slot name="next" :current="current" :step="currentStep" :total="total">
              <button v-if="isLast" class="easy-tour-btn easy-tour-btn--primary" @click="handleFinish">
                {{ finishText }}
              </button>
              <button v-else class="easy-tour-btn easy-tour-btn--primary" @click="handleNext">
                {{ nextText }}
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<!-- 组件核心样式（scoped，独立维护在 tour-style.scss） -->
<style scoped src="./tour-style.scss" lang="scss"></style>
