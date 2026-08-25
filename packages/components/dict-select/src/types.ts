/**
 * 字典项数据结构。
 *
 * 字段语义：
 * - `id` 为主键，默认作为下拉框的 value；
 * - `labelValue` 为业务英文代码（如 `NORMAL`），可通过 `returnField` 指定为返回值；
 * - `labelName` 为展示文本（如 `正常`），默认作为下拉框的 label。
 */
export interface DictOption {
  /** 值字段（默认 id） */
  id: string | number
  /** 值文本（英文代码，如 NORMAL） */
  labelValue: string
  /** 标签名（显示文本，如 正常） */
  labelName: string
  /** 是否禁用此选项 */
  disabled?: boolean
}

/** 字典选择器 props（defineProps 与内部 composable 共用） */
export interface DictSelectProps {
  /**
   * 绑定值
   * - 单选时为 string
   * - 多选时为 string[]，或逗号拼接的字符串（组件内部自动拆分）
   */
  modelValue?: string | string[] | null
  /** 字典类型标识，组件根据此值请求字典数据 */
  dictType: string
  /** 是否多选，默认 false */
  multiple?: boolean
  /** 是否可清空，默认 true */
  clearable?: boolean
  /** 是否禁用，默认 false */
  disabled?: boolean
  /** 占位文本，默认 '请选择' */
  placeholder?: string
  /** 尺寸 */
  size?: 'large' | 'default' | 'small'
  /** 多选时折叠标签的最大数量，默认 3 */
  maxTagCount?: number
  /** 是否可搜索过滤，默认 false */
  filterable?: boolean
  /** label 显示字段名，默认 'labelName'（即用 labelName 字段的值作为下拉显示文本） */
  labelField?: string
  /** 匹配字段名，用于回显和 change 事件中匹配字典项，默认 'id' */
  valueField?: string
  /** 返回值字段名，默认 'id'（可设为 'labelValue' 返回英文代码） */
  returnField?: string
  /**
   * 多选时 v-model 的值格式：
   * - 'array'（默认）：string[]
   * - 'string'：逗号拼接的字符串，如 '1,2,3'
   */
  valueFormat?: 'array' | 'string'
  /** 分隔符，默认 ',' */
  separator?: string
}

/**
 * `withDefaults` 处理后的字典选择器 props。
 *
 * `modelValue` 为受控绑定值、未声明默认值（可能为 undefined），
 * 故排除后再做 Required；composable 内部也不需要读取它。
 */
export type DictSelectResolvedProps = Required<Omit<DictSelectProps, 'modelValue'>>

/** 字典选择器事件（defineEmits 与内部 composable 共用） */
export interface DictSelectEmits {
  /** 绑定值更新 */
  (e: 'update:modelValue', value: string | string[] | null): void
  /** 值变化，同时返回完整字典项 */
  (e: 'change', value: string | string[] | null, items: DictOption | DictOption[] | null): void
  /** 清空 */
  (e: 'clear'): void
}
