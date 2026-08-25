import type { ChatAttachment, ChatInputEmits, ChatInputProps } from './chat-input-types'

import { computed, nextTick, ref, watch } from 'vue'

/**
 * 聊天输入框交互逻辑 composable。
 *
 * 将原来内联在 `chat-input.vue` 中的输入值管理、文本框自适应高度、发送/上传、
 * 附件管理、输入法状态以及聚焦/失焦等逻辑抽离为独立 composable，
 * 让 `.vue` 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 *
 * @param props 输入框组件 props（需传入响应式对象）
 * @param emit 输入框组件 emits（按 `ChatInputEmits` 可调用接口标注）
 */
export function useChatInput(props: ChatInputProps, emit: ChatInputEmits) {
  /** 文本框 DOM ref */
  const textareaRef = ref<HTMLTextAreaElement | null>(null)
  /** 隐藏文件选择 input ref */
  const fileInputRef = ref<HTMLInputElement | null>(null)
  /** 输入框当前值（本地副本，配合 v-model 同步） */
  const inputValue = ref(props.modelValue)
  /** 已选附件列表 */
  const attachments = ref<ChatAttachment[]>([])
  /** 是否正在输入法组合输入中（用于屏蔽组合期间的 Enter 发送） */
  const isComposing = ref(false)

  /** 是否可发送（有内容或非空附件且未禁用） */
  const canSend = computed(() => {
    return (inputValue.value.trim() !== '' || attachments.value.length > 0) && !props.disabled
  })

  // 监听外部 modelValue 变化，同步到本地输入值
  watch(
    () => props.modelValue,
    (val) => {
      inputValue.value = val
    },
  )

  /** 根据内容自动调整文本框高度（受 minRows / maxRows 约束） */
  function autoResize() {
    const textarea = textareaRef.value
    if (!textarea)
      return

    textarea.style.height = 'auto'
    const lineHeight = 24 // 行高
    const minHeight = (props.minRows ?? 1) * lineHeight
    const maxHeight = (props.maxRows ?? 8) * lineHeight

    textarea.style.height = `${Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight)}px`
    textarea.style.overflowY = textarea.scrollHeight > maxHeight ? 'auto' : 'hidden'
  }

  /** 处理输入事件：自适应高度并同步 v-model */
  function handleInput(_e: Event) {
    autoResize()
    emit('update:modelValue', inputValue.value)
  }

  /** 处理键盘事件：Enter 发送（组合输入中或 Shift+Enter 换行时不发送） */
  function handleKeydown(e: KeyboardEvent) {
    // Shift + Enter: 换行
    if (e.shiftKey && e.key === 'Enter') {
      return
    }

    // Enter: 发送（不在输入法输入中）
    if (e.key === 'Enter' && !isComposing.value) {
      e.preventDefault()
      handleSend()
    }
  }

  /** 发送消息：发出 send 事件并清空输入与附件 */
  function handleSend() {
    if (!canSend.value)
      return

    const content = inputValue.value.trim()
    if (content === '' && attachments.value.length === 0)
      return

    emit('send', content, [...attachments.value])

    // 清空输入框和附件
    inputValue.value = ''
    emit('update:modelValue', '')
    attachments.value = []

    // 重置文本框高度
    nextTick(() => {
      autoResize()
    })
  }

  /** 触发隐藏的文件选择框 */
  function handleFileSelect() {
    fileInputRef.value?.click()
  }

  /** 处理文件选择变化：数量校验 + 构造附件列表 + 发出 upload 事件 */
  function handleFileChange(e: Event) {
    const target = e.target as HTMLInputElement
    const files = Array.from(target.files || [])

    if (files.length === 0)
      return

    // 检查附件数量限制
    if (attachments.value.length + files.length > (props.maxAttachments ?? 5)) {
      // eslint-disable-next-line no-alert
      alert(`最多只能上传 ${props.maxAttachments ?? 5} 个附件`)
      target.value = ''
      return
    }

    // 处理文件
    const newAttachments: ChatAttachment[] = []
    for (const file of files) {
      const url = URL.createObjectURL(file)
      newAttachments.push({
        name: file.name,
        url,
        size: file.size,
        type: file.type,
        file,
      })
    }

    attachments.value.push(...newAttachments)
    emit('upload', files)

    // 清空 input
    target.value = ''
  }

  /** 移除指定下标附件 */
  function removeAttachment(index: number) {
    attachments.value.splice(index, 1)
  }

  /** 判断附件是否为图片（按 MIME 或扩展名） */
  function isImage(attachment: ChatAttachment): boolean {
    const type = attachment.type || attachment.name.split('.').pop()?.toLowerCase()
    const imageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml', 'image/bmp']
    return imageTypes.includes(type || '')
  }

  /** 聚焦：转发 focus 事件 */
  function handleFocus() {
    emit('focus')
  }

  /** 失焦：转发 blur 事件 */
  function handleBlur() {
    emit('blur')
  }

  // 监听输入法事件（保持原实现：setup 阶段 textareaRef 尚未挂载，此处为兼容性保留原逻辑）
  if (textareaRef.value) {
    textareaRef.value.addEventListener('compositionstart', () => {
      isComposing.value = true
    })
    textareaRef.value.addEventListener('compositionend', () => {
      isComposing.value = false
    })
  }

  return {
    textareaRef,
    fileInputRef,
    inputValue,
    attachments,
    isComposing,
    canSend,
    autoResize,
    handleInput,
    handleKeydown,
    handleSend,
    handleFileSelect,
    handleFileChange,
    removeAttachment,
    isImage,
    handleFocus,
    handleBlur,
  }
}
