import type { SignatureProps } from './types'

import { nextTick, onMounted, onUnmounted, ref, shallowRef, watch } from 'vue'

/** 历史快照上限（超出后丢弃最早的一笔，避免内存无限增长） */
const MAX_HISTORY = 30

/**
 * 画布生命周期与历史快照管理。
 *
 * 职责：
 * - 按设备像素比（DPR）初始化高清画布，并同步 CSS 尺寸；
 * - 监听 props.width / props.height 变化与容器尺寸变化（未指定宽度时）重新初始化；
 * - 维护每一笔绘制前的 ImageData 快照栈，以及 canUndo / hasContent 状态。
 *
 * 历史栈与 2D 上下文均以非深响应式方式持有（普通数组 + shallowRef），
 * 避免大对象被 Proxy 包裹带来的性能与兼容问题（与原实现的 let 变量等价）。
 *
 * @param props 签名板 props（响应式对象）
 */
export function useSignatureCanvas(props: SignatureProps) {
  /** 根容器（用于 ResizeObserver 监听自适应宽度） */
  const wrapperRef = ref<HTMLDivElement>()
  /** 画布元素 */
  const canvasRef = ref<HTMLCanvasElement>()
  /** 画布 2D 上下文 */
  const ctx = shallowRef<CanvasRenderingContext2D | null>(null)

  /** 历史记录（存储每一笔之前的 ImageData） */
  const history: ImageData[] = []
  /** 是否可撤销 */
  const canUndo = ref(false)
  /** 画布是否已有内容 */
  const hasContent = ref(false)

  /** 清空历史快照与派生状态 */
  function clearHistory() {
    history.length = 0
    canUndo.value = false
    hasContent.value = false
  }

  /** 初始化画布（高清渲染 + 线帽样式 + 重置历史） */
  function initCanvas() {
    const canvas = canvasRef.value
    if (!canvas)
      return

    const wrapper = canvas.parentElement
    const displayWidth = wrapper ? wrapper.clientWidth : props.width || 400
    const displayHeight = props.height || 200

    // 高清渲染（2x）
    const dpr = window.devicePixelRatio || 1
    canvas.width = displayWidth * dpr
    canvas.height = displayHeight * dpr
    canvas.style.width = `${displayWidth}px`
    canvas.style.height = `${displayHeight}px`

    ctx.value = canvas.getContext('2d')
    if (ctx.value) {
      ctx.value.scale(dpr, dpr)
      ctx.value.lineCap = 'round'
      ctx.value.lineJoin = 'round'
    }

    // 清空历史
    clearHistory()
  }

  /** 保存当前画布快照，供撤销回滚 */
  function saveHistory() {
    const canvas = canvasRef.value
    const context = ctx.value
    if (!canvas || !context)
      return

    const dpr = window.devicePixelRatio || 1
    const imageData = context.getImageData(0, 0, canvas.width / dpr, canvas.height / dpr)
    history.push(imageData)
    if (history.length > MAX_HISTORY) {
      history.shift()
    }
    canUndo.value = history.length > 0
  }

  /** 容器尺寸监听（仅未指定固定宽度时启用） */
  let resizeObserver: ResizeObserver | null = null

  onMounted(() => {
    nextTick(() => initCanvas())
  })

  // 监听尺寸变化
  watch(
    () => [props.width, props.height],
    () => {
      nextTick(() => initCanvas())
    },
  )

  // 窗口 resize / 容器尺寸变化
  onMounted(() => {
    if (wrapperRef.value && !props.width) {
      resizeObserver = new ResizeObserver(() => {
        nextTick(() => initCanvas())
      })
      resizeObserver.observe(wrapperRef.value)
    }
  })

  onUnmounted(() => {
    history.length = 0
    resizeObserver?.disconnect()
  })

  return {
    wrapperRef,
    canvasRef,
    ctx,
    history,
    canUndo,
    hasContent,
    initCanvas,
    saveHistory,
    clearHistory,
  }
}

/** 画布上下文（供绘制 composable 复用） */
export type SignatureCanvas = ReturnType<typeof useSignatureCanvas>
