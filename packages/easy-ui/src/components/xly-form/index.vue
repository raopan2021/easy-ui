<script setup lang="ts">
import type { Rule } from './utils'
import { computed, provide, ref } from 'vue'
import { validateForm } from './utils'

defineOptions({ name: 'XlyForm' })

const props = withDefaults(defineProps<FormProps>(), {
  rules: () => ({}),
  labelWidth: undefined,
  labelPosition: 'left',
  span: undefined,
  size: 'default',
  inline: false,
  disabled: false,
})

const emit = defineEmits<{
  (e: 'submit', formData: Record<string, any>): void
  (e: 'validate', result: { valid: boolean, errors: Record<string, string> }): void
}>()

export interface FormProps {
  model: Record<string, any>
  rules?: Record<string, Rule[]>
  labelWidth?: string
  /** 标签位置：right-标签右对齐居左，left-标签左对齐居左，top-标签在顶部 */
  labelPosition?: 'left' | 'right' | 'top'
  /** 栅格占位（共 24 栏），设置后所有 FormItem 默认使用该值，常用 6/8/12 */
  span?: number
  size?: 'large' | 'default' | 'small'
  inline?: boolean
  disabled?: boolean
}

const errors = ref<Record<string, string>>({})

// 收集所有字段的 rules
const fieldRules = ref<Record<string, Rule[]>>({})

function registerField(prop: string, rules: Rule[]) {
  fieldRules.value[prop] = rules
}

function unregisterField(prop: string) {
  delete fieldRules.value[prop]
}

// 合并 form 级别和 field 级别的 rules
function getMergedRules(): Record<string, Rule[]> {
  const merged: Record<string, Rule[]> = {}
  // form 级别
  for (const [prop, rules] of Object.entries(props.rules)) {
    merged[prop] = [...rules]
  }
  // field 级别（覆盖同名字段）
  for (const [prop, rules] of Object.entries(fieldRules.value)) {
    if (rules.length > 0) {
      merged[prop] = rules
    }
  }
  return merged
}

/** 校验整个表单 */
async function validate(): Promise<boolean> {
  const mergedRules = getMergedRules()
  const result = await validateForm(props.model, mergedRules)
  errors.value = result.errors
  emit('validate', result)
  return result.valid
}

/** 校验指定字段 */
async function validateField(prop: string): Promise<boolean> {
  const mergedRules = getMergedRules()
  const fieldRules = mergedRules[prop]
  if (!fieldRules)
    return true

  const { validateField: vf } = await import('./utils')
  const error = await vf(props.model[prop], fieldRules, props.model)
  if (error) {
    errors.value = { ...errors.value, [prop]: error }
  }
  else {
    const newErrors = { ...errors.value }
    delete newErrors[prop]
    errors.value = newErrors
  }
  return !error
}

/** 重置表单 */
function resetFields() {
  errors.value = {}
  for (const key of Object.keys(props.model)) {
    if (Array.isArray(props.model[key])) {
      props.model[key] = []
    }
    else {
      props.model[key] = ''
    }
  }
}

/** 清除校验信息 */
function clearValidate(props?: string[]) {
  if (props) {
    const newErrors = { ...errors.value }
    for (const p of props) {
      delete newErrors[p]
    }
    errors.value = newErrors
  }
  else {
    errors.value = {}
  }
}

/** 提交表单 */
async function submit() {
  const valid = await validate()
  if (valid) {
    emit('submit', { ...props.model })
  }
}

/** 实际生效的 span：inline 模式默认 6，非 inline 模式不设（占满一行） */
const activeSpan = computed(() => {
  if (props.span != null)
    return props.span
  return props.inline ? 6 : undefined
})

// provide 给子组件 FormItem 使用
provide('xlyFormContext', {
  labelWidth: props.labelWidth,
  labelPosition: props.labelPosition,
  span: activeSpan,
  modelValue: props.model,
  errors,
  registerField,
  unregisterField,
  getMergedRules,
})

defineExpose({ validate, validateField, resetFields, clearValidate, submit })
</script>

<template>
  <form
    class="xly-form"
    :class="[`xly-form--${size}`, { 'is-inline': inline, 'is-label-top': labelPosition === 'top' }]"
    @submit.prevent
  >
    <slot />
  </form>
</template>

<style scoped lang="scss">
.xly-form {
  width: 100%;

  &.xly-form--large {
    .xly-form-item__label {
      font-size: 15px;
    }
  }

  &.xly-form--default {
    .xly-form-item__label {
      font-size: 14px;
    }
  }

  &.xly-form--small {
    .xly-form-item__label {
      font-size: 13px;
    }
  }

  &.is-inline {
    display: flex;
    flex-wrap: wrap;
    align-items: flex-start;

    :deep(.xly-form-item) {
      margin-right: 16px;
      margin-bottom: 20px;
    }
  }
}
</style>
