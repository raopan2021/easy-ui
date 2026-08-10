import type { ExtractPropTypes } from 'vue'

import { buildProps, definePropType } from '../../../utils'

export interface SelectOption {
  [key: string]: any
}

export const selectProps = buildProps({
  modelValue: {
    type: definePropType<string | number | boolean | (string | number | boolean)[]>([
      String,
      Number,
      Boolean,
      Array,
    ]),
    default: undefined,
  },
  /** 选项数组，支持对象数组 [{label, value}, ...] 或基础数组 ['选项1', '选项2', ...] */
  options: {
    type: definePropType<SelectOption[] | string[]>(Array),
    default: () => [],
  },
  placeholder: {
    type: String,
    default: '请选择',
  },
  disabled: Boolean,
  clearable: {
    type: Boolean,
    default: true,
  },
  filterable: {
    type: Boolean,
    default: undefined,
  },
  /** 是否允许用户创建新条目，需配合 filterable 使用 */
  allowCreate: Boolean,
  multiple: Boolean,
  maxTagCount: {
    type: Number,
    default: 3,
  },
  size: {
    type: definePropType<'large' | 'default' | 'small'>(String),
    default: 'default',
  },
  listMaxHeight: {
    type: String,
    default: '274px',
  },
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
  /** 选项值对应的字段名，默认 `'value'` */
  valueKey: {
    type: String,
    default: 'value',
  },
  /** 选项标签对应的字段名，默认 `'label'` */
  labelKey: {
    type: String,
    default: 'label',
  },
  /** 选项禁用状态对应的字段名，默认 `'disabled'`。也可以是函数用于自定义禁用逻辑 */
  disabledKey: {
    type: definePropType<string | ((option: SelectOption) => boolean)>([String, Function]),
    default: 'disabled',
  },
  /** 是否启用远程搜索，需配合 remoteMethod 使用 */
  remote: Boolean,
  /** 远程搜索方法，接收搜索关键字作为参数 */
  remoteMethod: {
    type: definePropType<(query: string) => void | Promise<SelectOption[]>>(Function),
    default: undefined,
  },
  /** 是否显示加载中状态 */
  loading: Boolean,
  /** 远程搜索防抖延迟（毫秒），默认 300 */
  debounce: {
    type: Number,
    default: 300,
  },
  /** 多选时返回值的类型，'array' 返回数组，'string' 返回逗号分隔的字符串，默认 'array' */
  valueType: {
    type: definePropType<'array' | 'string'>(String),
    default: 'array',
  },
  /** 多选且 valueType='string' 时的分隔符，默认 ',' */
  separator: {
    type: String,
    default: ',',
  },
} as const)

export type SelectProps = ExtractPropTypes<typeof selectProps>

export const selectEmits = {
  'update:modelValue': (_value: any) => true,
  'change': (_value: any) => true,
  'clear': () => true,
  'remove-tag': (_value: any, _index: number) => true,
  'search': (query: string) => typeof query === 'string',
  'create': (_value: any) => true,
}
export interface SelectEmits {
  'update:modelValue': [value: any]
  'change': [value: any]
  'clear': []
  'remove-tag': [value: any, index: number]
  'search': [query: string]
  'create': [value: any]
}
