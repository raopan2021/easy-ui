<script setup lang="ts">
import type { TagEmits } from './tag'

import { tagProps } from './tag'
import { useTag } from './use-tag'

defineOptions({ name: 'EasyTag' })

const props = defineProps(tagProps)
const emit = defineEmits<TagEmits>()

const { visible, tagClass, tagStyle, handleClick, handleClose, show } = useTag(props, emit)

defineExpose({ show })
</script>

<template>
  <span v-if="visible" class="easy-tag" :class="tagClass" :style="tagStyle" @click="handleClick">
    <!-- 前置图标 -->
    <span v-if="icon" class="easy-tag__icon">
      <el-icon>
        <component :is="icon" />
      </el-icon>
    </span>

    <!-- 标签文字 -->
    <span class="easy-tag__text">
      <slot />
    </span>

    <!-- 关闭按钮 -->
    <span v-if="closable" class="easy-tag__close" @click.stop="handleClose">
      <svg
        viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2.5"
        stroke-linecap="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </span>
  </span>
</template>

<!-- 组件核心样式（scoped，独立维护在 tag-style.scss） -->
<style scoped src="./tag-style.scss" lang="scss"></style>

<!-- 暗色模式覆盖（非 scoped，全局 html.dark 作用域） -->
<style lang="scss">
/* ========== Dark Mode ========== */
html.dark .easy-tag--default.easy-tag--light {
  color: var(--el-text-color-secondary);
  background-color: var(--el-fill-color);
  border-color: var(--el-border-color);
}
html.dark .easy-tag--default.easy-tag--dark {
  background-color: var(--el-fill-color);
  border-color: var(--el-fill-color);
}
html.dark .easy-tag--default.easy-tag--plain {
  color: var(--el-text-color-secondary);
  border-color: var(--el-border-color);
}
</style>
