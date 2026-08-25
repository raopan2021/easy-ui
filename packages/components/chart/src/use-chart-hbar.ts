import type { ComputedRef } from 'vue'
import type { ChartPadding, ChartProps, ChartSerie, HBarItem } from './types'

import { computed } from 'vue'
import { pickExtra } from './chart-utils'

/** 横向柱状图同一行内相邻柱条的间隙（px） */
const HBAR_GAP = 3
/** 横向柱状图 X 轴刻度段数（刻度数 = 段数 + 1） */
const HBAR_TICK_COUNT = 5

/**
 * 横向柱状图（type="hbar"）几何计算。
 *
 * 与纵向柱状图相反：类目沿 Y 轴排布、数值沿 X 轴延伸，
 * 因此单独维护一套「行高 → 柱高 → 柱宽」的换算，并预先摊平为可直接 v-for 的柱条列表。
 *
 * @param props 图表 props（响应式对象）
 * @param ctx   依赖注入：布局量、可见系列、取色函数
 */
export function useChartHBar(props: ChartProps, ctx: {
  padding: ComputedRef<ChartPadding>
  plotWidth: ComputedRef<number>
  plotHeight: ComputedRef<number>
  visibleSeries: ComputedRef<ChartSerie[]>
  getSerieColor: (serie: ChartSerie, serieIdx: number, dataIdx?: number) => string
}) {
  const { padding, plotWidth, plotHeight, visibleSeries, getSerieColor } = ctx

  /** 参与计算的所有数值（仅 hbar 生效） */
  const hbarAllValues = computed(() => {
    if (props.type !== 'hbar')
      return []
    return visibleSeries.value.flatMap(s => s.data)
  })

  /** X 轴最大值（顶部留 15% 空间） */
  const hbarMax = computed(() => {
    const vals = hbarAllValues.value
    if (!vals.length)
      return 100
    return Math.max(...vals) * 1.15
  })

  /** 横向柱状图每行高度 */
  const hbarRowH = computed(() => {
    const count = Math.max(props.labels?.length ?? 1, 1)
    return plotHeight.value / count
  })

  /** 单根柱条高度（行内均分行高的 65%，最小 6px） */
  const hbarBarH = computed(() => {
    const seriesCount = Math.max(visibleSeries.value.length, 1)
    const available = hbarRowH.value * 0.65
    return Math.max(6, (available - HBAR_GAP * (seriesCount - 1)) / seriesCount)
  })

  /** 摊平后的柱条列表（系列 × 类目），可直接用于模板渲染与点击下钻 */
  const hbarItems = computed((): HBarItem[] => {
    if (props.type !== 'hbar')
      return []
    const result: HBarItem[] = []
    const labels = props.labels ?? []
    const seriesCount = visibleSeries.value.length
    const barH = hbarBarH.value
    const gap = HBAR_GAP
    const totalGroupH = barH * seriesCount + gap * (seriesCount - 1)
    const chartW = plotWidth.value

    visibleSeries.value.forEach((serie, si) => {
      const serieExtra = pickExtra(serie, ['name', 'data', 'color', 'areaFill'])
      labels.forEach((label, di) => {
        const val = serie.data[di] ?? 0
        const ratio = hbarMax.value > 0 ? val / hbarMax.value : 0
        const barW = Math.max(0, ratio * chartW)
        const barX = padding.value.left
        const rowCenterY = padding.value.top + hbarRowH.value * di + hbarRowH.value / 2
        const barY = rowCenterY - totalGroupH / 2 + (barH + gap) * si
        result.push({
          label,
          value: val,
          color: getSerieColor(serie, si, di),
          seriesName: serie.name,
          serieIdx: si,
          dataIdx: di,
          barY,
          barH,
          barX,
          barW,
          valX: barX + barW + 4,
          extra: serieExtra,
        })
      })
    })
    return result
  })

  /** hbar X轴刻度 */
  const hbarXTicks = computed(() => {
    if (props.type !== 'hbar')
      return []
    const count = HBAR_TICK_COUNT
    const step = hbarMax.value / count
    return Array.from({ length: count + 1 }, (_, i) => i * step)
  })

  /** 把数值映射为 X 坐标（用于网格线与刻度文字） */
  function getHBarTickX(val: number): number {
    const ratio = hbarMax.value > 0 ? val / hbarMax.value : 0
    return padding.value.left + ratio * plotWidth.value
  }

  return {
    hbarAllValues,
    hbarMax,
    hbarRowH,
    hbarBarH,
    hbarItems,
    hbarXTicks,
    getHBarTickX,
  }
}
