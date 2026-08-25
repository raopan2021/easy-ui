import type { RowProps } from './types'

import { computed, provide } from 'vue'
import { ROW_GUTTER_KEY } from './types'

/**
 * Row 布局逻辑：间隔计算、向子组件（Col）注入 gutter、flex 排版类名与负边距。
 *
 * 将原本内联在 row.vue 中的 computed 与 provide 抽离为独立 composable，
 * 让 .vue 仅承担「组合 + 模板」职责（对齐 markdown / progress 组件拆分规范）。
 *
 * @param props Row props（需传入响应式对象，computed 会自动追踪依赖）
 */
export function useRow(props: RowProps) {
  /** 统一格式化 gutter 为 { horizontal, vertical }（响应式对象取各断点最大值） */
  const gutterValue = computed(() => {
    const g = props.gutter
    if (typeof g === 'number')
      return { horizontal: g, vertical: 0 }
    // 响应式对象取最大值（简化处理，实际应响应窗口变化）
    return { horizontal: g?.lg ?? g?.md ?? g?.sm ?? g?.xs ?? g?.xl ?? 0, vertical: 0 }
  })

  /** 向子组件（Col）注入间隔，供其计算左右 padding */
  provide(ROW_GUTTER_KEY, gutterValue)

  /** 根节点组合类名：标签类型 + justify / align 排版类 */
  const rowClasses = computed(() => [
    `easy-row--${props.tag === 'div' ? 'default' : props.tag}`,
    {
      'is-justify-start': props.justify === 'start',
      'is-justify-end': props.justify === 'end',
      'is-justify-center': props.justify === 'center',
      'is-justify-space-around': props.justify === 'space-around',
      'is-justify-space-between': props.justify === 'space-between',
      'is-justify-space-evenly': props.justify === 'space-evenly',
      'is-align-top': props.align === 'top',
      'is-align-middle': props.align === 'middle',
      'is-align-bottom': props.align === 'bottom',
      'is-align-stretch': props.align === 'stretch',
      'is-flex': props.justify || props.align,
    },
  ])

  /** 根节点行内样式：水平间隔时左右负边距（抵消 Col 的 padding） */
  const rowStyle = computed<Record<string, string>>(() => {
    const style: Record<string, string> = {}
    const horizontalGutter = gutterValue.value.horizontal
    if (horizontalGutter > 0) {
      style.marginLeft = `-${horizontalGutter / 2}px`
      style.marginRight = `-${horizontalGutter / 2}px`
    }
    return style
  })

  return {
    rowClasses,
    rowStyle,
  }
}
