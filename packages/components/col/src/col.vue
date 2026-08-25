<script setup lang="ts">
import type { ColProps } from './types'

import { useCol } from './use-col'

defineOptions({ name: 'EasyCol' })

const props = withDefaults(defineProps<ColProps>(), {
  span: 24,
  offset: undefined,
  push: undefined,
  pull: undefined,
})

// ──── 布局类 / 样式（gutter 注入 + 派生计算抽离到 composable）────
const { colClasses, colStyle } = useCol(props)

// 保持对外类型导出兼容（原内联定义于 col.vue）
export type { ColBreakpoint, ColProps } from './types'
</script>

<template>
  <div class="easy-col" :class="colClasses" :style="colStyle">
    <slot />
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 col-style.scss） -->
<style scoped src="./col-style.scss" lang="scss"></style>
