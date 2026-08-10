import type { ExtractPropTypes } from 'vue'

import { buildProps, definePropType } from '../../../utils'

export const inputProps = buildProps({
  modelValue: {
    type: definePropType<string | number>([String, Number]),
    default: '',
  },
  type: {
    type: definePropType<
      | 'text'
      | 'password'
      | 'textarea'
      | 'number'
      | 'integer'
      | 'positiveInteger'
      | 'decimal'
      | `decimal${number}`
      | 'tel'
      | 'email'
      | 'url'
    >(String),
    default: 'text',
  },
  placeholder: {
    type: String,
    default: '',
  },
  disabled: Boolean,
  readonly: Boolean,
  clearable: Boolean,
  maxlength: {
    type: Number,
    default: undefined,
  },
  showWordLimit: Boolean,
  /** 前缀图标名称，使用 EasyIcon 的 name 格式，如 `el:Search`、`svg:edit` */
  prefixIcon: {
    type: String,
    default: undefined,
  },
  /** 后缀图标名称，使用 EasyIcon 的 name 格式，如 `el:Calendar`、`svg:edit` */
  suffixIcon: {
    type: String,
    default: undefined,
  },
  /** 前置文本（如 URL 协议头），自动显示在输入框左侧 */
  prefix: {
    type: String,
    default: undefined,
  },
  /** 后置文本，自动显示在输入框右侧 */
  suffix: {
    type: String,
    default: undefined,
  },
  autocomplete: {
    type: String,
    default: 'off',
  },
  inputmode: {
    type: String,
    default: undefined,
  },
  size: {
    type: definePropType<'large' | 'default' | 'small'>(String),
    default: 'default',
  },
  /** textarea 初始行数，默认 2 */
  rows: {
    type: Number,
    default: 2,
  },
  /** textarea 是否允许拖动调整大小，默认 'vertical' */
  resize: {
    type: definePropType<'none' | 'both' | 'horizontal' | 'vertical'>(String),
    default: 'vertical',
  },
  /** 自动转为大写（仅 text 类型有效） */
  toUpperCase: Boolean,
  /** 仅允许大写字母和数字，自动删除其他字符（仅 text 类型有效，需配合 to-upper-case） */
  alphaNumOnly: Boolean,
  /** 数值范围限制（仅 integer / positiveInteger / decimal(N) 类型生效） */
  range: {
    type: definePropType<{ min?: number, max?: number, minInclusive?: boolean, maxInclusive?: boolean }>(Object),
    default: undefined,
  },
} as const)

export type InputProps = ExtractPropTypes<typeof inputProps>

export const inputEmits = {
  'update:modelValue': (value: string) => typeof value === 'string',
  'input': (value: string) => typeof value === 'string',
  'change': (value: string) => typeof value === 'string',
  'focus': (event: FocusEvent) => event instanceof FocusEvent,
  'blur': (event: FocusEvent) => event instanceof FocusEvent,
  'clear': () => true,
  'keydown': (event: KeyboardEvent) => event instanceof KeyboardEvent,
}
export interface InputEmits {
  'update:modelValue': [value: string]
  'input': [value: string]
  'change': [value: string]
  'focus': [event: FocusEvent]
  'blur': [event: FocusEvent]
  'clear': []
  'keydown': [event: KeyboardEvent]
}
