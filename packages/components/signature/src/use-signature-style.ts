import type { SignatureProps } from './types'

import { computed } from 'vue'

/**
 * 签名板类名与行内样式派生（纯 props 派生，无副作用）。
 *
 * @param props 签名板 props（响应式对象）
 */
export function useSignatureStyle(props: SignatureProps) {
  /** 画布容器样式（宽度按需固定，高度始终固定） */
  const canvasWrapStyle = computed(() => {
    const style: Record<string, string> = {}
    if (props.width) {
      style.width = `${props.width}px`
    }
    style.height = `${props.height}px`
    return style
  })

  /** 根节点组合类名（禁用 / 无工具栏） */
  const signatureClass = computed(() => [
    {
      'is-disabled': props.disabled,
      'is-toolbar-hidden': !props.showToolbar,
    },
  ])

  /** 根节点行内样式（宽度 / 圆角） */
  const signatureStyle = computed(() => {
    const style: Record<string, string> = {}
    if (props.width) {
      style.width = `${props.width}px`
    }
    if (props.radius !== undefined) {
      style.borderRadius = `${props.radius}px`
    }
    return style
  })

  return {
    canvasWrapStyle,
    signatureClass,
    signatureStyle,
  }
}
