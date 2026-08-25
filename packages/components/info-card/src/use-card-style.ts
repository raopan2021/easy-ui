import type { InfoCardResolvedProps } from './types'

import { computed } from 'vue'

/**
 * 信息卡片样式派生：状态类名 + 自定义配色行内样式（纯 props 派生，无副作用）。
 *
 * 将原本内联在 info-card.vue 中的一组 computed 抽离为独立 composable，
 * 便于单测复用，并让 .vue 仅承担「组合 + 模板」职责
 * （对齐 markdown / progress 拆分规范）。行为与原实现完全一致。
 *
 * 配色优先级统一为：更具体的专用色（titleColor / descriptionColor / statusXxxColor）
 * 优先于全局 textColor；两者都未传时返回空对象，交由 SCSS 中的默认样式生效。
 *
 * @param props 信息卡片 props（withDefaults 处理后的响应式对象）
 */
export function useInfoCardStyle(props: InfoCardResolvedProps) {
  /** 根节点状态类名（可点击 / 带边框） */
  const cardClass = computed(() => [
    {
      'is-clickable': props.clickable,
      'is-bordered': props.bordered,
    },
  ])

  /** 根节点行内样式（自定义背景色 / 文字色 / 圆角，数值圆角自动补 px） */
  const cardStyle = computed(() => {
    const style: Record<string, string> = {}
    if (props.backgroundColor) {
      style.backgroundColor = props.backgroundColor
    }
    if (props.textColor) {
      style.color = props.textColor
    }
    if (props.radius !== undefined) {
      style.borderRadius = typeof props.radius === 'number' ? `${props.radius}px` : props.radius
    }
    return style
  })

  /** 标题文字颜色（titleColor 优先，其次继承 textColor） */
  const titleStyle = computed(() => {
    if (props.titleColor) {
      return { color: props.titleColor }
    }
    if (props.textColor) {
      return { color: props.textColor }
    }
    return {}
  })

  /** 标题前图标颜色（与标题保持一致的取色规则） */
  const iconStyle = computed(() => {
    if (props.titleColor) {
      return { color: props.titleColor }
    }
    if (props.textColor) {
      return { color: props.textColor }
    }
    return {}
  })

  /** 描述文字颜色（descriptionColor 优先；退化到 textColor 时降透明度以区分主次） */
  const descStyle = computed(() => {
    if (props.descriptionColor) {
      return { color: props.descriptionColor }
    }
    if (props.textColor) {
      return { color: props.textColor, opacity: '0.7' }
    }
    return {}
  })

  /** 描述项前小圆点颜色（与描述文字同源，但用作背景色） */
  const dotStyle = computed(() => {
    if (props.descriptionColor) {
      return { backgroundColor: props.descriptionColor }
    }
    if (props.textColor) {
      return { backgroundColor: props.textColor }
    }
    return {}
  })

  /** 状态标签行内样式（自定义背景色 / 文字色，未传时由 statusType 预设配色生效） */
  const statusStyle = computed(() => {
    const style: Record<string, string> = {}
    if (props.statusBackgroundColor) {
      style.backgroundColor = props.statusBackgroundColor
    }
    if (props.statusTextColor) {
      style.color = props.statusTextColor
    }
    return style
  })

  return { cardClass, cardStyle, titleStyle, iconStyle, descStyle, dotStyle, statusStyle }
}
