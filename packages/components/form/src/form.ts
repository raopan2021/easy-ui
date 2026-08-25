import type { Rule } from './utils'

/**
 * Form 表单组件 - 类型与事件定义。
 *
 * 仅声明对外 props / emits 类型，交互逻辑抽离到 use-form.ts，
 * 样式独立维护在 form-style.scss（对齐 switch 等组件的拆分规范）。
 */

/** 表单 props */
export interface FormProps {
  /** 表单数据对象（v-model 绑定源，字段校验基于此对象） */
  model: Record<string, any>
  /** 字段校验规则（form 级别，可被 FormItem 的 field 级别覆盖） */
  rules?: Record<string, Rule[]>
  /** 标签宽度（CSS 值，如 '100px'） */
  labelWidth?: string
  /** 标签位置：right-标签右对齐居左，left-标签左对齐居左，top-标签在顶部 */
  labelPosition?: 'left' | 'right' | 'top'
  /** 栅格占位（共 24 栏），设置后所有 FormItem 默认使用该值，常用 6/8/12 */
  span?: number
  /** 组件尺寸 */
  size?: 'large' | 'default' | 'small'
  /** 是否行内布局 */
  inline?: boolean
  /** 是否禁用 */
  disabled?: boolean
}

/** 组件事件（defineEmits 与内部 composable 共用） */
export interface FormEmits {
  (e: 'submit', formData: Record<string, any>): void
  (e: 'validate', result: { valid: boolean, errors: Record<string, string> }): void
}
