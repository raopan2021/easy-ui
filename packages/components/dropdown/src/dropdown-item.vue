<script setup lang="ts">
import type { DropdownItemEmits, DropdownItemProps } from './types'

import EasyIcon from '../../icon'

const props = withDefaults(defineProps<DropdownItemProps>(), {
  disabled: false,
  divided: false,
})

const emit = defineEmits<DropdownItemEmits>()

function handleClick(event: MouseEvent) {
  if (props.disabled)
    return
  emit('click', event)
}

// 保持对外类型导出兼容
export type { DropdownItemEmits, DropdownItemProps } from './types'
</script>

<template>
  <li
    class="easy-dropdown-item"
    :class="{
      'is-disabled': disabled,
      'is-divided': divided,
    }"
    @click="handleClick"
  >
    <EasyIcon v-if="icon" :name="icon" :size="14" class="easy-dropdown-item__icon" />
    <slot />
  </li>
</template>

<!-- 菜单项样式（scoped，独立维护在 dropdown-item-style.scss） -->
<style scoped src="./dropdown-item-style.scss" lang="scss"></style>
