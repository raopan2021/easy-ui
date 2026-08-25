/**
 * EasyUserPicker 用户选择器类型定义
 *
 * 原内联在 user-picker.vue 中的类型（UserItem / FetchUsersOptions / UserPickerProps）
 * 收敛到此文件，供 .vue 与 use-user-picker.ts 共用，
 * 并通过 user-picker.vue 的 `export type { ... } from './types'` 保持对外导出兼容。
 */

/** 用户对象（兼容任意业务字段，保持索引签名） */
export interface UserItem {
  [key: string]: any
}

/** 获取用户数据的选项 */
export interface FetchUsersOptions {
  keyword?: string
}

/** 组件 props（defineProps 与内部 composable 共用） */
export interface UserPickerProps {
  /** 绑定值 */
  modelValue?: number | string | number[] | string[] | null
  /** 是否多选 */
  multiple?: boolean
  /** 最大选择数量（多选模式） */
  max?: number
  /** 禁用 */
  disabled?: boolean
  /** 占位文字 */
  placeholder?: string
  /** 是否显示额外信息 */
  showExtra?: boolean
  /** 值字段名 */
  valueKey?: string
  /** 名称字段名 */
  nameKey?: string
  /** 头像字段名 */
  avatarKey?: string
  /** 额外信息字段名 */
  extraKey?: string
  /** 禁用判断函数 */
  isDisabled?: (user: UserItem) => boolean
  /** 多选时返回值类型：array 返回数组，string 返回逗号拼接字符串 */
  returnType?: 'array' | 'string'
}

/** 组件事件（defineEmits 与内部 composable 共用，callable 形式） */
export interface UserPickerEmits {
  (e: 'update:modelValue', value: number | string | number[] | string[] | null): void
  (e: 'change', value: number | string | number[] | string[] | null): void
  (e: 'pick'): void
}
