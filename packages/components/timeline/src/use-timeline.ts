import type { TimelineProps } from './types'

import { computed, provide, ref, useSlots } from 'vue'

/**
 * 时间线（Timeline）容器逻辑：统计子节点数量、构建并向下提供时间线上下文。
 *
 * 将原本内联在 timeline.vue 中的计算属性与 provide 抽离为独立 composable，
 * 便于单测复用，也让 .vue 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 *
 * @param props 响应式 props（需传入 withDefaults 后的对象）
 */
export function useTimeline(props: TimelineProps) {
  const slots = useSlots()

  // 计算子节点数量
  const items = computed(() => {
    if (!slots.default)
      return []
    return slots.default().filter((vnode) => {
      return vnode.component?.type?.name === 'EasyTimelineItem'
    })
  })

  const itemCount = computed(() => items.value.length)

  // 提供时间线上下文给子组件
  const timelineContext = ref({
    direction: computed(() => props.direction),
    reverse: computed(() => props.reverse),
    itemCount,
  })

  provide('easy-timeline', timelineContext)
}
