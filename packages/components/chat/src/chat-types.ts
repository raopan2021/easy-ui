import type { ChatAttachment, ChatMessage } from './chat-message-types'

/**
 * 聊天容器组件类型定义。
 *
 * 集中维护容器组件对外暴露的 props / emits 类型，供 `chat.vue`
 * 与 `use-chat.ts` 共用，并保留原有的类型导出能力（对齐 markdown 组件拆分规范）。
 *
 * 注：`ChatAttachment` / `ChatMessage` 复用于消息子组件的类型定义，保持跨组件契约一致。
 */

/** 聊天容器组件 props */
export interface ChatProps {
  /** 消息列表 */
  messages: ChatMessage[]
  /** 输入框占位文本 */
  placeholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 是否加载中 */
  loading?: boolean
  /** 是否显示头像 */
  showAvatar?: boolean
  /** 是否显示用户名 */
  showName?: boolean
  /** 是否显示时间 */
  showTime?: boolean
  /** 是否显示操作按钮 */
  showActions?: boolean
  /** 是否允许复制 */
  allowCopy?: boolean
  /** 是否允许重新生成 */
  allowRegenerate?: boolean
  /** 是否允许删除 */
  allowDelete?: boolean
  /** 是否开启打字效果 */
  enableTyping?: boolean
  /** 打字速度（毫秒/字） */
  typingSpeed?: number
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
  /** 输入框初始行数 */
  rows?: number
  /** 输入框最小行数 */
  minRows?: number
  /** 输入框最大行数 */
  maxRows?: number
}

/** 聊天容器组件事件（defineEmits 与内部 composable 共用） */
export interface ChatEmits {
  (e: 'update:messages', messages: ChatMessage[]): void
  (e: 'send', content: string, attachments: ChatAttachment[]): void
  (e: 'upload', files: File[]): void
  (e: 'scroll-to-top'): void
  (e: 'scroll-to-bottom'): void
  (e: 'copy', content: string): void
  (e: 'regenerate', message: ChatMessage): void
  (e: 'delete', message: ChatMessage): void
  (e: 'attachment-click', attachment: ChatAttachment): void
}
