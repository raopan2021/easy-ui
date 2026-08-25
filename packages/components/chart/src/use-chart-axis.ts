import type { ChartAxisCtx, ChartProps } from './types'

import { computed } from 'vue'
import { filterTicksBySpacing } from './chart-utils'

/** 计算「美观刻度」时期望的刻度段数（刻度数 = 段数 + 1） */
const PREFER_TICK_COUNT = 5

/**
 * 单 Y 轴值域与刻度（折线 / 柱状 / 堆叠图使用）。
 *
 * 数值域 → 刻度候选 → 像素间距过滤 → SVG Y 坐标映射，一条链路都在此处：
 * `yTicks` 刻意不依赖 plotHeight，由 `visibleYTicks` 再按像素间距过滤，
 * 以避免「刻度 → 内边距 → 绘图高度 → 刻度」的循环依赖。
 *
 * @param props 图表 props（响应式对象）
 * @param ctx   依赖注入：可见系列、内边距、绘图区高度
 */
export function useChartAxis(props: ChartProps, ctx: ChartAxisCtx) {
  const { visibleSeries, padding, plotHeight } = ctx

  /** 参与 Y 轴值域计算的所有数值（饼类不需要 Y 轴） */
  const allValues = computed(() => {
    if (props.type === 'pie' || props.type === 'donut')
      return []
    return visibleSeries.value.flatMap(s => s.data)
  })

  /** 堆叠图每个 X 点的堆叠总值 */
  const stackTotals = computed((): number[] => {
    if (props.type !== 'stack')
      return []
    const len = Math.max(...visibleSeries.value.map(s => s.data.length), 0)
    return Array.from({ length: len }, (_, i) => visibleSeries.value.reduce((sum, s) => sum + (s.data[i] ?? 0), 0))
  })

  /** Y 轴最小值（全为正数时固定从 0 开始，含负数时下探 10%） */
  const yMin = computed(() => {
    if (allValues.value.length === 0)
      return 0
    const min = Math.min(...allValues.value)
    return min >= 0 ? 0 : min * 1.1
  })

  /** Y 轴最大值（顶部留 15% 空间，堆叠图按堆叠总值计算） */
  const yMax = computed(() => {
    if (props.type === 'stack') {
      const max = Math.max(...stackTotals.value, 0)
      return max <= 0 ? 100 : max * 1.15
    }
    if (allValues.value.length === 0)
      return 100
    const max = Math.max(...allValues.value)
    return max <= 0 ? 0 : max * 1.15
  })

  /**
   * 生成美观 Y 轴刻度候选值（不依赖 plotHeight，避免循环依赖）
   * 使用 1/2/5 幂次步长对齐，最多 6 条候选。
   * 实际渲染时由 visibleYTicks 根据像素间距再过滤。
   */
  const yTicks = computed(() => {
    const PREFER_COUNT = PREFER_TICK_COUNT // 期望刻度段数（刻度数 = count+1）
    const range = yMax.value - yMin.value
    if (range <= 0)
      return [0, yMax.value || 100]

    // 找美观步长
    const rawStep = range / PREFER_COUNT
    const magnitude = 10 ** Math.floor(Math.log10(rawStep))
    const normalized = rawStep / magnitude
    let niceStep: number
    if (normalized <= 1)
      niceStep = 1 * magnitude
    else if (normalized <= 2)
      niceStep = 2 * magnitude
    else if (normalized <= 5)
      niceStep = 5 * magnitude
    else niceStep = 10 * magnitude

    const ticks: number[] = []
    // 始终从 0 开始（大多数业务场景 yMin >= 0）
    const start = yMin.value <= 0 ? 0 : Math.ceil(yMin.value / niceStep) * niceStep
    for (let v = start; v <= yMax.value * 1.001 + niceStep * 0.01; v = Math.round((v + niceStep) * 1e10) / 1e10) {
      ticks.push(v)
      if (ticks.length > 10)
        break // 安全上限
    }
    if (ticks.length < 2)
      ticks.push(yMax.value)
    return ticks
  })

  /** 把数值映射为 SVG Y 坐标（值域为 0 时按 1 兜底避免除零） */
  function getY(val: number): number {
    const range = yMax.value - yMin.value || 1
    return padding.value.top + plotHeight.value * (1 - (val - yMin.value) / range)
  }

  /**
   * 经过像素间距过滤的实际渲染刻度列表（MIN_SPACING = 36px）
   * plotHeight 在此处安全引用（yTicks 不再依赖 plotHeight）
   */
  const visibleYTicks = computed(() => filterTicksBySpacing(yTicks.value, getY))

  return {
    allValues,
    stackTotals,
    yMin,
    yMax,
    yTicks,
    visibleYTicks,
    getY,
  }
}
