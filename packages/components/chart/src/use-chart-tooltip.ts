import type { ComputedRef, Ref } from 'vue'
import type { ChartPadding, ChartProps, ChartSerie, ChartTooltipState, FunnelItem, PieSlice } from './types'

import { ref } from 'vue'

/** Tooltip 预估宽度（用于靠右边界时翻转到鼠标左侧） */
const TOOLTIP_EST_WIDTH = 170

/**
 * Tooltip 与 hover 高亮状态。
 *
 * 直角坐标系走「鼠标 X → 最近数据点」的就近命中，横向柱状图走「鼠标 Y → 最近行」，
 * 饼图 / 漏斗图直接由图形元素的 mouseenter 提供索引。
 * Tooltip 挂在根容器上定位，靠近右边界时自动翻转，避免被 body 的 overflow 裁剪。
 *
 * @param props 图表 props（响应式对象）
 * @param ctx   依赖注入：容器引用、布局量、坐标映射、取色函数、拖拽状态、饼图/漏斗数据
 */
export function useChartTooltip(props: ChartProps, ctx: {
  rootRef: Ref<HTMLElement | null>
  bodyRef: Ref<HTMLElement | null>
  padding: ComputedRef<ChartPadding>
  svgWidth: Ref<number>
  xLabels: ComputedRef<string[]>
  visibleSeries: ComputedRef<ChartSerie[]>
  itemWidth: ComputedRef<number>
  getXCenter: (i: number) => number
  isDragging: Ref<boolean>
  stopDrag: () => void
  getSerieColor: (serie: ChartSerie, serieIdx: number, dataIdx?: number) => string
  getStackSegColor: (serie: ChartSerie, serieIdx: number, dataIdx: number) => string
  hbarRowH: ComputedRef<number>
  pieSlices: ComputedRef<PieSlice[]>
  funnelItems: ComputedRef<FunnelItem[]>
}) {
  const {
    rootRef,
    bodyRef,
    padding,
    svgWidth,
    xLabels,
    visibleSeries,
    itemWidth,
    getXCenter,
    isDragging,
    stopDrag,
    getSerieColor,
    getStackSegColor,
    hbarRowH,
    pieSlices,
    funnelItems,
  } = ctx

  /** 折线/柱状/堆叠图当前高亮的数据索引 */
  const activeIndex = ref(-1)
  /** 饼图当前高亮切片索引 */
  const activePieIndex = ref(-1)
  /** 漏斗图当前高亮层索引 */
  const activeFunnelIndex = ref(-1)
  /** 横向柱状图当前高亮行索引（dataIdx） */
  const activeHBarIndex = ref(-1)

  const tooltip = ref<ChartTooltipState>({
    visible: false,
    x: 0,
    y: 0,
    title: '',
    items: [],
  })

  /**
   * 计算 Tooltip 相对根容器的定位。
   * 当鼠标靠近根容器右侧时，自动将 tooltip 显示在鼠标左侧，避免被裁剪。
   */
  function calcTooltipPos(clientX: number, clientY: number, offsetRight = 12, offsetTop = 20) {
    if (!rootRef.value)
      return { x: 0, y: 0 }
    const rootRect = rootRef.value.getBoundingClientRect()
    const tooltipW = TOOLTIP_EST_WIDTH // 预估 tooltip 宽度
    let rx = clientX - rootRect.left
    const ry = clientY - rootRect.top - offsetTop
    // 靠近右边界时翻转到鼠标左侧
    if (rx + offsetRight + tooltipW > rootRect.width) {
      rx = rx - tooltipW - offsetRight
    }
    else {
      rx = rx + offsetRight
    }
    return { x: Math.max(4, rx), y: Math.max(4, ry) }
  }

  /** 绘图区鼠标移动：就近命中数据点 / 行，更新高亮与 Tooltip */
  function onMouseMove(e: MouseEvent) {
    if (!bodyRef.value)
      return
    // 拖拽中不触发 tooltip
    if (isDragging.value)
      return
    const rect = bodyRef.value.getBoundingClientRect()
    const mx = e.clientX - rect.left
    const my = e.clientY - rect.top

    if (props.type === 'line' || props.type === 'bar' || props.type === 'stack') {
      // 找最近的 x 坐标（屏幕坐标系）
      let closest = -1
      let minDist = Infinity
      xLabels.value.forEach((_, i) => {
        const cx = getXCenter(i)
        const d = Math.abs(mx - cx)
        if (d < minDist) {
          minDist = d
          closest = i
        }
      })
      if (
        closest < 0
        || minDist > itemWidth.value / 2
        || getXCenter(closest) < padding.value.left
        || getXCenter(closest) > svgWidth.value - padding.value.right
      ) {
        activeIndex.value = -1
        tooltip.value.visible = false
        return
      }
      activeIndex.value = closest

      const items = visibleSeries.value.map((s, si) => ({
        name: s.name,
        value: s.data[closest] ?? 0,
        color: props.type === 'stack' ? getStackSegColor(s, si, closest) : getSerieColor(s, si, closest),
      }))
      const pos = calcTooltipPos(e.clientX, e.clientY)
      tooltip.value = {
        visible: true,
        x: pos.x,
        y: pos.y,
        title: xLabels.value[closest],
        items,
      }
    }
    else if (props.type === 'hbar') {
      // 找最近的行
      const labels = props.labels ?? []
      let closestRow = -1
      let minD = Infinity
      labels.forEach((_, di) => {
        const rowCY = padding.value.top + hbarRowH.value * di + hbarRowH.value / 2
        const d = Math.abs(my - rowCY)
        if (d < minD) {
          minD = d
          closestRow = di
        }
      })
      if (closestRow < 0 || minD > hbarRowH.value / 2 + 4) {
        activeHBarIndex.value = -1
        tooltip.value.visible = false
        return
      }
      activeHBarIndex.value = closestRow
      const items = visibleSeries.value.map((s, si) => ({
        name: s.name,
        value: s.data[closestRow] ?? 0,
        color: getSerieColor(s, si, closestRow),
      }))
      const pos = calcTooltipPos(e.clientX, e.clientY)
      tooltip.value = {
        visible: true,
        x: pos.x,
        y: pos.y,
        title: labels[closestRow],
        items,
      }
    }
  }

  /** 鼠标移出绘图区：清空高亮与 Tooltip，并结束可能进行中的拖拽 */
  function onMouseLeave() {
    activeIndex.value = -1
    activeHBarIndex.value = -1
    tooltip.value.visible = false
    if (isDragging.value)
      stopDrag()
  }

  /** 饼图切片 hover：高亮并展示「名称 + 占比 + 值」 */
  function onPieEnter(i: number, e: MouseEvent) {
    activePieIndex.value = i
    const slice = pieSlices.value[i]
    const pos = calcTooltipPos(e.clientX, e.clientY)
    tooltip.value = {
      visible: true,
      x: pos.x,
      y: pos.y,
      title: slice.name,
      items: [{ name: `${slice.percent}%`, value: slice.value, color: slice.color }],
    }
  }

  function onPieLeave() {
    activePieIndex.value = -1
    tooltip.value.visible = false
  }

  /** 漏斗层 hover：高亮并展示「名称 + 占比 + 值」 */
  function onFunnelEnter(i: number, e: MouseEvent) {
    activeFunnelIndex.value = i
    const item = funnelItems.value[i]
    const pos = calcTooltipPos(e.clientX, e.clientY)
    tooltip.value = {
      visible: true,
      x: pos.x,
      y: pos.y,
      title: item.name,
      items: [{ name: `占比 ${item.percent}%`, value: item.value, color: item.color }],
    }
  }

  function onFunnelLeave() {
    activeFunnelIndex.value = -1
    tooltip.value.visible = false
  }

  return {
    tooltip,
    activeIndex,
    activePieIndex,
    activeFunnelIndex,
    activeHBarIndex,
    calcTooltipPos,
    onMouseMove,
    onMouseLeave,
    onPieEnter,
    onPieLeave,
    onFunnelEnter,
    onFunnelLeave,
  }
}
