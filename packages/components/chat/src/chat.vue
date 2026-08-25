<script setup lang="ts">
import type { ChatEmits, ChatProps } from './chat-types'

import EasyIcon from '../../icon'
import EasyChatInput from './chat-input.vue'
import EasyChatMessage from './chat-message.vue'
import { useChat } from './use-chat'

defineOptions({ name: 'EasyChat' })

const props = withDefaults(defineProps<ChatProps>(), {
  placeholder: '请输入消息...',
  disabled: false,
  readonly: false,
  loading: false,
  showAvatar: true,
  showName: false,
  showTime: true,
  showActions: true,
  allowCopy: true,
  allowRegenerate: true,
  allowDelete: false,
  enableTyping: false,
  typingSpeed: 50,
  maxlength: undefined,
  showCharCount: false,
  allowUpload: true,
  accept: '*/*',
  multiple: true,
  maxAttachments: 5,
  autofocus: false,
  rows: 3,
  minRows: 1,
  maxRows: 8,
})

const emit = defineEmits<ChatEmits>()

// defineSlots 为编译器宏（无需 import），供模板通过 slots.xxx 访问具名插槽
const slots = defineSlots()

// ──── 容器交互逻辑（滚动同步 / 发送转发 / 复制等抽离到 composable）────
const {
  messagesContainerRef,
  inputRef,
  inputValue,
  showScrollToBottom,
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
} = useChat(props, emit)

// 暴露方法
defineExpose({
  scrollToBottom,
  focus: () => inputRef.value?.focus(),
  blur: () => inputRef.value?.blur(),
  clear: () => inputRef.value?.clear(),
  getMessages: () => props.messages,
})

export type { ChatAttachment, ChatMessage } from './chat-message-types'
// 保持对外类型导出兼容（原定义在 chat.vue）
export type { ChatEmits, ChatProps } from './chat-types'
</script>

<template>
  <div class="easy-chat" :class="{ 'is-disabled': disabled }">
    <!-- 消息列表 -->
    <div ref="messagesContainerRef" class="easy-chat__messages" @scroll="handleScroll">
      <!-- 欢迎消息/空状态 -->
      <div v-if="messages.length === 0" class="easy-chat__empty">
        <slot name="empty">
          <div class="easy-chat__empty-content">
            <EasyIcon name="el:ChatDotRound" :size="48" />
            <p>开始对话吧！</p>
          </div>
        </slot>
      </div>

      <!-- 消息列表 -->
      <EasyChatMessage v-for="message in messages" :key="message.id || messageIndex(message)" :message="message"
        :show-avatar="showAvatar" :show-name="showName" :show-time="showTime" :show-actions="showActions"
        :allow-copy="allowCopy" :allow-regenerate="allowRegenerate" :allow-delete="allowDelete"
        :typing-speed="typingSpeed" @copy="handleCopy" @regenerate="handleRegenerate" @delete="handleDelete"
        @attachment-click="handleAttachmentClick">
        <!-- 自定义头像插槽 -->
        <template v-if="slots.avatar" #avatar="{ message: msg }">
          <slot name="avatar" :message="msg" />
        </template>

        <!-- 自定义内容插槽 -->
        <template v-if="slots['message-content']" #content="{ message: msg }">
          <slot name="message-content" :message="msg" />
        </template>

        <!-- 自定义操作按钮插槽 -->
        <template v-if="slots.actions" #actions="{ message: msg }">
          <slot name="actions" :message="msg" />
        </template>
      </EasyChatMessage>

      <!-- 加载更多指示器 -->
      <div v-if="loading" class="easy-chat__loading">
        <EasyIcon name="el:Loading" class="easy-chat__loading-icon" />
        <span>AI 正在思考...</span>
      </div>

      <!-- 滚动到底部按钮 -->
      <button v-if="showScrollToBottom" class="easy-chat__scroll-btn" @click="scrollToBottom()">
        <EasyIcon name="el:ArrowDown" />
      </button>
    </div>

    <!-- 输入框 -->
    <div v-if="!disabled" class="easy-chat__input-wrapper">
      <EasyChatInput ref="inputRef" v-model="inputValue" :placeholder="placeholder" :disabled="loading"
        :readonly="readonly" :maxlength="maxlength" :show-char-count="showCharCount" :allow-upload="allowUpload"
        :accept="accept" :multiple="multiple" :max-attachments="maxAttachments" :autofocus="autofocus" :rows="rows"
        :min-rows="minRows" :max-rows="maxRows" @send="handleSend" @upload="handleUpload" @focus="handleFocus"
        @blur="handleBlur">
        <!-- 输入框工具栏插槽 -->
        <template v-if="slots['input-toolbar']" #toolbar>
          <slot name="input-toolbar" />
        </template>
      </EasyChatInput>
    </div>
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 chat-style.scss） -->
<style scoped src="./chat-style.scss" lang="scss"></style>
