// 节点数据
export interface TreeNodeData {
  /** 节点唯一标识 */
  id: string | number
  /** 节点显示文字 */
  label: string
  /** 子节点 */
  children?: TreeNodeData[]
  /** 是否禁用 */
  disabled?: boolean
  /** 自定义颜色（用于边框和装饰） */
  color?: string
  /** 展开状态 */
  expanded?: boolean
  /** 字体颜色（普通状态） */
  textColor?: string
  /** 背景色（普通状态） */
  backgroundColor?: string
  /** 悬停背景色 */
  activeBackgroundColor?: string
  /** 悬停字体颜色 */
  activeTextColor?: string
  /** 边框颜色（普通状态） */
  borderColor?: string
  /** 悬停边框颜色 */
  activeBorderColor?: string
  /** 额外数据 */
  [key: string]: any
}

// 节点配置
export interface NodeConfig {
  /** 节点宽度 */
  nodeWidth?: number
  /** 节点最小高度 */
  nodeMinHeight?: number
  /** 水平间距 */
  horizontalGap?: number
  /** 垂直间距 */
  verticalGap?: number
  /** 连接线颜色 */
  lineColor?: string
  /** 连接线宽度 */
  lineWidth?: number
  /** 节点唯一标识字段 */
  keyField?: string
  /** 子节点字段名 */
  childrenField?: string
  /** 标题字段名 */
  titleField?: string
  /** 描述字段名 */
  descField?: string
  /** 头像字段名 */
  avatarField?: string
}

/** 兼容旧名：树图节点类型 */
export type TreeChartNode = TreeNodeData

/**
 * 兼容旧名：tree-chart.vue 历史上直接导出的节点类型（与 TreeNodeData 等价）。
 * 保留以便已有 `import { TreeChatNode } from './tree-chart.vue'` 的调用方不受影响。
 */
export type TreeChatNode = TreeNodeData

/** 树图布局方向 */
export type TreeChartLayout = 'horizontal' | 'vertical'

/** 树图组件 props（defineProps 与内部 composable 共用） */
export interface TreeChartProps {
  /** 树形数据（单个树） */
  data?: TreeChatNode[]
  /** 多棵树数据（支持同时渲染多个独立的思维导图） */
  trees?: TreeChatNode[][]
  /** 节点配置 */
  nodeConfig?: NodeConfig
  /** 布局方向 */
  layout?: TreeChartLayout
  /** 默认展开所有节点 */
  defaultExpandAll?: boolean
  /** 受控展开的节点 keys（不传则使用内部状态） */
  expandedKeys?: (string | number)[]
  /** 是否显示工具栏 */
  showToolbar?: boolean
  /** 自定义颜色列表 */
  colors?: string[]
  /** 最小缩放比例 */
  minScale?: number
  /** 最大缩放比例 */
  maxScale?: number
  /** 是否启用展开收起功能 */
  expandable?: boolean
  /** 背景色 */
  backgroundColor?: string
  /** 是否显示网格背景 */
  showGrid?: boolean
  /** 网格颜色 */
  gridColor?: string
  /** 画布宽度 */
  width?: number | string
  /** 画布高度 */
  height?: number | string
}

/** 树图组件事件（defineEmits 与内部 composable 共用） */
export interface TreeChartEmits {
  /** 节点点击 */
  (e: 'node-click', node: TreeChatNode, nodePath: TreeChatNode[]): void
  /** 展开/收起 */
  (e: 'toggle-expand', node: TreeChatNode, expanded: boolean): void
  /** 更新展开的 keys（受控模式） */
  (e: 'update:expandedKeys', keys: (string | number)[]): void
}

/** 树节点组件 props（defineProps 与内部 composable 共用） */
export interface TreeNodeProps {
  /** 节点数据 */
  node: TreeNodeData
  /** 节点配置 */
  nodeConfig: NodeConfig
  /** 布局方向 */
  layout: 'horizontal' | 'vertical'
  /** 节点层级（从 0 开始） */
  level: number
  /** 颜色列表（按层级取色） */
  colors?: string[]
  /** 默认展开所有节点 */
  defaultExpandAll?: boolean
  /** 受控展开的节点 keys */
  expandedKeys?: Set<string | number>
  /** 是否启用展开收起功能 */
  expandable?: boolean
  /** 远程加载中的节点 keys */
  loadingKeys?: Set<string | number>
}

/** 树节点组件事件（defineEmits 与内部 composable 共用） */
export interface TreeNodeEmits {
  (e: 'node-click', node: TreeNodeData): void
  (e: 'toggle-expand', node: TreeNodeData, expanded: boolean): void
  (e: 'load-more', node: TreeNodeData): void
}
