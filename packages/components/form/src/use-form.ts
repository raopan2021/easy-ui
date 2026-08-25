import type { FormEmits, FormProps } from './form'

import type { Rule } from './utils'

import { computed, ref } from 'vue'
import { validateForm } from './utils'

/**
 * 表单校验与字段注册逻辑：维护错误态、聚合 form/field 级规则，提供校验/重置/提交。
 *
 * 将原本内联在 form.vue 中的状态与方法抽离为独立 composable（对齐 switch 等组件拆分规范）。
 *
 * @param props 表单 props（model / rules / label* / span / inline / disabled）
 * @param emit  表单事件触发函数（callable 形式，直接标注 FormEmits 类型）
 */
export function useForm(props: FormProps, emit: FormEmits) {
  /** 字段错误信息（prop -> message） */
  const errors = ref<Record<string, string>>({})

  /** 子组件 FormItem 注册的字段级规则 */
  const fieldRules = ref<Record<string, Rule[]>>({})

  /** 注册字段规则（FormItem 挂载时调用） */
  function registerField(prop: string, rules: Rule[]) {
    fieldRules.value[prop] = rules
  }

  /** 注销字段规则（FormItem 卸载时调用） */
  function unregisterField(prop: string) {
    delete fieldRules.value[prop]
  }

  /** 合并 form 级别与 field 级别的 rules（同名字段 field 覆盖 form） */
  function getMergedRules(): Record<string, Rule[]> {
    const merged: Record<string, Rule[]> = {}
    for (const [prop, rules] of Object.entries(props.rules ?? {})) {
      merged[prop] = [...rules]
    }
    for (const [prop, rules] of Object.entries(fieldRules.value)) {
      if (rules.length > 0)
        merged[prop] = rules
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

  /** 重置表单（清空所有字段值） */
  function resetFields() {
    errors.value = {}
    for (const key of Object.keys(props.model)) {
      if (Array.isArray(props.model[key]))
        props.model[key] = []
      else
        props.model[key] = ''
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

  /** 提交表单（先校验，通过才 emit submit） */
  async function submit() {
    const valid = await validate()
    if (valid)
      emit('submit', { ...props.model })
  }

  /** 实际生效的 span：inline 模式默认 6，非 inline 模式不设（占满一行） */
  const activeSpan = computed(() => {
    if (props.span != null)
      return props.span
    return props.inline ? 6 : undefined
  })

  return {
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
  }
}
