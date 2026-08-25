/**
 * DictTag 字典标签组件类型定义。
 *
 * 从原 dict-tag.vue 的内联类型（DictItem / DictTagProps）抽离而来，
 * 保持对外类型兼容。dict-tag.vue 在 <script setup> 末尾通过
 * `export type { ... } from './types'` 重新导出，确保外部类型导入不受影响。
 */

/** 字典数据项 */
export interface DictItem {
  /** 值字段（默认 id） */
  id?: string | number
  /** 显示文本字段（默认 labelValue） */
  labelValue?: string
  /** Tag 样式类型 */
  type?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  /** 自定义颜色 */
  color?: string
  /** 图标名称（el: 前缀 = Element Plus 图标，如 el:User）。需要配合 show-icon 属性使用 */
  icon?: string
  /** 允许任意额外字段 */
  [key: string]: any
}

/** DictTag 组件 props */
export interface DictTagProps {
  /** 绑定值：单选为 string，多选为 string | string[]（支持逗号拼接字符串） */
  value?: string | string[] | number | null
  /** 字典类型标识，组件内部根据此值请求字典数据 */
  dictType: string
  /** 是否多选模式 */
  multiple?: boolean
  /** 标签尺寸 */
  size?: 'large' | 'default' | 'small'
  /** 主题效果 */
  effect?: 'light' | 'plain' | 'dark'
  /** 是否圆角 */
  round?: boolean
  /** label 显示字段名，默认 labelValue */
  labelField?: string
  /** value 匹配字段名，默认 id */
  valueField?: string
}
