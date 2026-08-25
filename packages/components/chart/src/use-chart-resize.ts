import { nextTick, onActivated, onMounted, onUnmounted, ref } from 'vue'

/**
 * 图表容器尺寸测量与 ResizeObserver 生命周期。
 *
 * SVG 宽度必须依赖真实 DOM 宽度（`width` 支持百分比），因此统一在此测量：
 * - 挂载后 nextTick + 双 rAF 各测一次（懒加载路由 / 异步 chunk 下布局可能尚未稳定）
 * - ResizeObserver 监听绘图区尺寸变化
 * - KeepAlive 激活时重测（元素从 display:none 恢复后尺寸才有效）
 */
export function useChartResize() {
  /** 根容器（Tooltip 定位基准） */
  const rootRef = ref<HTMLElement | null>(null)
  /** SVG 绘图区容器（宽度测量基准） */
  const bodyRef = ref<HTMLElement | null>(null)
  /** 当前 SVG 宽度（px），为 0 时不渲染 SVG */
  const svgWidth = ref(0)
  const resizeObserver = ref<ResizeObserver | null>(null)

  /** 重新测量绘图区宽度（宽度为 0 时保留上一次有效值，避免图形闪烁） */
  function updateSize() {
    if (bodyRef.value) {
      const w = bodyRef.value.clientWidth
      if (w > 0)
        svgWidth.value = w
    }
  }

  onMounted(() => {
    nextTick(updateSize)
    // 初次挂载时布局可能尚未完全稳定（懒加载路由/异步 chunk），双 rAF 后再测一次确保宽度正确
    requestAnimationFrame(() => requestAnimationFrame(updateSize))
    resizeObserver.value = new ResizeObserver(updateSize)
    if (bodyRef.value)
      resizeObserver.value.observe(bodyRef.value)
  })

  // KeepAlive 缓存下切回页面时立即重测（元素从 display:none 恢复显示后尺寸才稳定）
  onActivated(() => {
    nextTick(updateSize)
  })

  onUnmounted(() => {
    resizeObserver.value?.disconnect()
  })

  return {
    rootRef,
    bodyRef,
    svgWidth,
    updateSize,
  }
}
