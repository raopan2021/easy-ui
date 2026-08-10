<script setup lang="ts">
import XlyIcon from '../xly-icon/index.vue'

const props = withDefaults(
  defineProps<{
    /** 菜单项图标 */
    icon?: string
    /** 是否禁用 */
    disabled?: boolean
    /** 是否显示分隔符 */
    divided?: boolean
  }>(),
  {
    disabled: false,
    divided: false,
  },
)

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

function handleClick(event: MouseEvent) {
  if (props.disabled)
    return
  emit('click', event)
}
</script>

<template>
  <li
    class="xly-dropdown-item"
    :class="{
      'is-disabled': disabled,
      'is-divided': divided,
    }"
    @click="handleClick"
  >
    <XlyIcon v-if="icon" :name="icon" :size="14" class="xly-dropdown-item__icon" />
    <slot />
  </li>
</template>

<style scoped>
.xly-dropdown-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  cursor: pointer;
  transition:
    background-color 0.2s ease,
    color 0.2s ease;
  list-style: none;
  font-size: 14px;
  color: var(--text-color, var(--el-text-color-regular));
  line-height: 22px;
}

.xly-dropdown-item:hover {
  background-color: var(--hover-bg-color, var(--el-fill-color-light));
  color: var(--primary-color, var(--el-color-primary));
}

.xly-dropdown-item.is-disabled {
  color: var(--disabled-text-color, var(--el-text-color-placeholder));
  cursor: not-allowed;
  pointer-events: none;
}

.xly-dropdown-item.is-divided {
  border-top: 1px solid var(--border-color, var(--el-border-color));
  margin-top: 6px;
  padding-top: 14px;
}

.xly-dropdown-item__icon {
  flex-shrink: 0;
}
</style>
