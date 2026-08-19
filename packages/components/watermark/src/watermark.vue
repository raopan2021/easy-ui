<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

defineOptions({ name: 'EasyWatermark' })

const props = withDefaults(defineProps<WatermarkOptions>(), {
  content: '',
  image: '',
  fullPage: true,
  rotate: -22,
  width: 120,
  height: 64,
  fontSize: 14,
  fontColor: 'rgba(0, 0, 0, 0.15)',
  fontFamily: 'sans-serif',
  fontWeight: 'normal',
  opacity: 1,
  gapX: 100,
  gapY: 100,
  offset: () => ({}),
  imageWidth: 120,
  preventDelete: false,
  zIndex: 9,
})

export interface WatermarkOptions {
  /** 水印文字内容，支持多行（数组形式） */
  content?: string | string[]
  /** 水印图片 URL（与 content 二选一，图片优先） */
  image?: string
  /** 是否让水印作为容器背景（false 时水印覆盖在内容上方），默认 true */
  fullPage?: boolean
  /** 水印旋转角度，单位度，默认 -22 */
  rotate?: number
  /** 单个水印区域宽度，单位 px，默认 120 */
  width?: number
  /** 单个水印区域高度，单位 px，默认 64（文字）或按图片比例 */
  height?: number
  /** 字体大小，单位 px，默认 14 */
  fontSize?: number
  /** 字体颜色，默认 rgba(0, 0, 0, 0.15) */
  fontColor?: string
  /** 字体族，默认 'sans-serif' */
  fontFamily?: string
  /** 字体粗细，默认 'normal' */
  fontWeight?: string
  /** 水印整体透明度 0~1，默认 1 */
  opacity?: number
  /** 水印之间水平间距，单位 px，默认 100 */
  gapX?: number
  /** 水印之间垂直间距，单位 px，默认 100 */
  gapY?: number
  /** 水印区域在画布中的偏移量 */
  offset?: { x?: number, y?: number }
  /** 图片水印宽度（仅在 image 模式下生效），默认 120 */
  imageWidth?: number
  /** 是否防篡改（监听 DOM 变动自动重建水印），默认 false */
  preventDelete?: boolean
  /** z-index，默认 9 */
  zIndex?: number
}

const containerRef = ref<HTMLElement | null>(null)
const canvasRef = ref<HTMLCanvasElement | null>(null)

let mutationObserver: MutationObserver | null = null
let resizeObserver: ResizeObserver | null = null
let themeObserver: MutationObserver | null = null

/** dark 模式默认水印色（浅色，保证在深色背景上可辨识） */
const DARK_FONT_COLOR = 'rgba(255, 255, 255, 0.15)'

/** 检测当前是否为 dark 模式（EP 通过 html.dark class 标记） */
function isDarkMode(): boolean {
  return document.documentElement.classList.contains('dark')
}

const isDark = ref(isDarkMode())

/** 解析实际水印颜色：用户显式自定义则始终使用；否则 dark 模式自动用浅色 */
const resolvedFontColor = computed(() => {
  if (props.fontColor && props.fontColor !== 'rgba(0, 0, 0, 0.15)')
    return props.fontColor
  return isDark.value ? DARK_FONT_COLOR : props.fontColor
})

/** 统一 content 为数组形式 */
function normalizeContent(): string[] {
  if (Array.isArray(props.content))
    return props.content.filter(Boolean)
  return props.content ? [props.content] : []
}

/** 生成单个水印 tile 的 base64 图片 */
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

/** 创建占位图片（用于图片水印 tile 的同步绘制） */
function createPlaceholderImage(w: number, h: number): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return c
}

/** 异步版本：生成图片水印 tile（图片加载后绘制） */
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

/** 将 tile 平铺绘制到覆盖层 canvas */
function drawTileToOverlay(tileUrl: string) {
  if (!canvasRef.value || !containerRef.value || !tileUrl)
    return

  const canvas = canvasRef.value
  const container = containerRef.value
  const ratio = window.devicePixelRatio || 1

  canvas.width = container.offsetWidth * ratio
  canvas.height = container.offsetHeight * ratio

  const ctx = canvas.getContext('2d')!
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const img = new Image()
  img.onload = () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    const pat = ctx.createPattern(img, 'repeat')
    if (pat) {
      ctx.fillStyle = pat
      ctx.fillRect(0, 0, canvas.width, canvas.height)
    }
  }
  img.src = tileUrl
}

/** 核心绘制流程 */
async function draw() {
  if (!canvasRef.value || !containerRef.value)
    return

  // 检查内容是否有效
  const hasContent = props.content || props.image
  if (!hasContent)
    return

  let tileUrl: string
  if (props.image) {
    tileUrl = await generateTileUrlAsync()
  }
  else {
    tileUrl = generateTileUrl()
  }

  drawTileToOverlay(tileUrl)
}

/** 防篡改：监听 DOM 变动自动重建 */
function initMutationObserver() {
  if (!props.preventDelete)
    return

  mutationObserver = new MutationObserver(() => {
    if (containerRef.value && canvasRef.value) {
      if (!containerRef.value.contains(canvasRef.value)) {
        containerRef.value.appendChild(canvasRef.value)
      }
      // 防止样式被清除
      canvasRef.value.style.cssText = getCanvasStyleString()
    }
    draw()
  })

  mutationObserver.observe(containerRef.value!, {
    childList: true,
    subtree: false,
    attributes: true,
    attributeFilter: ['style', 'class'],
  })
}

function getCanvasStyleString(): string {
  return `position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: ${props.zIndex};`
}

/** 监听容器尺寸变化 */
function initResizeObserver() {
  if (!containerRef.value)
    return
  resizeObserver = new ResizeObserver(() => draw())
  resizeObserver.observe(containerRef.value)
}

/** 监听主题切换（html.dark class），变化时重绘水印 */
function initThemeObserver() {
  themeObserver = new MutationObserver(() => {
    const next = isDarkMode()
    if (next !== isDark.value) {
      isDark.value = next
      nextTick(draw)
    }
  })
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['class'],
  })
}

/** Canvas 样式 */
const canvasStyle = computed(() => ({
  zIndex: props.zIndex,
  position: 'absolute' as const,
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
}))

/** 是否需要 position: relative */
const relative = computed(() => props.fullPage)

/** 监听属性变化 */
watch(
  () => [
    props.content,
    props.image,
    props.rotate,
    props.width,
    props.height,
    props.fontSize,
    props.fontColor,
    props.fontFamily,
    props.fontWeight,
    props.opacity,
    props.gapX,
    props.gapY,
    props.imageWidth,
    props.zIndex,
    props.offset,
    isDark,
  ],
  () => nextTick(draw),
  { deep: true },
)

onMounted(() => {
  nextTick(() => {
    draw()
    initResizeObserver()
    initMutationObserver()
    initThemeObserver()
  })
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  mutationObserver?.disconnect()
  themeObserver?.disconnect()
})

/** 暴露重绘方法 */
defineExpose({ redraw: draw })
</script>

<template>
  <div ref="containerRef" class="easy-watermark" :style="{ position: relative ? 'relative' : undefined }">
    <slot />
    <canvas ref="canvasRef" class="easy-watermark__canvas" :style="canvasStyle" />
  </div>
</template>

<style scoped lang="scss">
.easy-watermark {
  .easy-watermark__canvas {
    pointer-events: none;
  }
}
</style>
