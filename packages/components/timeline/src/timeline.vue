<script setup lang="ts">
import { computed, provide, ref, useSlots } from 'vue'

import { timelineProps } from './timeline'

defineOptions({
  name: 'EasyTimeline',
})

const props = defineProps(timelineProps)

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
</script>

<template>
  <div class="easy-timeline" :class="[`easy-timeline--${direction}`]">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.easy-timeline {
  &.easy-timeline--vertical {
    padding-left: 0;
  }

  &.easy-timeline--horizontal {
    display: flex;
    align-items: flex-start;
    width: 100%;

    :deep(.easy-timeline-item) {
      flex: 1;
    }
  }
}
</style>
