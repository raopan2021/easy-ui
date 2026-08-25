/**
 * 部门树数据节点。
 *
 * 同时兼容两种数据形态：
 * - 平铺数据：每条记录携带 `pid`（父级标识）字段，组件内部会自动构建为嵌套树；
 * - 嵌套数据：每条记录携带 `children` 子节点数组，组件直接使用。
 *
 * 保留索引签名，便于业务侧携带任意扩展字段（配合 {@link NodeKey} 做字段名映射）。
 */
export interface TreeNode {
  /** 节点唯一标识 */
  id?: string | number
  /** 父节点标识（平铺数据形态使用） */
  pid?: string | number
  /** 节点显示文本 */
  label?: string
  /** 子节点列表（嵌套数据形态使用） */
  children?: TreeNode[]
  /** 业务侧自定义扩展字段 */
  [key: string]: unknown
}

/**
 * 字段名映射配置。
 *
 * 用于把业务数据的真实字段名映射为组件内部使用的语义字段，
 * 避免业务侧为了适配组件而额外转换数据。
 */
export interface NodeKey {
  /** 唯一标识字段名 */
  id: string
  /** 父级标识字段名，缺省回退为 `'pid'` */
  pid?: string
  /** 显示文本字段名，缺省回退为 `'label'` */
  label?: string
  /** 子节点字段名，缺省回退为 `'children'` */
  children?: string
}

/** 部门树 props（defineProps 与内部 composable 共用） */
export interface DeptTreeProps {
  /** 树数据（平铺或嵌套均可） */
  data?: TreeNode[] | null
  /** 字段名映射配置 */
  nodeKey?: NodeKey
  /** 节点行自定义行内样式 */
  nodeStyle?: Record<string, string>
  /** 是否高亮当前选中节点 */
  highlightCurrent?: boolean
  /** 是否展开全部节点 */
  expandAll?: boolean
  /** 默认展开层级（<= 0 时展开全部） */
  defaultExpandLevel?: number
  /** 当前选中节点标识（受控） */
  selectedId?: string | number | null
  /** 空数据文案 */
  emptyText?: string
  /** 是否处于加载中 */
  loading?: boolean
}

/**
 * 兼容原 `dept-tree.vue` 内联导出的 `Props` 名称。
 *
 * 历史上该接口以 `Props` 之名从 SFC 中导出，为不破坏外部引用而保留别名。
 */
export type Props = DeptTreeProps

/**
 * `withDefaults` 处理后的部门树 props。
 *
 * 所有 props 均声明了默认值，因此 composable 内部可按「必填」使用，
 * 无需重复做空值兜底（与原 SFC 内的访问方式完全一致）。
 */
export type DeptTreeResolvedProps = Required<DeptTreeProps>

/** 部门树事件（defineEmits 与内部 composable 共用） */
export interface DeptTreeEmits {
  /** 选中节点时触发，回传完整节点数据 */
  (e: 'select', node: TreeNode): void
  /** 展开 / 折叠节点时触发，回传节点数据与展开后的状态 */
  (e: 'toggle', node: TreeNode, expanded: boolean): void
}

/** 单个部门节点 props（递归渲染，由 dept-tree 逐层下发） */
export interface DeptNodeProps {
  /** 当前节点数据 */
  node: TreeNode
  /** 字段名映射配置 */
  nodeKey: NodeKey
  /** 节点行自定义行内样式 */
  nodeStyle?: Record<string, string>
  /** 是否高亮当前选中节点 */
  highlightCurrent?: boolean
  /** 是否展开全部节点 */
  expandAll?: boolean
  /** 默认展开层级（<= 0 时展开全部） */
  defaultExpandLevel?: number
  /** 当前选中节点标识 */
  selectedId?: string | number | null
  /** 已手动展开的节点标识集合（父组件持有，全树共享） */
  expandedSet: Set<string>
  /** 当前节点所处层级（根节点为 0，用于计算缩进与默认展开） */
  depth?: number
}

/**
 * `withDefaults` 处理后的部门节点 props。
 *
 * `node` / `nodeKey` / `expandedSet` 为必传，其余均有默认值。
 */
export type DeptNodeResolvedProps = Required<DeptNodeProps>

/** 单个部门节点事件（签名与部门树一致，用于逐层向上冒泡） */
export interface DeptNodeEmits {
  /** 点击节点行 */
  (e: 'select', node: TreeNode): void
  /** 点击展开 / 折叠图标 */
  (e: 'toggle', node: TreeNode, expanded: boolean): void
}
