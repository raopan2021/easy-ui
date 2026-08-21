<script setup lang="ts">
import { Expand, Fold } from '@element-plus/icons-vue'

import { useNav } from '@/layout/hooks/useNav'

interface Props {
  isActive?: boolean
}

withDefaults(defineProps<Props>(), {
  isActive: false,
})

const emit = defineEmits<{
  (e: 'toggleClick'): void
}>()

const { tooltipEffect } = useNav()

function toggleClick() {
  emit('toggleClick')
}
</script>

<template>
  <div class="left-collapse">
    <PureIcon
      v-tippy="{
        content: isActive ? '点击折叠' : '点击展开',
        theme: tooltipEffect,
        hideOnClick: 'toggle',
        placement: 'right',
      }" :icon="isActive ? Fold : Expand" :size="16" class="left-collapse-icon dark:text-white" @click="toggleClick"
    />
  </div>
</template>

<style lang="scss" scoped>
.left-collapse {
  position: absolute;
  bottom: 0;
  width: 100%;
  height: 40px;
  line-height: 40px;
  box-shadow: 0 0 6px -3px var(--el-color-primary);
}

.left-collapse-icon {
  display: inline-block;
  margin-left: 16px;
  margin-bottom: 4px;
  vertical-align: middle;
  cursor: pointer;
  transition: color 100ms;

  &:hover {
    color: var(--el-color-primary);
  }

  svg {
    width: 16px;
    height: 16px;
  }
}
</style>
