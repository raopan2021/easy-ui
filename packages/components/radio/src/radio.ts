import type { ComputedRef, ExtractPropTypes } from 'vue'

import { buildProps, definePropType } from '../../../utils'

export const radioProps = buildProps({
  label: {
    type: definePropType<string | number | boolean>([String, Number, Boolean]),
    default: undefined,
  },
  modelValue: {
    type: definePropType<string | number | boolean>([String, Number, Boolean]),
    default: undefined,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  size: {
    type: definePropType<'large' | 'default' | 'small'>(String),
    default: 'default',
  },
  name: {
    type: String,
    default: '',
  },
  border: {
    type: Boolean,
    default: false,
  },
} as const)

export type RadioProps = ExtractPropTypes<typeof radioProps>

/** RadioGroup 注入到 Radio 的上下文（供 Radio 读取组的值/禁用/尺寸，并触发组变更） */
export interface RadioGroupContext {
  modelValue: ComputedRef<string | number | boolean | undefined>
  disabled: ComputedRef<boolean>
  size: ComputedRef<string>
  changeEvent: (value: string | number | boolean) => void
}

/** Radio 与 RadioGroup 共享的注入 key（原字面量 'easyRadioGroup' 收敛为常量） */
export const RADIO_GROUP_KEY = 'easyRadioGroup'

/** Radio 事件（defineEmits 与内部 composable 共用） */
export interface RadioEmits {
  (e: 'update:modelValue', value: string | number | boolean): void
  (e: 'change', value: string | number | boolean): void
}

/** RadioGroup 组件 props */
export interface RadioGroupProps {
  /** 绑定值 */
  modelValue?: string | number | boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 尺寸 */
  size?: 'large' | 'default' | 'small'
  /** 原生 name 属性 */
  name?: string
}

/** RadioGroup 事件（defineEmits 与内部 provide 共用） */
export interface RadioGroupEmits {
  (e: 'update:modelValue', value: string | number | boolean): void
  (e: 'change', value: string | number | boolean): void
}

/** 兼容旧版对象式 emits 声明（保留导出以维持对外 API 稳定） */
export const radioEmits = {
  'update:modelValue': (_value: string | number | boolean) => true,
  'change': (_value: string | number | boolean) => true,
}
