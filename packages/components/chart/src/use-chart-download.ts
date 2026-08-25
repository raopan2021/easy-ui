import type { ComputedRef, Ref } from 'vue'
import type { ChartDownloadFormat, ChartProps, LegendItem } from './types'

import { onMounted, onUnmounted, ref } from 'vue'
import { escXml, roundRect, triggerDownload } from './chart-utils'

/** 导出画布左右内边距 */
const EXPORT_PAD_X = 20
/** 导出画布顶部内边距 */
const EXPORT_PAD_TOP = 20
/** 导出画布底部内边距 */
const EXPORT_PAD_BOTTOM = 20
/** 导出时图例区占高（仅 top / bottom 方向） */
const EXPORT_LEGEND_H = 32
/** 通用无衬线字体栈（导出时内联，避免脱离页面样式后字体丢失） */
const EXPORT_FONT_FAMILY = `-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif`

/**
 * 图表下载：菜单开合 + PNG / SVG 导出。
 *
 * 导出时不是简单地截取 DOM，而是重新拼装一张「标题 + 图例 + 图表」的完整画布：
 * - SVG：把绘图 SVG 作为嵌套 `<svg>` 内联进外层画布，并用文本节点重绘标题与图例
 * - PNG：先把绘图 SVG 序列化为图片，再用 Canvas 按同样的版式绘制并导出
 * 两条路径都注入内联样式，保证脱离页面 CSS 后网格线、坐标轴等仍然可见。
 *
 * @param props 图表 props（响应式对象）
 * @param ctx   依赖注入：绘图区容器（用于取 SVG 元素）、图例项
 */
export function useChartDownload(props: ChartProps, ctx: {
  bodyRef: Ref<HTMLElement | null>
  legendItems: ComputedRef<LegendItem[]>
}) {
  const { bodyRef, legendItems } = ctx

  /** 下载按钮容器（用于判断点击是否发生在菜单外） */
  const downloadRef = ref<HTMLElement | null>(null)
  const downloadMenuVisible = ref(false)

  function toggleDownloadMenu() {
    downloadMenuVisible.value = !downloadMenuVisible.value
  }

  /** 点击组件外部时关闭下载菜单 */
  function onClickOutsideDownload(e: MouseEvent) {
    if (downloadRef.value && !downloadRef.value.contains(e.target as Node)) {
      downloadMenuVisible.value = false
    }
  }

  /** 取当前绘图 SVG 元素 */
  function getSvgElement(): SVGSVGElement | null {
    return bodyRef.value?.querySelector('svg.easy-chart__svg') ?? null
  }

  /** 导出文件名（标题中的空白替换为下划线，无标题时用 chart） */
  function getDownloadFileName(ext: string): string {
    return `${props.title ? props.title.replace(/\s+/g, '_') : 'chart'}.${ext}`
  }

  /** 构建包含标题+图例+图表的完整 SVG 字符串 */
  function buildFullSvg(
    totalW: number,
    totalH: number,
    padX: number,
    padTop: number,
    titleH: number,
    legendHeightPx: number,
    chartW: number,
    chartH: number,
    innerSvgStr: string,
  ): string {
    const lines: string[] = []
    lines.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${totalH}">`)
    lines.push(`<style>text{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;}</style>`)
    // 白色背景
    lines.push(`<rect width="${totalW}" height="${totalH}" fill="white"/>`)

    let curY = padTop

    // 标题
    if (props.title) {
      lines.push(
        `<text x="${padX}" y="${curY + 15}" font-size="15" font-weight="600" fill="#1a1a1a">${escXml(props.title)}</text>`,
      )
      curY += 22
    }
    if (props.subtitle) {
      lines.push(`<text x="${padX}" y="${curY + 12}" font-size="12" fill="#71717a">${escXml(props.subtitle)}</text>`)
      curY += 18
    }
    if (titleH > 0)
      curY += 8

    // 图例（简单估算每项宽度）
    const showLeg = props.showLegend && legendItems.value.length > 0
    const drawSvgLegend = (offsetY: number) => {
      if (!showLeg)
        return ''
      let lx = padX
      const dotSize = 10
      const charW = 7.5
      const itemParts: string[] = []
      legendItems.value.forEach((item) => {
        const shape
          = props.type === 'line'
            ? `<circle cx="${lx + 5}" cy="${offsetY + 5}" r="5" fill="${item.color}"/>`
            : `<rect x="${lx}" y="${offsetY}" width="${dotSize}" height="${dotSize}" rx="2" fill="${item.color}"/>`
        const textX = lx + dotSize + 6
        itemParts.push(shape)
        itemParts.push(
          `<text x="${textX}" y="${offsetY + dotSize - 1}" font-size="12" fill="#71717a">${escXml(item.name)}</text>`,
        )
        lx += dotSize + 6 + item.name.length * charW + 16
      })
      return itemParts.join('\n')
    }

    if (showLeg && props.legendPosition === 'top') {
      lines.push(drawSvgLegend(curY + 6))
      curY += legendHeightPx
    }

    // 嵌入图表 SVG（用 foreignObject 或直接 <svg> 嵌套）
    // 提取内部 SVG 内容并包裹进嵌套 svg
    const innerContent = innerSvgStr.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')
    lines.push(`<svg x="${padX}" y="${curY}" width="${chartW}" height="${chartH}" xmlns="http://www.w3.org/2000/svg">`)
    lines.push(innerContent)
    lines.push('</svg>')
    curY += chartH

    if (showLeg && props.legendPosition === 'bottom') {
      lines.push(drawSvgLegend(curY + 6))
    }

    lines.push('</svg>')
    return lines.join('\n')
  }

  /**
   * 导出图表。
   *
   * @param format 'png' 走 Canvas 绘制；'svg' 输出矢量文件
   */
  function downloadAs(format: ChartDownloadFormat) {
    downloadMenuVisible.value = false
    const svgEl = getSvgElement()
    if (!svgEl)
      return

    const scale = Math.max(window.devicePixelRatio || 2, 2)
    const padX = EXPORT_PAD_X // 左右内边距
    const padTop = EXPORT_PAD_TOP // 顶部内边距
    const padBot = EXPORT_PAD_BOTTOM // 底部内边距

    // ---- 计算各区域尺寸 ----
    const chartW = svgEl.clientWidth || Number.parseInt(svgEl.getAttribute('width') || '600')
    const chartH = svgEl.clientHeight || Number.parseInt(svgEl.getAttribute('height') || '300')
    const totalW = chartW + padX * 2

    // 标题区高度
    let titleH = 0
    if (props.title)
      titleH += 22
    if (props.subtitle)
      titleH += 18
    if (titleH > 0)
      titleH += 16 // 上下 padding

    // 图例区高度（top/bottom 方向才单独占高度）
    const showLeg = props.showLegend && legendItems.value.length > 0
    const legIsHoriz = props.legendPosition === 'top' || props.legendPosition === 'bottom'
    let legendHeightPx = 0
    if (showLeg && legIsHoriz)
      legendHeightPx = EXPORT_LEGEND_H

    const totalH = padTop + titleH + legendHeightPx + chartH + padBot

    // ---- 构建 SVG 字符串（注入内联样式）----
    const serializer = new XMLSerializer()
    const svgClone = svgEl.cloneNode(true) as SVGSVGElement
    svgClone.setAttribute('width', String(chartW))
    svgClone.setAttribute('height', String(chartH))
    const inlineStyle = document.createElementNS('http://www.w3.org/2000/svg', 'style')
    inlineStyle.textContent = `
    text { font-family: ${EXPORT_FONT_FAMILY}; }
    .easy-chart__grid-line { stroke: #f1f1f4; stroke-width: 1; }
    .easy-chart__axis-line { stroke: #e4e4e7; stroke-width: 1; }
    .easy-chart__axis-text { font-size: 11px; fill: #a1a1aa; }
    .easy-chart__tooltip-line { display: none; }
  `
    svgClone.insertBefore(inlineStyle, svgClone.firstChild)
    const svgStr = serializer.serializeToString(svgClone)

    if (format === 'svg') {
      // SVG 格式：构建一个包含标题+图例+图表的完整 SVG
      const fullSvg = buildFullSvg(totalW, totalH, padX, padTop, titleH, legendHeightPx, chartW, chartH, svgStr)
      const blob = new Blob([fullSvg], { type: 'image/svg+xml;charset=utf-8' })
      triggerDownload(URL.createObjectURL(blob), getDownloadFileName('svg'))
      return
    }

    // PNG 格式：Canvas 绘制
    const svgBlob = new Blob([svgStr], { type: 'image/svg+xml;charset=utf-8' })
    const svgUrl = URL.createObjectURL(svgBlob)
    const svgImg = new Image()

    svgImg.onload = () => {
      const canvas = document.createElement('canvas')
      canvas.width = totalW * scale
      canvas.height = totalH * scale
      const ctx2d = canvas.getContext('2d')!
      ctx2d.scale(scale, scale)

      // 白色背景
      ctx2d.fillStyle = '#ffffff'
      ctx2d.fillRect(0, 0, totalW, totalH)

      let curY = padTop

      // 绘制标题
      if (props.title) {
        ctx2d.font = `600 15px ${EXPORT_FONT_FAMILY}`
        ctx2d.fillStyle = '#1a1a1a'
        ctx2d.fillText(props.title, padX, curY + 15)
        curY += 22
      }
      if (props.subtitle) {
        ctx2d.font = `12px ${EXPORT_FONT_FAMILY}`
        ctx2d.fillStyle = '#71717a'
        ctx2d.fillText(props.subtitle, padX, curY + 12)
        curY += 18
      }
      if (titleH > 0)
        curY += 8

      // 绘制图例（top 时在图表前，bottom 时在图表后暂存）
      const drawLegend = (offsetY: number) => {
        if (!showLeg)
          return
        let lx = padX
        const dotSize = 10
        const gap = 6
        const itemGap = 16
        ctx2d.font = `12px ${EXPORT_FONT_FAMILY}`
        legendItems.value.forEach((item) => {
          // 圆点
          ctx2d.fillStyle = item.color
          ctx2d.beginPath()
          if (props.type === 'line') {
            ctx2d.arc(lx + dotSize / 2, offsetY + dotSize / 2, dotSize / 2, 0, Math.PI * 2)
          }
          else {
            roundRect(ctx2d, lx, offsetY, dotSize, dotSize, 2)
          }
          ctx2d.fill()
          // 文字
          ctx2d.fillStyle = '#71717a'
          const labelW = ctx2d.measureText(item.name).width
          ctx2d.fillText(item.name, lx + dotSize + gap, offsetY + dotSize - 1)
          lx += dotSize + gap + labelW + itemGap
        })
      }

      if (showLeg && props.legendPosition === 'top') {
        drawLegend(curY + 6)
        curY += legendHeightPx
      }

      // 绘制 SVG 图表
      ctx2d.drawImage(svgImg, padX, curY, chartW, chartH)
      URL.revokeObjectURL(svgUrl)
      curY += chartH

      if (showLeg && props.legendPosition === 'bottom') {
        curY += 6
        drawLegend(curY)
      }

      canvas.toBlob((blob) => {
        if (blob)
          triggerDownload(URL.createObjectURL(blob), getDownloadFileName('png'))
      }, 'image/png')
    }
    svgImg.src = svgUrl
  }

  onMounted(() => {
    document.addEventListener('click', onClickOutsideDownload)
  })

  onUnmounted(() => {
    document.removeEventListener('click', onClickOutsideDownload)
  })

  return {
    downloadRef,
    downloadMenuVisible,
    toggleDownloadMenu,
    onClickOutsideDownload,
    getSvgElement,
    getDownloadFileName,
    downloadAs,
  }
}
