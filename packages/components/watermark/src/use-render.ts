import type { Ref } from 'vue'

import type { WatermarkResolvedOptions } from './types'
import { computed, nextTick, onBeforeUnmount, onMounted, watch } from 'vue'
import { isDarkMode } from './use-tile'

/** 渲染层依赖的上下文（由 watermark.vue 组合 tile composable 后注入） */
export interface WatermarkRenderContext {
  /** 水印容器节点 ref */
  containerRef: Ref<HTMLElement | null>
  /** 覆盖层 canvas 节点 ref */
  canvasRef: Ref<HTMLCanvasElement | null>
  /** 当前是否 dark 模式（由主题 observer 写入，驱动重绘） */
  isDark: Ref<boolean>
  /** 同步生成 tile（文字水印） */
  generateTileUrl: () => string
  /** 异步生成 tile（图片水印，等图片加载完成） */
  generateTileUrlAsync: () => Promise<string>
}

/**
 * 水印渲染与监听：tile 平铺绘制 + 尺寸/主题/防篡改三类监听 + 生命周期管理。
 *
 * 将原本内联在 watermark.vue 中的绘制流程（draw / drawTileToOverlay）、
 * 三个 observer 的创建与销毁、以及属性变化重绘的 watch 抽离为独立 composable，
 * 便于单测复用，并让 .vue 仅承担「组合 + 模板」职责
 * （对齐 markdown / progress 拆分规范）。行为与原实现完全一致。
 *
 * @param props 水印 props（withDefaults 处理后的响应式对象）
 * @param ctx 容器/画布 ref 与 tile 生成能力
 */
export function useWatermarkRender(props: WatermarkResolvedOptions, ctx: WatermarkRenderContext) {
  const { containerRef, canvasRef, isDark, generateTileUrl, generateTileUrlAsync } = ctx

  let mutationObserver: MutationObserver | null = null
  let resizeObserver: ResizeObserver | null = null
  let themeObserver: MutationObserver | null = null

  /**
   * 将 tile 以 repeat pattern 平铺绘制到覆盖层 canvas。
   *
   * canvas 像素尺寸按 devicePixelRatio 放大以适配高清屏；
   * tile 图片加载完成后再填充，避免 pattern 为空导致水印不显示。
   */
  function drawTileToOverlay(tileUrl: string) {
    if (!canvasRef.value || !containerRef.value || !tileUrl)
      return

    const canvas = canvasRef.value
    const container = containerRef.value
    const ratio = window.devicePixelRatio || 1

    canvas.width = container.offsetWidth * ratio
    canvas.height = container.offsetHeight * ratio

    const ctx2d = canvas.getContext('2d')!
    ctx2d.clearRect(0, 0, canvas.width, canvas.height)

    const img = new Image()
    img.onload = () => {
      ctx2d.clearRect(0, 0, canvas.width, canvas.height)
      const pat = ctx2d.createPattern(img, 'repeat')
      if (pat) {
        ctx2d.fillStyle = pat
        ctx2d.fillRect(0, 0, canvas.width, canvas.height)
      }
    }
    img.src = tileUrl
  }

  /**
   * 核心绘制流程：生成 tile → 平铺到覆盖层。
   *
   * 容器/画布未就绪或内容（content 与 image）均为空时直接返回，
   * 图片模式走异步生成以等待图片加载。
   */
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

  /** 覆盖层 canvas 的兜底行内样式串（供防篡改时还原被清除的样式） */
  function getCanvasStyleString(): string {
    return `position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; z-index: ${props.zIndex};`
  }

  /**
   * 防篡改：监听容器子节点与 style/class 变动。
   *
   * canvas 被移除时重新挂回容器，样式被清空时还原行内样式，最后统一重绘。
   * 仅在 preventDelete 开启时生效。
   */
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

  /** 监听容器尺寸变化：容器变大变小都需要重新平铺，避免水印缺角 */
  function initResizeObserver() {
    if (!containerRef.value)
      return
    resizeObserver = new ResizeObserver(() => draw())
    resizeObserver.observe(containerRef.value)
  }

  /** 监听主题切换（html.dark class），dark 状态真正变化时才重绘水印 */
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

  /** 监听属性变化：任一水印外观参数（含 dark 状态）变化后于下一帧重绘 */
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

  return { canvasStyle, relative, draw }
}
