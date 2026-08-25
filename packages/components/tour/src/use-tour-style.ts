import type { TourProps } from './types'
import type { TourPosition } from './use-tour-position'
import type { TourState } from './use-tour-state'

import { computed } from 'vue'

/**
 * 遮罩 / 高亮 / 气泡的行内样式与元素显隐派生（纯派生，无副作用）。
 *
 * 高亮框以超大 box-shadow 实现「挖洞」遮罩效果，z-index 依次为
 * zIndex（遮罩）、zIndex + 1（高亮）、zIndex + 2（气泡）。
 *
 * @param props 引导组件 props（响应式对象）
 * @param state 步骤状态（useTourState 返回值）
 * @param position 定位上下文（useTourPosition 返回值）
 */
export function useTourStyle(props: TourProps, state: TourState, position: TourPosition) {
  const { total, currentStep, isFirst } = state
  const { targetRect, positionReady, popoverTop, popoverLeft } = position

  /** 是否显示上一步按钮 */
  const showPrev = computed(() => props.prevBtn && !isFirst.value)
  /** 是否显示箭头 */
  const showArrow = computed(() => props.arrow)
  /** 是否显示遮罩高亮（步骤显式关闭 highlight 或目标未就绪时不显示） */
  const showMask = computed(() => props.mask && currentStep.value?.highlight !== false && !!targetRect.value)
  /** 是否显示关闭按钮 */
  const showClose = computed(() => props.closeBtn)
  /** 是否显示步骤索引（仅多步时显示） */
  const showStepIndex = computed(() => props.showIndex && total.value > 1)

  /** 遮罩层样式（铺满视口） */
  const overlayStyle = computed(() => ({
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: props.zIndex,
    pointerEvents: props.closeOnOverlay ? ('auto' as const) : ('none' as const),
  }))

  /** 高亮框样式（跟随目标矩形，外扩 4px） */
  const highlightStyle = computed(() => {
    if (!targetRect.value)
      return { display: 'none' }
    const r = targetRect.value
    const radius = currentStep.value?.highlightRadius || 0
    return {
      position: 'fixed' as const,
      top: `${r.top - 4}px`,
      left: `${r.left - 4}px`,
      width: `${r.width + 8}px`,
      height: `${r.height + 8}px`,
      borderRadius: radius ? `${radius}px` : '4px',
      boxShadow: `0 0 0 9999px ${props.maskColor}`,
      zIndex: props.zIndex! + 1,
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      pointerEvents: 'none' as const,
    }
  })

  /** 气泡样式（定位坐标 + 主题色变量 + 就绪后淡入） */
  const popoverStyle = computed(() => ({
    'position': 'fixed' as const,
    'top': `${popoverTop.value}px`,
    'left': `${popoverLeft.value}px`,
    'zIndex': props.zIndex! + 2,
    'maxWidth': typeof props.maxWidth === 'number' ? `${props.maxWidth}px` : props.maxWidth,
    '--tour-color': props.color,
    'opacity': positionReady.value ? 1 : 0,
    'visibility': positionReady.value ? ('visible' as const) : ('hidden' as const),
    'transition': positionReady.value
      ? 'top 0.25s cubic-bezier(0.4, 0, 0.2, 1), left 0.25s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.2s ease'
      : 'none',
  }))

  return {
    showPrev,
    showArrow,
    showMask,
    showClose,
    showStepIndex,
    overlayStyle,
    highlightStyle,
    popoverStyle,
  }
}
