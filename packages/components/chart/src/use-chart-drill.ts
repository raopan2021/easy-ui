import type { ComputedRef } from 'vue'
import type {
  ChartDrillDetail,
  ChartEmits,
  ChartProps,
  ChartSerie,
  ChartType,
  FunnelItem,
  HBarItem,
  PieSlice,
} from './types'

import { pickExtra } from './chart-utils'

/**
 * 下钻事件绑定：把各类图形的点击统一收敛为 `drill` 事件。
 *
 * 事件载荷固定为「图表类型 + 类目名 + 数值 + 系列名 + 索引 + extra」，
 * 其中 extra 为用户挂在 serie / data 上的业务字段，便于调用方直接跳转或查询明细。
 *
 * @param props 图表 props（响应式对象）
 * @param emit  组件 emit 函数（callable 形式的 ChartEmits）
 * @param ctx   依赖注入：X 轴标签、可见系列、饼图切片、漏斗层
 */
export function useChartDrill(props: ChartProps, emit: ChartEmits, ctx: {
  xLabels: ComputedRef<string[]>
  visibleSeries: ComputedRef<ChartSerie[]>
  pieSlices: ComputedRef<PieSlice[]>
  funnelItems: ComputedRef<FunnelItem[]>
}) {
  const { xLabels, visibleSeries, pieSlices, funnelItems } = ctx

  /** 补齐 type 字段后派发 drill 事件 */
  function emitDrill(payload: ChartDrillDetail) {
    emit('drill', { type: props.type as ChartType, ...payload })
  }

  /** 折线/柱状/堆叠/混用图点击：逐个可见系列各派发一次 */
  function onBarLineClick(dataIdx: number) {
    if (dataIdx < 0)
      return
    visibleSeries.value.forEach((s) => {
      emitDrill({
        label: xLabels.value[dataIdx] ?? String(dataIdx),
        value: s.data[dataIdx] ?? 0,
        seriesName: s.name,
        index: dataIdx,
        extra: pickExtra(s, ['name', 'data', 'color', 'areaFill']),
      })
    })
  }

  /** 饼图/环形图切片点击 */
  function onPieClick(i: number) {
    const slice = pieSlices.value[i]
    emitDrill({ label: slice.name, value: slice.value, index: i, extra: slice.extra })
  }

  /** 漏斗层点击 */
  function onFunnelClick(i: number) {
    const item = funnelItems.value[i]
    emitDrill({ label: item.name, value: item.value, index: i, extra: item.extra })
  }

  /** 横向柱状图柱条点击 */
  function onHBarClick(item: HBarItem) {
    emitDrill({
      label: item.label,
      value: item.value,
      seriesName: item.seriesName,
      index: item.dataIdx,
      extra: item.extra,
    })
  }

  return {
    emitDrill,
    onBarLineClick,
    onPieClick,
    onFunnelClick,
    onHBarClick,
  }
}
