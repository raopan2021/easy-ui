<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'

defineOptions({ name: 'EasyCarousel' })

const props = withDefaults(
  defineProps<{
    /** 轮播数据列表，支持图片 URL 字符串或任意对象 */
    items: (string | Record<string, any>)[]
    /** 轮播模式：slide（滑动）或 3d（3D 透视） */
    mode?: CarouselMode
    /** 自动播放间隔（毫秒），0 表示不自动播放 */
    interval?: number
    /** 是否循环播放 */
    loop?: boolean
    /** 轮播方向 */
    direction?: CarouselDirection
    /** 箭头显示策略 */
    arrow?: ArrowDisplay
    /** 指示器位置 */
    dotPosition?: DotPosition
    /** 指示器样式类型 */
    dotType?: DotType
    /** 是否显示指示器 */
    showDots?: boolean
    /** 是否显示箭头 */
    showArrows?: boolean
    /** 数据中用作唯一 key 的字段名 */
    itemKey?: string
    /** 是否在鼠标悬停时暂停自动播放 */
    pauseOnHover?: boolean
    /** 初始索引 */
    initialIndex?: number
    /** 是否显示标题（取 items 中的 title 字段，或通过 #title 插槽自定义） */
    showTitle?: boolean
    /** 是否在标题旁显示计数器（当前/总数） */
    showCounter?: boolean
    /** 标题字段名，当 items 为对象数组时，从中读取标题文本 */
    titleField?: string
    /** 轮播容器高度，支持 CSS 值如 '200px'、'40vh'、'300' */
    height?: number | string
  }>(),
  {
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
  },
)
const emit = defineEmits<{
  (e: 'change', index: number, prevIndex: number): void
}>()
/** 轮播模式 */
type CarouselMode = 'slide' | '3d'
/** 轮播方向 */
type CarouselDirection = 'horizontal' | 'vertical'
/** 箭头显示策略 */
type ArrowDisplay = 'always' | 'hover' | 'never'
/** 指示器位置 */
type DotPosition = 'bottom' | 'left' | 'right'
/** 指示器类型 */
type DotType = 'dot' | 'line' | 'number'

const currentIndex = ref(props.initialIndex)
const prevIndex = ref(0)
const isHovering = ref(false)
const containerRef = ref<HTMLElement | null>(null)
let timer: ReturnType<typeof setInterval> | null = null
const slideDirection = ref<'forward' | 'backward'>('forward')

// ===== 计算属性 =====

const transitionName = computed(() => {
  const prefix = props.direction === 'vertical' ? 'easy-slide-v' : 'easy-slide'
  return slideDirection.value === 'forward' ? `${prefix}-forward` : `${prefix}-backward`
})

/** 当前标题文本 */
const currentTitle = computed(() => {
  const item = props.items[currentIndex.value]
  if (typeof item === 'string')
    return ''
  return ((item as Record<string, unknown>)[props.titleField] as string) || ''
})

/** 容器自定义高度样式 */
const containerStyle = computed(() => {
  if (!props.height)
    return undefined
  const val = typeof props.height === 'number' ? `${props.height}px` : props.height
  return { height: val }
})

/** 3D 模式轨道样式 */
const track3dStyle = computed(() => ({
  transform: `rotateY(0deg)`,
}))

/** 获取 3D 模式下每个 item 的样式 */
function getItem3dStyle(index: number) {
  const len = props.items.length
  const current = currentIndex.value

  // 计算相对位置（考虑循环）
  let offset = index - current
  if (offset > Math.floor(len / 2))
    offset -= len
  if (offset < -Math.floor(len / 2))
    offset += len

  const translateZ = 0
  const translateX = offset * 65
  const rotateY = -offset * 25
  const opacity = offset === 0 ? 1 : Math.max(0.3, 1 - Math.abs(offset) * 0.3)
  const zIndex = len - Math.abs(offset)
  const scale = offset === 0 ? 1 : Math.max(0.75, 1 - Math.abs(offset) * 0.1)

  return {
    transform: `translateX(${translateX}%) rotateY(${rotateY}deg) translateZ(${translateZ}px) scale(${scale})`,
    opacity,
    zIndex,
  }
}

// ===== 定时器 =====

function clearTimer() {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
}

function startTimer() {
  clearTimer()
  if (props.interval > 0) {
    timer = setInterval(() => {
      if (!props.pauseOnHover || !isHovering.value) {
        next()
      }
    }, props.interval)
  }
}

// ===== 导航 =====

function goTo(index: number, direction: 'forward' | 'backward' = 'forward') {
  if (index === currentIndex.value)
    return

  const oldIndex = currentIndex.value
  prevIndex.value = oldIndex
  slideDirection.value = direction
  currentIndex.value = index
  emit('change', index, oldIndex)
}

function next() {
  const len = props.items.length
  if (len <= 1)
    return

  if (props.loop) {
    const nextIndex = (currentIndex.value + 1) % len
    goTo(nextIndex, 'forward')
  }
  else {
    if (currentIndex.value < len - 1) {
      goTo(currentIndex.value + 1, 'forward')
    }
  }
}

function prev() {
  const len = props.items.length
  if (len <= 1)
    return

  if (props.loop) {
    const prevIndex = (currentIndex.value - 1 + len) % len
    goTo(prevIndex, 'backward')
  }
  else {
    if (currentIndex.value > 0) {
      goTo(currentIndex.value - 1, 'backward')
    }
  }
}

// ===== 事件 =====

function handleMouseEnter() {
  isHovering.value = true
  if (props.pauseOnHover) {
    clearTimer()
  }
}

function handleMouseLeave() {
  isHovering.value = false
  startTimer()
}

function handleKeydown(e: KeyboardEvent) {
  if (props.direction === 'horizontal') {
    if (e.key === 'ArrowLeft')
      prev()
    else if (e.key === 'ArrowRight')
      next()
  }
  else {
    if (e.key === 'ArrowUp') {
      e.preventDefault()
      prev()
    }
    else if (e.key === 'ArrowDown') {
      e.preventDefault()
      next()
    }
  }
}

onMounted(() => {
  startTimer()
  document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
  clearTimer()
  document.removeEventListener('keydown', handleKeydown)
})

watch(
  () => props.interval,
  () => {
    startTimer()
  },
)

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
        <div
          v-for="(item, index) in items"
          v-show="index === currentIndex"
          :key="itemKey ? (item as any)[itemKey] : index"
          class="easy-carousel__item"
          :class="{ 'is-active': index === currentIndex }"
        >
          <slot name="item" :item="item" :index="index">
            <img v-if="typeof item === 'string'" :src="item" :alt="`carousel-${index}`" class="easy-carousel__img">
            <img
              v-else-if="(item as Record<string, unknown>).src"
              :src="(item as Record<string, unknown>).src as string"
              :alt="`carousel-${index}`"
              class="easy-carousel__img"
            >
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
              <img
                v-else-if="(item as Record<string, unknown>).src"
                :src="(item as Record<string, unknown>).src as string"
                :alt="`carousel-${index}`"
                class="easy-carousel__img"
              >
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
      <button
        class="easy-carousel__arrow easy-carousel__arrow--left"
        :class="{ 'is-hidden': arrow === 'hover' && !isHovering }"
        @click="prev"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M15 18L9 12L15 6"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
      <button
        class="easy-carousel__arrow easy-carousel__arrow--right"
        :class="{ 'is-hidden': arrow === 'hover' && !isHovering }"
        @click="next"
      >
        <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M9 6L15 12L9 18"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </button>
    </template>

    <!-- 指示器 -->
    <div
      v-if="showDots"
      class="easy-carousel__dots"
      :class="[`easy-carousel__dots--${dotPosition}`, { 'easy-carousel__dots--number': dotType === 'number' }]"
    >
      <template v-if="dotType === 'number'">
        <!-- 数字指示器 -->
        <div class="easy-carousel__number">
          <button class="easy-carousel__number-btn" @click="prev">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
          <span class="easy-carousel__number-current">{{ String(currentIndex + 1) }}</span>
          <span class="easy-carousel__number-sep">/</span>
          <span class="easy-carousel__number-total">{{ String(items.length) }}</span>
          <button class="easy-carousel__number-btn" @click="next">
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M9 6L15 12L9 18"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
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

<style scoped lang="scss">
@use '../../../easy-ui/src/styles/tokens' as *;

/* ========== 设计令牌 ========== */

$transition: all 0.3s ease;

.easy-carousel {
  position: relative;
  width: 100%;
  overflow: hidden;
  border-radius: 12px;
  background: var(--el-fill-color-light);

  html.dark & {
    background: var(--el-fill-color-lighter);
  }
}

.easy-carousel--vertical {
  .easy-carousel__container {
    height: 300px;
  }
}

/* ========== 容器 ========== */
.easy-carousel__container {
  position: relative;
  width: 100%;
  height: 200px;
}

.easy-carousel__track {
  position: relative;
  width: 100%;
  height: 100%;
}

.easy-carousel__item {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.easy-carousel__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.easy-carousel__custom-item {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  color: var(--el-color-white);
  background: linear-gradient(135deg, var(--el-color-primary) 0%, var(--el-color-primary) 100%);
}

/* ========== 标题 ========== */
.easy-carousel__title {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 8;
  padding: 48px 20px 16px;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.55) 0%, transparent 100%);
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 12px;
  pointer-events: none;
}

.easy-carousel__title-text {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-color-white);
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
  line-height: 1.4;
}

.easy-carousel__counter {
  flex-shrink: 0;
  font-size: 13px;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
  background: rgba(0, 0, 0, 0.25);
  padding: 2px 10px;
  border-radius: 12px;
  backdrop-filter: blur(4px);
}

/* ========== 3D 模式 ========== */
.easy-carousel--3d {
  .easy-carousel__container {
    height: 260px;
    perspective: 1200px;
  }
}

.easy-carousel__perspective {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  perspective: 1200px;
}

.easy-carousel__3d-track {
  position: relative;
  width: 100%;
  height: 100%;
  transform-style: preserve-3d;
}

.easy-carousel__3d-item {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  transform-style: preserve-3d;
  backface-visibility: hidden;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);

  &.is-active {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.25);
  }

  html.dark & {
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.45);

    &.is-active {
      box-shadow: 0 12px 40px rgba(0, 0, 0, 0.55);
    }
  }

  img {
    border-radius: 12px;
  }
}

/* ========== 箭头 ========== */
.easy-carousel__arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 10;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: var(--el-fill-color-light);
  color: var(--el-color-white);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: $transition;
  opacity: 1;
  backdrop-filter: blur(4px);

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    background: var(--el-fill-color-light);
  }

  &.is-hidden {
    opacity: 0;
    pointer-events: none;
  }
}

.easy-carousel__arrow--left {
  left: 12px;
}
.easy-carousel__arrow--right {
  right: 12px;
}

/* 垂直模式箭头位置调整 */
.easy-carousel--vertical {
  .easy-carousel__arrow {
    top: auto;
    left: 50%;
    transform: translateX(-50%);

    &.easy-carousel__arrow--left {
      top: 12px;
      transform: translateX(-50%);
    }
    &.easy-carousel__arrow--right {
      bottom: 12px;
      top: auto;
      transform: translateX(-50%);
    }
  }
}

/* ========== 指示器 ========== */
.easy-carousel__dots {
  position: absolute;
  z-index: 10;
  display: flex;
  gap: 8px;
}

.easy-carousel__dots--bottom {
  bottom: 12px;
  left: 50%;
  transform: translateX(-50%);
}

.easy-carousel__dots--left {
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  flex-direction: column;
}

.easy-carousel__dots--right {
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  flex-direction: column;
}

// 有标题时指示器上移
.easy-carousel__title ~ .easy-carousel__dots--bottom {
  bottom: 52px;
}

.easy-carousel__dot {
  border: none;
  cursor: pointer;
  background: transparent;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: $transition;
}

.easy-carousel__dot--dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: $white-dim;
  box-shadow: 0 0 4px rgba(0, 0, 0, 0.1);

  html.dark & {
    box-shadow: 0 0 4px rgba(0, 0, 0, 0.3);
  }

  &.is-active {
    background: $white;
    box-shadow: 0 0 8px rgba(79, 110, 247, 0.08);
    transform: scale(1.2);
  }
}

.easy-carousel__dot--line {
  width: 24px;
  height: 4px;
  border-radius: 2px;
  background: $white-dim;
  overflow: hidden;

  .easy-carousel__dot-inner {
    display: block;
    width: 100%;
    height: 100%;
    background: transparent;
    border-radius: 2px;
    transform: scaleX(0);
    transition: transform 0.3s ease;
  }

  &.is-active {
    background: rgba(255, 255, 255, 0.3);
    .easy-carousel__dot-inner {
      background: $white;
      transform: scaleX(1);
    }
  }
}

/* ========== 数字指示器 ========== */
.easy-carousel__dots--number {
  gap: 0;
  background: rgba(0, 0, 0, 0.3);
  backdrop-filter: blur(8px);
  border-radius: 20px;
  padding: 4px;

  html.dark & {
    background: rgba(0, 0, 0, 0.5);
  }
}

.easy-carousel__number {
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--el-color-white);
  font-size: 14px;
  user-select: none;
}

.easy-carousel__number-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: 50%;
  background: transparent;
  color: var(--el-color-white);
  cursor: pointer;
  transition: $transition;

  svg {
    width: 14px;
    height: 14px;
  }

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
}

.easy-carousel__number-current {
  font-size: 16px;
  min-width: 24px;
  text-align: center;
}

.easy-carousel__number-sep {
  opacity: 0.5;
  font-weight: 400;
}

.easy-carousel__number-total {
  font-size: 13px;
  opacity: 0.6;
  min-width: 24px;
  text-align: center;
}

/* ========== 过渡动画 - 水平 ========== */
.easy-slide-forward-enter-active,
.easy-slide-forward-leave-active,
.easy-slide-backward-enter-active,
.easy-slide-backward-leave-active {
  transition: all 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.easy-slide-forward-enter-from {
  transform: translateX(100%);
  opacity: 0.5;
}
.easy-slide-forward-leave-to {
  transform: translateX(-100%);
  opacity: 0.5;
}
.easy-slide-backward-enter-from {
  transform: translateX(-100%);
  opacity: 0.5;
}
.easy-slide-backward-leave-to {
  transform: translateX(100%);
  opacity: 0.5;
}

/* ========== 过渡动画 - 垂直 ========== */
.easy-slide-v-forward-enter-active,
.easy-slide-v-forward-leave-active,
.easy-slide-v-backward-enter-active,
.easy-slide-v-backward-leave-active {
  transition: all 0.45s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}
.easy-slide-v-forward-enter-from {
  transform: translateY(100%);
  opacity: 0.5;
}
.easy-slide-v-forward-leave-to {
  transform: translateY(-100%);
  opacity: 0.5;
}
.easy-slide-v-backward-enter-from {
  transform: translateY(-100%);
  opacity: 0.5;
}
.easy-slide-v-backward-leave-to {
  transform: translateY(100%);
  opacity: 0.5;
}
</style>
