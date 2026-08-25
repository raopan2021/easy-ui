import type { ComputedRef, Ref } from 'vue'
import type { FormItemProps } from './types'
import type { FormItemContext, FormRule, Rule } from './utils'

import { computed, inject, onMounted, onUnmounted, provide, ref } from 'vue'

import { normalizeRules, required } from './utils'

/** 栅格总分（24 栅格） */
const TOTAL_COL = 24

/** Form 组件注入的上下文类型 */
interface FormContext {
  labelWidth?: string
  labelPosition?: 'left' | 'right' | 'top'
  span?: number | ComputedRef<number | undefined>
  modelValue?: Record<string, any>
  errors: Ref<Record<string, string>>
  registerField: (prop: string, rules: Rule[]) => void
  unregisterField: (prop: string) => void
  getMergedRules?: () => Record<string, Rule[]>
}

/**
 * EasyFormItem 核心逻辑 composable
 *
 * 将原本内联在 form-item.vue 中的必填规则合并、字段注册/注销、
 * 错误态/必填态计算、栅格宽度、懒校验与 provide 等逻辑抽离为独立 composable，
 * 让 .vue 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 *
 * @param props 表单项 props（需传入响应式对象）
 */
export function useFormItem(props: FormItemProps) {
  // 从 Form 注入的上下文
  const formContext = inject<FormContext | null>('easyFormContext', null)

  // 处理 required 属性，将其转换为规则
  const effectiveRules = computed<Rule[]>(() => {
    const rules = props.rules || []

    // 如果设置了 required 属性，自动添加必填规则
    if (props.required) {
      const hasRequiredRule = rules.some((rule) => {
        if (typeof rule === 'string') {
          return rule === 'required'
        }
        // 检查 FormRule 的 validator 是否包含 '必填' 或 'required'
        const fnStr = rule.validator.toString()
        return fnStr.includes('必填') || fnStr.includes('required')
      })

      if (!hasRequiredRule) {
        // 优先使用自定义消息，否则使用"请填写 + label"
        const message = props.msg || `请填写${props.label}`
        return [required(message), ...rules]
      }
    }

    return rules
  })

  // 注册/注销字段
  onMounted(() => {
    if (props.prop && formContext?.registerField) {
      formContext.registerField(props.prop, effectiveRules.value)
    }
  })

  onUnmounted(() => {
    if (props.prop && formContext?.unregisterField) {
      formContext.unregisterField(props.prop)
    }
  })

  const errorMessage = computed(() => {
    if (props.prop && formContext?.errors) {
      return formContext.errors.value[props.prop] || ''
    }
    return ''
  })

  const isRequired = computed(() => {
    // 如果明确设置了 required 属性，直接返回 true
    if (props.required)
      return true

    // 获取合并后的规则（Form 级别 + Field 级别）
    let rules: Rule[] = []
    if (props.prop && formContext?.getMergedRules) {
      const mergedRules = formContext.getMergedRules()
      rules = mergedRules[props.prop] || []
    }
    else {
      // 如果 prop 不存在或无法获取合并规则，回退到 props.rules
      rules = props.rules || []
    }

    // 检查规则中是否有必填规则
    return rules.some((r) => {
      if (typeof r === 'string') {
        return r === 'required'
      }
      // 检查 FormRule 的 required 标记
      return r.required === true
    })
  })

  const labelWidth = computed(() => formContext?.labelWidth)
  const labelPosition = computed(() => formContext?.labelPosition ?? 'left')

  /** 栅格宽度：优先取自身 span，否则取 Form 注入的 span，都没有则占满一行 */
  const itemStyle = computed(() => {
    const formSpan = formContext?.span
    const span = props.span ?? (typeof formSpan === 'number' ? formSpan : formSpan?.value)
    if (!span || span >= TOTAL_COL)
      return undefined
    return { width: `${(span / TOTAL_COL) * 100}%` }
  })

  /**
   * 懒校验状态：是否曾展示过错误。
   * 为 true 时才在每次 change 时实时校验；为 false 时仅 blur 触发。
   * blur 校验出错后置为 true，change 校验通过后置为 false。
   */
  const hasShownError = ref(false)

  /** 根据 trigger 过滤规则后执行字段校验 */
  async function validateField(trigger?: 'change' | 'blur'): Promise<boolean> {
    if (!props.prop || !formContext?.modelValue || !formContext?.errors)
      return true

    // 懒校验：change 事件仅在曾经出错后才触发实时校验
    if (trigger === 'change' && !hasShownError.value)
      return true

    const mergedRules = formContext.getMergedRules?.()
    const rules = mergedRules?.[props.prop] || []
    if (!rules.length)
      return true

    const normalizedRules = normalizeRules(rules)

    // change：仅校验 trigger 含 'change' 或未指定 trigger 的规则，跳过仅 blur 的规则
    // blur：校验全部规则（blur 是全面校验，不受 trigger 限制）
    const triggeredRules
      = trigger === 'change'
        ? normalizedRules.filter((rule) => {
            const t = (rule as FormRule).trigger
            if (t === undefined || t === null)
              return true
            if (Array.isArray(t))
              return (t as string[]).includes('change')
            return t !== 'blur'
          })
        : normalizedRules

    if (!triggeredRules.length)
      return true

    const { validateField: vf } = await import('./utils')
    const error = await vf(formContext.modelValue[props.prop], triggeredRules, formContext.modelValue)

    // blur 出错 → 开启懒校验；change 通过 → 关闭懒校验
    if (error) {
      if (trigger === 'blur')
        hasShownError.value = true
      formContext.errors.value = { ...formContext.errors.value, [props.prop]: error }
    }
    else {
      if (trigger === 'change')
        hasShownError.value = false
      const newErrors = { ...formContext.errors.value }
      delete newErrors[props.prop]
      formContext.errors.value = newErrors
    }

    return !error
  }

  // 向子组件（如 EasyInput）提供校验入口
  provide<FormItemContext>('easyFormItemContext', {
    validateField,
    prop: props.prop ?? '',
  })

  return {
    errorMessage,
    isRequired,
    labelWidth,
    labelPosition,
    itemStyle,
  }
}
