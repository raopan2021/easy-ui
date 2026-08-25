import type { ComputedRef, Ref } from 'vue'
import type { ChartPadding, ChartProps, LegendItem } from './types'

import { computed, getCurrentInstance } from 'vue'

/**
 * 容器尺寸、绘图区内边距与派生布局量。
 *
 * 负责把「组件宽高 + 标题 + 图例」换算成 SVG 画布尺寸，并按图表类型估算
 * 坐标轴文字所需的内边距，最终得到绘图区（plot）宽高，供各图形几何计算使用。
 *
 * @param props 图表 props（响应式对象）
 * @param ctx   依赖注入：实测 SVG 宽度、图例项（决定图例占高）
 */
export function useChartLayout(props: ChartProps, ctx: {
  svgWidth: Ref<number>
  legendItems: ComputedRef<LegendItem[]>
}) {
  const { svgWidth, legendItems } = ctx

  // ========== 唯一实例 id（解决多图表 clipPath id 冲突）==========
  const uid = getCurrentInstance()?.uid ?? Math.random().toString(36).slice(2)
  /** 数据区裁剪用的 clipPath id（每个实例唯一） */
  const clipPathId = `easy-plot-clip-${uid}`

  // ========== 根容器尺寸 ==========
  /** 根容器宽度样式值（数字按 px 处理） */
  const computedWidth = computed(() => (typeof props.width === 'number' ? `${props.width}px` : props.width))
  /** 根容器高度样式值（数字按 px 处理） */
  const computedHeight = computed(() => (typeof props.height === 'number' ? `${props.height}px` : props.height))

  /** 标题区占高（无标题与副标题时为 0） */
  const headerHeight = computed(() => (props.title || props.subtitle ? 52 : 0))

  /** 图例区占高（仅 top / bottom 方向占用垂直空间） */
  const legendH = computed(() => {
    if (!props.showLegend || legendItems.value.length === 0)
      return 0
    if (props.legendPosition === 'top' || props.legendPosition === 'bottom')
      return 36
    return 0
  })

  /** SVG 画布高度 = 总高 - 标题区 - 图例区（height 非数字时按 300 估算） */
  const svgHeight = computed(() => {
    const totalH = typeof props.height === 'number' ? props.height : 300
    return totalH - headerHeight.value - legendH.value
  })

  // ========== 绘图区内边距 ==========
  /**
   * 按图表类型估算内边距：
   * - hbar：左侧预留类目名称宽度，右侧预留数值宽度
   * - 折线 / 柱状 / 堆叠 / 混用：按 Y 轴最大值估算标签字符宽度
   * - mixed：右侧额外预留折线轴宽度
   *
   * 这里直接用 props.series 估算最大值（不引用 yMax computed），避免与
   * 「yMax → padding → plotHeight → getY」形成循环依赖。
   */
  const padding = computed<ChartPadding>(() => {
    const isLinBar = props.type === 'line' || props.type === 'bar' || props.type === 'stack'
    const isMixed = props.type === 'mixed'
    const isHBar = props.type === 'hbar'
    if (isHBar) {
      // 横向柱状图：左边留名称空间，右边留数值空间
      const maxLabelLen = Math.max(...(props.labels ?? []).map(l => l.length), 4)
      const leftW = Math.min(Math.max(maxLabelLen * 7 + 12, 60), 140)
      return { top: 16, right: 60, bottom: 16, left: leftW }
    }
    // 根据 Y 轴最大值估算标签字符宽度，避免循环依赖（不用 yMax computed）
    let leftW = 50
    let rightW = 24
    if (isLinBar || isMixed) {
      const allVals = (props.series ?? []).flatMap(s => s.data ?? [])
      const maxVal = allVals.length ? Math.max(...allVals) : 0
      let labelLen: number
      if (Math.abs(maxVal) >= 10000)
        labelLen = (maxVal / 10000).toFixed(1).length + 1
      else labelLen = maxVal.toFixed(0).length
      leftW = Math.max(50, labelLen * 7 + 16)
    }
    if (isMixed) {
      // 右 Y 轴（折线系列）也需要空间
      const lineVals = (props.series ?? []).filter(s => s.chartType === 'line').flatMap(s => s.data ?? [])
      const lineMax = lineVals.length ? Math.max(...lineVals.map(Math.abs)) : 0
      let lineLen: number
      if (lineMax >= 10000)
        lineLen = (lineMax / 10000).toFixed(1).length + 1
      else lineLen = lineMax.toFixed(1).length
      rightW = Math.max(52, lineLen * 7 + 16)
    }
    return {
      top: 20,
      right: rightW,
      bottom: isLinBar || isMixed ? 40 : 20,
      left: isLinBar || isMixed ? leftW : 20,
    }
  })

  /** X 轴标签列表 */
  const xLabels = computed(() => props.labels ?? [])

  /** 绘图区可视宽度 */
  const plotWidth = computed(() => svgWidth.value - padding.value.left - padding.value.right)
  /** 绘图区可视高度 */
  const plotHeight = computed(() => svgHeight.value - padding.value.top - padding.value.bottom)

  /** 是否空数据（仪表盘永不为空，饼类需所有值为 0 才算空） */
  const isEmpty = computed(() => {
    if (props.type === 'pie' || props.type === 'donut' || props.type === 'funnel') {
      return !props.data?.length || props.data.every(d => d.value === 0)
    }
    if (props.type === 'gauge')
      return false
    if (props.type === 'hbar')
      return !props.series?.length
    return !props.series?.length
  })

  return {
    clipPathId,
    computedWidth,
    computedHeight,
    headerHeight,
    legendH,
    svgHeight,
    padding,
    xLabels,
    plotWidth,
    plotHeight,
    isEmpty,
  }
}
