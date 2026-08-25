<script setup lang="ts">
import type { TimelineItemProps } from './types'

import EasyIcon from '../../icon'
import { useTimelineItem } from './use-timeline-item'

// 保持对外类型导出兼容（原定义在 timeline-item.ts，现转发自 types.ts）
export type { TimelineItemProps } from './types'

defineOptions({
  name: 'EasyTimelineItem',
})

const props = withDefaults(defineProps<TimelineItemProps>(), {
  status: 'finish',
  timestamp: '',
  icon: '',
})

const { computedDirection, isLastItem, displayIcon, nodeIconSize } = useTimelineItem(props)
</script>

<template>
  <div class="easy-timeline-item" :class="[`easy-timeline-item--${status}`, `easy-timeline-item--${computedDirection}`]">
    <!-- 连接线 -->
    <div v-if="!isLastItem" class="easy-timeline-item__line" />

    <!-- 时间线节点 -->
    <div class="easy-timeline-item__node" :class="[`easy-timeline-item__node--${status}`]">
      <!-- 自定义插槽（最高优先级） -->
      <slot v-if="$slots.dot" name="dot" />

      <!-- 图标（支持自定义或默认状态图标） -->
      <EasyIcon v-else-if="displayIcon" :name="displayIcon" :size="nodeIconSize" />
    </div>

    <!-- 内容区域 -->
    <div class="easy-timeline-item__content">
      <div v-if="$slots.timestamp || timestamp" class="easy-timeline-item__timestamp">
        <slot name="timestamp">
          {{ timestamp }}
        </slot>
      </div>
      <div class="easy-timeline-item__body">
        <slot />
      </div>
    </div>
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 timeline-item-style.scss） -->
<style scoped src="./timeline-item-style.scss" lang="scss"></style>
