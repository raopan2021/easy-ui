<script setup lang="ts">
import type { ChartEmits, ChartProps } from './types'

import { useChartAxis } from './use-chart-axis'
import { useChartCartesian } from './use-chart-cartesian'
import { useChartDownload } from './use-chart-download'
import { useChartDrill } from './use-chart-drill'
import { useChartGauge } from './use-chart-gauge'
import { useChartHBar } from './use-chart-hbar'
import { useChartLayout } from './use-chart-layout'
import { useChartLegend } from './use-chart-legend'
import { useChartMixed } from './use-chart-mixed'
import { useChartPalette } from './use-chart-palette'
import { useChartPie } from './use-chart-pie'
import { useChartResize } from './use-chart-resize'
import { useChartScroll } from './use-chart-scroll'
import { useChartTooltip } from './use-chart-tooltip'

defineOptions({ name: 'EasyChart' })

/**
 * 图表组件 props（与 types.ts 中的 ChartProps 保持一致，默认值严格沿用原实现）。
 */
const props = withDefaults(defineProps<ChartProps>(), {
  type: 'line',
  title: '',
  subtitle: '',
  width: '100%',
  height: 300,
  labels: () => [],
  series: () => [],
  data: () => [],
  showGrid: true,
  showLegend: true,
  showLabel: false,
  legendPosition: 'bottom',
  areaFill: true,
  barRadius: 4,
  animated: true,
  showDownload: true,
  minItemWidth: 0,
  smooth: false,
  showDots: true,
  gaugeValue: 0,
  gaugeMin: 0,
  gaugeMax: 100,
  gaugeUnit: '',
})

const emit = defineEmits<ChartEmits>()

// 尺寸测量与 ResizeObserver 生命周期
const { rootRef, bodyRef, svgWidth, updateSize } = useChartResize()
// 配色与数值格式化
const { defaultColors, getSerieColor, getStackSegColor, formatValue } = useChartPalette(props)
// 图例与系列显隐
const { hiddenSeries, visibleSeries, legendItems, toggleSeries } = useChartLegend(props, { defaultColors })
// 容器尺寸与派生布局量
const {
  clipPathId,
  computedWidth,
  computedHeight,
  svgHeight,
  padding,
  xLabels,
  plotWidth,
  plotHeight,
  isEmpty,
} = useChartLayout(props, { svgWidth, legendItems })
// 单 Y 轴值域与刻度（折线 / 柱状 / 堆叠）
const { getY, visibleYTicks } = useChartAxis(props, { visibleSeries, padding, plotHeight })
// 横向滚动视口
const {
  scrollable,
  isDragging,
  itemWidth,
  clampedOffsetX,
  stepX,
  linePaddingX,
  onWheel,
  onDragStart,
  stopDrag,
  scrollbarThumbLeft,
  scrollbarThumbW,
  onScrollbarDragStart,
} = useChartScroll(props, { xLabels, padding, plotWidth, updateSize })
// 直角坐标系几何（折线 / 柱 / 堆叠）
const {
  getXCenter,
  getLinePath,
  getAreaPath,
  barWidth,
  getBarX,
  stackBarWidth,
  getStackBarX,
  stackSegments,
} = useChartCartesian(props, {
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
})
// 折柱混用（双 Y 轴）
const {
  mixedBarSeries,
  mixedLineSeries,
  mixedBarWidth,
  getMixedBarX,
  getMixedBarY,
  getMixedLineAreaPath,
  getMixedLinePath,
  getMixedLineY,
  mixedBarYTicks,
  mixedLineYTicks,
} = useChartMixed(props, {
  padding,
  plotHeight,
  svgHeight,
  visibleSeries,
  itemWidth,
  scrollable,
  clampedOffsetX,
  getXCenter,
  getY,
})
// 饼图 / 环形图 / 漏斗图
const { pieCenter, pieSlices, donutInnerRadius, funnelItems } = useChartPie(props, {
  svgWidth,
  svgHeight,
  defaultColors,
  hiddenSeries,
})
// 仪表盘
const {
  gaugeCx,
  gaugeCy,
  gaugeR,
  gaugeTrackW,
  gaugeRatio,
  gaugeTrackPath,
  gaugeProgressPath,
  gaugeTicks,
  gaugeNeedle,
  gaugeArcs,
} = useChartGauge(props, { svgWidth, svgHeight, formatValue })
// 横向柱状图
const { hbarRowH, hbarItems, hbarXTicks, getHBarTickX } = useChartHBar(props, {
  padding,
  plotWidth,
  plotHeight,
  visibleSeries,
  getSerieColor,
})
// Tooltip 与 hover 高亮
const {
  tooltip,
  activeIndex,
  activePieIndex,
  activeFunnelIndex,
  activeHBarIndex,
  onMouseMove,
  onMouseLeave,
  onPieEnter,
  onPieLeave,
  onFunnelEnter,
  onFunnelLeave,
} = useChartTooltip(props, {
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
})
// 下钻事件
const { onBarLineClick, onPieClick, onFunnelClick, onHBarClick } = useChartDrill(props, emit, {
  xLabels,
  visibleSeries,
  pieSlices,
  funnelItems,
})
// 下载（PNG / SVG）
const { downloadRef, downloadMenuVisible, toggleDownloadMenu, downloadAs } = useChartDownload(props, {
  bodyRef,
  legendItems,
})

// 保持对外类型导出兼容（原类型定义位于 types.ts）
export type {
  AxisRange,
  ChartDownloadFormat,
  ChartDrillDetail,
  ChartDrillPayload,
  ChartEmits,
  ChartPadding,
  ChartProps,
  ChartSerie,
  ChartTooltipItem,
  ChartTooltipState,
  ChartType,
  FunnelItem,
  GaugeArc,
  GaugeTick,
  HBarItem,
  LegendItem,
  MixedSerie,
  PieItem,
  PieSlice,
} from './types'
</script>

<template>
  <div ref="rootRef" class="easy-chart"
    :class="{ [`legend-${legendPosition}`]: legendPosition === 'left' || legendPosition === 'right' }"
    :style="{ width: computedWidth, height: computedHeight }">
    <!-- 标题 + 下载按钮 -->
    <div class="easy-chart__header" :class="{ 'has-content': title || subtitle }">
      <div class="easy-chart__header-left">
        <div v-if="title" class="easy-chart__title">
          {{ title }}
        </div>
        <div v-if="subtitle" class="easy-chart__subtitle">
          {{ subtitle }}
        </div>
      </div>
      <!-- 下载按钮 -->
      <div v-if="showDownload" ref="downloadRef" class="easy-chart__download">
        <button class="easy-chart__download-btn" title="下载图表" @click.stop="toggleDownloadMenu">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        </button>
        <!-- 下载菜单 -->
        <div v-if="downloadMenuVisible" class="easy-chart__download-menu">
          <div class="easy-chart__download-item" @click="downloadAs('png')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            下载 PNG
          </div>
          <div class="easy-chart__download-item" @click="downloadAs('svg')">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            下载 SVG
          </div>
        </div>
      </div>
    </div>

    <!-- 图例 -->
    <div v-if="showLegend && legendItems.length > 0" class="easy-chart__legend"
      :class="`easy-chart__legend--${legendPosition}`">
      <div v-for="item in legendItems" :key="item.name" class="easy-chart__legend-item"
        :class="{ 'is-hidden': hiddenSeries.has(item.name) }" @click="toggleSeries(item.name)">
        <span
          class="easy-chart__legend-dot"
          :style="{
            background: item.color,
            borderRadius: type === 'line' || item.isLine ? '50%' : '2px',
          }"
        />
        <span class="easy-chart__legend-label">{{ item.name }}</span>
      </div>
    </div>

    <!-- SVG 绘图区 -->
    <div ref="bodyRef" class="easy-chart__body" :class="{ 'is-scrollable': scrollable, 'is-dragging': isDragging }"
      @wheel.prevent="onWheel">
      <svg v-if="svgWidth > 0" :width="svgWidth" :height="svgHeight" class="easy-chart__svg" @mousemove="onMouseMove"
        @mouseleave="onMouseLeave" @mousedown="onDragStart">
        <!-- ClipPath：水平裁剪数据区（左右不超出绘图区），垂直方向留足空间让 X 轴标签正常显示 -->
        <defs>
          <clipPath :id="clipPathId">
            <rect :x="padding.left" :y="padding.top - 8" :width="plotWidth" :height="svgHeight - padding.top + 8" />
          </clipPath>
        </defs>

        <!-- 折线图 / 柱状图 / 堆叠柱状图 / 折柱混用 -->
        <template v-if="type === 'line' || type === 'bar' || type === 'stack' || type === 'mixed'">
          <!-- 背景网格 -->
          <!-- 网格线 -->
          <g v-if="showGrid" class="easy-chart__grid">
            <!-- mixed 模式：以左轴（柱状）刻度为网格基准 -->
            <template v-if="type === 'mixed'">
              <line v-for="(tick, i) in mixedBarYTicks" :key="`hy-${i}`" :x1="padding.left" :y1="getMixedBarY(tick)"
                :x2="svgWidth - padding.right" :y2="getMixedBarY(tick)" class="easy-chart__grid-line" />
            </template>
            <template v-else>
              <line v-for="(tick, i) in visibleYTicks" :key="`hy-${i}`" :x1="padding.left" :y1="getY(tick)"
                :x2="svgWidth - padding.right" :y2="getY(tick)" class="easy-chart__grid-line" />
            </template>
          </g>

          <!-- Y轴（左） -->
          <g class="easy-chart__axis-y">
            <line :x1="padding.left" :y1="padding.top" :x2="padding.left" :y2="svgHeight - padding.bottom"
              class="easy-chart__axis-line" />
            <!-- mixed 模式：左轴（柱状）刻度 -->
            <template v-if="type === 'mixed'">
              <g v-for="(tick, i) in mixedBarYTicks" :key="`myt-${i}`">
                <text :x="padding.left - 8" :y="getMixedBarY(tick)" class="easy-chart__axis-text" text-anchor="end"
                  dominant-baseline="middle">
                  {{ formatValue(tick) }}
                </text>
              </g>
            </template>
            <!-- 非 mixed 模式：普通左轴刻度 -->
            <template v-else>
              <g v-for="(tick, i) in visibleYTicks" :key="`yt-${i}`">
                <text :x="padding.left - 8" :y="getY(tick)" class="easy-chart__axis-text" text-anchor="end"
                  dominant-baseline="middle">
                  {{ formatValue(tick) }}
                </text>
              </g>
            </template>
          </g>

          <!-- 右 Y 轴（折线系列，仅 mixed 模式） -->
          <g v-if="type === 'mixed'" class="easy-chart__axis-y-right">
            <line :x1="svgWidth - padding.right" :y1="padding.top" :x2="svgWidth - padding.right"
              :y2="svgHeight - padding.bottom" class="easy-chart__axis-line" />
            <g v-for="(tick, i) in mixedLineYTicks" :key="`myrt-${i}`">
              <text :x="svgWidth - padding.right + 8" :y="getMixedLineY(tick)" class="easy-chart__axis-text"
                text-anchor="start" dominant-baseline="middle">
                {{ formatValue(tick) }}
              </text>
            </g>
          </g>

          <!-- X轴 -->
          <g class="easy-chart__axis-x">
            <line :x1="padding.left" :y1="svgHeight - padding.bottom" :x2="svgWidth - padding.right"
              :y2="svgHeight - padding.bottom" class="easy-chart__axis-line" />
            <!-- X轴标签随 scroll 偏移，并裁剪 -->
            <g :clip-path="`url(#${clipPathId})`">
              <g v-for="(label, i) in xLabels" :key="`xl-${i}`">
                <text :x="getXCenter(i)" :y="svgHeight - padding.bottom + 18" class="easy-chart__axis-text"
                  text-anchor="middle">
                  {{ label }}
                </text>
              </g>
            </g>
          </g>

          <!-- 折线图数据（clip 裁剪） -->
          <template v-if="type === 'line'">
            <g :clip-path="`url(#${clipPathId})`">
              <g v-for="(serie, si) in visibleSeries" :key="`ls-${si}`">
                <!-- 面积填充 -->
                <path v-if="serie.areaFill !== false && areaFill" :d="getAreaPath(serie.data)"
                  :fill="serie.color || defaultColors[si % defaultColors.length]" opacity="0.12" />
                <!-- 折线 -->
                <path :d="getLinePath(serie.data)" :stroke="serie.color || defaultColors[si % defaultColors.length]"
                  stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="easy-chart__line" />
                <!-- 数据点 -->
                <template v-for="(val, i) in serie.data" :key="`lp-${i}`">
                  <circle v-if="showDots" :cx="getXCenter(i)" :cy="getY(val)" :r="activeIndex === i ? 6 : 4"
                    :fill="activeIndex === i ? serie.color || defaultColors[si % defaultColors.length] : '#fff'"
                    :stroke="serie.color || defaultColors[si % defaultColors.length]" stroke-width="2.5"
                    class="easy-chart__point" @click="onBarLineClick(i)" />
                  <!-- 数据标签 -->
                  <template v-for="(v, idx) in serie.data" :key="`ll-${idx}`">
                    <text v-if="showLabel" :x="getXCenter(idx)" :y="getY(v) - 10" text-anchor="middle"
                      dominant-baseline="auto" class="easy-chart__data-label"
                      :fill="serie.color || defaultColors[si % defaultColors.length]">
                      {{ formatValue(v) }}
                    </text>
                  </template>
                </template></g>
            </g>
          </template>

          <!-- 柱状图数据（clip 裁剪） -->
          <template v-if="type === 'bar'">
            <g :clip-path="`url(#${clipPathId})`">
              <g v-for="(serie, si) in visibleSeries" :key="`bs-${si}`">
                <rect v-for="(val, i) in serie.data" :key="`br-${i}`" :x="getBarX(i, si)" :y="getY(val)"
                  :width="barWidth" :height="svgHeight - padding.bottom - getY(val)" :fill="getSerieColor(serie, si, i)"
                  :rx="barRadius" :ry="barRadius" :opacity="activeIndex !== -1 && activeIndex !== i ? 0.55 : 1"
                  class="easy-chart__bar" @click="onBarLineClick(i)" />
                <!-- 数据标签 -->
                <template v-for="(val, i) in serie.data" :key="`bl-${i}`">
                  <text v-if="showLabel" :x="getBarX(i, si) + barWidth / 2" :y="getY(val) - 5" text-anchor="middle"
                    dominant-baseline="auto" class="easy-chart__data-label" :fill="getSerieColor(serie, si, i)">
                    {{ formatValue(val) }}
                  </text>
                </template>
              </g>
            </g>
          </template>

          <!-- 堆叠柱状图数据（clip 裁剪） -->
          <template v-if="type === 'stack'">
            <g :clip-path="`url(#${clipPathId})`">
              <g v-for="(serie, si) in visibleSeries" :key="`ss-${si}`">
                <template v-for="(seg, i) in stackSegments[si]" :key="`sr-${i}`">
                  <rect v-if="seg.h > 0" :x="getStackBarX(i)" :y="seg.y" :width="stackBarWidth" :height="seg.h"
                    :fill="getStackSegColor(serie, si, i)" :rx="si === visibleSeries.length - 1 ? barRadius : 0"
                    :ry="si === visibleSeries.length - 1 ? barRadius : 0"
                    :opacity="activeIndex !== -1 && activeIndex !== i ? 0.55 : 1" class="easy-chart__bar"
                    @click="onBarLineClick(i)" />
                  <!-- 数据标签：在每段中间显示各自的值，高度足够时才显示 -->
                  <text v-if="showLabel && seg.h > 16" :x="getStackBarX(i) + stackBarWidth / 2" :y="seg.y + seg.h / 2"
                    text-anchor="middle" dominant-baseline="middle" class="easy-chart__data-label" fill="#fff">
                    {{ formatValue(seg.val) }}
                  </text>
                </template>
              </g>
            </g>
          </template>

          <!-- 折柱混用（type="mixed"）：先渲染所有柱状系列，再渲染所有折线系列（折线在上层） -->
          <template v-if="type === 'mixed'">
            <g :clip-path="`url(#${clipPathId})`">
              <!-- 柱状系列（使用左Y轴 getMixedBarY） -->
              <g v-for="(serie, si) in mixedBarSeries" :key="`mbs-${si}`">
                <rect v-for="(val, i) in serie.data" :key="`mbr-${i}`" :x="getMixedBarX(i, serie._barIdx)"
                  :y="getMixedBarY(val)" :width="mixedBarWidth" :height="svgHeight - padding.bottom - getMixedBarY(val)"
                  :fill="getSerieColor(serie, serie._origIdx, i)" :rx="barRadius" :ry="barRadius"
                  :opacity="activeIndex !== -1 && activeIndex !== i ? 0.55 : 1" class="easy-chart__bar"
                  @click="onBarLineClick(i)" />
                <!-- 数据标签 -->
                <template v-for="(val, i) in serie.data" :key="`mbl-${i}`">
                  <text v-if="showLabel" :x="getMixedBarX(i, serie._barIdx) + mixedBarWidth / 2"
                    :y="getMixedBarY(val) - 5" text-anchor="middle" dominant-baseline="auto"
                    class="easy-chart__data-label" :fill="getSerieColor(serie, serie._origIdx, i)">
                    {{ formatValue(val) }}
                  </text>
                </template>
              </g>
              <!-- 折线系列（使用右Y轴 getMixedLineY，渲染在柱子上层） -->
              <g v-for="(serie, si) in mixedLineSeries" :key="`mls-${si}`">
                <!-- 面积填充 -->
                <path v-if="serie.areaFill !== false && areaFill" :d="getMixedLineAreaPath(serie.data)"
                  :fill="getSerieColor(serie, serie._origIdx)" opacity="0.12" />
                <!-- 折线 -->
                <path :d="getMixedLinePath(serie.data)" :stroke="getSerieColor(serie, serie._origIdx)"
                  stroke-width="2.5" fill="none" stroke-linecap="round" stroke-linejoin="round" class="easy-chart__line" />
                <!-- 数据点 -->
                <template v-for="(val, i) in serie.data" :key="`mlp-${i}`">
                  <circle v-if="showDots" :cx="getXCenter(i)" :cy="getMixedLineY(val)" :r="activeIndex === i ? 6 : 4"
                    :fill="activeIndex === i ? getSerieColor(serie, serie._origIdx) : '#fff'"
                    :stroke="getSerieColor(serie, serie._origIdx)" stroke-width="2.5" class="easy-chart__point"
                    @click="onBarLineClick(i)" />
                  <!-- 数据标签 -->
                  <template v-for="(v, idx) in serie.data" :key="`mll-${idx}`">
                    <text v-if="showLabel" :x="getXCenter(idx)" :y="getMixedLineY(v) - 10" text-anchor="middle"
                      dominant-baseline="auto" class="easy-chart__data-label" :fill="getSerieColor(serie, serie._origIdx)">
                      {{ formatValue(v) }}
                    </text>
                  </template>
                </template></g>
            </g>
          </template>

          <!-- Tooltip 触发竖线 -->
          <line
            v-if="
              activeIndex >= 0
                && getXCenter(activeIndex) >= padding.left
                && getXCenter(activeIndex) <= svgWidth - padding.right
            "
            :x1="getXCenter(activeIndex)"
            :y1="padding.top"
            :x2="getXCenter(activeIndex)"
            :y2="svgHeight - padding.bottom"
            class="easy-chart__tooltip-line"
          />

          <!-- 滚动条 -->
          <g v-if="scrollable" class="easy-chart__scrollbar">
            <!-- 轨道 -->
            <rect :x="padding.left" :y="svgHeight - 6" :width="plotWidth" height="4" rx="2"
              class="easy-chart__scrollbar-track" />
            <!-- 滑块 -->
            <rect :x="scrollbarThumbLeft" :y="svgHeight - 7" :width="scrollbarThumbW" height="6" rx="3"
              class="easy-chart__scrollbar-thumb" @mousedown.stop="onScrollbarDragStart" />
          </g>
        </template>

        <!-- 饼图 / 环形图 -->
        <template v-if="type === 'pie' || type === 'donut'">
          <g :transform="`translate(${pieCenter.x}, ${pieCenter.y})`">
            <path v-for="(slice, i) in pieSlices" :key="`ps-${i}`" :d="slice.path" :fill="slice.color"
              :opacity="activePieIndex !== -1 && activePieIndex !== i ? 0.6 : 1"
              :transform="activePieIndex === i ? `translate(${slice.offsetX * 8}, ${slice.offsetY * 8})` : ''"
              class="easy-chart__pie-slice" @mouseenter="onPieEnter(i, $event)" @mouseleave="onPieLeave"
              @click="onPieClick(i)" />
            <!-- 饼图/环形图数据标签：显示百分比，切片 >5% 才显示避免拥挤 -->
            <template v-if="showLabel">
              <text v-for="(slice, i) in pieSlices" v-show="slice.percent >= 5" :key="`pl-${i}`" :x="slice.labelX"
                :y="slice.labelY" text-anchor="middle" dominant-baseline="middle" class="easy-chart__pie-label">
                {{ slice.percent }}%
              </text>
            </template>
            <!-- 环形图中心 -->
            <template v-if="type === 'donut'">
              <circle :r="donutInnerRadius" fill="white" />
              <text v-if="donutLabel" text-anchor="middle" dominant-baseline="middle" class="easy-chart__donut-label">
                {{ donutLabel }}
              </text>
              <text v-if="donutValue" text-anchor="middle" dominant-baseline="middle" y="18"
                class="easy-chart__donut-value">
                {{ donutValue }}
              </text>
            </template>
          </g>
        </template>

        <!-- 漏斗图 -->
        <template v-if="type === 'funnel'">
          <g>
            <path v-for="(item, i) in funnelItems" :key="`fi-${i}`" :d="item.path" :fill="item.color"
              :opacity="activeFunnelIndex !== -1 && activeFunnelIndex !== i ? 0.55 : 1" class="easy-chart__funnel-item"
              @mouseenter="onFunnelEnter(i, $event)" @mouseleave="onFunnelLeave" @click="onFunnelClick(i)" />
            <!-- 层标签：名称 + 数值 -->
            <g v-for="(item, i) in funnelItems" :key="`fl-${i}`">
              <text :x="item.labelX" :y="item.labelY - 8" text-anchor="middle" dominant-baseline="middle"
                class="easy-chart__funnel-label">
                {{ item.name }}
              </text>
              <text :x="item.labelX" :y="item.labelY + 10" text-anchor="middle" dominant-baseline="middle"
                class="easy-chart__funnel-value">
                {{ formatValue(item.value) }} ({{ item.percent }}%)
              </text>
            </g>
          </g>
        </template>

        <!-- 横向柱状图（hbar） -->
        <template v-if="type === 'hbar'">
          <!-- 背景网格（垂直线） -->
          <g v-if="showGrid">
            <line v-for="(tick, i) in hbarXTicks" :key="`hg-${i}`" :x1="getHBarTickX(tick)" :y1="padding.top"
              :x2="getHBarTickX(tick)" :y2="svgHeight - padding.bottom" class="easy-chart__grid-line" />
          </g>
          <!-- X轴底部刻度数值 -->
          <g>
            <line :x1="padding.left" :y1="svgHeight - padding.bottom" :x2="svgWidth - padding.right"
              :y2="svgHeight - padding.bottom" class="easy-chart__axis-line" />
            <text v-for="(tick, i) in hbarXTicks" :key="`hxt-${i}`" :x="getHBarTickX(tick)"
              :y="svgHeight - padding.bottom + 14" class="easy-chart__axis-text" text-anchor="middle">
              {{ formatValue(tick) }}
            </text>
          </g>
          <!-- Y轴左侧行标签 -->
          <g>
            <line :x1="padding.left" :y1="padding.top" :x2="padding.left" :y2="svgHeight - padding.bottom"
              class="easy-chart__axis-line" />
            <text v-for="(label, di) in labels ?? []" :key="`hyl-${di}`" :x="padding.left - 8"
              :y="padding.top + hbarRowH * di + hbarRowH / 2" class="easy-chart__axis-text" text-anchor="end"
              dominant-baseline="middle">
              {{ label }}
            </text>
          </g>
          <!-- 柱条 -->
          <g v-for="item in hbarItems" :key="`hb-${item.serieIdx}-${item.dataIdx}`">
            <rect :x="item.barX" :y="item.barY" :width="item.barW" :height="item.barH" :fill="item.color"
              :rx="barRadius" :ry="barRadius"
              :opacity="activeHBarIndex !== -1 && activeHBarIndex !== item.dataIdx ? 0.55 : 1" class="easy-chart__bar"
              @click="onHBarClick(item)" />
            <!-- 数值标签 -->
            <text v-if="item.barW > 20" :x="item.valX" :y="item.barY + item.barH / 2" class="easy-chart__hbar-val"
              dominant-baseline="middle">
              {{ formatValue(item.value) }}
            </text>
          </g>
          <!-- hover 高亮行 -->
          <rect v-if="activeHBarIndex >= 0" :x="padding.left" :y="padding.top + hbarRowH * activeHBarIndex"
            :width="plotWidth" :height="hbarRowH" class="easy-chart__hbar-hover" />
        </template>

        <!-- 仪表盘（gauge） -->
        <template v-if="type === 'gauge'">
          <!-- 轨道底色（灰色背景弧，最底层） -->
          <path :d="gaugeTrackPath" stroke="#f1f1f4" :stroke-width="gaugeTrackW" fill="none" stroke-linecap="round" />
          <!-- 轨道分段弧（颜色区段） -->
          <path v-for="(arc, i) in gaugeArcs" :key="`ga-${i}`" :d="arc.path" :stroke="arc.color"
            :stroke-width="gaugeTrackW" fill="none" stroke-linecap="butt" opacity="0.3" />
          <!-- 进度弧（高亮当前值） -->
          <path
            v-if="gaugeProgressPath"
            :d="gaugeProgressPath"
            :stroke="
              gaugeArcs.length
                ? gaugeArcs[Math.min(Math.floor(gaugeRatio * gaugeArcs.length), gaugeArcs.length - 1)].color
                : defaultColors[0]
            "
            :stroke-width="gaugeTrackW"
            fill="none"
            stroke-linecap="round"
            class="easy-chart__gauge-progress"
          />
          <!-- 刻度文字（靠近轨道外圈，不画线） -->
          <text v-for="(tick, i) in gaugeTicks" :key="`gtick-${i}`" :x="tick.lx" :y="tick.ly"
            class="easy-chart__axis-text" text-anchor="middle" dominant-baseline="middle">
            {{ tick.label }}
          </text>
          <!-- 指针 -->
          <path :d="gaugeNeedle.path" fill="#374151" opacity="0.88" class="easy-chart__gauge-needle" />
          <circle :cx="gaugeNeedle.cx" :cy="gaugeNeedle.cy" r="7" fill="#374151" />
          <circle :cx="gaugeNeedle.cx" :cy="gaugeNeedle.cy" r="3" fill="#fff" />
          <!-- 中心数值 -->
          <text :x="gaugeCx" :y="gaugeCy + gaugeR * 0.36" text-anchor="middle" class="easy-chart__gauge-val">
            {{ formatValue(gaugeValue) }}{{ gaugeUnit }}
          </text>
        </template>
      </svg>

      <!-- 空状态 -->
      <div v-if="isEmpty" class="easy-chart__empty">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
          <rect x="4" y="28" width="8" height="16" rx="2" fill="#e4e4e7" />
          <rect x="20" y="18" width="8" height="26" rx="2" fill="#e4e4e7" />
          <rect x="36" y="10" width="8" height="34" rx="2" fill="#e4e4e7" />
        </svg>
        <p>暂无数据</p>
      </div>
    </div>

    <!-- Tooltip：挂在根容器上，避免被 body 的 overflow:hidden 裁剪 -->
    <div v-if="tooltip.visible" class="easy-chart__tooltip" :style="{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }">
      <div class="easy-chart__tooltip-title">
        {{ tooltip.title }}
      </div>
      <div v-for="item in tooltip.items" :key="item.name" class="easy-chart__tooltip-item">
        <span class="easy-chart__tooltip-dot" :style="{ background: item.color }" />
        <span class="easy-chart__tooltip-name">{{ item.name }}</span>
        <span class="easy-chart__tooltip-val">{{ formatValue(item.value) }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped src="./chart-style.scss" lang="scss"></style>
