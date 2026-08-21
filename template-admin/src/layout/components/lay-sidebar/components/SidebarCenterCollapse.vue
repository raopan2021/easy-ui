<script setup lang="ts">
import { DArrowLeft as ArrowLeft } from '@element-plus/icons-vue'

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
  <div
    v-tippy="{
      content: isActive ? '点击折叠' : '点击展开',
      theme: tooltipEffect,
      hideOnClick: 'toggle',
      placement: 'right',
    }"
    class="center-collapse"
    @click="toggleClick"
  >
    <PureIcon
      :icon="ArrowLeft"
      :size="16"
      class="dark:text-white"
      :style="{ transform: isActive ? 'none' : 'rotateY(180deg)' }"
    />
  </div>
</template>

<style lang="scss" scoped>
.center-collapse {
  position: absolute;
  top: 50%;
  right: 2px;
  z-index: 1002;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 34px;
  cursor: pointer;
  background: var(--el-bg-color);
  border: 1px solid var(--pure-border-color);
  border-radius: 4px;
  transform: translate(12px, -50%);
}
</style>
