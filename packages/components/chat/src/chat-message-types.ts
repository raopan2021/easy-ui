/**
 * 聊天消息组件类型定义。
 *
 * 集中维护消息组件对外暴露的 props / emits 类型，供 `chat-message.vue`
 * 与 `use-chat-message.ts` 共用，并保留原有的类型导出能力（对齐 markdown 组件拆分规范）。
 */

/** 聊天附件 */
export interface ChatAttachment {
  /** 附件名称 */
  name: string
  /** 附件地址 */
  url: string
  /** 附件大小（字节） */
  size?: number
  /** 附件 MIME 类型 */
  type?: string
}

/** 单条聊天消息 */
export interface ChatMessage {
  /** 消息唯一标识 */
  id?: string | number
  /** 消息角色：用户 / 助手 / 系统 */
  role: 'user' | 'assistant' | 'system'
  /** 消息文本内容 */
  content?: string
  /** 发送者名称 */
  name?: string
  /** 发送者头像地址 */
  avatar?: string
  /** 发送时间 */
  time?: string | Date
  /** 附属附件列表 */
  attachments?: ChatAttachment[]
  /** 是否正在打字（流式输出标记） */
  typing?: boolean
}

/** 消息组件 props */
export interface ChatMessageProps {
  /** 单条消息数据 */
  message: ChatMessage
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
  /** 打字速度（毫秒/字） */
  typingSpeed?: number
}

/** 消息组件事件（defineEmits 与内部 composable 共用） */
export interface ChatMessageEmits {
  (e: 'copy', content: string): void
  (e: 'regenerate', message: ChatMessage): void
  (e: 'delete', message: ChatMessage): void
  (e: 'attachment-click', attachment: ChatAttachment): void
}
