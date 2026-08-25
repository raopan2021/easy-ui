import type { ComputedRef } from 'vue'
import type { ChartPadding, ChartProps, ChartSerie } from './types'

import { computed } from 'vue'

/**
 * 直角坐标系图形几何：折线路径、面积路径、分组柱与堆叠柱坐标。
 *
 * 所有 X 坐标都通过 `getXCenter` 统一叠加滚动偏移，Y 坐标复用单 Y 轴的 `getY`，
 * 因此折线 / 柱状 / 堆叠三种图形共享同一套坐标系。
 *
 * @param props 图表 props（响应式对象）
 * @param ctx   依赖注入：布局量、可见系列、Y 坐标映射、滚动视口
 */
export function useChartCartesian(props: ChartProps, ctx: {
  padding: ComputedRef<ChartPadding>
  plotWidth: ComputedRef<number>
  svgHeight: ComputedRef<number>
  xLabels: ComputedRef<string[]>
  visibleSeries: ComputedRef<ChartSerie[]>
  getY: (val: number) => number
  itemWidth: ComputedRef<number>
  stepX: ComputedRef<number>
  linePaddingX: ComputedRef<number>
  scrollable: ComputedRef<boolean>
  clampedOffsetX: ComputedRef<number>
}) {
  const {
    padding,
    plotWidth,
    svgHeight,
    xLabels,
    visibleSeries,
    getY,
    itemWidth,
    stepX,
    linePaddingX,
    scrollable,
    clampedOffsetX,
  } = ctx

  /**
   * 第 i 个数据点的 X 中心坐标（已叠加滚动偏移）。
   *
   * 柱状 / 堆叠 / 混用返回整组柱子的几何中心，保证鼠标悬停在任意子柱上都能命中；
   * 折线图基于虚拟宽度均匀分布，首尾各留 `linePaddingX` 边距。
   */
  function getXCenter(i: number): number {
    const offsetX = scrollable.value ? -clampedOffsetX.value : 0
    if (props.type === 'bar' || props.type === 'mixed') {
      // 返回整组柱子的几何中心，确保鼠标悬停在任意子柱上都能命中
      return padding.value.left + offsetX + itemWidth.value * i + itemWidth.value / 2
    }
    if (props.type === 'stack') {
      return padding.value.left + offsetX + itemWidth.value * i + itemWidth.value / 2
    }
    // 折线图：基于虚拟宽度（含 minItemWidth 扩展）均匀分布，首尾留 linePaddingX 边距
    if (props.type === 'line') {
      const dataLen = Math.max(xLabels.value.length, 1)
      if (dataLen <= 1)
        return padding.value.left + offsetX + plotWidth.value / 2
      return padding.value.left + linePaddingX.value + offsetX + stepX.value * i
    }
    return padding.value.left + offsetX + stepX.value * i
  }

  /** 折线路径（smooth 时用 Catmull-Rom 样条转三次贝塞尔） */
  function getLinePath(data: number[]): string {
    if (!data.length)
      return ''
    if (!props.smooth) {
      // 直线
      return data.map((val, i) => `${i === 0 ? 'M' : 'L'} ${getXCenter(i)} ${getY(val)}`).join(' ')
    }
    // 平滑曲线（Catmull-Rom样条转三次贝塞尔）
    const points = data.map((val, i) => ({ x: getXCenter(i), y: getY(val) }))
    if (points.length < 2)
      return ''
    if (points.length === 2) {
      return `M ${points[0].x} ${points[0].y} L ${points[1].x} ${points[1].y}`
    }
    // 生成平滑曲线路径
    let d = `M ${points[0].x} ${points[0].y}`
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(0, i - 1)]
      const p1 = points[i]
      const p2 = points[i + 1]
      const p3 = points[Math.min(points.length - 1, i + 2)]
      // Catmull-Rom到三次贝塞尔转换
      const cp1x = p1.x + (p2.x - p0.x) / 6
      const cp1y = p1.y + (p2.y - p0.y) / 6
      const cp2x = p2.x - (p3.x - p1.x) / 6
      const cp2y = p2.y - (p3.y - p1.y) / 6
      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`
    }
    return d
  }

  /** 面积填充路径（折线路径闭合到基线） */
  function getAreaPath(data: number[]): string {
    if (!data.length)
      return ''
    const linePart = getLinePath(data)
    const base = svgHeight.value - padding.value.bottom
    const lastX = getXCenter(data.length - 1)
    const firstX = getXCenter(0)
    return `${linePart} L ${lastX} ${base} L ${firstX} ${base} Z`
  }

  // ========== 柱状图 ==========
  /** 同一数据点内相邻柱子的间隙 */
  const barGap = computed(() => 4)

  /** 单根柱子宽度（组内均分 itemWidth 的 70%，最小 6px） */
  const barWidth = computed(() => {
    const seriesCount = Math.max(visibleSeries.value.length, 1)
    const available = itemWidth.value * 0.7
    return Math.max(6, (available - barGap.value * (seriesCount - 1)) / seriesCount)
  })

  /** 第 dataIdx 组中第 serieIdx 根柱子的左侧 X 坐标 */
  function getBarX(dataIdx: number, serieIdx: number): number {
    const seriesCount = visibleSeries.value.length
    const totalBarW = barWidth.value * seriesCount + barGap.value * (seriesCount - 1)
    const offsetX = scrollable.value ? -clampedOffsetX.value : 0
    const groupStart = padding.value.left + offsetX + itemWidth.value * dataIdx + (itemWidth.value - totalBarW) / 2
    return groupStart + (barWidth.value + barGap.value) * serieIdx
  }

  // ========== 堆叠柱状图 ==========
  /** 堆叠柱宽度（itemWidth 的 55%，最小 6px） */
  const stackBarWidth = computed(() => {
    return Math.max(6, itemWidth.value * 0.55)
  })

  /** 第 dataIdx 根堆叠柱的左侧 X 坐标 */
  function getStackBarX(dataIdx: number): number {
    const offsetX = scrollable.value ? -clampedOffsetX.value : 0
    return padding.value.left + offsetX + itemWidth.value * dataIdx + (itemWidth.value - stackBarWidth.value) / 2
  }

  /**
   * 计算堆叠图每个系列每个数据点的 y 起始、高度
   * 返回 [serieIdx][dataIdx] = { y, h }
   */
  const stackSegments = computed((): Array<Array<{ y: number, h: number, val: number }>> => {
    if (props.type !== 'stack')
      return []
    const dataLen = Math.max(xLabels.value.length, 0)
    // 每列的累计底部 Y 坐标（从 baseline 向上叠加）
    const baseY = svgHeight.value - padding.value.bottom
    const colBottomY: number[] = Array.from<number>({ length: dataLen }).fill(baseY)

    return visibleSeries.value.map((serie) => {
      return Array.from({ length: dataLen }, (_, i) => {
        const val = serie.data[i] ?? 0
        const segH = Math.max(0, getY(0) - getY(val)) // 正值高度
        const yTop = colBottomY[i] - segH
        const result = { y: yTop, h: segH, val }
        colBottomY[i] = yTop // 下一个系列从这里往上堆
        return result
      })
    })
  })

  return {
    getXCenter,
    getLinePath,
    getAreaPath,
    barGap,
    barWidth,
    getBarX,
    stackBarWidth,
    getStackBarX,
    stackSegments,
  }
}
