import type { IDomEditor, IEditorConfig, IToolbarConfig } from '@wangeditor/editor'

/**
 * RichText 富文本编辑器 - 类型与事件定义。
 *
 * 仅声明对外 props / emits 类型，交互逻辑抽离到 use-richtext.ts，
 * 样式独立维护在 richtext-style.scss（scoped）与 richtext-theme.scss（dark 全局覆盖）。
 */
export interface RichTextProps {
  /** 绑定值（HTML 字符串） */
  modelValue?: string
  /** 占位符 */
  placeholder?: string
  /** 高度（像素） */
  height?: number
  /** 最小高度（像素） */
  minHeight?: number
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 是否显示默认工具栏 */
  showToolbar?: boolean
  /** 工具栏配置 */
  toolbarConfig?: Partial<IToolbarConfig>
  /** 编辑器配置 */
  editorConfig?: Partial<IEditorConfig>
}

/** 组件事件（defineEmits 与内部 composable 共用） */
export interface RichTextEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
  (e: 'created', editor: IDomEditor): void
  (e: 'focus', editor: IDomEditor): void
  (e: 'blur', editor: IDomEditor): void
  (e: 'destroyed', editor: IDomEditor): void
}

/** 对外透出 wangeditor 的编辑器实例类型，便于消费方在 @created / @focus 等事件中直接引用 */
export type { IDomEditor }
