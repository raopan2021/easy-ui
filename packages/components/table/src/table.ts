import type { ExtractPropTypes } from 'vue'

import { buildProps, definePropType } from '../../../utils'

export interface TableColumn {
  /** 字段名 */
  prop: string
  /** 列标题 */
  name?: string
  /** 列宽 */
  width?: string | number
  /** 最小宽度 */
  minWidth?: string | number
  /** 对齐方式 */
  align?: 'left' | 'center' | 'right'
  /** 是否可排序 */
  sortable?: boolean
  /** 是否超长省略 */
  ellipsis?: boolean
  /** 自定义格式化函数 */
  formatter?: (row: any, column: TableColumn, cellValue: any, index: number) => any
  /** 是否可见 */
  visible?: boolean
  /** 是否固定列 */
  fixed?: boolean
  /** 是否可拖拽 */
  drag?: boolean
  /** 前缀内容 */
  prefix?: string
  /** 后缀内容 */
  suffix?: string
  /** 是否参与合计 */
  summary?: boolean
  /** 合计自定义文本 */
  summaryText?: string
}

export type PaginationPosition = 'left' | 'center' | 'right'

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
  showIndex: Boolean,
  indexLabel: {
    type: String,
    default: '序号',
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
    default: 18,
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
  'selection-change': (_rows: any[]) => true,
  'row-click': (_row: any, _column: TableColumn) => true,
  'sort-change': (_prop: string, _order: 'ascending' | 'descending') => true,
  'page-change': (_page: number) => true,
  'page-size-change': (_size: number) => true,
  'column-order-change': (_columns: TableColumn[]) => true,
  'refresh': () => true,
  'export': () => true,
  'expand-change': (_row: any, _expanded: boolean) => true,
  'tree-expand': (_row: any, _expanded: boolean) => true,
}
export interface TableEmits {
  'selection-change': [rows: any[]]
  'row-click': [row: any, column: TableColumn]
  'sort-change': [prop: string, order: 'ascending' | 'descending']
  'page-change': [page: number]
  'page-size-change': [size: number]
  'column-order-change': [columns: TableColumn[]]
  'refresh': []
  'export': []
  'expand-change': [row: any, expanded: boolean]
  'tree-expand': [row: any, expanded: boolean]
}
