<script setup lang="ts">
import type { RadioGroupEmits, RadioGroupProps } from './radio'

import { computed, provide } from 'vue'
import { RADIO_GROUP_KEY } from './radio'

defineOptions({ name: 'EasyRadioGroup' })

const props = withDefaults(defineProps<RadioGroupProps>(), {
  modelValue: undefined,
  disabled: false,
  size: 'default',
  name: '',
})

const emit = defineEmits<RadioGroupEmits>()

provide(RADIO_GROUP_KEY, {
  modelValue: computed(() => props.modelValue),
  disabled: computed(() => props.disabled),
  size: computed(() => props.size),
  changeEvent(val: string | number | boolean) {
    emit('update:modelValue', val)
    emit('change', val)
  },
})
</script>

<template>
  <div class="easy-radio-group" :class="[`easy-radio-group--${size}`, { 'is-disabled': disabled }]" role="radiogroup">
    <slot />
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 radio-group-style.scss） -->
<style scoped src="./radio-group-style.scss" lang="scss"></style>
