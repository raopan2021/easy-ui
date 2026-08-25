<script setup lang="ts">
import type { BadgeProps } from './badge'

import { useBadge } from './use-badge'

defineOptions({
  name: 'EasyBadge',
})

const props = withDefaults(defineProps<BadgeProps>(), {
  value: undefined,
  max: 99,
  overflowText: '+',
  type: 'danger',
  position: 'top-right',
  showZero: false,
  color: '',
  circle: false,
})

// 徽标展示逻辑抽离到 composable
const { shouldShow, finalValue, textStyle } = useBadge(props)

// 保持对外类型导出兼容（原定义在 badge.ts）
export type { BadgeProps } from './badge'
</script>

<template>
  <span class="easy-badge">
    <span v-if="shouldShow" class="badge-mark" :class="[position, { circle }]">
      <span class="badge-text" :style="textStyle">{{ finalValue }}</span>
    </span>
    <slot />
  </span>
</template>

<!-- 非 scoped 样式（全局 .easy-badge 作用域，按规则保持内联） -->
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
