<template>
  <label
    class="xly-radio"
    :class="[
      `xly-radio--${size}`,
      {
        'is-disabled': disabled,
        'is-checked': isChecked,
        'is-bordered': border,
      },
    ]"
    @click.stop="select"
  >
    <input
      class="xly-radio__original"
      type="radio"
      :name="name"
      :value="label"
      :disabled="disabled"
      :checked="isChecked"
      @change.stop
    />
    <span class="xly-radio__inner">
      <span class="xly-radio__dot" :class="{ 'is-show': isChecked }" />
    </span>
    <span v-if="$slots.default" class="xly-radio__label">
      <slot />
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed, inject, type ComputedRef } from 'vue'

defineOptions({ name: 'XlyRadio' })

export interface RadioProps {
  /** 选中时的值 */
  label?: string | number | boolean
  /** 绑定值，配合 v-model 使用（单选时也可不传，由 RadioGroup 注入） */
  modelValue?: string | number | boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 尺寸 */
  size?: 'large' | 'default' | 'small'
  /** 原生 name 属性 */
  name?: string
  /** 是否显示边框 */
  border?: boolean
}

const props = withDefaults(defineProps<RadioProps>(), {
  label: undefined,
  modelValue: undefined,
  disabled: false,
  size: 'default',
  name: '',
  border: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number | boolean): void
  (e: 'change', value: string | number | boolean): void
}>()

// ========== RadioGroup 注入 ==========
type RadioGroupContext = {
  modelValue: ComputedRef<string | number | boolean | undefined>
  disabled: ComputedRef<boolean>
  size: ComputedRef<string>
  changeEvent: (value: string | number | boolean) => void
}

const radioGroup = inject<RadioGroupContext | null>('xlyRadioGroup', null)

const groupValue = computed(() => radioGroup?.modelValue.value)
const groupDisabled = computed(() => radioGroup?.disabled.value ?? false)
const groupSize = computed(() => radioGroup?.size.value ?? 'default')

const isChecked = computed(() => {
  const val = radioGroup ? groupValue.value : props.modelValue
  return val === props.label
})

function select() {
  if (isActuallyDisabled.value) return
  const val = props.label as string | number | boolean
  if (radioGroup) {
    radioGroup.changeEvent(val)
  } else {
    emit('update:modelValue', val)
    emit('change', val)
  }
}

const isActuallyDisabled = computed(() => props.disabled || groupDisabled.value)
</script>

<style scoped lang="scss">

$primary-light: rgba(79, 110, 247, 0.08);

$radius: 4px;
$transition: all 0.2s ease;

.xly-radio {
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
  &--large .xly-radio__inner {
    width: 18px;
    height: 18px;
  }
  &--large .xly-radio__dot {
    width: 8px;
    height: 8px;
  }
  &--large .xly-radio__label {
    font-size: 15px;
  }

  &--default .xly-radio__inner {
    width: 16px;
    height: 16px;
  }
  &--default .xly-radio__dot {
    width: 6px;
    height: 6px;
  }
  &--default .xly-radio__label {
    font-size: 14px;
  }

  &--small .xly-radio__inner {
    width: 14px;
    height: 14px;
  }
  &--small .xly-radio__dot {
    width: 5px;
    height: 5px;
  }
  &--small .xly-radio__label {
    font-size: 13px;
  }

  &.is-disabled {
    cursor: not-allowed;
    color: var(--el-text-color-disabled);

    .xly-radio__inner {
      background: var(--el-fill-color-light);
      border-color: var(--el-border-color);
      cursor: not-allowed;
    }

    .xly-radio__dot {
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

.xly-radio__original {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  margin: 0;
}

.xly-radio__inner {
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

.xly-radio__dot {
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

.xly-radio__label {
  margin-left: 8px;
  line-height: 1.4;
}

// 状态
.xly-radio.is-checked .xly-radio__inner {
  border-color: var(--el-color-primary);
}

.xly-radio:not(.is-disabled):hover .xly-radio__inner {
  border-color: var(--el-color-primary);
}
</style>

<style lang="scss">
/* ========== Dark Mode ========== */
html.dark .xly-radio.is-bordered {
  border-color: var(--el-border-color);
  background-color: var(--el-bg-color);
}
html.dark .xly-radio.is-bordered.is-checked {
  border-color: var(--el-color-primary);
}
html.dark .xly-radio.is-bordered.is-disabled {
  border-color: var(--el-border-color);
  background-color: var(--el-fill-color);
}
html.dark .xly-radio__inner {
  border-color: var(--el-border-color);
}
html.dark .xly-radio.is-checked .xly-radio__inner {
  border-color: var(--el-color-primary);
}
html.dark .xly-radio:not(.is-disabled):hover .xly-radio__inner {
  border-color: var(--el-color-primary);
}
</style>
