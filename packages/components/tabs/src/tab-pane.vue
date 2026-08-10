<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted } from 'vue'

import { tabPaneProps } from './tab-pane'

defineOptions({ name: 'EasyTabPane' })

const props = defineProps(tabPaneProps)

const tabsContext = inject<{
  activeName: { value: string | number }
  registerPane: (pane: { name: string | number, label: string, disabled: boolean, icon?: string }) => void
  unregisterPane: (name: string | number) => void
} | null>('easyTabsContext', null)

const isActive = computed(() => {
  return tabsContext ? tabsContext.activeName.value === props.name : false
})

onMounted(() => {
  tabsContext?.registerPane({
    name: props.name,
    label: props.label,
    disabled: props.disabled,
    icon: props.icon,
  })
})

onUnmounted(() => {
  tabsContext?.unregisterPane(props.name)
})
</script>

<template>
  <div v-show="isActive" class="easy-tab-pane">
    <slot />
  </div>
</template>
