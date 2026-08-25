<script setup lang="ts">
import type { CarouselEmits, CarouselProps } from './types'

import { ref } from 'vue'
import { useCarouselAutoplay } from './use-carousel-autoplay'
import { useCarouselNavigation } from './use-carousel-navigation'
import { useCarouselStyle } from './use-carousel-style'

// 保持对外类型导出兼容（原定义内联在 carousel.vue）
export type {
  ArrowDisplay,
  CarouselDirection,
  CarouselEmits,
  CarouselMode,
  CarouselProps,
  CarouselSlideDirection,
  DotPosition,
  DotType,
} from './types'

defineOptions({ name: 'EasyCarousel' })

const props = withDefaults(defineProps<CarouselProps>(), {
  mode: 'slide',
  interval: 3000,
  loop: true,
  direction: 'horizontal',
  arrow: 'hover',
  dotPosition: 'bottom',
  dotType: 'dot',
  showDots: true,
  showArrows: true,
  itemKey: undefined,
  pauseOnHover: true,
  initialIndex: 0,
  showTitle: false,
  showCounter: false,
  titleField: 'title',
  height: undefined,
})

const emit = defineEmits<CarouselEmits>()

/** 轮播容器 DOM 引用（仅供模板 ref 绑定） */
const containerRef = ref<HTMLElement | null>(null)

// ──── 索引状态机 + 键盘方向键导航 ────
const navigation = useCarouselNavigation(props, emit)
const { currentIndex, prevIndex, goTo, next, prev } = navigation

// ──── 自动播放定时器 + 悬停暂停 ────
const { isHovering, handleMouseEnter, handleMouseLeave } = useCarouselAutoplay(props, navigation)

// ──── 展示层派生（过渡动画名 / 标题 / 容器高度 / 3D 变换）────
const {
  transitionName,
  currentTitle,
  containerStyle,
  track3dStyle,
  getItem3dStyle,
} = useCarouselStyle(props, navigation)

defineExpose({
  next,
  prev,
  goTo,
  currentIndex,
})
</script>

<template>
  <div
    class="easy-carousel"
    :class="{
      'easy-carousel--vertical': direction === 'vertical',
      'easy-carousel--3d': mode === '3d',
    }"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 轮播容器 -->
    <div ref="containerRef" class="easy-carousel__container" :style="containerStyle">
      <!-- ===== 普通模式 ===== -->
      <TransitionGroup v-if="mode === 'slide'" :name="transitionName" tag="div" class="easy-carousel__track">
        <div v-for="(item, index) in items" v-show="index === currentIndex"
          :key="itemKey ? (item as any)[itemKey] : index" class="easy-carousel__item"
          :class="{ 'is-active': index === currentIndex }">
          <slot name="item" :item="item" :index="index">
            <img v-if="typeof item === 'string'" :src="item" :alt="`carousel-${index}`" class="easy-carousel__img">
            <img v-else-if="(item as Record<string, unknown>).src"
              :src="(item as Record<string, unknown>).src as string" :alt="`carousel-${index}`" class="easy-carousel__img">
            <div v-else class="easy-carousel__custom-item">
              {{ item }}
            </div>
          </slot>
        </div>
      </TransitionGroup>

      <!-- ===== 3D 模式 ===== -->
      <div v-else-if="mode === '3d'" class="easy-carousel__perspective">
        <div class="easy-carousel__3d-track" :style="track3dStyle">
          <div
            v-for="(item, index) in items"
            :key="itemKey ? (item as any)[itemKey] : index"
            class="easy-carousel__3d-item"
            :class="{
              'is-active': index === currentIndex,
              'is-prev': index === prevIndex,
            }"
            :style="getItem3dStyle(index)"
          >
            <slot name="item" :item="item" :index="index">
              <img v-if="typeof item === 'string'" :src="item" :alt="`carousel-${index}`" class="easy-carousel__img">
              <img v-else-if="(item as Record<string, unknown>).src"
                :src="(item as Record<string, unknown>).src as string" :alt="`carousel-${index}`"
                class="easy-carousel__img">
              <div v-else class="easy-carousel__custom-item">
                {{ item }}
              </div>
            </slot>
          </div>
        </div>
      </div>
    </div>

    <!-- 标题 -->
    <div v-if="showTitle && currentTitle" class="easy-carousel__title">
      <slot name="title" :item="items[currentIndex]" :index="currentIndex">
        <span class="easy-carousel__title-text">{{ currentTitle }}</span>
        <span v-if="showCounter" class="easy-carousel__counter"> {{ currentIndex + 1 }} / {{ items.length }} </span>
      </slot>
    </div>

    <!-- 左右箭头 -->
    <template v-if="showArrows && arrow !== 'never'">
      <button class="easy-carousel__arrow easy-carousel__arrow--left"
        :class="{ 'is-hidden': arrow === 'hover' && !isHovering }" @click="prev">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
      </button>
      <button class="easy-carousel__arrow easy-carousel__arrow--right"
        :class="{ 'is-hidden': arrow === 'hover' && !isHovering }" @click="next">
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
      </button>
    </template>

    <!-- 指示器 -->
    <div v-if="showDots" class="easy-carousel__dots"
      :class="[`easy-carousel__dots--${dotPosition}`, { 'easy-carousel__dots--number': dotType === 'number' }]">
      <template v-if="dotType === 'number'">
        <!-- 数字指示器 -->
        <div class="easy-carousel__number">
          <button class="easy-carousel__number-btn" @click="prev">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </button>
          <span class="easy-carousel__number-current">{{ String(currentIndex + 1) }}</span>
          <span class="easy-carousel__number-sep">/</span>
          <span class="easy-carousel__number-total">{{ String(items.length) }}</span>
          <button class="easy-carousel__number-btn" @click="next">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 6L15 12L9 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"
                stroke-linejoin="round" />
            </svg>
          </button>
        </div>
      </template>
      <template v-else>
        <!-- 圆点 / 线条 指示器 -->
        <button
          v-for="(_, index) in items"
          :key="index"
          class="easy-carousel__dot"
          :class="{
            'is-active': index === currentIndex,
            [`easy-carousel__dot--${dotType}`]: true,
          }"
          @click="goTo(index)"
        >
          <span v-if="dotType === 'line'" class="easy-carousel__dot-inner" />
        </button>
      </template>
    </div>
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 carousel-style.scss） -->
<style scoped src="./carousel-style.scss" lang="scss"></style>
