import type { TourProps, TourStep } from './types'
import type { TourState } from './use-tour-state'

import { isRef, nextTick, onUnmounted, ref, unref } from 'vue'

/**
 * 气泡定位与目标监听。
 *
 * 职责：
 * - 解析步骤 target（选择器 / DOM / ref）为真实元素；
 * - 按 placement 计算气泡坐标，空间不足时自动翻转，并做视口边界约束；
 * - 滚动目标进入可视区域后延迟定位，避免滚动动画期间取到旧坐标；
 * - 监听 body 尺寸与窗口滚动 / resize，实时跟随目标。
 *
 * @param props 引导组件 props（响应式对象）
 * @param state 步骤状态（useTourState 返回值）
 */
export function useTourPosition(props: TourProps, state: TourState) {
  const { visible, currentStep } = state

  /** 气泡根节点 */
  const popoverRef = ref<HTMLElement | null>(null)
  /** 目标元素矩形（用于高亮框） */
  const targetRect = ref<DOMRect | null>(null)
  /** 实际生效的气泡方位（可能因空间不足而翻转） */
  const effectivePlacement = ref(props.placement)
  /** 位置是否已就绪（就绪后才显示气泡，避免定位闪跳） */
  const positionReady = ref(false)
  /** 气泡定位坐标 */
  const popoverTop = ref(0)
  const popoverLeft = ref(0)

  let resizeObserver: ResizeObserver | null = null
  let scrollParentHandler: (() => void) | null = null
  let updateTimer: ReturnType<typeof setTimeout> | null = null

  /** 获取目标元素 */
  function getTargetElement(step: TourStep): HTMLElement | null {
    if (!step)
      return null
    let target = step.target as any
    // 用 Vue 的 unref 自动解包 ref 对象
    if (isRef(target)) {
      target = unref(target)
    }
    if (target instanceof HTMLElement)
      return target
    if (typeof target === 'string') {
      return document.querySelector(target)
    }
    return null
  }

  /** 计算弹窗位置 */
  function calculatePosition(
    tRect: DOMRect,
    pRect: DOMRect,
    placement: string,
    gap: number,
  ): { top: number, left: number } {
    const { top, left, width, height } = tRect
    const vw = window.innerWidth
    const vh = window.innerHeight

    // 检查是否有足够空间，不够则翻转
    let p = placement
    const space = {
      top: top - gap,
      bottom: vh - (top + height) - gap,
      left: left - gap,
      right: vw - (left + width) - gap,
    }

    if (p === 'top' && space.top < pRect.height && space.bottom >= pRect.height)
      p = 'bottom'
    else if (p === 'bottom' && space.bottom < pRect.height && space.top >= pRect.height)
      p = 'top'
    else if (p === 'left' && space.left < pRect.width && space.right >= pRect.width)
      p = 'right'
    else if (p === 'right' && space.right < pRect.width && space.left >= pRect.width)
      p = 'left'

    effectivePlacement.value = p as any

    let resultTop = 0
    let resultLeft = 0

    switch (p) {
      case 'top':
        resultTop = top - pRect.height - gap
        resultLeft = left + (width - pRect.width) / 2
        break
      case 'bottom':
        resultTop = top + height + gap
        resultLeft = left + (width - pRect.width) / 2
        break
      case 'left':
        resultTop = top + (height - pRect.height) / 2
        resultLeft = left - pRect.width - gap
        break
      case 'right':
        resultTop = top + (height - pRect.height) / 2
        resultLeft = left + width + gap
        break
    }

    // 边界约束
    resultLeft = Math.max(12, Math.min(resultLeft, vw - pRect.width - 12))
    resultTop = Math.max(12, Math.min(resultTop, vh - pRect.height - 12))

    return { top: resultTop, left: resultLeft }
  }

  /** 实际执行位置计算 */
  function doPositionCalculation(target: HTMLElement) {
    if (!popoverRef.value || !visible.value)
      return

    const rect = target.getBoundingClientRect()
    targetRect.value = rect

    const popoverRect = popoverRef.value.getBoundingClientRect()
    // 弹窗还没尺寸（首次渲染可能 0），再等一帧
    if (popoverRect.width === 0 && popoverRect.height === 0) {
      nextTick(() => doPositionCalculation(target))
      return
    }

    const gap = currentStep.value?.gap ?? props.gap!
    const placement = currentStep.value?.placement || props.placement!

    effectivePlacement.value = placement

    const pos = calculatePosition(rect, popoverRect, placement, gap)

    // 设置位置（通过 ref，由 Vue 响应式更新 style）
    popoverTop.value = pos.top
    popoverLeft.value = pos.left

    // 标记位置就绪，显示弹窗
    positionReady.value = true
  }

  /**
   * 更新弹窗位置。
   *
   * @param shouldScroll 是否先把目标滚动进可视区域（步骤切换时为 true）
   */
  function updatePosition(shouldScroll = true) {
    if (updateTimer) {
      clearTimeout(updateTimer)
      updateTimer = null
    }
    if (!currentStep.value || !visible.value || !popoverRef.value) {
      positionReady.value = false
      return
    }

    const target = getTargetElement(currentStep.value)
    if (!target) {
      positionReady.value = false
      return
    }

    // 滚动到可视区域（仅步骤切换时）
    if (shouldScroll && props.scrollIntoView) {
      target.scrollIntoView({ behavior: props.scrollBehavior, block: 'center', inline: 'center' })
    }

    // 等待滚动完成后再计算位置
    const delay = shouldScroll && props.scrollIntoView ? (props.scrollBehavior === 'smooth' ? 400 : 80) : 0
    updateTimer = setTimeout(() => {
      updateTimer = null
      doPositionCalculation(target)
    }, delay)
  }

  /** 停止监听 */
  function stopObserving() {
    if (updateTimer) {
      clearTimeout(updateTimer)
      updateTimer = null
    }
    resizeObserver?.disconnect()
    resizeObserver = null
    if (scrollParentHandler) {
      window.removeEventListener('scroll', scrollParentHandler, true)
      window.removeEventListener('resize', scrollParentHandler)
      scrollParentHandler = null
    }
  }

  /** 开始监听 */
  function startObserving() {
    stopObserving()

    resizeObserver = new ResizeObserver(() => updatePosition(false))
    resizeObserver.observe(document.body)

    scrollParentHandler = () => updatePosition(false)
    window.addEventListener('scroll', scrollParentHandler, true)
    window.addEventListener('resize', scrollParentHandler)
  }

  onUnmounted(() => {
    stopObserving()
  })

  return {
    popoverRef,
    targetRect,
    effectivePlacement,
    positionReady,
    popoverTop,
    popoverLeft,
    updatePosition,
    startObserving,
    stopObserving,
  }
}

/** 定位上下文（供导航 / 样式 composable 复用） */
export type TourPosition = ReturnType<typeof useTourPosition>
