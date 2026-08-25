import type { BarcodeEmits, BarcodeProps } from './types'

import JsBarcode from 'jsbarcode'

import { nextTick, onMounted, ref, watch } from 'vue'

/**
 * 条码绘制与导出逻辑（JsBarcode 渲染 + SVG/PNG 导出下载）。
 *
 * 将原本内联在 barcode.vue 中的绘制、下载、监听逻辑抽离为独立 composable，
 * 让 .vue 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 *
 * @param props 条码 props（需传入响应式对象，composable 内部 watch 会自动追踪依赖）
 * @param emit 条码事件触发器（生成完成 / 失败）
 */
export function useBarcode(props: BarcodeProps, emit: BarcodeEmits) {
  /** SVG 元素引用（由模板 ref 绑定） */
  const svgRef = ref<SVGElement | null>(null)

  /** 绘制条码 */
  function drawBarcode(): void {
    if (!svgRef.value || !props.content)
      return

    try {
      // 清空旧的条码内容，防止重复叠加
      const svgEl = svgRef.value
      while (svgEl.firstChild) {
        svgEl.removeChild(svgEl.firstChild)
      }

      // 使用 JsBarcode 绘制（会自动设置 SVG 的 width/height 属性和 viewBox）
      JsBarcode(svgEl, props.content, {
        format: props.format,
        width: props.width,
        height: props.height,
        displayValue: props.displayValue,
        font: props.font,
        fontSize: props.fontSize,
        textAlign: props.textAlign as 'left' | 'center' | 'right',
        margin: props.margin,
        background: props.background,
        lineColor: props.lineColor,
      })

      // 让 SVG 按属性宽高显示（style 覆盖，防止被 scoped 样式影响）
      const w = svgEl.getAttribute('width')
      const heightAttr = svgEl.getAttribute('height')
      if (w && heightAttr) {
        svgEl.style.cssText = `width:${w}px;height:${heightAttr}px;background:${props.background};display:block`
      }

      // 触发完成事件
      emit('generated', svgEl)
    }
    catch (error) {
      emit('error', error as Error)
    }
  }

  /** 暴露：获取 SVG 元素 */
  function getSvgElement(): SVGElement | null {
    return svgRef.value
  }

  /** 暴露：获取 SVG 字符串 */
  function toSVGString(): string {
    return svgRef.value?.outerHTML || ''
  }

  /** 暴露：下载为 SVG 文件 */
  function downloadSVG(filename = 'barcode.svg'): void {
    const svg = svgRef.value
    if (!svg)
      return
    const svgData = new XMLSerializer().serializeToString(svg)
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.download = filename
    link.href = url
    link.click()
    URL.revokeObjectURL(url)
  }

  /** 暴露：下载为 PNG 图片 */
  function downloadPNG(filename = 'barcode.png', scale = 2): void {
    const svg = svgRef.value
    if (!svg)
      return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx)
      return

    const svgData = new XMLSerializer().serializeToString(svg)
    const img = new Image()
    img.onload = () => {
      canvas.width = img.width * scale
      canvas.height = img.height * scale
      ctx.fillStyle = props.background ?? '#ffffff'
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height)
      const pngUrl = canvas.toDataURL('image/png')
      const link = document.createElement('a')
      link.download = filename
      link.href = pngUrl
      link.click()
    }
    img.src = `data:image/svg+xml;base64,${btoa(unescape(encodeURIComponent(svgData)))}`
  }

  // 监听属性变化
  watch(
    () => [
      props.content,
      props.format,
      props.width,
      props.height,
      props.displayValue,
      props.font,
      props.fontSize,
      props.textAlign,
      props.margin,
      props.background,
      props.lineColor,
    ],
    async () => {
      await nextTick()
      drawBarcode()
    },
    { deep: true },
  )

  onMounted(async () => {
    await nextTick()
    drawBarcode()
  })

  return {
    svgRef,
    drawBarcode,
    getSvgElement,
    toSVGString,
    downloadSVG,
    downloadPNG,
  }
}
