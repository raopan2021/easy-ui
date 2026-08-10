<script setup lang="ts">
import type { SwitchEmits } from './switch'

import { computed } from 'vue'

import { switchProps } from './switch'

defineOptions({ name: 'EasySwitch' })

const props = defineProps(switchProps)
const emit = defineEmits<SwitchEmits>()

const isChecked = computed(() => {
  return props.modelValue === props.activeValue
})

function handleClick() {
  if (props.disabled || props.loading)
    return

  const newValue = isChecked.value ? props.inactiveValue : props.activeValue
  emit('update:modelValue', newValue)
  emit('change', newValue)
}
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
