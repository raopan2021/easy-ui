/** 单个搜索项配置 */
export interface SearchItem {
  /** 字段名 */
  prop: string
  /** 标签文本 */
  label: string
  /** 栅格占据的列数 */
  span?: number
  /** 组件类型 */
  type?:
    | 'input'
    | 'textarea'
    | 'select'
    | 'date'
    | 'daterange'
    | 'datetime'
    | 'datetimerange'
    | 'time'
    | 'timerange'
    | 'cascader'
    | 'range'
    | 'custom'
  /** range 类型底层输入框类型（如 'number'、'decimal'、'positiveInteger'），默认 'text' */
  inputType?:
    | 'text'
    | 'password'
    | 'number'
    | 'integer'
    | 'positiveInteger'
    | 'decimal'
    | `decimal${number}`
    | 'tel'
    | 'email'
    | 'url'
  /** 占位符 */
  placeholder?: string
  /** 是否可清空 */
  clearable?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 是否隐藏 */
  hide?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 最大长度 */
  maxlength?: number
  /** 是否显示字数统计 */
  showWordLimit?: boolean
  /** 前缀图标 */
  prefixIcon?: string
  /** 后缀图标 */
  suffixIcon?: string
  /** textarea 行数 */
  rows?: number
  /** 选项列表（select 用） */
  options?: Array<{ label: string, value: any, disabled?: boolean }>
  /** 是否多选（select 用） */
  multiple?: boolean
  /** 是否可搜索（select 用） */
  filterable?: boolean
  /** 多选时返回值的类型（select、cascader 用） */
  valueType?: 'array' | 'string'
  /** 多选且 valueType='string' 时的分隔符（select、cascader 用） */
  separator?: string
  /** 级联选择器选项（cascader 用） */
  cascaderOptions?: Array<{ label: string, value: any, children?: any[] }>
  /** 日期格式 */
  format?: string
  /** 日期值格式 */
  valueFormat?: string
  /** 是否显示秒（datetime 用） */
  showSeconds?: boolean
  /** 范围选择结束属性名（daterange、datetimerange、timerange 用） */
  endProp?: string
  /** 范围分隔符 */
  rangeSeparator?: string
  /** 开始日期占位符 */
  startPlaceholder?: string
  /** 结束日期占位符 */
  endPlaceholder?: string
  /** 是否必填 */
  required?: boolean
  /** 校验规则 */
  rules?: any[]
  /** 默认值 */
  defaultValue?: any
  /** 是否在收起时隐藏（用于展开/收起功能） */
  hiddenWhenCollapsed?: boolean
}

/** 组件 props（沿用原 search-form.vue 中的导出名 `Props`，保持对外兼容） */
export interface Props {
  /** 搜索项配置 */
  items?: SearchItem[]
  /** 初始数据 */
  modelValue?: Record<string, any>
  /** 是否内联布局 */
  inline?: boolean
  /** 组件尺寸 */
  size?: 'large' | 'default' | 'small'
  /** 加载状态 */
  loading?: boolean
  /** 搜索按钮文本 */
  searchButtonText?: string
  /** 重置按钮文本 */
  resetButtonText?: string
  /** 是否显示展开按钮 */
  showExpandButton?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 表单验证规则 */
  rules?: Record<string, any[]>
}

/**
 * withDefaults 处理后的 props：带默认值的字段必定存在。
 *
 * composable 内部直接访问 `items` / `showExpandButton` 等字段，
 * 使用该类型可避免重复的空值判断。
 */
export type ResolvedProps = Props & Required<Pick<Props, 'items' | 'showExpandButton'>>

/** 组件事件（defineEmits 与内部 composable 共用） */
export interface SearchFormEmits {
  (e: 'search', data: Record<string, any>): void
  (e: 'reset'): void
  (e: 'update:modelValue', value: Record<string, any>): void
}
