import type { SignatureProps } from './types'

import { onMounted, onUnmounted, ref } from 'vue'

/** light 模式默认笔画色 */
export const DEFAULT_PEN_COLOR = '#1a1a2e'
/** dark 模式默认笔画色（浅色，保证在深色画布上可辨识） */
export const DARK_PEN_COLOR = '#e4e4e7'

/** 工具栏预设画笔颜色 */
export const PEN_COLORS = ['#1a1a2e', '#000000', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
/** 工具栏预设画笔粗细（像素） */
export const PEN_SIZES = [1, 2, 4, 6]

/**
 * 画笔状态：颜色 / 粗细，以及暗色模式下默认笔画色的自动跟随。
 *
 * 将原本内联在 signature.vue 中的画笔状态与主题监听抽离为独立 composable，
 * 让 .vue 仅承担「组合 + 模板」职责（对齐 markdown / progress 拆分规范）。
 * 行为与原实现一致：用户显式自定义 penColor 时始终使用该颜色；
 * 否则监听 html.dark class 变化，在明暗主题间切换默认笔画色。
 *
 * @param props 签名板 props（响应式对象）
 */
export function useSignaturePen(props: SignatureProps) {
  /** 当前是否处于暗色模式（以 html.dark class 为准） */
  function isDarkMode(): boolean {
    return document.documentElement.classList.contains('dark')
  }

  /** 解析默认笔画色：用户显式自定义则始终使用；否则 dark 模式自动用浅色 */
  function resolvePenColor(): string {
    if (props.penColor && props.penColor !== DEFAULT_PEN_COLOR)
      return props.penColor
    return isDarkMode() ? DARK_PEN_COLOR : DEFAULT_PEN_COLOR
  }

  /** 当前画笔颜色 */
  const currentPenColor = ref(resolvePenColor())
  /** 当前画笔粗细（props.penSize 由 withDefaults 保证有值，兜底与默认值一致） */
  const currentPenSize = ref(props.penSize ?? 2)

  /** 主题切换监听（dark class 变化时更新默认笔画色） */
  let themeObserver: MutationObserver | null = null

  onMounted(() => {
    themeObserver = new MutationObserver(() => {
      if (!props.penColor || props.penColor === DEFAULT_PEN_COLOR) {
        currentPenColor.value = resolvePenColor()
      }
    })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  })

  onUnmounted(() => {
    themeObserver?.disconnect()
  })

  /** 设置画笔颜色 */
  function setPenColor(color: string) {
    currentPenColor.value = color
  }

  /** 设置画笔粗细 */
  function setPenSize(size: number) {
    currentPenSize.value = size
  }

  return {
    penColors: PEN_COLORS,
    penSizes: PEN_SIZES,
    currentPenColor,
    currentPenSize,
    setPenColor,
    setPenSize,
  }
}

/** 画笔状态上下文（供绘制 composable 复用） */
export type SignaturePen = ReturnType<typeof useSignaturePen>
