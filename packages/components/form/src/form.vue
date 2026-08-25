<script setup lang="ts">
import type { FormEmits, FormProps } from './form'

import { provide } from 'vue'
import { useForm } from './use-form'

defineOptions({ name: 'EasyForm' })

const props = withDefaults(defineProps<FormProps>(), {
  rules: () => ({}),
  labelWidth: undefined,
  labelPosition: 'left',
  span: undefined,
  size: 'default',
  inline: false,
  disabled: false,
})

const emit = defineEmits<FormEmits>()

const {
  errors,
  registerField,
  unregisterField,
  getMergedRules,
  validate,
  validateField,
  resetFields,
  clearValidate,
  submit,
  activeSpan,
} = useForm(props, emit)

// provide 给子组件 FormItem 使用
provide('easyFormContext', {
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

// 保持对外类型导出兼容（原定义在 form.ts）
export type { FormEmits, FormProps } from './form'
</script>

<template>
  <form
    class="easy-form"
    :class="[`easy-form--${size}`, { 'is-inline': inline, 'is-label-top': labelPosition === 'top' }]" @submit.prevent
  >
    <slot />
  </form>
</template>

<!-- 组件核心样式（scoped，独立维护在 form-style.scss） -->
<style scoped src="./form-style.scss" lang="scss"></style>
