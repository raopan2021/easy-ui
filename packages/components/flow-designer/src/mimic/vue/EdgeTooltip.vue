<script setup lang="ts">
import type { EdgeTooltipEmits, EdgeTooltipProps } from './edge-tooltip-types'

import { useEdgeTooltip } from './use-edge-tooltip'

const props = withDefaults(defineProps<EdgeTooltipProps>(), {
  position: () => ({}),
  tooltipEdge: () => ({}),
})

const emit = defineEmits<EdgeTooltipEmits>()

const {
  options,
  descMap,
  iconMap,
  tooltipPosition,
  handleTooltipEnter,
  handleTooltipLeave,
  handleClick,
} = useEdgeTooltip(props, emit)

export type { EdgeTooltipEmits, EdgeTooltipProps } from './edge-tooltip-types'
</script>

<template>
  <div class="edge-tooltip" :style="tooltipPosition" @mouseenter="handleTooltipEnter" @mouseleave="handleTooltipLeave">
    <div v-for="(item, index) in options" :key="index" class="tooltip-item" @click="handleClick(item)">
      <span class="tooltip-icon" v-html="iconMap[item.icon]" />
      <div class="tooltip-text">
        <span class="tooltip-label">{{ item.label }}</span>
        <span class="tooltip-desc">{{ descMap[item.icon] }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped src="./edge-tooltip-style.scss" lang="scss"></style>
