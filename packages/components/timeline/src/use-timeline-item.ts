import type { TimelineItemProps } from './types'

import { computed, inject } from 'vue'

/**
 * 时间线项（TimelineItem）逻辑：读取父级上下文、按状态推导默认图标、计算节点尺寸。
 *
 * 将原本内联在 timeline-item.vue 中的计算属性抽离为独立 composable，
 * 便于单测复用，也让 .vue 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 *
 * @param props 响应式 props（需传入 withDefaults 后的对象）
 */
export function useTimelineItem(props: TimelineItemProps) {
  // 获取父组件上下文
  const timeline = inject<{
    direction: { value: string }
    reverse: { value: boolean }
    itemCount: { value: number }
  }>('easy-timeline', {
    direction: { value: 'vertical' },
    reverse: { value: false },
    itemCount: { value: 1 },
  })

  const computedDirection = computed(() => {
    return timeline?.direction?.value || 'vertical'
  })

  const isLastItem = computed(() => {
    return false
  })

  // 根据状态获取默认图标
  const defaultIconByStatus = computed(() => {
    switch (props.status) {
      case 'finish':
        return 'el:Check'
      case 'error':
        return 'el:Close'
      case 'process':
        return 'el:Loading'
      case 'wait':
      default:
        return ''
    }
  })

  // 显示的图标：优先使用传入的 icon，否则使用状态默认图标
  const displayIcon = computed(() => {
    return props.icon || defaultIconByStatus.value
  })

  // 节点图标尺寸
  const nodeIconSize = computed(() => {
    return 12
  })

  return {
    computedDirection,
    isLastItem,
    displayIcon,
    nodeIconSize,
  }
}
