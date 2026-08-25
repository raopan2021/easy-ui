import type { WatermarkResolvedOptions } from './types'

import { computed, ref } from 'vue'

/** dark 模式默认水印色（浅色，保证在深色背景上可辨识） */
const DARK_FONT_COLOR = 'rgba(255, 255, 255, 0.15)'

/** 组件默认水印色，用于判断用户是否显式自定义了颜色 */
const DEFAULT_FONT_COLOR = 'rgba(0, 0, 0, 0.15)'

/** 检测当前是否为 dark 模式（EP 通过 html.dark class 标记） */
export function isDarkMode(): boolean {
  return document.documentElement.classList.contains('dark')
}

/** 创建占位图片（用于图片水印 tile 的同步绘制） */
function createPlaceholderImage(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

/** 加载图片，返回 Promise */
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

/**
 * 水印 tile（单元图案）生成：dark 模式配色解析 + 文字/图片绘制。
 *
 * 将原本内联在 watermark.vue 中的 canvas 绘制逻辑抽离为独立 composable，
 * 便于单测复用，并让 .vue 仅承担「组合 + 模板」职责
 * （对齐 markdown / progress 拆分规范）。行为与原实现完全一致。
 *
 * tile 尺寸为「水印尺寸 + 间距」，绘制时先平移到 tile 中心（叠加 offset）
 * 再旋转，这样后续以 repeat pattern 平铺即可得到等距倾斜的水印阵列。
 *
 * @param props 水印 props（withDefaults 处理后的响应式对象）
 */
export function useWatermarkTile(props: WatermarkResolvedOptions) {
  /** 当前是否 dark 模式（由 use-render 的主题 observer 负责同步更新） */
  const isDark = ref(isDarkMode())

  /** 解析实际水印颜色：用户显式自定义则始终使用；否则 dark 模式自动用浅色 */
  const resolvedFontColor = computed(() => {
    if (props.fontColor && props.fontColor !== DEFAULT_FONT_COLOR)
      return props.fontColor
    return isDark.value ? DARK_FONT_COLOR : props.fontColor
  })

  /** 统一 content 为数组形式（过滤空串，便于多行居中排版） */
  function normalizeContent(): string[] {
    if (Array.isArray(props.content))
      return props.content.filter(Boolean)
    return props.content ? [props.content] : []
  }

  /**
   * 生成单个水印 tile 的 base64 图片（同步版本）。
   *
   * 图片模式下无法同步等待图片加载，因此绘制的是等尺寸空白占位
   * （真实图片由 generateTileUrlAsync 负责）；文字模式支持单行居中
   * 与多行垂直居中排列。文字内容为空时返回空串，调用方据此跳过绘制。
   */
  function generateTileUrl(): string {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const ratio = window.devicePixelRatio || 1

    const w = props.width
    const heightVal = props.height
    const gapX = props.gapX
    const gapY = props.gapY

    // canvas 尺寸 = 水印尺寸 + 间距
    canvas.width = (w + gapX) * ratio
    canvas.height = (heightVal + gapY) * ratio
    ctx.scale(ratio, ratio)

    // 移动到 tile 中心并旋转
    const tileCenterX = w / 2
    const tileCenterY = heightVal / 2
    ctx.translate(tileCenterX + (props.offset.x || 0), tileCenterY + (props.offset.y || 0))
    ctx.rotate((props.rotate * Math.PI) / 180)

    ctx.globalAlpha = props.opacity

    if (props.image) {
      // 图片水印 — 同步绘制已有缓存的图片，或用占位
      const imgW = props.imageWidth
      const imgH = heightVal
      ctx.drawImage(createPlaceholderImage(imgW, imgH), -imgW / 2, -imgH / 2, imgW, imgH)
    }
    else {
      // 文字水印
      const lines = normalizeContent()
      if (lines.length === 0)
        return ''

      ctx.font = `${props.fontWeight} ${props.fontSize}px ${props.fontFamily}`
      ctx.fillStyle = resolvedFontColor.value
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      if (lines.length === 1) {
        ctx.fillText(lines[0], 0, 0)
      }
      else {
        // 多行文字居中排列
        const lineHeight = props.fontSize * 1.4
        const totalHeight = lineHeight * lines.length
        const startY = -totalHeight / 2 + lineHeight / 2
        lines.forEach((line, i) => {
          ctx.fillText(line, 0, startY + i * lineHeight)
        })
      }
    }

    return canvas.toDataURL()
  }

  /**
   * 异步版本：生成图片水印 tile（等图片加载完成后再绘制）。
   *
   * 图片按 imageWidth 等比缩放；加载失败时降级为首行文字水印，
   * 保证水印不会因图片 404 / 跨域而整体消失。非图片模式直接复用同步版本。
   */
  async function generateTileUrlAsync(): Promise<string> {
    if (!props.image)
      return generateTileUrl()

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const ratio = window.devicePixelRatio || 1

    const w = props.width
    const heightVal = props.height
    const gapX = props.gapX
    const gapY = props.gapY

    canvas.width = (w + gapX) * ratio
    canvas.height = (heightVal + gapY) * ratio
    ctx.scale(ratio, ratio)

    const tileCenterX = w / 2
    const tileCenterY = heightVal / 2
    ctx.translate(tileCenterX + (props.offset.x || 0), tileCenterY + (props.offset.y || 0))
    ctx.rotate((props.rotate * Math.PI) / 180)
    ctx.globalAlpha = props.opacity

    try {
      const img = await loadImage(props.image)
      const imgW = props.imageWidth
      const imgH = (img.naturalHeight / img.naturalWidth) * imgW
      ctx.drawImage(img, -imgW / 2, -imgH / 2, imgW, imgH)
    }
    catch {
      // 图片加载失败，fallback 到文字
      const lines = normalizeContent()
      if (lines.length > 0) {
        ctx.font = `${props.fontWeight} ${props.fontSize}px ${props.fontFamily}`
        ctx.fillStyle = resolvedFontColor.value
        ctx.textAlign = 'center'
        ctx.textBaseline = 'middle'
        ctx.fillText(lines[0] || 'Watermark', 0, 0)
      }
    }

    return canvas.toDataURL()
  }

  return { isDark, resolvedFontColor, normalizeContent, generateTileUrl, generateTileUrlAsync }
}
