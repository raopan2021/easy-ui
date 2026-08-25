import type { ComputedRef } from 'vue'
import type { ChartPadding, ChartProps } from './types'

import { computed, onMounted, onUnmounted, ref, watch } from 'vue'

/**
 * 横向滚动视口：虚拟画布宽度、拖拽 / 滚轮 / 滚动条滑块交互。
 *
 * 当 `minItemWidth` 使数据区总宽超出可视宽度时启用滚动，所有几何计算通过
 * `clampedOffsetX` 统一左移，避免真实 DOM 滚动带来的坐标换算问题。
 *
 * @param props 图表 props（响应式对象）
 * @param ctx   依赖注入：X 轴标签、内边距、绘图区宽度、尺寸重测函数
 */
export function useChartScroll(props: ChartProps, ctx: {
  xLabels: ComputedRef<string[]>
  padding: ComputedRef<ChartPadding>
  plotWidth: ComputedRef<number>
  updateSize: () => void
}) {
  const { xLabels, padding, plotWidth, updateSize } = ctx

  // ========== 滚动 / 拖拽状态 ==========
  /** 当前向左偏移的像素数（>=0） */
  const scrollOffsetX = ref(0)
  const isDragging = ref(false)
  const dragStartX = ref(0)
  const dragStartOffset = ref(0)
  // 滚动条拖拽
  const isScrollbarDragging = ref(false)
  const scrollbarDragStartX = ref(0)
  const scrollbarDragStartOffset = ref(0)

  /** 每个数据点实际占用宽度（虚拟 canvas 中） */
  const itemWidth = computed(() => {
    const minItemWidth = props.minItemWidth ?? 0
    if (minItemWidth > 0) {
      const dataLen = Math.max(xLabels.value.length, 1)
      const naturalW = plotWidth.value / dataLen
      return Math.max(naturalW, minItemWidth)
    }
    return plotWidth.value / Math.max(xLabels.value.length, 1)
  })

  /** 虚拟数据区总宽度 */
  const virtualPlotWidth = computed(() => {
    const dataLen = Math.max(xLabels.value.length, 1)
    if (props.type === 'line') {
      // 包含两端留白，确保第一/最后数据点不贴边
      const padding2x = Math.min(16, itemWidth.value * 0.5) * 2
      return itemWidth.value * (dataLen - 1) + padding2x
    }
    return itemWidth.value * dataLen
  })

  /** 是否启用横向滚动 */
  const scrollable = computed(
    () =>
      (props.type === 'line' || props.type === 'bar' || props.type === 'stack' || props.type === 'mixed')
      && virtualPlotWidth.value > plotWidth.value + 1,
  )

  /** 最大可偏移量 */
  const maxScrollOffsetX = computed(() =>
    scrollable.value ? Math.max(0, virtualPlotWidth.value - plotWidth.value) : 0,
  )

  /** 当前偏移量（钳制在合法范围） */
  const clampedOffsetX = computed(() => Math.max(0, Math.min(scrollOffsetX.value, maxScrollOffsetX.value)))

  /** 滚动条宽度比例 */
  const scrollbarRatio = computed(() => {
    if (!scrollable.value || virtualPlotWidth.value <= 0)
      return 1
    return Math.max(plotWidth.value / virtualPlotWidth.value, 0.06)
  })

  /** 滚动条轨道宽度（px） */
  const scrollbarTrackW = computed(() => plotWidth.value)

  /** 滚动条滑块宽度 */
  const scrollbarThumbW = computed(() => Math.max(scrollbarTrackW.value * scrollbarRatio.value, 28))

  /** 滚动条滑块 left 位置 */
  const scrollbarThumbLeft = computed(() => {
    if (maxScrollOffsetX.value <= 0)
      return padding.value.left
    const travel = scrollbarTrackW.value - scrollbarThumbW.value
    return padding.value.left + (clampedOffsetX.value / maxScrollOffsetX.value) * travel
  })

  /** 相邻数据点的横向步长（折线图按虚拟宽度均分，其余等于 itemWidth） */
  const stepX = computed(() => {
    const len = xLabels.value.length
    if (props.type === 'line') {
      return len > 1 ? virtualPlotWidth.value / (len - 1) : virtualPlotWidth.value
    }
    return itemWidth.value
  })

  /** 折线图两端与 Y轴/右边界之间的留白距离（避免第一/最后数据点贴边） */
  const linePaddingX = computed(() => {
    if (props.type !== 'line')
      return 0
    const dataLen = xLabels.value.length
    if (dataLen <= 1)
      return 0
    // 固定留白 16px，但不超过 itemWidth 的一半
    return Math.min(16, itemWidth.value * 0.5)
  })

  // ========== 拖拽滚动 ==========
  function onDragStart(e: MouseEvent) {
    if (!scrollable.value)
      return
    if ((e.target as Element).classList.contains('easy-chart__scrollbar-thumb'))
      return
    isDragging.value = true
    dragStartX.value = e.clientX
    dragStartOffset.value = clampedOffsetX.value
  }

  function onDragMove(e: MouseEvent) {
    if (!isDragging.value)
      return
    const delta = dragStartX.value - e.clientX // 向左拖 → 偏移增大（内容向左移动）
    const newOffset = dragStartOffset.value + delta
    scrollOffsetX.value = Math.max(0, Math.min(newOffset, maxScrollOffsetX.value))
  }

  function stopDrag() {
    isDragging.value = false
  }

  // ========== 滚动条拖拽 ==========
  function onScrollbarDragStart(e: MouseEvent) {
    isScrollbarDragging.value = true
    scrollbarDragStartX.value = e.clientX
    scrollbarDragStartOffset.value = clampedOffsetX.value
  }

  function onScrollbarDragMove(e: MouseEvent) {
    if (!isScrollbarDragging.value)
      return
    const delta = e.clientX - scrollbarDragStartX.value
    const travel = scrollbarTrackW.value - scrollbarThumbW.value
    if (travel <= 0)
      return
    const newOffset = scrollbarDragStartOffset.value + (delta / travel) * maxScrollOffsetX.value
    scrollOffsetX.value = Math.max(0, Math.min(newOffset, maxScrollOffsetX.value))
  }

  function stopScrollbarDrag() {
    isScrollbarDragging.value = false
  }

  // ========== 滚轮滚动 ==========
  function onWheel(e: WheelEvent) {
    if (!scrollable.value)
      return
    const delta = e.deltaY !== 0 ? e.deltaY : e.deltaX
    scrollOffsetX.value = Math.max(0, Math.min(scrollOffsetX.value + delta, maxScrollOffsetX.value))
  }

  // 拖拽过程中鼠标可能移出组件，因此监听 document
  onMounted(() => {
    document.addEventListener('mousemove', onDragMove)
    document.addEventListener('mouseup', stopDrag)
    document.addEventListener('mousemove', onScrollbarDragMove)
    document.addEventListener('mouseup', stopScrollbarDrag)
  })

  onUnmounted(() => {
    document.removeEventListener('mousemove', onDragMove)
    document.removeEventListener('mouseup', stopDrag)
    document.removeEventListener('mousemove', onScrollbarDragMove)
    document.removeEventListener('mouseup', stopScrollbarDrag)
  })

  // 数据变化后重测宽度并把视口拉回起点，避免停留在越界偏移上
  watch(
    () => props.series,
    () => {
      updateSize()
      scrollOffsetX.value = 0
    },
    { deep: true },
  )
  watch(
    () => props.data,
    () => {
      updateSize()
      scrollOffsetX.value = 0
    },
    { deep: true },
  )
  watch(
    () => props.labels,
    () => {
      scrollOffsetX.value = 0
    },
    { deep: true },
  )

  return {
    scrollOffsetX,
    isDragging,
    itemWidth,
    virtualPlotWidth,
    scrollable,
    maxScrollOffsetX,
    clampedOffsetX,
    scrollbarTrackW,
    scrollbarThumbW,
    scrollbarThumbLeft,
    stepX,
    linePaddingX,
    onDragStart,
    onDragMove,
    stopDrag,
    onScrollbarDragStart,
    onScrollbarDragMove,
    stopScrollbarDrag,
    onWheel,
  }
}
