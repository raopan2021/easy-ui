<script setup lang="ts">
import type { RowProps } from './types'

import { useRow } from './use-row'

defineOptions({ name: 'EasyRow' })

const props = withDefaults(defineProps<RowProps>(), {
  gutter: 0,
  justify: undefined,
  align: undefined,
  tag: 'div',
})

const { rowClasses, rowStyle } = useRow(props)

// 保持对外类型导出兼容（原定义在 row.vue，现统一收敛到 types.ts）
export type { RowProps } from './types'
</script>

<template>
  <div class="easy-row" :class="rowClasses" :style="rowStyle">
    <slot />
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 row-style.scss） -->
<style scoped src="./row-style.scss" lang="scss"></style>
