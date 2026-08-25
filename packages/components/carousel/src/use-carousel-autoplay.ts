import type { CarouselResolvedProps } from './types'

import type { CarouselNavigation } from './use-carousel-navigation'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

/**
 * 自动播放定时器 + 鼠标悬停暂停。
 *
 * 将原本内联在 carousel.vue 中的 timer / isHovering / startTimer / clearTimer
 * 及鼠标进出事件抽离为独立 composable（对齐 markdown / progress 拆分规范）。
 * 行为与原实现完全一致：
 *
 * - `interval` 为 0（或负数）时不启动定时器，即关闭自动播放；
 * - 定时器每次触发前判断悬停状态：`pauseOnHover` 为 true 且正在悬停时跳过本次切换；
 * - `mouseenter` 时若开启 `pauseOnHover` 则直接销毁定时器，`mouseleave` 时重建；
 * - `interval` 变化时重建定时器；组件卸载时清理定时器。
 *
 * @param props 轮播组件 props（withDefaults 填充后的响应式对象）
 * @param navigation 索引状态机（useCarouselNavigation 返回值，提供 next）
 */
export function useCarouselAutoplay(props: CarouselResolvedProps, navigation: CarouselNavigation) {
  const { next } = navigation

  /** 鼠标是否悬停在轮播区域上（同时用于箭头的 hover 显隐） */
  const isHovering = ref(false)
  /** 自动播放定时器句柄 */
  let timer: ReturnType<typeof setInterval> | null = null

  /** 销毁定时器（幂等） */
  function clearTimer() {
    if (timer) {
      clearInterval(timer)
      timer = null
    }
  }

  /** 重建定时器：先销毁旧的，再按 interval 重新登记（interval ≤ 0 时不启动） */
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

  /** 鼠标进入：标记悬停，开启 pauseOnHover 时暂停自动播放 */
  function handleMouseEnter() {
    isHovering.value = true
    if (props.pauseOnHover) {
      clearTimer()
    }
  }

  /** 鼠标离开：取消悬停标记并恢复自动播放 */
  function handleMouseLeave() {
    isHovering.value = false
    startTimer()
  }

  onMounted(() => {
    startTimer()
  })

  onBeforeUnmount(() => {
    clearTimer()
  })

  watch(
    () => props.interval,
    () => {
      startTimer()
    },
  )

  return {
    isHovering,
    handleMouseEnter,
    handleMouseLeave,
  }
}

/** 轮播自动播放上下文 */
export type CarouselAutoplay = ReturnType<typeof useCarouselAutoplay>
