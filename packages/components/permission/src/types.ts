/**
 * 权限数据节点。
 *
 * 字段名可通过 idKey / labelKey / childrenKey / disabledKey 自定义，
 * 因此这里保持索引签名以兼容任意业务结构：
 * - `id`（默认字段）唯一标识
 * - `label`（默认字段）显示文本
 * - `children`（默认字段）子节点列表
 * - `disabled`（默认字段）是否禁用
 */
export interface Permission {
  [key: string]: any
}

/** 权限组件 props（与 permission.vue 的 defineProps 共用） */
export interface PermissionProps {
  /** 选中的权限 id 集合（含被选中的父级 id） */
  modelValue?: (string | number)[]
  /** 权限树数据 */
  data?: Permission[]
  /** 最大层级（1-5），决定表格列数与行构建方式 */
  maxLevel?: number
  /** 是否禁用全部勾选 */
  disabled?: boolean
  /** 是否显示全选 */
  showSelectAll?: boolean
  /** 全选文案 */
  selectAllText?: string
  /** 是否显示边框 */
  bordered?: boolean
  /** 是否显示已选权限区域 */
  showSelected?: boolean
  /** id 字段名 */
  idKey?: string
  /** label 字段名 */
  labelKey?: string
  /** children 字段名 */
  childrenKey?: string
  /** disabled 字段名 */
  disabledKey?: string
  /** 自定义禁用判断函数，优先级最高，用于复杂逻辑 */
  isDisabled?: (item: Permission, level: number) => boolean
  /** 禁用字段名，配合 disabledValue 使用（如 status） */
  disabledField?: string
  /** 禁用字段的值，支持单个值或数组（如 2 或 [1, 2]） */
  disabledValue?: string | number | (string | number)[]
  /** 自定义表头文案 */
  headers?: string[]
}

/** 组件事件（defineEmits 与内部 composable 共用） */
export interface PermissionEmits {
  /** 选中值变化（v-model） */
  (e: 'update:modelValue', value: (string | number)[]): void
  /** 选中值变化 */
  (e: 'change', value: (string | number)[]): void
}

/** 扁平化后的权限树节点 */
export interface TreeNode {
  id: string | number
  label: string
  disabled: boolean
  parent: string | number | null
  children: (string | number)[]
}

/** 节点勾选状态：未选 / 半选 / 全选 */
export type CheckState = 'none' | 'half' | 'checked'

/** 表格单元格内的权限项 */
export interface RowItem {
  _id: string | number
  _label: string
  _disabled: boolean
}

/** 表格行（适配一级至五级结构） */
export interface TableRow {
  key: string
  moduleId: string | number
  moduleLabel: string
  moduleDisabled: boolean
  /** 模块跨多少行 */
  moduleRowspan: number
  /** 是否是模块的第一行（显示模块名） */
  isModuleFirst: boolean
  pageId: string | number
  pageLabel: string
  pageDisabled: boolean
  /** 页面跨多少行 */
  pageRowspan: number
  /** 是否是页面的第一行（显示页面名） */
  isPageFirst: boolean
  /** 操作（三级用数组横向排列，四五级用单个对象） */
  action: RowItem | null
  actions: RowItem[]
  /** 该操作下的所有功能 */
  features: RowItem[]
  /** 该操作下的所有数据 */
  dataItems: RowItem[]
}
