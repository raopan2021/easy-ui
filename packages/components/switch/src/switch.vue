<script setup lang="ts">
import type { SwitchEmits, SwitchProps } from './switch'

import { useSwitch } from './use-switch'

defineOptions({
  name: 'EasySwitch',
})

const props = withDefaults(defineProps<SwitchProps>(), {
  modelValue: false,
  activeValue: true,
  inactiveValue: false,
  disabled: false,
  size: 'default',
  activeColor: '#4f6ef7',
  inactiveColor: '#e2e4ed',
  activeText: '',
  inactiveText: '',
  loading: false,
})

const emit = defineEmits<SwitchEmits>()

// 开关选中态与切换逻辑抽离到 composable
const { isChecked, handleClick } = useSwitch(props, emit)

// 保持对外类型导出兼容（原定义在 switch.ts）
export type { SwitchEmits, SwitchProps } from './switch'
</script>

<template>
  <div
    class="easy-switch"
    :class="[
      `easy-switch--${size}`,
      {
        'is-disabled': disabled,
        'is-checked': isChecked,
        'is-loading': loading,
      },
    ]"
    @click="handleClick"
  >
    <span
      class="easy-switch__core"
      :style="{
        background: isChecked ? activeColor : inactiveColor,
      }"
    >
      <span v-if="loading" class="easy-switch__loading" />
      <span v-else class="easy-switch__dot" />
    </span>
    <span v-if="activeText || inactiveText" class="easy-switch__text">
      {{ isChecked ? activeText : inactiveText }}
    </span>
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 switch-style.scss） -->
<style scoped src="./switch-style.scss" lang="scss"></style>
