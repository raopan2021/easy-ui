import type { Component } from 'vue'
import type { AnyObj, SuperField, SuperFormEmits, SuperFormProps } from './types'

import { computed, onMounted, reactive, ref, watch } from 'vue'

import EasyCascader from '../../cascader'
import EasyDatePicker from '../../date-picker'
import EasyDateRangePicker from '../../date-range-picker'
import EasyDateTimePicker from '../../date-time-picker'
import EasyDateTimeRangePicker from '../../date-time-range-picker'
import EasyImageUpload from '../../image-upload'
import EasyInput from '../../input'
import EasyRate from '../../rate'
import EasySelect from '../../select'
import EasySwitch from '../../switch'
import EasyTimePicker from '../../time-picker'
import EasyTimeRangePicker from '../../time-range-picker'
import EasyUserPicker from '../../user-picker'

/** 组件类型映射表 */
const typeMap: Record<string, Component> = {
  input: EasyInput,
  select: EasySelect,
  datePicker: EasyDatePicker,
  dateRangePicker: EasyDateRangePicker,
  dateTimePicker: EasyDateTimePicker,
  dateTimeRangePicker: EasyDateTimeRangePicker,
  timePicker: EasyTimePicker,
  timeRangePicker: EasyTimeRangePicker,
  cascader: EasyCascader,
  switch: EasySwitch,
  rate: EasyRate,
  imageUpload: EasyImageUpload,
  user: EasyUserPicker,
}

/**
 * EasySuperForm 核心逻辑 composable
 *
 * 将原本内联在 super-form.vue 中的组件类型映射、数据同步、字段校验、
 * 提交/重置等逻辑抽离为独立 composable，
 * 让 .vue 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 *
 * @param props 超级表单 props（需传入响应式对象）
 * @param emit  超级表单事件触发函数（callable 形式，见 SuperFormEmits）
 */
export function useSuperForm(props: SuperFormProps, emit: SuperFormEmits) {
  // ============ 数据状态 ============
  // 内部数据（外部未传 modelValue 时使用）
  const internalData = reactive<AnyObj>({})

  // 如果外部传入了 modelValue，通过 watch 同步；否则直接使用内部数据
  const formData = computed(() => props.modelValue ?? internalData)

  // 同步锁：防止外部 modelValue 变化时触发 emit
  let syncingFromExternal = false

  watch(
    () => props.modelValue,
    (newVal) => {
      if (newVal) {
        syncingFromExternal = true
        // 深拷贝避免引用导致的循环
        const copied = JSON.parse(JSON.stringify(newVal))
        for (const key in copied) {
          internalData[key] = copied[key]
        }
        // 延迟解锁到下一个事件循环，确保 emit 被正确忽略
        setTimeout(() => {
          syncingFromExternal = false
        }, 0)
      }
    },
    { immediate: true },
  )

  // 提交时通知外部（仅在外部修改时触发）
  watch(
    () => internalData,
    () => {
      if (syncingFromExternal)
        return
      if (props.modelValue !== undefined) {
        Object.assign(props.modelValue, internalData)
        emit('update:modelValue', props.modelValue)
      }
    },
    { deep: true },
  )

  const defaultSpan = computed(() => props.span)

  // ============ 校验状态 ============
  const errors = ref<Record<string, string>>({})
  // 存储字段的组件实例
  const fieldRefs = ref<Record<string, any>>({})

  // ============ 计算属性 ============
  const fieldList = computed<SuperField[]>(() => props.fields || [])

  /** 获取字段的标签宽度 */
  function getFieldLabelWidth(field: SuperField): string {
    return field.labelWidth ?? props.labelWidth ?? '100px'
  }

  /** 根据 type 或 component 获取组件 */
  function getComponent(field: SuperField): Component {
    if (field.component) {
      return field.component
    }
    if (field.type) {
      return typeMap[field.type] || EasyInput
    }
    return EasyInput
  }

  /** 是否为双绑定组件（日期范围等） */
  function isDualBinding(field: SuperField): boolean {
    return !!field.startProp && !!field.endProp
  }

  /** 获取错误信息的 key */
  function getErrorKey(field: SuperField): string {
    return field.startProp || field.prop
  }

  /** 设置字段组件实例 */
  function setFieldRef(prop: string, el: any) {
    if (el) {
      fieldRefs.value[prop] = el
    }
  }

  /** 获取字段的 props（处理远程搜索方法） */
  function getFieldProps(field: SuperField): Record<string, any> {
    const fieldProps = { ...(field.props || {}) }

    // 如果有 remoteMethod，包装一下自动更新 options
    if (field.remoteMethod) {
      fieldProps.remote = true
      fieldProps.filterable = true
      fieldProps['remote-method'] = async (query: string) => {
        const instance = fieldRefs.value[field.prop]
        if (!instance)
          return

        if (!query) {
          instance.remoteOptions.value = []
          return
        }

        // 用户返回数组或 Promise，组件自动填充
        let result = field.remoteMethod!(query, instance)
        if (result instanceof Promise) {
          result = await result
        }
        // remoteOptions 是 ref，需要用 .value 赋值
        instance.remoteOptions.value = result || []
      }
    }

    return fieldProps
  }

  // ============ 方法 ============
  function initFormData() {
    // 如果外部传入了 modelValue，不在组件内部初始化（由外部管理初始值）
    if (props.modelValue !== undefined)
      return

    // 只在内部数据中初始化
    const data = internalData
    for (const field of fieldList.value) {
      // 初始化 prop
      if (data[field.prop] === undefined) {
        const p = field.props
        data[field.prop] = p?.multiple ? [] : ''
      }
      // 初始化 startProp/endProp（双绑定组件）
      if (field.startProp && data[field.startProp] === undefined) {
        data[field.startProp] = ''
      }
      if (field.endProp && data[field.endProp] === undefined) {
        data[field.endProp] = ''
      }
    }
  }

  async function validateField(prop: string): Promise<boolean> {
    const field = fieldList.value.find(f => f.prop === prop)
    if (!field)
      return true

    const errorKey = getErrorKey(field)
    const data = formData.value
    const value = isDualBinding(field) ? data[field.startProp!] : data[prop]
    const labelText = field.label || field.startProp || field.prop

    if (field.required) {
      if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
        errors.value[errorKey] = `请填写${labelText}`
        return false
      }
    }

    if (field.rules?.length) {
      for (const rule of field.rules) {
        let error: string | boolean = true

        if (rule.type === 'required') {
          if (!value || (Array.isArray(value) && value.length === 0)) {
            error = rule.message || `请填写${labelText}`
          }
        }
        else if (rule.type === 'email') {
          if (value && !/^[^\s@]+@[^\s@][^\s.@]*\.[^\s@]+$/.test(value)) {
            error = rule.message || '邮箱格式不正确'
          }
        }
        else if (rule.type === 'phone') {
          if (value && !/^1[3-9]\d{9}$/.test(value)) {
            error = rule.message || '手机号格式不正确'
          }
        }
        else if (rule.type === 'pattern' && rule.pattern) {
          const regex = typeof rule.pattern === 'string' ? new RegExp(rule.pattern) : rule.pattern
          if (value && !regex.test(value)) {
            error = rule.message || '格式不正确'
          }
        }
        else if (rule.validator) {
          error = rule.validator(value, formData.value)
        }

        if (error !== true) {
          errors.value[errorKey] = typeof error === 'string' ? error : String(error)
          return false
        }
      }
    }

    delete errors.value[errorKey]
    return true
  }

  async function validate(): Promise<boolean> {
    let valid = true
    errors.value = {}
    for (const field of fieldList.value) {
      const fieldValid = await validateField(field.prop)
      if (!fieldValid)
        valid = false
    }
    emit('validate', { valid, errors: { ...errors.value } })
    return valid
  }

  function handleReset() {
    const data = formData.value
    for (const field of fieldList.value) {
      const p = field.props
      data[field.prop] = p?.multiple ? [] : ''
    }
    errors.value = {}
    emit('reset')
  }

  async function handleSubmit() {
    const valid = await validate()
    if (valid) {
      emit('submit', { ...formData.value })
    }
  }

  // ============ 生命周期 ============
  onMounted(() => {
    initFormData()
  })

  watch(
    () => props.fields,
    () => {
      initFormData()
    },
    { deep: true },
  )

  return {
    // 数据
    formData,
    defaultSpan,
    fieldList,
    errors,
    fieldRefs,
    // 计算 / 辅助
    getFieldLabelWidth,
    getComponent,
    isDualBinding,
    getErrorKey,
    setFieldRef,
    getFieldProps,
    // 方法
    validate,
    validateField,
    handleReset,
    handleSubmit,
  }
}
