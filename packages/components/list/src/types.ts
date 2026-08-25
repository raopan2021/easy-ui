/**
 * EasyList 组件类型定义。
 *
 * 将原本内联在 list.vue 中的 props / emits 类型抽离到独立文件，
 * 供 .vue 与内部 composable 共用（对齐 markdown 组件拆分规范）。
 */

/** 列表项（默认渲染使用 any，保持与原实现一致，不限制数据源结构） */
export type ListItem = any

/** 组件 props */
export interface ListProps {
  /** 数据源 */
  list?: ListItem[]
  /** 主字段名（默认 title） */
  title?: string
  /** 描述字段名 */
  description?: string
  /** 头像字段名或固定值 */
  avatar?: string
  /** 额外内容字段名 */
  extra?: string
  /** 唯一标识字段名（默认 id） */
  rowKey?: string
  /** 是否显示边框 */
  bordered?: boolean
  /** 是否显示空状态组件 */
  showEmpty?: boolean
  /** 空状态文字 */
  emptyText?: string
  /** 加载状态 */
  loading?: boolean
  /** 悬停效果 */
  hoverable?: boolean
  /** 指针样式（cursor: pointer） */
  clickable?: boolean
  /** 最大高度 */
  maxHeight?: string
  /** 头部内容 */
  header?: string
  /** 底部内容 */
  footer?: string
}

/** 组件事件（defineEmits 与内部 composable 共用） */
export interface ListEmits {
  (e: 'item-click', item: ListItem, index: number): void
}
