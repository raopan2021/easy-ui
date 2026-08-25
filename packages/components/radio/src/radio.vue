<script setup lang="ts">
import type { RadioEmits } from './radio'

import { radioProps } from './radio'
import { useRadio } from './use-radio'

defineOptions({ name: 'EasyRadio' })

const props = defineProps(radioProps)
const emit = defineEmits<RadioEmits>()

const { isActuallyDisabled, isChecked, select } = useRadio(props, emit)
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
    <input class="easy-radio__original" type="radio" :name="name" :value="label" :disabled="isActuallyDisabled"
      :checked="isChecked" @change.stop>
    <span class="easy-radio__inner">
      <span class="easy-radio__dot" :class="{ 'is-show': isChecked }" />
    </span>
    <span v-if="$slots.default" class="easy-radio__label">
      <slot />
    </span>
  </label>
</template>

<!-- 组件核心样式（scoped，独立维护在 radio-style.scss） -->
<style scoped src="./radio-style.scss" lang="scss"></style>
