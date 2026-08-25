import type { Ref } from 'vue'

import type { LoadingResolvedProps } from './types'
import { computed } from 'vue'

/**
 * Loading 样式与尺寸派生计算（纯 props 派生，无副作用）。
 *
 * 将原本内联在 loading.vue 中的大量 computed 与尺寸辅助函数抽离为独立 composable，
 * 便于复用与单测，也让 .vue 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 *
 * @param props   Loading props（需传入响应式对象，已应用默认值，computed 会自动追踪依赖）
 * @param visible 内部可见状态 ref（原 loading.vue 的 `visible`，用于 `is-visible` 类名）
 */
export function useLoadingStyle(props: LoadingResolvedProps, visible: Ref<boolean>) {
  /** 根节点组合类名（类型 / 尺寸 / 全屏 / 遮罩 / 锁定 / 可见态 / 自定义 class） */
  const wrapperClasses = computed(() => [
    'easy-loading',
    `easy-loading--${props.type}`,
    `easy-loading--${getSizeClass()}`,
    {
      'is-fullscreen': props.fullscreen,
      'is-container-fullscreen': props.containerFullscreen,
      'is-overlay-mode': props.overlayMode,
      'is-lock': props.lock,
      'is-visible': visible.value,
    },
    props.customClass,
  ])

  /** 根节点行内样式（全屏层级） */
  const wrapperStyle = computed(() => ({
    zIndex: props.fullscreen ? 9999 : props.containerFullscreen ? 1000 : undefined,
  }))

  /** 内容区行内样式（文本颜色） */
  const contentStyle = computed(() => ({
    color: props.textColor,
  }))

  /** 遮罩行内样式（遮罩颜色） */
  const maskStyle = computed(() => ({
    backgroundColor: props.maskColor,
  }))

  /** 加载动画容器组合类名 */
  const spinnerClasses = computed(() => ['easy-loading-spinner', `spinner--${props.type}`])

  /** 加载动画容器行内样式（尺寸 + 颜色 CSS 变量） */
  const spinnerStyle = computed(() => {
    const size = getSizeValue()
    return {
      'width': typeof size === 'number' ? `${size}px` : size,
      'height': typeof size === 'number' ? `${size}px` : size,
      '--spinner-color': props.color,
      '--spinner-bg-color': props.backgroundColor,
    } as Record<string, string | number>
  })

  /** 环形进度整圆周长（半径 20） */
  const circumference = computed(() => 2 * Math.PI * 20)

  /** 环形进度虚线偏移量（progress 归一化到 0-100） */
  const progressOffset = computed(() => {
    const progress = Math.max(0, Math.min(100, props.progress))
    return circumference.value * (1 - progress / 100)
  })

  /** 根据自定义 number 尺寸映射为 small/medium/large 尺寸类名 */
  function getSizeClass(): string {
    if (typeof props.size === 'string') {
      return props.size
    }
    if (props.size <= 20)
      return 'small'
    if (props.size <= 40)
      return 'medium'
    return 'large'
  }

  /** 根据尺寸解析为具体像素值（自定义 number 直接透传） */
  function getSizeValue(): number {
    if (typeof props.size === 'number') {
      return props.size
    }
    const sizes = { small: 24, medium: 32, large: 48 }
    return sizes[props.size] || sizes.medium
  }

  /** 旋转圆圈每个点的动画延迟 + 颜色 */
  function getDotStyle(index: number) {
    return {
      animationDelay: `${(index - 1) * 0.1}s`,
      backgroundColor: props.color,
    }
  }

  /** 波浪每个条的动画延迟 + 颜色 */
  function getWaveStyle(index: number) {
    return {
      animationDelay: `${(index - 1) * 0.1}s`,
      backgroundColor: props.color,
    }
  }

  return {
    wrapperClasses,
    wrapperStyle,
    contentStyle,
    maskStyle,
    spinnerClasses,
    spinnerStyle,
    circumference,
    progressOffset,
    getSizeClass,
    getSizeValue,
    getDotStyle,
    getWaveStyle,
  }
}
