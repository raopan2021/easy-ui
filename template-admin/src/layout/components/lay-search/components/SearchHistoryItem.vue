<script setup lang="ts">
import type { optionsItem } from '../types'
import { Close as CloseIcon, Star as StarIcon } from '@element-plus/icons-vue'
import { useRenderIcon } from '@/components/ReIcon/src/hooks'

interface Props {
  item: optionsItem
}

interface Emits {
  (e: 'collectItem', val: optionsItem): void
  (e: 'deleteItem', val: optionsItem): void
}

withDefaults(defineProps<Props>(), {})
const emit = defineEmits<Emits>()
function handleCollect(item) {
  emit('collectItem', item)
}

function handleDelete(item) {
  emit('deleteItem', item)
}
</script>

<template>
  <component :is="useRenderIcon(item.meta?.icon)" />
  <span class="history-item-title">
    {{ item.meta?.title }}
  </span>
  <PureIcon
    v-show="item.type === 'history'"
    :icon="StarIcon"
    :size="18"
    class="mr-2 hover:text-[#d7d5d4]"
    @click.stop="handleCollect(item)"
  />
  <PureIcon
    :icon="CloseIcon"
    :size="18"
    class="hover:text-[#d7d5d4] cursor-pointer"
    @click.stop="handleDelete(item)"
  />
</template>

<style lang="scss" scoped>
.history-item-title {
  display: flex;
  flex: 1;
  margin-left: 5px;
}
</style>
