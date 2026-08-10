<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted } from 'vue'

defineOptions({ name: 'XlyTabPane' })

const props = withDefaults(defineProps<TabPaneProps>(), {
  disabled: false,
  icon: undefined,
})

export interface TabPaneProps {
  /** 选项卡标识，对应 Tabs 的 modelValue */
  name: string | number
  /** 选项卡标题 */
  label: string
  /** 是否禁用 */
  disabled?: boolean
  /** 标题前缀图标（Element Plus 图标名称） */
  icon?: string
}

const tabsContext = inject<{
  activeName: { value: string | number }
  registerPane: (pane: { name: string | number, label: string, disabled: boolean, icon?: string }) => void
  unregisterPane: (name: string | number) => void
} | null>('xlyTabsContext', null)

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
  <div v-show="isActive" class="xly-tab-pane">
    <slot />
  </div>
</template>
