import type ChatInput from './chat-input.vue'

import type { ChatAttachment, ChatMessage } from './chat-message-types'
import type { ChatEmits, ChatProps } from './chat-types'

import { nextTick, ref, watch } from 'vue'

/**
 * 聊天容器交互逻辑 composable。
 *
 * 将原来内联在 `chat.vue` 中的消息列表滚动同步、发送/上传转发、滚动到底部按钮、
 * 复制/重新生成/删除/附件点击转发以及聚焦/失焦等逻辑抽离为独立 composable，
 * 让 `.vue` 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 *
 * @param props 聊天容器组件 props（需传入响应式对象）
 * @param emit 聊天容器组件 emits（按 `ChatEmits` 可调用接口标注）
 */
export function useChat(props: ChatProps, emit: ChatEmits) {
  /** 消息列表容器 ref（用于滚动控制） */
  const messagesContainerRef = ref<HTMLElement | null>(null)
  /** 子输入框组件实例 ref（用于转发 focus / blur / clear） */
  const inputRef = ref<InstanceType<typeof ChatInput> | null>(null)
  /** 容器本地输入值（v-model 绑定到子输入框） */
  const inputValue = ref('')
  /** 是否显示滚动到底部按钮 */
  const showScrollToBottom = ref(false)
  /** 是否正在滚动到顶部（用于加载历史消息时抑制自动滚动到底部） */
  const isScrollingTop = ref(false)

  // 监听消息列表变化，自动滚动到底部（但不在滚动到顶部时）
  watch(
    () => props.messages.length,
    async () => {
      await nextTick()
      // 如果正在滚动到顶部加载历史消息，不要自动滚动到底部
      if (!isScrollingTop.value) {
        scrollToBottom(false)
      }
    },
  )

  /** 计算消息在列表中的索引 */
  function messageIndex(message: ChatMessage): number {
    return props.messages.indexOf(message)
  }

  /** 处理子输入框发送：转发 send 事件并清空本地输入 */
  function handleSend(content: string, attachments: ChatAttachment[]) {
    emit('send', content, attachments)
    inputValue.value = ''
  }

  /** 处理子输入框上传：转发 upload 事件 */
  function handleUpload(files: File[]) {
    emit('upload', files)
  }

  /** 处理消息列表滚动：更新滚动到底部按钮 + 触发 scroll-to-top */
  function handleScroll(e: Event) {
    const target = e.target as HTMLElement
    const { scrollTop, scrollHeight, clientHeight } = target

    // 距离底部超过 200px 时显示滚动到底部按钮
    const distanceToBottom = scrollHeight - scrollTop - clientHeight
    showScrollToBottom.value = distanceToBottom > 200

    // 滚动到顶部时触发回调
    if (scrollTop === 0) {
      isScrollingTop.value = true // 标记正在滚动到顶部
      emit('scroll-to-top')

      // 延迟取消标记，确保加载完成后不会自动滚动到底部
      setTimeout(() => {
        isScrollingTop.value = false
      }, 1000)
    }
  }

  /** 滚动到底部（smooth 控制是否平滑滚动） */
  function scrollToBottom(smooth: boolean = true) {
    if (!messagesContainerRef.value)
      return

    const container = messagesContainerRef.value
    container.scrollTo({
      top: container.scrollHeight,
      behavior: smooth ? 'smooth' : 'auto',
    })

    showScrollToBottom.value = false
  }

  /** 处理复制：转发 copy 事件 */
  function handleCopy(content: string) {
    emit('copy', content)
  }

  /** 处理重新生成：转发 regenerate 事件 */
  function handleRegenerate(message: ChatMessage) {
    emit('regenerate', message)
  }

  /** 处理删除：转发 delete 事件 */
  function handleDelete(message: ChatMessage) {
    emit('delete', message)
  }

  /** 处理附件点击：转发 attachment-click 事件 */
  function handleAttachmentClick(attachment: ChatAttachment) {
    emit('attachment-click', attachment)
  }

  /** 处理聚焦（占位：聚焦时的可选逻辑） */
  function handleFocus() {
    // 可选：聚焦时的逻辑
  }

  /** 处理失焦（占位：失焦时的可选逻辑） */
  function handleBlur() {
    // 可选：失焦时的逻辑
  }

  return {
    messagesContainerRef,
    inputRef,
    inputValue,
    showScrollToBottom,
    isScrollingTop,
    messageIndex,
    handleSend,
    handleUpload,
    handleScroll,
    scrollToBottom,
    handleCopy,
    handleRegenerate,
    handleDelete,
    handleAttachmentClick,
    handleFocus,
    handleBlur,
  }
}
