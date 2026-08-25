<script setup lang="ts">
import type { TimelineProps } from './types'

import { useTimeline } from './use-timeline'

// 保持对外类型导出兼容（原定义在 timeline.ts，现转发自 types.ts）
export type { TimelineProps } from './types'

defineOptions({
  name: 'EasyTimeline',
})

const props = withDefaults(defineProps<TimelineProps>(), {
  direction: 'vertical',
  reverse: false,
  customClass: '',
})

useTimeline(props)
</script>

<template>
  <div class="easy-timeline" :class="[`easy-timeline--${direction}`]">
    <slot />
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 timeline-style.scss） -->
<style scoped src="./timeline-style.scss" lang="scss"></style>
