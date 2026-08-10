<script setup lang="ts">
import { computed } from 'vue'

import { badgeProps } from './badge'

defineOptions({ name: 'EasyBadge' })

const props = defineProps(badgeProps)

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

const finalValue = computed(() => {
  const num = Number(props.value)
  if (!Number.isNaN(num)) {
    if (num > props.max)
      return props.max + props.overflowText
    return num
  }
  return props.value
})

const badgeColor = computed(() => {
  const colorMap: Record<string, string> = {
    primary: '#409eff',
    success: '#67c23a',
    warning: '#e6a23c',
    danger: '#f56c6c',
    info: '#909399',
  }
  return props.color || colorMap[props.type] || colorMap.danger
})

const textStyle = computed(() => ({
  backgroundColor: badgeColor.value,
}))
</script>

<template>
  <span class="easy-badge">
    <span v-if="shouldShow" class="badge-mark" :class="[position, { circle }]">
      <span class="badge-text" :style="textStyle">{{ finalValue }}</span>
    </span>
    <slot />
  </span>
</template>

<style>
.easy-badge {
  display: inline-flex;
  position: relative;
  vertical-align: middle;
}

.easy-badge .badge-mark {
  position: absolute;
  z-index: 100;
}

.easy-badge .badge-text {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  font-size: 12px;
  font-weight: bold;
  color: #fff;
  border: 2px solid #fff;
  box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
  white-space: nowrap;
}

.easy-badge .top-right {
  top: 0;
  right: 0;
  transform: translate(50%, -50%);
}
.easy-badge .top-left {
  top: 0;
  left: 0;
  transform: translate(-50%, -50%);
}
.easy-badge .bottom-right {
  bottom: 0;
  right: 0;
  transform: translate(50%, 50%);
}
.easy-badge .bottom-left {
  bottom: 0;
  left: 0;
  transform: translate(-50%, 50%);
}

.easy-badge .badge-mark.circle .badge-text {
  width: 20px;
  height: 20px;
  padding: 0;
  border-radius: 50% !important;
}
</style>
