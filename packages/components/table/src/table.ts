import type { ExtractPropTypes } from 'vue'

import { buildProps, definePropType } from '../../../utils'

/** 列对齐方式 */
export type TableAlign = 'left' | 'center' | 'right'

/** 排序顺序：'asc' 升序 | 'desc' 降序 | null 不排序 */
export type SortOrder = 'asc' | 'desc' | null

/** 分页位置 */
export type PaginationPosition = 'left' | 'center' | 'right'

/** 列配置项（核心数据契约，组件内部与外部消费共用） */
export interface TableColumn {
  /** 列唯一标识，也是数据字段的 key */
  prop: string
  /** 列标题 */
  name?: string
  /** 列宽度（数字按 px 处理，字符串原样作为 CSS 宽度值） */
  width?: number | string
  /** 最小宽度（数字按 px 处理，字符串原样作为 CSS 最小宽度值） */
  minWidth?: number | string
  /** 文字对齐方式 */
  align?: TableAlign
  /** 是否可排序 */
  sortable?: boolean
  /** 超出文字是否省略（启用后鼠标悬浮显示完整内容 tooltip） */
  ellipsis?: boolean
  /** 自定义格式化函数：(row, value) => 显示文本 */
  formatter?: (row: Record<string, any>, value: any) => string
  /** 是否显示该列 */
  visible?: boolean
  /** 列固定位置：'left' | 'right' | undefined（用于横向滚动时固定列） */
  fixed?: 'left' | 'right'
  /** 是否可拖动排序（列设置面板内） */
  drag?: boolean
  /** 列内容前缀 */
  prefix?: string
  /** 列内容后缀 */
  suffix?: string
  /** 合计方式：'sum' 求和 | 'avg' 平均值 | false 不参与合计（默认不参与） */
  summary?: 'sum' | 'avg' | false
  /** 合计行该列显示的自定义文字（优先于 summary 计算值） */
  summaryText?: string
}

export const tableProps = buildProps({
  data: {
    type: definePropType<Record<string, any>[]>(Array),
    default: () => [],
  },
  columns: {
    type: definePropType<TableColumn[]>(Array),
    default: () => [],
  },
  title: {
    type: String,
    default: '',
  },
  loading: Boolean,
  loadingText: {
    type: String,
    default: '加载中...',
  },
  emptyText: {
    type: String,
    default: '暂无数据',
  },
  stripe: Boolean,
  border: Boolean,
  selectable: Boolean,
  // 序号列默认开启（重构前的默认值即为 true，还原该行为）
  showIndex: {
    type: Boolean,
    default: true,
  },
  indexLabel: {
    type: String,
    default: '#',
  },
  actionLabel: {
    type: String,
    default: '操作',
  },
  maxHeight: {
    type: definePropType<number | string>([Number, String]),
    default: undefined,
  },
  rowKey: {
    type: String,
    default: 'id',
  },
  rowClickable: Boolean,
  pagination: Boolean,
  total: {
    type: Number,
    default: 0,
  },
  page: {
    type: Number,
    default: 1,
  },
  pageSize: {
    type: Number,
    default: 10,
  },
  showPageSize: Boolean,
  pageSizeOptions: {
    type: definePropType<number[]>(Array),
    default: () => [10, 20, 50, 100],
  },
  compact: Boolean,
  highlight: Boolean,
  paginationPosition: {
    type: definePropType<PaginationPosition>(String),
    default: 'right',
  },
  showPageInput: Boolean,
  showColumnSettings: Boolean,
  columnDraggable: Boolean,
  showRefresh: Boolean,
  showExport: Boolean,
  selectionMode: {
    type: definePropType<'multiple' | 'single'>(String),
    default: 'multiple',
  },
  expandable: Boolean,
  expandTrigger: {
    type: definePropType<'icon' | 'click'>(String),
    default: 'icon',
  },
  defaultExpandedRows: {
    type: definePropType<number[]>(Array),
    default: () => [],
  },
  tree: Boolean,
  treeChildrenKey: {
    type: String,
    default: 'children',
  },
  treeIndentSize: {
    type: Number,
    default: 24,
  },
  lazy: Boolean,
  load: {
    type: definePropType<(row: any) => Promise<any[]>>(Function),
    default: undefined,
  },
  defaultExpandedKeys: {
    type: definePropType<(string | number)[]>(Array),
    default: () => [],
  },
  defaultExpandAll: Boolean,
  showSummary: Boolean,
  summaryLabel: {
    type: String,
    default: '合计',
  },
  actionFixed: {
    type: definePropType<'left' | 'right'>(String),
    default: undefined,
  },
  actionWidth: {
    type: Number,
    default: undefined,
  },
  autoHeight: {
    type: Boolean,
    default: true,
  },
  autoHeightOffset: {
    type: Number,
    default: 0,
  },
} as const)

export type TableProps = ExtractPropTypes<typeof tableProps>

export const tableEmits = {
  'selection-change': (_rows: Record<string, any>[]) => true,
  'row-click': (_row: Record<string, any>, _index: number) => true,
  'sort-change': (_key: string, _order: SortOrder) => true,
  'page-change': (_page: number) => true,
  'page-size-change': (_size: number) => true,
  'column-order-change': (_columns: TableColumn[]) => true,
  'refresh': () => true,
  'export': () => true,
  'expand-change': (_row: Record<string, any>, _expanded: boolean) => true,
  'tree-expand': (_row: Record<string, any>, _expanded: boolean) => true,
}

/** 组件事件（defineEmits 与内部 composable 共用，采用「可调用接口」形式） */
export interface TableEmits {
  (e: 'selection-change', rows: Record<string, any>[]): void
  (e: 'row-click', row: Record<string, any>, index: number): void
  (e: 'sort-change', key: string, order: SortOrder): void
  (e: 'page-change', page: number): void
  (e: 'page-size-change', size: number): void
  (e: 'column-order-change', columns: TableColumn[]): void
  (e: 'refresh'): void
  (e: 'export'): void
  (e: 'expand-change', row: Record<string, any>, expanded: boolean): void
  (e: 'tree-expand', row: Record<string, any>, expanded: boolean): void
}
