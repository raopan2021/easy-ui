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

<style scoped lang="scss">
$radius: 4px;
$transition: all 0.2s ease;

.easy-radio {
  display: inline-flex;
  align-items: center;
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
  outline: none;
  font-size: 14px;
  color: var(--el-text-color-regular);
  transition: $transition;

  // 尺寸
  &.easy-radio--large .easy-radio__inner {
    width: 18px;
    height: 18px;
  }
  &.easy-radio--large .easy-radio__dot {
    width: 8px;
    height: 8px;
  }
  &.easy-radio--large .easy-radio__label {
    font-size: 15px;
  }

  &.easy-radio--default .easy-radio__inner {
    width: 16px;
    height: 16px;
  }
  &.easy-radio--default .easy-radio__dot {
    width: 6px;
    height: 6px;
  }
  &.easy-radio--default .easy-radio__label {
    font-size: 14px;
  }

  &.easy-radio--small .easy-radio__inner {
    width: 14px;
    height: 14px;
  }
  &.easy-radio--small .easy-radio__dot {
    width: 5px;
    height: 5px;
  }
  &.easy-radio--small .easy-radio__label {
    font-size: 13px;
  }

  &.is-disabled {
    cursor: not-allowed;
    color: var(--el-text-color-disabled);

    .easy-radio__inner {
      background: var(--el-fill-color-light);
      border-color: var(--el-border-color);
      cursor: not-allowed;
    }

    .easy-radio__dot {
      background: var(--el-text-color-disabled);
    }
  }

  &.is-bordered {
    padding: 8px 16px;
    border: 1px solid var(--el-border-color);
    border-radius: $radius;
    transition: $transition;

    &.is-checked {
      border-color: var(--el-color-primary);
    }

    &.is-disabled {
      border-color: var(--el-border-color);
      background: var(--el-fill-color-light);
    }
  }
}

.easy-radio__original {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  margin: 0;
}

.easy-radio__inner {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border: 2px solid var(--el-border-color);
  border-radius: 50%;
  background: var(--el-bg-color);
  transition: $transition;
  flex-shrink: 0;
}

.easy-radio__dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--el-color-primary);
  flex-shrink: 0;
  transform: scale(0);
  transition: transform 0.15s ease;

  &.is-show {
    transform: scale(1);
  }
}

.easy-radio__label {
  margin-left: 8px;
  line-height: 1.4;
}

// 状态
.easy-radio.is-checked .easy-radio__inner {
  border-color: var(--el-color-primary);
}

.easy-radio:not(.is-disabled):hover .easy-radio__inner {
  border-color: var(--el-color-primary);
}
</style>
