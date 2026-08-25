/**
 * 聊天输入框组件类型定义。
 *
 * 集中维护输入框组件对外暴露的 props / emits 类型，供 `chat-input.vue`
 * 与 `use-chat-input.ts` 共用，并保留原有的类型导出能力（对齐 markdown 组件拆分规范）。
 */

/** 聊天输入附件（含原始 File，便于上传） */
export interface ChatAttachment {
  /** 附件名称 */
  name: string
  /** 附件地址 */
  url: string
  /** 附件大小（字节） */
  size?: number
  /** 附件 MIME 类型 */
  type?: string
  /** 原始文件对象 */
  file?: File
}

/** 输入框组件 props */
export interface ChatInputProps {
  /** 输入框内容（v-model） */
  modelValue: string
  /** 占位文本 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 最大输入长度 */
  maxlength?: number
  /** 是否显示字符计数 */
  showCharCount?: boolean
  /** 是否允许上传附件 */
  allowUpload?: boolean
  /** 接受的文件类型 */
  accept?: string
  /** 是否允许多选 */
  multiple?: boolean
  /** 最大附件数量 */
  maxAttachments?: number
  /** 是否自动聚焦 */
  autofocus?: boolean
  /** 初始行数 */
  rows?: number
  /** 最小行数 */
  minRows?: number
  /** 最大行数 */
  maxRows?: number
}

/** 输入框组件事件（defineEmits 与内部 composable 共用） */
export interface ChatInputEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'send', content: string, attachments: ChatAttachment[]): void
  (e: 'upload', files: File[]): void
  (e: 'focus'): void
  (e: 'blur'): void
}
