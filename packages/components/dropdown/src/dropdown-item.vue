<script setup lang="ts">
import EasyIcon from '../../icon'

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

<style scoped>
.easy-dropdown-item {
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

.easy-dropdown-item:hover {
  background-color: var(--hover-bg-color, var(--el-fill-color-light));
  color: var(--primary-color, var(--el-color-primary));
}

.easy-dropdown-item.is-disabled {
  color: var(--disabled-text-color, var(--el-text-color-placeholder));
  cursor: not-allowed;
  pointer-events: none;
}

.easy-dropdown-item.is-divided {
  border-top: 1px solid var(--border-color, var(--el-border-color));
  margin-top: 6px;
  padding-top: 14px;
}

.easy-dropdown-item__icon {
  flex-shrink: 0;
}
</style>
