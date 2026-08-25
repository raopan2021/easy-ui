import type { GutterInjection } from '../../row/src/types'

import type { ColProps } from './types'
import { computed, inject, ref } from 'vue'
import { ROW_GUTTER_KEY } from '../../row/src/types'

/**
 * 栅格布局类与样式计算（纯 props / inject 派生，无副作用）。
 *
 * 将原本内联在 col.vue 中的 computed（colClasses / colStyle）与 gutter 注入
 * 抽离为独立 composable，便于单测复用，也让 .vue 仅承担「组合 + 模板」职责
 * （对齐 markdown 组件拆分规范）。
 *
 * @param props Col 组件 props（需传入响应式对象，computed 会自动追踪依赖）
 */
export function useCol(props: ColProps) {
  // 从 Row 注入的 gutter（缺省为 0，等价于无间距）
  const gutter = inject<GutterInjection>(ROW_GUTTER_KEY, ref({ horizontal: 0, vertical: 0 }))

  /** 根节点栅格类名：基础 span + offset/push/pull + 各响应式断点 */
  const colClasses = computed<string[]>(() => {
    const classes: string[] = [`easy-col--${props.span}`]

    if (props.offset)
      classes.push(`easy-col--offset-${props.offset}`)
    if (props.push)
      classes.push(`easy-col--push-${props.push}`)
    if (props.pull)
      classes.push(`easy-col--pull-${props.pull}`)

    // 响应式断点：number 直接生成栅格类，object 展开生成 span/offset/push/pull
    const breakpoints: (keyof ColProps)[] = ['xs', 'sm', 'md', 'lg', 'xl']
    for (const bp of breakpoints) {
      const val = props[bp]
      if (typeof val === 'number') {
        classes.push(`easy-col--${bp}-${val}`)
      }
      else if (val && typeof val === 'object') {
        if (val.span)
          classes.push(`easy-col--${bp}-${val.span}`)
        if (val.offset)
          classes.push(`easy-col--${bp}-offset-${val.offset}`)
        if (val.push)
          classes.push(`easy-col--${bp}-push-${val.push}`)
        if (val.pull)
          classes.push(`easy-col--${bp}-pull-${val.pull}`)
      }
    }

    return classes
  })

  /** 根节点行内样式（仅处理来自 Row 的水平 gutter 左右内边距） */
  const colStyle = computed<Record<string, string>>(() => {
    const style: Record<string, string> = {}
    const horizontalGutter = gutter.value.horizontal
    if (horizontalGutter > 0) {
      style.paddingLeft = `${horizontalGutter / 2}px`
      style.paddingRight = `${horizontalGutter / 2}px`
    }
    return style
  })

  return {
    colClasses,
    colStyle,
  }
}
