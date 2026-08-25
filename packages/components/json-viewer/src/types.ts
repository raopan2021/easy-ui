/** 组件 props */
export interface JsonViewerProps {
  /** 待展示数据（对象 / 数组 / JSON 字符串） */
  data?: unknown
  /** 默认展开层级，0 表示全部展开 */
  depth?: number
  /** 容器宽度 */
  width?: string
  /** 内容区最大高度 */
  maxHeight?: string
  /** 主题，auto 时跟随 html.dark */
  theme?: 'light' | 'dark' | 'auto'
  /** 是否显示工具栏 */
  showToolbar?: boolean
  /** 是否显示复制按钮 */
  showCopy?: boolean
  /** 是否显示展开 / 折叠按钮 */
  showExpand?: boolean
}

/** 递归节点组件 props */
export interface JsonNodeProps {
  /** 当前节点数据 */
  data: unknown
  /** 节点路径（如 root-user-0），作为展开状态的唯一标识 */
  path: string
  /** 当前节点深度 */
  depth: number
  /** 默认展开的最大深度，<=0 表示全部展开 */
  maxDepth: number
  /** 生效主题 */
  theme: string
  /** 手动展开的路径集合 */
  expandedSet: Set<string>
  /** 手动折叠的路径集合 */
  collapsedSet: Set<string>
}
