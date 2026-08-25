import type { ProgressProps } from './progress'

import { computed } from 'vue'

/**
 * 进度条几何与配色计算（纯 props 派生，无副作用）。
 *
 * 将原本内联在 progress.vue 中的大量 computed 抽离为独立 composable，
 * 便于单测复用，也让 .vue 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 *
 * @param props 进度条 props（需传入响应式对象，computed 会自动追踪依赖）
 */
export function useProgressGeometry(props: ProgressProps) {
  /** 归一化百分比到 0-100，避免越界导致 SVG 偏移异常 */
  const displayPercentage = computed(() => Math.min(Math.max(props.percentage, 0), 100))

  // ──── 圆形 / 仪表盘几何 ────
  /** 圆形进度条半径（留出 strokeWidth 一半，避免描边被裁剪） */
  const radius = computed(() => 50 - props.strokeWidth / 2)
  /** 整圆周长 */
  const circumference = computed(() => 2 * Math.PI * radius.value)
  /** 半圆（仪表盘）周长 */
  const halfCircumference = computed(() => Math.PI * radius.value)

  /**
   * 进度条虚线偏移量。
   * - 仪表盘按半圆周长计算；其余按整圆周长。
   * - 偏移 = 周长 × (1 - 进度)，进度为 0 时完全隐藏，100 时铺满。
   */
  const dashOffset = computed(() => {
    const maxOffset = props.type === 'dashboard' ? halfCircumference.value : circumference.value
    return maxOffset - (displayPercentage.value / 100) * maxOffset
  })

  // ──── 配色 ────
  /** 进度条主色（status 优先级高于自定义 color） */
  const colorValue = computed(() => {
    if (props.status === 'success')
      return '#67c23a'
    if (props.status === 'exception')
      return '#f56c6c'
    if (props.status === 'warning')
      return '#e6a23c'
    if (typeof props.color === 'function')
      return props.color(displayPercentage.value)
    return props.color || '#4f6ef7'
  })

  /** 轨道背景色（缺省为浅灰） */
  const trackColorValue = computed(() => props.trackColor || '#e8e8e8')

  // ──── 类名 ────
  /** 根节点组合类名（类型 / 状态 / 自定义 class） */
  const progressClass = computed(() => [
    `easy-progress--${props.type}`,
    `easy-progress--status-${props.status}`,
    props.customClass,
  ])

  // ──── 行内样式 ────
  /** 根节点样式（当前无额外样式，预留扩展） */
  const progressStyle = computed<Record<string, string>>(() => ({}))

  /** 轨道行内样式（line 类型生效：背景色 + 高度） */
  const trackStyle = computed<Record<string, string>>(() => {
    const style: Record<string, string> = {}
    if (props.type === 'line' && props.trackColor)
      style.backgroundColor = props.trackColor
    if (props.type === 'line')
      style.height = `${props.strokeWidth}px`
    return style
  })

  /** 进度条行内样式（line 类型生效：宽度 / 高度 / 颜色） */
  const barStyle = computed<Record<string, string>>(() => {
    const style: Record<string, string> = {}
    if (props.type === 'line' && !props.indeterminate)
      style.width = `${displayPercentage.value}%`
    if (props.type === 'line') {
      style.height = `${props.strokeWidth}px`
      style.backgroundColor = colorValue.value
    }
    return style
  })

  return {
    displayPercentage,
    radius,
    circumference,
    halfCircumference,
    dashOffset,
    colorValue,
    trackColorValue,
    progressClass,
    progressStyle,
    trackStyle,
    barStyle,
  }
}
