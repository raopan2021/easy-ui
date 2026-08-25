import type { ModalProps, ModalSize } from './types'

import { computed } from 'vue'

/**
 * 弹窗布局与定位计算（纯 props 派生，无副作用）。
 *
 * 将原 modal.vue 中内联的 `sizeMap` / `parseOffset` / `maskStyle` /
 * `modalStyle` / `modalClass` 抽离为独立 composable，便于复用的同时，
 * 让 .vue 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 *
 * @param props 弹窗 props（需传入响应式对象，computed 会自动追踪依赖）
 */
export function useModalLayout(props: ModalProps) {
  /** size → 默认宽度映射 */
  const sizeMap: Record<ModalSize, string> = {
    small: '480px',
    default: '560px',
    large: '780px',
    fullscreen: '100%',
  }

  /**
   * 解析 offset 为 `{ x, y }` 字符串。
   * 支持字符串（x/y 同值）与对象（x/y 各自可选，缺省为 '0'）两种写法。
   */
  function parseOffset(): { x: string, y: string } {
    if (typeof props.offset === 'string') {
      return { x: props.offset, y: props.offset }
    }
    return {
      x: props.offset?.x ?? '0',
      y: props.offset?.y ?? '0',
    }
  }

  /**
   * 遮罩层 flex 对齐样式：根据 placement 决定水平/垂直对齐与内边距。
   * 例如 top-left 表示左上角对齐，center 表示居中，left/right 表示垂直居中。
   * 所有方向都保证最小 20px 内边距，避免弹窗贴边。
   */
  const maskStyle = computed<Record<string, string>>(() => {
    const p = props.placement ?? 'center'
    const { x, y } = parseOffset()
    const style: Record<string, string> = {}

    // 水平方向
    if (p.includes('left')) {
      style.justifyContent = 'flex-start'
      style.paddingLeft = x
    }
    else if (p.includes('right')) {
      style.justifyContent = 'flex-end'
      style.paddingRight = x
    }
    else {
      style.justifyContent = 'center'
    }

    // 垂直方向
    if (p.startsWith('top')) {
      style.alignItems = 'flex-start'
      style.paddingTop = y
    }
    else if (p.startsWith('bottom')) {
      style.alignItems = 'flex-end'
      style.paddingBottom = y
    }
    else if (p === 'left' || p === 'right') {
      style.alignItems = 'center'
    }
    else {
      // center：垂直居中
      style.alignItems = 'center'
    }

    // 基础 padding（仅当某方向未被 placement 覆盖时才填充）
    if (!style.paddingLeft)
      style.paddingLeft = '20px'
    if (!style.paddingRight)
      style.paddingRight = '20px'
    if (!style.paddingTop)
      style.paddingTop = '20px'
    if (!style.paddingBottom)
      style.paddingBottom = '20px'

    return style
  })

  /**
   * 弹窗主体行内样式：宽度以 `width` 优先，否则回退到 `sizeMap`。
   * fullscreen 时铺满并去除圆角。
   */
  const modalStyle = computed<Record<string, string>>(() => {
    const width = props.width ?? sizeMap[props.size as ModalSize]
    const style: Record<string, string> = {
      width: String(width),
    }
    if (props.size === 'fullscreen') {
      style.width = '100%'
      style.height = '100%'
      style.borderRadius = '0'
    }
    return style
  })

  /** 根节点组合类名（size + 自定义 class） */
  const modalClass = computed(() => [`easy-modal--${props.size}`, props.customClass])

  return {
    sizeMap,
    parseOffset,
    maskStyle,
    modalStyle,
    modalClass,
  }
}
