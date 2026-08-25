<script setup lang="ts">
import type { ChatMessageEmits, ChatMessageProps } from './chat-message-types'

import EasyIcon from '../../icon'
import { useChatMessage } from './use-chat-message'

defineOptions({ name: 'EasyChatMessage' })

const props = withDefaults(defineProps<ChatMessageProps>(), {
  showAvatar: true,
  showName: false,
  showTime: false,
  showActions: true,
  allowCopy: true,
  allowRegenerate: true,
  allowDelete: false,
  typingSpeed: 50,
})

const emit = defineEmits<ChatMessageEmits>()

// ──── 消息渲染与交互逻辑（Markdown / 打字光标 / 复制等抽离到 composable）────
const {
  textRef,
  isTyping,
  renderedMarkdown,
  formatTime,
  formatSize,
  isImage,
  handleCopy,
  handleRegenerate,
  handleDelete,
  handleAttachmentClick,
} = useChatMessage(props, emit)

// 保持对外类型导出兼容（原定义在 chat-message.vue）
export type { ChatAttachment, ChatMessage, ChatMessageEmits, ChatMessageProps } from './chat-message-types'
</script>

<template>
  <div
    class="easy-chat-message"
    :class="{
      'is-user': message.role === 'user',
      'is-assistant': message.role === 'assistant',
      'is-system': message.role === 'system',
    }"
  >
    <!-- 头像 -->
    <div v-if="showAvatar" class="easy-chat-message__avatar">
      <slot name="avatar" :message="message">
        <img v-if="message.avatar" :src="message.avatar" :alt="message.role">
        <EasyIcon v-else-if="message.role === 'user'" name="el:User" />
        <EasyIcon v-else-if="message.role === 'assistant'" name="el:ChatDotRound" />
        <EasyIcon v-else name="el:InfoFilled" />
      </slot>
    </div>

    <!-- 消息内容 -->
    <div class="easy-chat-message__content">
      <!-- 用户名 -->
      <div v-if="message.name && showName" class="easy-chat-message__name">
        {{ message.name }}
      </div>

      <!-- 时间 -->
      <div v-if="message.time && showTime" class="easy-chat-message__time">
        {{ formatTime(message.time) }}
      </div>

      <!-- Markdown 内容 -->
      <div
        v-if="message.content && message.content.trim()" ref="textRef" class="easy-chat-message__text"
        :class="{ 'is-typing': isTyping }" v-html="renderedMarkdown"
      />

      <!-- 附件列表 -->
      <div v-if="message.attachments && message.attachments.length > 0" class="easy-chat-message__attachments">
        <div
          v-for="(attachment, index) in message.attachments" :key="index" class="easy-chat-message__attachment"
          @click="handleAttachmentClick(attachment)"
        >
          <!-- 图片附件 -->
          <img v-if="isImage(attachment)" :src="attachment.url" :alt="attachment.name">
          <!-- 其他附件 -->
          <div v-else class="easy-chat-message__attachment-file">
            <EasyIcon name="el:Document" />
            <span class="file-name">{{ attachment.name }}</span>
            <span class="size">{{ formatSize(attachment.size) }}</span>
          </div>
        </div>
      </div>

      <!-- 自定义消息内容插槽 -->
      <slot name="content" :message="message" />

      <!-- 操作按钮 -->
      <div v-if="showActions" class="easy-chat-message__actions">
        <slot name="actions" :message="message">
          <button v-if="allowCopy" class="easy-chat-message__action-btn" title="复制" @click="handleCopy">
            <EasyIcon name="el:DocumentCopy" />
          </button>
          <button
            v-if="allowRegenerate && message.role === 'assistant'" class="easy-chat-message__action-btn"
            title="重新生成" @click="handleRegenerate"
          >
            <EasyIcon name="el:Refresh" />
          </button>
          <button v-if="allowDelete" class="easy-chat-message__action-btn" title="删除" @click="handleDelete">
            <EasyIcon name="el:Delete" />
          </button>
        </slot>
      </div>
    </div>
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 chat-message-style.scss） -->
<style scoped src="./chat-message-style.scss" lang="scss"></style>
