<script setup lang="ts">
import type { ComputedRef, Ref } from 'vue'
import type { FormItemContext, FormRule, Rule } from './utils'
import { computed, inject, onMounted, onUnmounted, provide, ref } from 'vue'
import { normalizeRules, required } from './utils'

const props = withDefaults(defineProps<FormItemProps>(), {
  label: '',
  prop: '',
  rules: undefined,
  required: false,
  msg: undefined,
})

const TOTAL_COL = 24

export interface FormItemProps {
  label?: string
  prop?: string
  rules?: Rule[]
  required?: boolean
  msg?: string
  /** 栅格占位，默认 24（占满一行），inline 模式下常用 6/8/12 等值控制一行几个 */
  span?: number
}

// 从 Form 注入的上下文
const formContext = inject<{
  labelWidth?: string
  labelPosition?: 'left' | 'right' | 'top'
  span?: number | ComputedRef<number | undefined>
  modelValue?: Record<string, any>
  errors: Ref<Record<string, string>>
  registerField: (prop: string, rules: Rule[]) => void
  unregisterField: (prop: string) => void
  getMergedRules?: () => Record<string, Rule[]>
} | null>('easyFormContext', null)

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
  prop: props.prop,
})
</script>

<template>
  <div
    class="easy-form-item"
    :class="{
      'is-error': !!errorMessage,
      'is-required': isRequired,
      'is-label-top': labelPosition === 'top',
      'is-no-label': !label && labelPosition === 'top',
    }"
    :style="itemStyle"
  >
    <label v-if="label" class="easy-form-item__label" :style="{ width: labelWidth || undefined }">
      <span class="easy-form-item__label-text">{{ label }}</span>
    </label>
    <div class="easy-form-item__content">
      <div class="easy-form-item__control">
        <slot />
      </div>
      <Transition name="easy-form-error-fade">
        <div v-if="errorMessage" class="easy-form-item__error">
          {{ errorMessage }}
        </div>
      </Transition>
      <div v-if="$slots.tip && !errorMessage" class="easy-form-item__tip">
        <slot name="tip" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
$transition: all 0.2s ease;

.easy-form-item {
  display: flex;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 20px;
  min-height: 32px;

  // label 在顶部模式
  &.is-label-top {
    flex-direction: column;

    .easy-form-item__label {
      width: 100% !important;
      padding-top: 0;
      padding-bottom: 8px;
      padding-right: 0;
      text-align: left;
    }

    .easy-form-item__content {
      width: 100%;
    }

    // 无 label 时，补上 label 占位高度，使控件与其他有 label 的表单项对齐
    &.is-no-label .easy-form-item__content {
      padding-top: calc(14px * 1.4 + 8px);
    }
  }

  &.is-error {
    :deep(.easy-input__wrapper) {
      border-color: var(--el-color-danger) !important;
      box-shadow: 0 0 0 1px var(--el-color-danger) inset !important;
    }
    :deep(.easy-select .easy-select__wrapper) {
      border-color: var(--el-color-danger) !important;
      box-shadow: 0 0 0 1px var(--el-color-danger) inset !important;
    }
  }

  &.is-required {
    .easy-form-item__label-text::before {
      content: '*';
      color: var(--el-color-danger);
      margin-right: 4px;
    }
  }
}

.easy-form-item__label {
  flex-shrink: 0;
  padding-top: 6px;
  text-align: right;
  padding-right: 12px;
  box-sizing: border-box;
}

.easy-form-item__label-text {
  font-size: 14px;
  color: var(--el-text-color-primary);
  font-weight: 500;
  line-height: 1.4;
}

.easy-form-item__content {
  flex: 1;
  min-width: 0;
  position: relative;
  padding-bottom: 0;
  display: flex;
  align-items: center;
  min-height: 36px;
}

.easy-form-item__control {
  width: 100%;
}

.easy-form-item__error {
  font-size: 12px;
  color: var(--el-color-danger);
  line-height: 1.4;
  margin-top: 4px;
  word-break: break-all;
  position: absolute;
  left: 0;
  top: 100%;
  z-index: 1;
}

.easy-form-item__tip {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  line-height: 1.4;
  margin-top: 4px;
}

.easy-form-error-fade-enter-active,
.easy-form-error-fade-leave-active {
  transition: opacity 0.2s ease;
}
.easy-form-error-fade-enter-from,
.easy-form-error-fade-leave-to {
  opacity: 0;
}
</style>

<style lang="scss">
/* ========== Dark Mode ========== */
html.dark .easy-form-item__label {
  color: var(--el-text-color-regular);
}
html.dark .easy-form-item .label-desc {
  color: var(--el-text-color-placeholder);
}
html.dark .is-required .easy-form-item__label::before {
  color: var(--el-color-danger);
}
</style>
