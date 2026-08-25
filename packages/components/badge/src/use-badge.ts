import type { BadgeProps } from './badge'

import { computed } from 'vue'
import { colorMap } from './badge'

/**
 * 徽标展示逻辑：是否渲染、最终显示值、背景色。
 *
 * 将原本内联在 badge.vue 中的计算属性抽离为独立 composable，
 * 让 .vue 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 * 颜色映射复用 badge.ts 导出的 colorMap，避免重复定义。
 *
 * @param props 徽标组件 props（响应式对象，computed 会自动追踪依赖）
 */
export function useBadge(props: BadgeProps) {
  /** 是否渲染徽标：value 为空 / 为 0 且不显示零时隐藏 */
  const shouldShow = computed(() => {
    const v = props.value
    if (v === undefined || v === null)
      return false
    if (!props.showZero && (v === 0 || v === '0'))
      return false
    if (v === '')
      return false
    return true
  })

  /** 最终显示文本：数值超过 max 时附加 overflowText，非数值原样展示 */
  const finalValue = computed(() => {
    const max = props.max ?? 99
    const overflowText = props.overflowText ?? '+'
    const num = Number(props.value)
    if (!Number.isNaN(num)) {
      if (num > max)
        return `${max}${overflowText}`
      return num
    }
    return props.value
  })

  /** 徽标背景色：自定义 color 优先，其次按 type 取预设色，缺省 danger */
  const badgeColor = computed(() => {
    const type = props.type ?? 'danger'
    return props.color || colorMap[type] || colorMap.danger
  })

  /** 徽标文本行内样式（背景色） */
  const textStyle = computed(() => ({
    backgroundColor: badgeColor.value,
  }))

  return {
    shouldShow,
    finalValue,
    textStyle,
  }
}
