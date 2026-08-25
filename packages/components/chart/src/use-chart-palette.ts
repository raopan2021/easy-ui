import type { ChartProps, ChartSerie } from './types'

import { computed } from 'vue'

/** 内置调色盘（props.colors 未传时使用） */
const BUILT_IN_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16']

/**
 * 配色与数值格式化。
 *
 * 集中处理「某个系列 / 某根柱子该用什么颜色」以及坐标轴、标签、Tooltip 的数值文本，
 * 供折线、柱状、堆叠、混用、饼图、漏斗、仪表盘等各类图形共用。
 *
 * @param props 图表 props（响应式对象）
 */
export function useChartPalette(props: ChartProps) {
  /** 当前生效的调色盘（props.colors 优先，为空时回退内置调色盘） */
  const defaultColors = computed(() => (props.colors?.length ? props.colors : BUILT_IN_COLORS))

  /**
   * 获取某个系列在某个数据索引处的颜色。
   *
   * 优先级：serie.colors[dataIdx] > serie.color > defaultColors[serieIdx]
   *
   * @param serie    数据系列
   * @param serieIdx 系列索引（决定调色盘取色位置）
   * @param dataIdx  数据点索引（传入时才启用单点颜色）
   */
  function getSerieColor(serie: ChartSerie, serieIdx: number, dataIdx?: number): string {
    if (dataIdx !== undefined && serie.colors && serie.colors[dataIdx]) {
      return serie.colors[dataIdx]
    }
    return serie.color || defaultColors.value[serieIdx % defaultColors.value.length]
  }

  /**
   * 堆叠柱状图颜色优先级：
   * 1. stackColors[dataIdx][serieIdx]  —— 单柱某层精确颜色
   * 2. serie.colors[dataIdx]           —— 某系列某柱颜色
   * 3. serie.color                     —— 某系列整体颜色
   * 4. defaultColors[serieIdx]         —— 全局调色盘
   */
  function getStackSegColor(serie: ChartSerie, serieIdx: number, dataIdx: number): string {
    const sc = props.stackColors
    if (sc && sc[dataIdx] && sc[dataIdx][serieIdx]) {
      return sc[dataIdx][serieIdx]
    }
    if (serie.colors && serie.colors[dataIdx]) {
      return serie.colors[dataIdx]
    }
    return serie.color || defaultColors.value[serieIdx % defaultColors.value.length]
  }

  /**
   * 数值格式化：props.formatter 优先；
   * 否则万级以上转 `x.xw`，整数原样输出，小数保留 1 位。
   */
  function formatValue(val: number): string {
    if (props.formatter)
      return props.formatter(val)
    if (Math.abs(val) >= 10000)
      return `${(val / 10000).toFixed(1)}w`
    if (Number.isInteger(val))
      return val.toString()
    return val.toFixed(1)
  }

  return {
    defaultColors,
    getSerieColor,
    getStackSegColor,
    formatValue,
  }
}
