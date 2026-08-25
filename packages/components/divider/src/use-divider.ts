import type { DividerProps } from './divider'

import { computed } from 'vue'

/**
 * 分割线样式与文本定位逻辑（纯 props 派生，无副作用）。
 *
 * 将原本内联在 divider.vue 中的 computed 抽离为独立 composable，
 * 让 .vue 仅承担「组合 + 模板」职责（对齐 markdown / progress 组件拆分规范）。
 *
 * @param props 分割线 props（需传入响应式对象，computed 会自动追踪依赖）
 */
export function useDivider(props: DividerProps) {
  /** 是否为水平方向（direction 默认 horizontal） */
  const isHorizontal = computed(() => props.direction === 'horizontal')

  /** 根节点行内样式：边框线型 + 垂直/水平方向尺寸 */
  const dividerStyle = computed<Record<string, string>>(() => {
    const style: Record<string, string> = {
      borderTopStyle: props.borderStyle,
    }
    // 垂直分割线通过高度控制长度
    if (!isHorizontal.value && props.height) {
      style.height = props.height
    }
    // 水平分割线通过宽度控制长度
    if (isHorizontal.value && props.width) {
      style.width = props.width
    }
    return style
  })

  /** 文本内容定位类名（left / center / right） */
  const textClass = computed(() => [
    `easy-divider__text--${props.contentPosition}`,
  ])

  return {
    isHorizontal,
    dividerStyle,
    textClass,
  }
}
