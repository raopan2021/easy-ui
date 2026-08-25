import type { ComputedRef, Ref } from 'vue'
import type { ChartProps, FunnelItem, PieSlice } from './types'

import { computed } from 'vue'
import { pickExtra } from './chart-utils'

/** 漏斗图层与层之间的间隙（px） */
const FUNNEL_GAP = 4

/**
 * 饼图 / 环形图 / 漏斗图几何计算。
 *
 * 三者都基于 `props.data`（并遵守图例显隐），产出可直接渲染的 path 与标签坐标：
 * - 饼图 / 环形图：以 SVG 中心为原点的扇形（环形额外挖出内圈）
 * - 漏斗图：自上而下按值收窄的梯形
 *
 * @param props 图表 props（响应式对象）
 * @param ctx   依赖注入：画布尺寸、调色盘、图例隐藏集合
 */
export function useChartPie(props: ChartProps, ctx: {
  svgWidth: Ref<number>
  svgHeight: ComputedRef<number>
  defaultColors: ComputedRef<string[]>
  hiddenSeries: Ref<Set<string>>
}) {
  const { svgWidth, svgHeight, defaultColors, hiddenSeries } = ctx

  /** 饼图外半径（取画布短边一半再留 24px 边距，最小 40px） */
  const pieRadius = computed(() => {
    const r = Math.min(svgWidth.value, svgHeight.value) / 2 - 24
    return Math.max(r, 40)
  })

  /** 环形图内半径（外半径的 55%） */
  const donutInnerRadius = computed(() => pieRadius.value * 0.55)

  /** 饼图圆心（画布中心） */
  const pieCenter = computed(() => ({
    x: svgWidth.value / 2,
    y: svgHeight.value / 2,
  }))

  /**
   * 饼图 / 环形图切片列表。
   *
   * 从 12 点方向（-90°）顺时针排布；`offsetX/offsetY` 为切片中心方向的单位向量，
   * hover 时用于「向外弹出」动画；`labelX/labelY` 为百分比标签坐标。
   */
  const pieSlices = computed((): PieSlice[] => {
    const items = props.data?.filter(d => !hiddenSeries.value.has(d.name)) ?? []
    if (!items.length)
      return []
    const total = items.reduce((s, d) => s + d.value, 0)
    if (total === 0)
      return []

    let startAngle = -Math.PI / 2
    const r = pieRadius.value
    const inner = props.type === 'donut' ? donutInnerRadius.value : 0

    return items.map((item, i) => {
      const angle = (item.value / total) * Math.PI * 2
      const endAngle = startAngle + angle
      const midAngle = startAngle + angle / 2

      const x1 = Math.cos(startAngle) * r
      const y1 = Math.sin(startAngle) * r
      const x2 = Math.cos(endAngle) * r
      const y2 = Math.sin(endAngle) * r

      const largeArc = angle > Math.PI ? 1 : 0

      let path: string
      if (inner > 0) {
        const ix1 = Math.cos(startAngle) * inner
        const iy1 = Math.sin(startAngle) * inner
        const ix2 = Math.cos(endAngle) * inner
        const iy2 = Math.sin(endAngle) * inner
        path = `M ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} L ${ix2} ${iy2} A ${inner} ${inner} 0 ${largeArc} 0 ${ix1} ${iy1} Z`
      }
      else {
        path = `M 0 0 L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`
      }

      const labelR
        = props.type === 'donut'
          ? (donutInnerRadius.value + r) / 2 // 环形图：标签放在环带中间
          : r * 0.65 // 饼图：标签放在半径 65% 处
      startAngle = endAngle
      return {
        path,
        color: item.color || defaultColors.value[i % defaultColors.value.length],
        name: item.name,
        value: item.value,
        percent: Math.round((item.value / total) * 1000) / 10,
        offsetX: Math.cos(midAngle),
        offsetY: Math.sin(midAngle),
        labelX: Math.cos(midAngle) * labelR,
        labelY: Math.sin(midAngle) * labelR,
        extra: pickExtra(item, ['name', 'value', 'color']),
      }
    })
  })

  /**
   * 漏斗图层列表。
   *
   * 每层顶宽沿用上一层的底宽以保证视觉连续；最窄层至少占最宽层的 15%，
   * 避免极小值退化成一条线。
   */
  const funnelItems = computed((): FunnelItem[] => {
    const items = props.data?.filter(d => !hiddenSeries.value.has(d.name)) ?? []
    if (!items.length)
      return []

    const padH = 16 // 上下留白
    const padW = 20 // 左右最小留白（最宽行）
    const areaW = svgWidth.value - padW * 2
    const areaH = svgHeight.value - padH * 2
    const count = items.length
    const itemH = (areaH - FUNNEL_GAP * (count - 1)) / count

    // 最大值决定顶部最宽
    const maxVal = Math.max(...items.map(d => d.value))
    const minRatio = 0.15 // 最窄层至少占最宽的 15%

    return items.map((item, i) => {
      const ratio = maxVal > 0 ? item.value / maxVal : 1
      const clampedRatio = Math.max(ratio, minRatio)
      const topW = areaW * (i === 0 ? 1 : Math.max(items[i - 1].value / maxVal, minRatio))
      const botW = areaW * clampedRatio

      const yStart = padH + i * (itemH + FUNNEL_GAP)
      const xTop = padW + (areaW - topW) / 2
      const xBot = padW + (areaW - botW) / 2

      // 梯形路径（左上、右上、右下、左下）
      const path = `M ${xTop} ${yStart} L ${xTop + topW} ${yStart} L ${xBot + botW} ${yStart + itemH} L ${xBot} ${yStart + itemH} Z`

      const color = item.color || defaultColors.value[i % defaultColors.value.length]
      const total = items.reduce((s, d) => s + d.value, 0)
      const percent = total > 0 ? Math.round((item.value / total) * 1000) / 10 : 0

      return {
        x: xTop,
        y: yStart,
        topW,
        botW,
        h: itemH,
        color,
        name: item.name,
        value: item.value,
        percent,
        path,
        labelX: svgWidth.value / 2,
        labelY: yStart + itemH / 2,
        extra: pickExtra(item, ['name', 'value', 'color']),
      }
    })
  })

  return {
    pieRadius,
    donutInnerRadius,
    pieCenter,
    pieSlices,
    funnelItems,
  }
}
