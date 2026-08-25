<script setup lang="ts">
import EasyIcon from '../../icon'

import { stepProps } from './step'
import { useStep } from './use-step'

defineOptions({ name: 'EasyStep' })

// ──── props ────
const props = defineProps(stepProps)

// ──── 上下文注入 / 计数注册 / 状态派生 / 配色（抽离到 composable）────
const {
  stepsData,
  stepStyle,
  index,
  isLast,
  currentStatus,
  lineStatus,
} = useStep(props)
</script>

<template>
  <div
    class="easy-step"
    :class="[
      `easy-step--${currentStatus}`,
      {
        'is-center': stepsData?.alignCenter,
        'is-vertical': stepsData?.direction === 'vertical',
        'is-last': isLast,
      },
    ]"
    :style="stepStyle"
  >
    <!-- 图标区域 -->
    <div class="easy-step__head">
      <div class="easy-step__icon-wrapper">
        <div class="easy-step__icon" :class="[`is-${currentStatus}`]">
          <!-- 自定义图标 -->
          <slot name="icon">
            <template v-if="icon">
              <EasyIcon :name="icon" :size="16" color="currentColor" />
            </template>
            <template v-else-if="currentStatus === 'success' || currentStatus === 'finish'">
              <EasyIcon name="el:Check" :size="16" color="currentColor" />
            </template>
            <template v-else-if="currentStatus === 'error'">
              <EasyIcon name="el:Close" :size="16" color="currentColor" />
            </template>
            <span v-else class="easy-step__number">{{ index + 1 }}</span>
          </slot>
        </div>
        <!-- 脉冲动画效果（仅进行中状态） -->
        <div v-if="currentStatus === 'process'" class="easy-step__pulse" />
      </div>
      <!-- 连接线 -->
      <div v-if="!isLast" class="easy-step__line" :class="[`is-${lineStatus}`]">
        <div class="easy-step__line-progress" :class="[`is-${lineStatus}`]" />
      </div>
    </div>
    <!-- 文字区域 -->
    <div class="easy-step__main">
      <div class="easy-step__title" :class="[`is-${currentStatus}`]">
        <slot name="title">
          {{ title }}
        </slot>
      </div>
      <div v-if="description || $slots.description" class="easy-step__description" :class="[`is-${currentStatus}`]">
        <slot name="description">
          {{ description }}
        </slot>
      </div>
    </div>
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 step-style.scss） -->
<style scoped src="./step-style.scss" lang="scss"></style>
