/**
 * EasyCascader 级联选择器组件类型定义
 *
 * 原内联在 cascader.vue 中的类型（CascaderNode / CascaderProps / CascaderEmits）
 * 收敛到此文件，供 .vue 与 use-cascader-core.ts 共用，
 * 并通过 cascader.vue 的 `export type { ... } from './types'` 保持对外导出兼容。
 */

/** 级联选项节点（支持任意自定义字段，核心字段由 valueKey / labelKey / childrenKey 指定） */
export interface CascaderNode {
  [key: string]: any
}

/** 组件 props（defineProps 与内部 composable 共用） */
export interface CascaderProps {
  modelValue?: string | (string | number)[] | (string | number)[][] | any[][]
  options?: CascaderNode[]
  placeholder?: string
  disabled?: boolean
  clearable?: boolean
  filterable?: boolean
  multiple?: boolean
  maxTagCount?: number
  size?: 'large' | 'default' | 'small'
  /** 级联层级，默认不限制（根据 children 自动展开） */
  maxLevel?: number
  /** 懒加载回调，接收节点和回调函数 */
  lazyLoad?: (node: CascaderNode, callback: (children: CascaderNode[]) => void) => void
  /** 展开/关闭子菜单的触发方式，'click' 或 'hover'，默认 'click' */
  expandTrigger?: 'click' | 'hover'
  /** 相邻两级菜单是否展开时收起其他菜单，默认 false */
  accordion?: boolean
  /** 是否可以选择任意层级节点，默认 false（只能选叶子节点） */
  checkStrictly?: boolean
  /** 选项值对应的字段名，默认 'value' */
  valueKey?: string
  /** 选项标签对应的字段名，默认 'label' */
  labelKey?: string
  /** 子节点字段名，默认 'children' */
  childrenKey?: string
  /** 是否启用远程搜索，需配合 remoteMethod 使用 */
  remote?: boolean
  /** 远程搜索方法，接收搜索关键字作为参数 */
  remoteMethod?: (query: string) => void
  /** 是否显示加载中状态 */
  loading?: boolean
  /** 远程搜索防抖延迟（毫秒），默认 300 */
  debounce?: number
  /** 多选时返回值的类型，'array' 返回二维数组，'string' 返回逗号分隔的字符串，默认 'array' */
  valueType?: 'array' | 'string'
  /** 多选且 valueType='string' 时的分隔符，默认 ',' */
  separator?: string
  /** 菜单项自定义类名，可以是字符串或函数。如果是函数，接收当前节点和层级作为参数，返回类名字符串 */
  menuNodeClass?: string | ((node: CascaderNode, level: number) => string)
  /** 菜单项自定义样式，可以是字符串或函数。如果是函数，接收当前节点和层级作为参数，返回样式字符串 */
  menuNodeStyle?: string | ((node: CascaderNode, level: number) => string)
}

/** 组件事件（defineEmits 与内部 composable 共用，callable 形式便于 emit 直接标注类型） */
export interface CascaderEmits {
  (e: 'update:modelValue', value: (string | number)[] | (string | number)[][]): void
  (e: 'change', value: (string | number)[] | (string | number)[][]): void
  (e: 'expand-change', value: (string | number)[]): void
  (e: 'search', query: string): void
}
