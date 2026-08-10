<script setup lang="ts">
import type { ComputedRef } from 'vue'

import type { RadioEmits } from './radio'
import { computed, inject } from 'vue'

import { radioProps } from './radio'

defineOptions({ name: 'EasyRadio' })

const props = defineProps(radioProps)
const emit = defineEmits<RadioEmits>()

// ========== RadioGroup 注入 ==========
interface RadioGroupContext {
  modelValue: ComputedRef<string | number | boolean | undefined>
  disabled: ComputedRef<boolean>
  size: ComputedRef<string>
  changeEvent: (value: string | number | boolean) => void
}

const radioGroup = inject<RadioGroupContext | null>('easyRadioGroup', null)

const groupValue = computed(() => radioGroup?.modelValue.value)
const groupDisabled = computed(() => radioGroup?.disabled.value ?? false)

const isActuallyDisabled = computed(() => props.disabled || groupDisabled.value)

const isChecked = computed(() => {
  const val = radioGroup ? groupValue.value : props.modelValue
  return val === props.label
})

function select() {
  if (isActuallyDisabled.value)
    return
  const val = props.label as string | number | boolean
  if (radioGroup) {
    radioGroup.changeEvent(val)
  }
  else {
    emit('update:modelValue', val)
    emit('change', val)
  }
}
</script>

<template>
  <label
    class="easy-radio"
    :class="[
      `easy-radio--${size}`,
      {
        'is-disabled': isActuallyDisabled,
        'is-checked': isChecked,
        'is-bordered': border,
      },
    ]"
    @click.stop="select"
  >
    <input
      class="easy-radio__original"
      type="radio"
      :name="name"
      :value="label"
      :disabled="isActuallyDisabled"
      :checked="isChecked"
      @change.stop
    >
    <span class="easy-radio__inner">
      <span class="easy-radio__dot" :class="{ 'is-show': isChecked }" />
    </span>
    <span v-if="$slots.default" class="easy-radio__label">
      <slot />
    </span>
  </label>
</template>
