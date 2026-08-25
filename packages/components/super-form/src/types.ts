import type { Component } from 'vue'

/**
 * EasySuperForm 超级表单类型定义
 *
 * 原内联在 super-form.vue 中的类型（SuperField / FieldRule / AnyObj / Props）
 * 收敛到此文件，供 .vue 与 use-super-form.ts 共用，
 * 并通过 super-form.vue 的 `export type { ... } from './types'` 保持对外导出兼容。
 */

/** 通用对象（表单数据 / 错误信息等） */
export interface AnyObj { [key: string]: any }

/** 校验规则 */
export interface FieldRule {
  type?: 'required' | 'email' | 'phone' | 'url' | 'pattern'
  message?: string
  pattern?: string | RegExp
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  validator?: (value: any, formData?: AnyObj) => string | boolean
}

/** 字段配置 */
export interface SuperField {
  /** 字段名（属性名） */
  prop: string
  /** 标签文字，默认使用 prop */
  label?: string
  /** 是否显示标签，默认 true */
  showLabel?: boolean
  /** 标签宽度，默认 100px */
  labelWidth?: string
  /** 是否必填 */
  required?: boolean
  /** 组件类型：input | select | datePicker | dateRangePicker | dateTimePicker | dateTimeRangePicker | timePicker | timeRangePicker | cascader | switch | rate */
  type?: string
  /** 自定义组件（兼容旧写法） */
  component?: Component
  /** 传递给组件的额外属性 */
  props?: Record<string, any>
  /** 栅格占位（1-24），默认继承 span */
  span?: number
  /** 尺寸 */
  size?: 'large' | 'default' | 'small'
  /** 校验规则 */
  rules?: FieldRule[]
  /** 开始日期/时间字段名（范围组件用），同时作为错误信息的 key */
  startProp?: string
  /** 结束日期/时间字段名（范围组件用） */
  endProp?: string
  /** 远程搜索方法（用于 select/cascader 组件） */
  remoteMethod?: (query: string, instance: any) => any[] | Promise<any[]> | void
}

/** 组件 props */
export interface SuperFormProps {
  /** 表单数据对象（支持双向绑定） */
  modelValue?: AnyObj
  /** 字段配置 */
  fields: SuperField[]
  /** 布局方式 */
  layout?: 'vertical' | 'inline'
  /** 标签宽度 */
  labelWidth?: string
  /** 默认栅格占位（1-24） */
  span?: number
  /** 尺寸 */
  size?: 'large' | 'default' | 'small'
}

/** 组件事件（defineEmits 与内部 composable 共用，callable 形式） */
export interface SuperFormEmits {
  (e: 'update:modelValue', value: AnyObj): void
  (e: 'submit', data: AnyObj): void
  (e: 'reset'): void
  (e: 'validate', result: { valid: boolean, errors: AnyObj }): void
}
