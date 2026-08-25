import type { CarouselEmits, CarouselResolvedProps, CarouselSlideDirection } from './types'

import { onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * 轮播索引状态机 + 键盘方向键导航。
 *
 * 将原本内联在 carousel.vue 中的 currentIndex / prevIndex / slideDirection 状态
 * 及 goTo / next / prev / handleKeydown 抽离为独立 composable，作为自动播放与
 * 样式派生的共享数据源（对齐 markdown / progress 拆分规范）。行为与原实现完全一致：
 *
 * - `goTo` 索引未变化时直接返回，不派发 change；
 * - `next` / `prev` 在 items 数量 ≤ 1 时不响应；非循环模式下到达边界即停止；
 * - 键盘监听挂在 document 上（水平模式响应 ←/→，垂直模式响应 ↑/↓ 并阻止页面滚动）。
 *
 * emit 以 CarouselEmits 可调用接口直接标注（不使用 EmitFn<>）。
 *
 * @param props 轮播组件 props（withDefaults 填充后的响应式对象）
 * @param emit 组件事件（change）
 */
export function useCarouselNavigation(props: CarouselResolvedProps, emit: CarouselEmits) {
  /** 当前展示的索引 */
  const currentIndex = ref(props.initialIndex)
  /** 上一次展示的索引（3D 模式用于标记 is-prev） */
  const prevIndex = ref(0)
  /** 本次切换的方向，决定过渡动画名 */
  const slideDirection = ref<CarouselSlideDirection>('forward')

  /**
   * 跳转到指定索引。
   *
   * @param index 目标索引
   * @param direction 过渡方向，默认 'forward'
   */
  function goTo(index: number, direction: CarouselSlideDirection = 'forward') {
    if (index === currentIndex.value)
      return

    const oldIndex = currentIndex.value
    prevIndex.value = oldIndex
    slideDirection.value = direction
    currentIndex.value = index
    emit('change', index, oldIndex)
  }

  /** 下一张（循环模式取模回绕，非循环模式到末尾即停止） */
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

  /** 上一张（循环模式取模回绕，非循环模式到开头即停止） */
  function prev() {
    const len = props.items.length
    if (len <= 1)
      return

    if (props.loop) {
      // 局部变量仅用于计算目标索引，与外层 prevIndex ref 无关（由 goTo 统一写入）
      const targetIndex = (currentIndex.value - 1 + len) % len
      goTo(targetIndex, 'backward')
    }
    else {
      if (currentIndex.value > 0) {
        goTo(currentIndex.value - 1, 'backward')
      }
    }
  }

  /** 键盘方向键导航：垂直模式需阻止默认滚动行为 */
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
    document.addEventListener('keydown', handleKeydown)
  })

  onBeforeUnmount(() => {
    document.removeEventListener('keydown', handleKeydown)
  })

  return {
    currentIndex,
    prevIndex,
    slideDirection,
    goTo,
    next,
    prev,
  }
}

/** 轮播导航上下文（供其余 composable 复用） */
export type CarouselNavigation = ReturnType<typeof useCarouselNavigation>
