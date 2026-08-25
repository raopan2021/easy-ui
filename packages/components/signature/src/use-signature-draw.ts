import type { SignatureEmits, SignaturePoint, SignatureProps } from './types'
import type { SignatureCanvas } from './use-signature-canvas'
import type { SignaturePen } from './use-signature-pen'

/**
 * 签名绘制与操作方法。
 *
 * 职责：
 * - 鼠标 / 触摸事件的落笔、移动、抬笔处理（含单击成点）；
 * - 撤销 / 清空 / 确认 / 导出 dataURL 等对外操作；
 * - 事件派发（change / undo / clear / confirm）。
 *
 * emit 以 SignatureEmits 可调用接口直接标注（不使用 EmitFn<>），
 * 与 markdown 组件的 composable 约定保持一致。
 *
 * @param props 签名板 props（响应式对象）
 * @param emit 组件事件（confirm / change / undo / clear）
 * @param canvas 画布上下文（useSignatureCanvas 返回值）
 * @param pen 画笔状态（useSignaturePen 返回值）
 */
export function useSignatureDraw(
  props: SignatureProps,
  emit: SignatureEmits,
  canvas: SignatureCanvas,
  pen: SignaturePen,
) {
  const { canvasRef, ctx, history, canUndo, hasContent, saveHistory, clearHistory } = canvas
  const { currentPenColor, currentPenSize } = pen

  /** 是否处于绘制中 */
  let isDrawing = false
  /** 上一个采样点坐标 */
  let lastX = 0
  let lastY = 0

  /** 将视口坐标换算为画布内坐标 */
  function getCanvasPoint(clientX: number, clientY: number): SignaturePoint {
    const el = canvasRef.value!
    const rect = el.getBoundingClientRect()
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    }
  }

  /** 绘制一段线条（使用当前画笔颜色与粗细） */
  function drawLine(x1: number, y1: number, x2: number, y2: number) {
    if (!ctx.value)
      return
    ctx.value.beginPath()
    ctx.value.strokeStyle = currentPenColor.value
    ctx.value.lineWidth = currentPenSize.value
    ctx.value.moveTo(x1, y1)
    ctx.value.lineTo(x2, y2)
    ctx.value.stroke()
  }

  /** 落笔时画一个圆点（处理单击不拖动的情况） */
  function drawDot(x: number, y: number) {
    if (!ctx.value)
      return
    ctx.value.beginPath()
    ctx.value.fillStyle = currentPenColor.value
    ctx.value.arc(x, y, currentPenSize.value / 2, 0, Math.PI * 2)
    ctx.value.fill()
  }

  // ──── 鼠标事件 ────

  /** 鼠标落笔 */
  function onPointerDown(e: MouseEvent) {
    if (props.disabled)
      return
    isDrawing = true
    const { x, y } = getCanvasPoint(e.clientX, e.clientY)
    lastX = x
    lastY = y

    // 保存当前状态用于撤销
    saveHistory()

    drawDot(x, y)
  }

  /** 鼠标移动 */
  function onPointerMove(e: MouseEvent) {
    if (!isDrawing || props.disabled)
      return
    const { x, y } = getCanvasPoint(e.clientX, e.clientY)
    drawLine(lastX, lastY, x, y)
    lastX = x
    lastY = y
    hasContent.value = true
  }

  /** 抬笔 / 移出画布：结束本笔并派发 change */
  function onPointerUp() {
    if (isDrawing) {
      isDrawing = false
      emit('change', true)
    }
  }

  // ──── 触摸事件 ────

  /** 触摸落笔 */
  function onTouchStart(e: TouchEvent) {
    if (props.disabled)
      return
    const touch = e.touches[0]
    isDrawing = true
    const { x, y } = getCanvasPoint(touch.clientX, touch.clientY)
    lastX = x
    lastY = y

    saveHistory()

    drawDot(x, y)
  }

  /** 触摸移动 */
  function onTouchMove(e: TouchEvent) {
    if (!isDrawing || props.disabled)
      return
    const touch = e.touches[0]
    const { x, y } = getCanvasPoint(touch.clientX, touch.clientY)
    drawLine(lastX, lastY, x, y)
    lastX = x
    lastY = y
    hasContent.value = true
  }

  // ──── 操作方法 ────

  /** 撤销上一笔 */
  function undo() {
    if (history.length === 0)
      return
    const lastState = history.pop()!
    const context = ctx.value
    if (context) {
      context.putImageData(lastState, 0, 0)
    }
    canUndo.value = history.length > 0
    hasContent.value = history.length > 0
    emit('undo')
  }

  /** 清空画布 */
  function clear() {
    const el = canvasRef.value
    const context = ctx.value
    if (!el || !context)
      return

    const dpr = window.devicePixelRatio || 1
    const w = el.width / dpr
    const heightVal = el.height / dpr
    context.clearRect(0, 0, w, heightVal)

    clearHistory()
    emit('clear')
    emit('change', false)
  }

  /** 确认签名，返回 dataURL */
  function confirm() {
    if (!canvasRef.value || !hasContent.value)
      return
    const dataUrl = canvasRef.value.toDataURL('image/png')
    emit('confirm', dataUrl)
  }

  /** 获取签名图片 dataURL（不触发事件） */
  function getDataUrl(): string {
    if (!canvasRef.value)
      return ''
    return canvasRef.value.toDataURL('image/png')
  }

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onTouchStart,
    onTouchMove,
    undo,
    clear,
    confirm,
    getDataUrl,
  }
}
