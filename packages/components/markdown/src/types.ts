import type { MarkdownTheme } from '../style/themes'

/** 下载/导出格式（pdf 为浏览器打印另存；pdf-file 为直接生成 PDF 文件） */
export type MarkdownDownloadType = 'md' | 'html' | 'pdf' | 'pdf-file' | 'docx' | 'png' | 'jpeg' | 'webp'

/** 图片导出格式 */
export type MarkdownImageType = 'png' | 'jpeg' | 'webp'

/** 视图模式 */
export type MarkdownView = 'edit' | 'preview' | 'split'

export interface MarkdownProps {
  /** 绑定值（Markdown 源码） */
  modelValue?: string
  /** 占位符 */
  placeholder?: string
  /** 是否显示工具栏 */
  showToolbar?: boolean
  /** 默认视图：edit | preview | split */
  defaultView?: MarkdownView
  /** 编辑区与预览区高度（像素），fill 为 true 时忽略 */
  height?: number
  /** 高度占满父容器剩余空间（父容器建议 flex 布局或定高） */
  fill?: boolean
  /** 编辑区显示行号 */
  lineNumbers?: boolean
  /** 预览区代码块显示行号 */
  codeBlockLineNumbers?: boolean
  /** 是否渲染 Mermaid 图表（需要安装 mermaid，未安装时自动降级为代码块） */
  mermaid?: boolean
  /** 编辑区是否软换行 */
  softWrap?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 导出文件名（不含扩展名） */
  exportName?: string
  /** 当前主题 key（default | github | clean，或自定义主题 key） */
  theme?: string
  /** 自定义主题列表，与内置主题合并，同名 key 覆盖 */
  themes?: MarkdownTheme[]
}

/** 组件事件（defineEmits 与内部 composable 共用） */
export interface MarkdownEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
  (e: 'save', value: string): void
  (e: 'download', type: MarkdownDownloadType, value: string): void
  (e: 'update:theme', value: string): void
}

export interface MermaidModule {
  initialize: (config: Record<string, unknown>) => void
  render: (id: string, text: string) => Promise<{ svg: string }>
}

export type Html2CanvasFn = (element: HTMLElement, opts: Record<string, unknown>) => Promise<HTMLCanvasElement>
