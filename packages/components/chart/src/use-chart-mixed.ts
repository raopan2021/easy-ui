import type { ComputedRef } from 'vue'
import type { AxisRange, ChartPadding, ChartProps, ChartSerie, MixedSerie } from './types'

import { computed } from 'vue'
import { calcAxisRange, filterTicksBySpacing } from './chart-utils'

/**
 * 折柱混用（type="mixed"）专属逻辑：系列拆分 + 左右双 Y 轴。
 *
 * 柱状系列走左轴（`getMixedBarY`），折线系列走右轴（`getMixedLineY`），
 * 两轴各自独立计算美观刻度，因此量级差异极大的指标也能同图对比。
 *
 * @param props 图表 props（响应式对象）
 * @param ctx   依赖注入：布局量、可见系列、X 坐标映射、单轴 getY（非 mixed 时兜底）
 */
export function useChartMixed(props: ChartProps, ctx: {
  padding: ComputedRef<ChartPadding>
  plotHeight: ComputedRef<number>
  svgHeight: ComputedRef<number>
  visibleSeries: ComputedRef<ChartSerie[]>
  itemWidth: ComputedRef<number>
  scrollable: ComputedRef<boolean>
  clampedOffsetX: ComputedRef<number>
  getXCenter: (i: number) => number
  getY: (val: number) => number
}) {
  const {
    padding,
    plotHeight,
    svgHeight,
    visibleSeries,
    itemWidth,
    scrollable,
    clampedOffsetX,
    getXCenter,
    getY,
  } = ctx

  /**
   * 带有 _barIdx（在 bar 系列中的位置）和 _origIdx（在 visibleSeries 中的原始位置）的系列
   * 用于正确计算柱子偏移和颜色
   */
  const mixedBarSeries = computed((): MixedSerie[] => {
    if (props.type !== 'mixed')
      return []
    let barIdx = 0
    return visibleSeries.value.reduce<MixedSerie[]>((acc, s, origIdx) => {
      if ((s.chartType ?? 'bar') === 'bar') {
        acc.push({ ...s, _barIdx: barIdx++, _origIdx: origIdx })
      }
      return acc
    }, [])
  })

  /** 折线系列（chartType === 'line'，渲染在柱子上层） */
  const mixedLineSeries = computed((): MixedSerie[] => {
    if (props.type !== 'mixed')
      return []
    return visibleSeries.value.reduce<MixedSerie[]>((acc, s, origIdx) => {
      if (s.chartType === 'line') {
        acc.push({ ...s, _barIdx: -1, _origIdx: origIdx })
      }
      return acc
    }, [])
  })

  /** 混用模式下同组柱子的间隙 */
  const mixedBarGap = computed(() => 4)

  /** 混用模式下单根柱子宽度（组内均分 itemWidth 的 65%，最小 6px） */
  const mixedBarWidth = computed(() => {
    const barCount = Math.max(mixedBarSeries.value.length, 1)
    const available = itemWidth.value * 0.65
    return Math.max(6, (available - mixedBarGap.value * (barCount - 1)) / barCount)
  })

  /** 第 dataIdx 组中第 barIdx 根柱子的左侧 X 坐标 */
  function getMixedBarX(dataIdx: number, barIdx: number): number {
    const barCount = mixedBarSeries.value.length
    const totalBarW = mixedBarWidth.value * barCount + mixedBarGap.value * (barCount - 1)
    const offsetX = scrollable.value ? -clampedOffsetX.value : 0
    const groupStart = padding.value.left + offsetX + itemWidth.value * dataIdx + (itemWidth.value - totalBarW) / 2
    return groupStart + (mixedBarWidth.value + mixedBarGap.value) * barIdx
  }

  // ========== 双 Y 轴 ==========
  /** 左 Y 轴（柱状系列专用，mixed 模式） */
  const mixedBarAxis = computed((): AxisRange | null => {
    if (props.type !== 'mixed')
      return null
    const vals = mixedBarSeries.value.flatMap(s => s.data)
    return calcAxisRange(vals)
  })

  /** 右 Y 轴（折线系列专用，mixed 模式） */
  const mixedLineAxis = computed((): AxisRange | null => {
    if (props.type !== 'mixed')
      return null
    const vals = mixedLineSeries.value.flatMap(s => s.data)
    return calcAxisRange(vals)
  })

  /** mixed 模式：把值映射到 SVG Y 坐标（柱状轴） */
  function getMixedBarY(val: number): number {
    if (!mixedBarAxis.value)
      return getY(val)
    const { min, max } = mixedBarAxis.value
    const range = max - min || 1
    return padding.value.top + plotHeight.value * (1 - (val - min) / range)
  }

  /** mixed 模式：把值映射到 SVG Y 坐标（折线轴） */
  function getMixedLineY(val: number): number {
    if (!mixedLineAxis.value)
      return getY(val)
    const { min, max } = mixedLineAxis.value
    const range = max - min || 1
    return padding.value.top + plotHeight.value * (1 - (val - min) / range)
  }

  /** mixed 模式：经过像素间距过滤的左 Y 轴刻度 */
  const mixedBarYTicks = computed((): number[] => {
    const axis = mixedBarAxis.value
    if (!axis)
      return []
    return filterTicksBySpacing(axis.ticks, getMixedBarY)
  })

  /** mixed 模式：经过像素间距过滤的右 Y 轴刻度 */
  const mixedLineYTicks = computed((): number[] => {
    const axis = mixedLineAxis.value
    if (!axis)
      return []
    return filterTicksBySpacing(axis.ticks, getMixedLineY)
  })

  /** 折线路径（mixed 模式，用折线 Y 轴） */
  function getMixedLinePath(data: number[]): string {
    if (!data.length)
      return ''
    if (!props.smooth) {
      return data.map((val, i) => `${i === 0 ? 'M' : 'L'} ${getXCenter(i)} ${getMixedLineY(val)}`).join(' ')
    }
    // 平滑曲线
    const points = data.map((val, i) => ({ x: getXCenter(i), y: getMixedLineY(val) }))
    if (points.length < 2)
      return ''
    if (points.length === 2) {
      return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`
    }
    let d = `M ${points[0].x} ${points[0].y}`
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)]
      const p1 = points[i]
      const p2 = points[i + 1]
      const p3 = points[Math.min(points.length - 1, i + 2)]
      const cp1x = p1.x + (p2.x - p0.x) / 6
      const cp1y = p1.y + (p2.y - p0.y) / 6
      const cp2x = p2.x - (p3.x - p1.x) / 6
      const cp2y = p2.y - (p3.y - p1.y) / 6
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
    }
    return d
  }

  /** 面积路径（mixed 模式，用折线 Y 轴） */
  function getMixedLineAreaPath(data: number[]): string {
    if (!data.length)
      return ''
    const linePart = getMixedLinePath(data)
    const base = svgHeight.value - padding.value.bottom
    const lastX = getXCenter(data.length - 1)
    const firstX = getXCenter(0)
    return `${linePart} L ${lastX} ${base} L ${firstX} ${base} Z`
  }

  return {
    mixedBarSeries,
    mixedLineSeries,
    mixedBarGap,
    mixedBarWidth,
    getMixedBarX,
    mixedBarAxis,
    mixedLineAxis,
    getMixedBarY,
    getMixedLineY,
    mixedBarYTicks,
    mixedLineYTicks,
    getMixedLinePath,
    getMixedLineAreaPath,
  }
}
