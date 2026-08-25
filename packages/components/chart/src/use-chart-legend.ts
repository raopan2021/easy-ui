import type { ComputedRef } from 'vue'
import type { ChartProps, ChartSerie, LegendItem } from './types'

import { computed, ref } from 'vue'

/**
 * 图例数据与系列显隐。
 *
 * 图例点击后把系列名写入 `hiddenSeries`，`visibleSeries` 作为所有绘图逻辑的
 * 统一数据源，从而实现「点击图例隐藏系列」对全部图表类型生效。
 *
 * @param props 图表 props（响应式对象）
 * @param ctx   依赖注入：调色盘
 */
export function useChartLegend(props: ChartProps, ctx: { defaultColors: ComputedRef<string[]> }) {
  const { defaultColors } = ctx

  /** 被图例隐藏的系列 / 数据项名称集合 */
  const hiddenSeries = ref(new Set<string>())

  /** 参与绘制的系列（已剔除图例隐藏项） */
  const visibleSeries = computed<ChartSerie[]>(() => (props.series ?? []).filter(s => !hiddenSeries.value.has(s.name)))

  /**
   * 图例项列表。
   * - 饼图 / 环形图 / 漏斗图：取自 data
   * - 仪表盘：无图例
   * - 其余：取自 series（堆叠图优先使用 stackColors 首列颜色，保证与柱体一致）
   */
  const legendItems = computed<LegendItem[]>(() => {
    if (props.type === 'pie' || props.type === 'donut' || props.type === 'funnel') {
      return (props.data ?? []).map((d, i) => ({
        name: d.name,
        color: d.color || defaultColors.value[i % defaultColors.value.length],
        isLine: false,
      }))
    }
    if (props.type === 'gauge')
      return []
    return (props.series ?? []).map((s, i) => {
      let color = s.color || defaultColors.value[i % defaultColors.value.length]
      if (props.type === 'stack' && props.stackColors?.[0]?.[i]) {
        color = props.stackColors[0][i]
      }
      return { name: s.name, color, isLine: props.type === 'line' || s.chartType === 'line' }
    })
  })

  /** 切换某个系列 / 数据项的显隐（替换整个 Set 以触发响应式更新） */
  function toggleSeries(name: string) {
    const s = new Set(hiddenSeries.value)
    if (s.has(name))
      s.delete(name)
    else s.add(name)
    hiddenSeries.value = s
  }

  return {
    hiddenSeries,
    visibleSeries,
    legendItems,
    toggleSeries,
  }
}
