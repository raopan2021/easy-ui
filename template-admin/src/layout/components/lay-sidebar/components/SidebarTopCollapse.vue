<script setup lang="ts">
import { Fold as MenuFold, Expand as MenuUnfold } from '@element-plus/icons-vue'

interface Props {
  isActive?: boolean
}

withDefaults(defineProps<Props>(), {
  isActive: false,
})

const emit = defineEmits<{
  (e: 'toggleClick'): void
}>()

function toggleClick() {
  emit('toggleClick')
}
</script>

<template>
  <div class="px-3 mr-1 navbar-bg-hover" :title="isActive ? '点击折叠' : '点击展开'" @click="toggleClick">
    <PureIcon :icon="isActive ? MenuFold : MenuUnfold" :size="20"
      class="inline-block! align-middle hover:text-primary dark:hover:text-white!" />
  </div>
</template>
