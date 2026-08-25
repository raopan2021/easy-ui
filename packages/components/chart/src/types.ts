/**
 * Chart 图表组件类型定义。
 *
 * 原本内联在 chart.vue 的 `<script setup>` 中，拆分后统一维护在此，
 * 供 chart.vue 与各 use-*.ts composable 共享（对齐 markdown 组件拆分规范）。
 */
import type { ComputedRef, Ref } from 'vue'

/** 图表类型 */
export type ChartType = 'line' | 'bar' | 'stack' | 'hbar' | 'pie' | 'donut' | 'funnel' | 'gauge' | 'mixed'

/** 折线 / 柱状 / 堆叠 / 折柱混用图的数据系列 */
export interface ChartSerie {
  name: string
  data: number[]
  color?: string
  /** 单个柱子/数据点的颜色数组，优先级高于 color，索引与 data 对应 */
  colors?: string[]
  areaFill?: boolean
  /**
   * 折柱混用（type="mixed"）时，指定该系列的展示类型
   * 'bar' = 柱状，'line' = 折线，默认 'bar'
   */
  chartType?: 'line' | 'bar'
  /** 任意额外字段，不参与绘制，仅透传到 drill 事件的 extra 中 */
  [key: string]: any
}

/** 饼图 / 环形图 / 漏斗图 / 仪表盘的数据项 */
export interface PieItem {
  name: string
  value: number
  color?: string
  /** 任意额外字段，不参与绘制，仅透传到 drill 事件的 extra 中 */
  [key: string]: any
}

/**
 * 折柱混用内部使用的系列包装类型。
 * - `_barIdx`：在柱状系列中的位置（折线系列为 -1），用于计算柱子横向偏移
 * - `_origIdx`：在 visibleSeries 中的原始位置，用于取色保持与图例一致
 */
export type MixedSerie = ChartSerie & { _barIdx: number, _origIdx: number }

/** 绘图区内边距（SVG 像素） */
export interface ChartPadding {
  top: number
  right: number
  bottom: number
  left: number
}

/** 坐标轴值域与刻度（折柱混用双 Y 轴使用） */
export interface AxisRange {
  min: number
  max: number
  ticks: number[]
}

/** 图例项 */
export interface LegendItem {
  name: string
  color: string
  /** 图例色块是否渲染为圆点（折线系列） */
  isLine: boolean
}

/** Tooltip 单行数据 */
export interface ChartTooltipItem {
  name: string
  value: number
  color: string
}

/** Tooltip 状态 */
export interface ChartTooltipState {
  visible: boolean
  x: number
  y: number
  title: string
  items: ChartTooltipItem[]
}

/** 饼图 / 环形图切片 */
export interface PieSlice {
  path: string
  color: string
  name: string
  value: number
  percent: number
  offsetX: number
  offsetY: number
  labelX: number
  labelY: number
  extra?: Record<string, any>
}

/** 漏斗图层级 */
export interface FunnelItem {
  /** 梯形左上角 x */
  x: number
  /** 梯形顶部 y */
  y: number
  /** 顶部宽度 */
  topW: number
  /** 底部宽度 */
  botW: number
  /** 高度 */
  h: number
  color: string
  name: string
  value: number
  percent: number
  path: string
  /** 标签居中 x */
  labelX: number
  /** 标签居中 y */
  labelY: number
  extra?: Record<string, any>
}

/** 横向柱状图（hbar）柱条 */
export interface HBarItem {
  label: string
  value: number
  color: string
  seriesName: string
  serieIdx: number
  dataIdx: number
  /** 柱子顶部 y */
  barY: number
  /** 柱子高度 */
  barH: number
  /** 柱子起始 x（从 padding.left 开始） */
  barX: number
  /** 柱子宽度 */
  barW: number
  /** 数值文字 x */
  valX: number
  /** 来自 serie 的额外透传字段 */
  extra?: Record<string, any>
}

/** 仪表盘颜色区段弧 */
export interface GaugeArc {
  path: string
  color: string
  startDeg: number
  endDeg: number
}

/** 仪表盘刻度线 */
export interface GaugeTick {
  x1: number
  y1: number
  x2: number
  y2: number
  label: string
  lx: number
  ly: number
}

/** 图表下载格式 */
export type ChartDownloadFormat = 'png' | 'svg'

/** 下钻事件载荷（不含 type，由组件内部补齐） */
export interface ChartDrillDetail {
  label: string
  value: number
  seriesName?: string
  index: number
  extra?: Record<string, any>
}

/** 下钻事件载荷 */
export interface ChartDrillPayload extends ChartDrillDetail {
  type: ChartType
}

/** 图表组件 props（defineProps 与内部 composable 共用） */
export interface ChartProps {
  /** 图表类型 */
  type?: ChartType
  /** 图表标题 */
  title?: string
  /** 副标题 */
  subtitle?: string
  /** 宽度 */
  width?: number | string
  /** 高度 */
  height?: number | string
  /** 折线/柱状图的 X 轴标签 */
  labels?: string[]
  /** 折线/柱状图的数据系列 */
  series?: ChartSerie[]
  /** 饼图/环形图/漏斗图/仪表盘的数据 */
  data?: PieItem[]
  /** 是否显示网格 */
  showGrid?: boolean
  /** 是否显示图例 */
  showLegend?: boolean
  /** 图例位置 */
  legendPosition?: 'top' | 'bottom' | 'left' | 'right'
  /** 折线图面积填充 */
  areaFill?: boolean
  /** 自定义颜色（各系列） */
  colors?: string[]
  /**
   * 堆叠柱状图每根柱子每层的精确颜色
   * stackColors[dataIdx][serieIdx] = color
   * 优先级高于 serie.color / colors
   */
  stackColors?: string[][]
  /** 柱图圆角 */
  barRadius?: number
  /** 环形图中心文字 */
  donutLabel?: string
  /** 环形图中心数值 */
  donutValue?: string
  /** Y轴格式化函数 */
  formatter?: (val: number) => string
  /** 是否动画 */
  animated?: boolean
  /** 是否在图形上显示数据标签 */
  showLabel?: boolean
  /** 是否显示下载按钮 */
  showDownload?: boolean
  /** 每个数据点最小宽度（px），超出时启用横向拖拽，0=自动 */
  minItemWidth?: number
  /** 折线是否使用平滑曲线 */
  smooth?: boolean
  /** 是否显示折线数据点（小圆点） */
  showDots?: boolean
  /** 仪表盘：当前值 */
  gaugeValue?: number
  /** 仪表盘：最小值 */
  gaugeMin?: number
  /** 仪表盘：最大值 */
  gaugeMax?: number
  /** 仪表盘：单位 */
  gaugeUnit?: string
}

/** 图表组件事件（defineEmits 与内部 composable 共用） */
export interface ChartEmits {
  /** 下钻事件：点击图表元素时触发 */
  (e: 'drill', payload: ChartDrillPayload): void
}

/**
 * 以下 *Ctx 为各 use-* composable 的「依赖注入」入参类型。
 * 抽成具名接口可避免内联对象字面量类型被 jsdoc 规则逐个要求文档化，
 * 同时集中维护类型，方便跨文件复用。
 */

/** useChartLegend 的依赖注入 */
export interface ChartLegendCtx {
  defaultColors: ComputedRef<string[]>
}

/** useChartLayout 的依赖注入 */
export interface ChartLayoutCtx {
  svgWidth: Ref<number>
  legendItems: ComputedRef<LegendItem[]>
}

/** useChartAxis 的依赖注入 */
export interface ChartAxisCtx {
  visibleSeries: ComputedRef<ChartSerie[]>
  padding: ComputedRef<ChartPadding>
  plotHeight: ComputedRef<number>
}

/** useChartScroll 的依赖注入 */
export interface ChartScrollCtx {
  xLabels: ComputedRef<string[]>
  padding: ComputedRef<ChartPadding>
  plotWidth: ComputedRef<number>
  updateSize: () => void
}

/** useChartCartesian 的依赖注入 */
export interface ChartCartesianCtx {
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
}

/** useChartMixed 的依赖注入 */
export interface ChartMixedCtx {
  padding: ComputedRef<ChartPadding>
  plotHeight: ComputedRef<number>
  svgHeight: ComputedRef<number>
  visibleSeries: ComputedRef<ChartSerie[]>
  itemWidth: ComputedRef<number>
  scrollable: ComputedRef<boolean>
  clampedOffsetX: ComputedRef<number>
  getXCenter: (i: number) => number
  getY: (val: number) => number
}

/** useChartPie 的依赖注入 */
export interface ChartPieCtx {
  svgWidth: Ref<number>
  svgHeight: ComputedRef<number>
  defaultColors: ComputedRef<string[]>
  hiddenSeries: Ref<Set<string>>
}

/** useChartGauge 的依赖注入 */
export interface ChartGaugeCtx {
  svgWidth: Ref<number>
  svgHeight: ComputedRef<number>
  formatValue: (val: number) => string
}

/** useChartHBar 的依赖注入 */
export interface ChartHBarCtx {
  padding: ComputedRef<ChartPadding>
  plotWidth: ComputedRef<number>
  plotHeight: ComputedRef<number>
  visibleSeries: ComputedRef<ChartSerie[]>
  getSerieColor: (serie: ChartSerie, serieIdx: number, dataIdx?: number) => string
}

/** useChartTooltip 的依赖注入 */
export interface ChartTooltipCtx {
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
}

/** useChartDrill 的依赖注入 */
export interface ChartDrillCtx {
  xLabels: ComputedRef<string[]>
  visibleSeries: ComputedRef<ChartSerie[]>
  pieSlices: ComputedRef<PieSlice[]>
  funnelItems: ComputedRef<FunnelItem[]>
}

/** useChartDownload 的依赖注入 */
export interface ChartDownloadCtx {
  bodyRef: Ref<HTMLElement | null>
  legendItems: ComputedRef<LegendItem[]>
}
