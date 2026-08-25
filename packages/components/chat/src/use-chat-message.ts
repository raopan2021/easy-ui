import type { ChatAttachment, ChatMessageEmits, ChatMessageProps } from './chat-message-types'

import MarkdownIt from 'markdown-it'

import { computed, onUpdated, ref } from 'vue'

/**
 * 聊天消息渲染与交互逻辑 composable。
 *
 * 将原来内联在 `chat-message.vue` 中的 Markdown 解析、打字光标管理、
 * 时间/大小格式化以及复制/重新生成/删除/附件点击等事件转发抽离为独立 composable，
 * 让 `.vue` 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 *
 * @param props 消息组件 props（需传入响应式对象）
 * @param emit 消息组件 emits（按 `ChatMessageEmits` 可调用接口标注，便于内部转发事件）
 */
export function useChatMessage(props: ChatMessageProps, emit: ChatMessageEmits) {
  /** 消息文本容器 ref（用于打字光标插入） */
  const textRef = ref<HTMLElement | null>(null)

  /** Markdown 解析器（开启 html / linkify / typographer / breaks） */
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: true, // 支持 \n 换行
  })

  /** 是否正在打字（流式输出标记） */
  const isTyping = computed(() => props.message.typing || false)

  /**
   * 实际展示的内容。
   * - 流式输出模式（typing=true）：message.content 实时更新，直接展示。
   * - 动画模式（typing=false）：展示完整内容。
   */
  const displayContent = computed(() => {
    return props.message.content || ''
  })

  /** 渲染后的 Markdown HTML 字符串（空内容返回空串） */
  const renderedMarkdown = computed(() => {
    const content = displayContent.value
    if (!content.trim())
      return ''

    return md.render(content)
  })

  /** 组件更新后，维护打字光标：移除旧光标并在最后一个文本节点后插入新光标 */
  onUpdated(() => {
    if (textRef.value) {
      // 移除旧的光标
      const oldCursor = textRef.value.querySelector('.typing-cursor')
      if (oldCursor) {
        oldCursor.remove()
      }

      // 如果正在打字，创建新的光标
      if (isTyping.value) {
        const cursor = document.createElement('span')
        cursor.className = 'typing-cursor'
        cursor.textContent = '|'

        // 找到最后一个文本节点
        const textNodes: Node[] = []
        const walk = (node: Node) => {
          if (node.nodeType === Node.TEXT_NODE && node.textContent && node.textContent.trim()) {
            textNodes.push(node)
          }
          for (const child of node.childNodes) {
            walk(child)
          }
        }
        walk(textRef.value)

        // 把光标插入到最后一个文本节点后面
        if (textNodes.length > 0) {
          const lastTextNode = textNodes[textNodes.length - 1]
          const parent = lastTextNode.parentNode
          if (parent && lastTextNode.nextSibling) {
            parent.insertBefore(cursor, lastTextNode.nextSibling)
          }
          else if (parent) {
            parent.appendChild(cursor)
          }
        }
        else {
          // 如果没有文本节点，直接追加到容器末尾
          textRef.value.appendChild(cursor)
        }
      }
    }
  })

  /** 格式化时间：相对时间（刚刚 / x分钟前 / x小时前）或具体时间 */
  function formatTime(time: string | Date): string {
    const date = typeof time === 'string' ? new Date(time) : time
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    // 小于1分钟
    if (diff < 60000) {
      return '刚刚'
    }
    // 小于1小时
    if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}分钟前`
    }
    // 小于24小时
    if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}小时前`
    }
    // 大于24小时，显示具体时间
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${month}-${day} ${hours}:${minutes}`
  }

  /** 格式化文件大小（B / KB / MB / GB） */
  function formatSize(size?: number): string {
    if (!size)
      return ''
    if (size < 1024)
      return `${size}B`
    if (size < 1024 * 1024)
      return `${(size / 1024).toFixed(1)}KB`
    if (size < 1024 * 1024 * 1024)
      return `${(size / (1024 * 1024)).toFixed(1)}MB`
    return `${(size / (1024 * 1024 * 1024)).toFixed(1)}GB`
  }

  /** 判断附件是否为图片（按 MIME 或扩展名） */
  function isImage(attachment: ChatAttachment): boolean {
    const type = attachment.type || attachment.name.split('.').pop()?.toLowerCase()
    const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp']
    return imageTypes.includes(type || '')
  }

  /** 复制消息：提取纯文本（保留换行）并写入剪贴板，转发 copy 事件 */
  function handleCopy() {
    if (!props.message.content)
      return

    // 创建临时 div 来渲染 Markdown
    const tempDiv = document.createElement('div')
    tempDiv.innerHTML = md.render(props.message.content)

    // 提取纯文本内容，保留 <br> 换行
    let textContent = ''
    const walker = document.createTreeWalker(tempDiv, NodeFilter.SHOW_TEXT, null)
    let node = walker.nextNode()
    while (node) {
      textContent += node.textContent
      // 在文本节点后添加换行符（模拟原始换行）
      if (node.nextSibling && node.nextSibling.nodeType !== Node.TEXT_NODE) {
        textContent += '\n'
      }
      node = walker.nextNode()
    }

    // 清理多余的空行
    textContent = textContent.replace(/\n{3,}/g, '\n\n')

    navigator.clipboard.writeText(textContent)
    emit('copy', textContent)
  }

  /** 重新生成：转发 regenerate 事件，携带当前消息 */
  function handleRegenerate() {
    emit('regenerate', props.message)
  }

  /** 删除：转发 delete 事件，携带当前消息 */
  function handleDelete() {
    emit('delete', props.message)
  }

  /** 附件点击：转发 attachment-click 事件，携带被点击附件 */
  function handleAttachmentClick(attachment: ChatAttachment) {
    emit('attachment-click', attachment)
  }

  return {
    textRef,
    isTyping,
    displayContent,
    renderedMarkdown,
    formatTime,
    formatSize,
    isImage,
    handleCopy,
    handleRegenerate,
    handleDelete,
    handleAttachmentClick,
  }
}
