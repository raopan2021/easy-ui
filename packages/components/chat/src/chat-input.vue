<script setup lang="ts">
import type { ChatInputEmits, ChatInputProps } from './chat-input-types'

import { nextTick } from 'vue'
import EasyIcon from '../../icon'
import { useChatInput } from './use-chat-input'

defineOptions({ name: 'EasyChatInput' })

const props = withDefaults(defineProps<ChatInputProps>(), {
  placeholder: '请输入消息...',
  disabled: false,
  readonly: false,
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

const emit = defineEmits<ChatInputEmits>()

// ──── 输入框交互逻辑（输入值 / 自适应高度 / 发送 / 附件 / 输入法抽离到 composable）────
const {
  textareaRef,
  fileInputRef,
  inputValue,
  attachments,
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
} = useChatInput(props, emit)

// 暴露方法
defineExpose({
  focus: () => textareaRef.value?.focus(),
  blur: () => textareaRef.value?.blur(),
  clear: () => {
    inputValue.value = ''
    attachments.value = []
    emit('update:modelValue', '')
    nextTick(() => autoResize())
  },
})

// 保持对外类型导出兼容（原定义在 chat-input.vue）
export type { ChatAttachment, ChatInputEmits, ChatInputProps } from './chat-input-types'
</script>

<template>
  <div class="easy-chat-input">
    <!-- 附件预览 -->
    <div v-if="attachments.length > 0" class="easy-chat-input__attachments">
      <div v-for="(attachment, index) in attachments" :key="index" class="easy-chat-input__attachment">
        <img v-if="isImage(attachment)" :src="attachment.url" :alt="attachment.name">
        <div v-else class="easy-chat-input__attachment-file">
          <EasyIcon name="el:Document" />
          <span>{{ attachment.name }}</span>
        </div>
        <button class="easy-chat-input__attachment-close" @click="removeAttachment(index)">
          <EasyIcon name="el:Close" :size="12" />
        </button>
      </div>
    </div>

    <!-- 输入框区域 -->
    <div class="easy-chat-input__wrapper">
      <div class="easy-chat-input__toolbar">
        <!-- 上传附件按钮 -->
        <button v-if="allowUpload" class="easy-chat-input__toolbar-btn" title="上传附件" @click="handleFileSelect">
          <EasyIcon name="el:Paperclip" />
        </button>
        <input ref="fileInputRef" type="file" :accept="accept" :multiple="multiple" style="display: none"
          @change="handleFileChange">

        <!-- 其他工具按钮插槽 -->
        <slot name="toolbar" />
      </div>

      <textarea ref="textareaRef" v-model="inputValue" class="easy-chat-input__textarea" :placeholder="placeholder"
        :disabled="disabled" :readonly="readonly" :maxlength="maxlength" :rows="rows" @keydown="handleKeydown"
        @input="handleInput" @focus="handleFocus" @blur="handleBlur" />

      <!-- 发送按钮 -->
      <button class="easy-chat-input__send-btn" :class="{ 'is-disabled': !canSend }"
        :disabled="disabled || readonly || !canSend" @click="handleSend">
        <EasyIcon name="el:Promotion" />
      </button>
    </div>

    <!-- 提示信息 -->
    <div v-if="showCharCount && maxlength" class="easy-chat-input__footer">
      <span>{{ inputValue.length }} / {{ maxlength }}</span>
    </div>
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 chat-input-style.scss） -->
<style scoped src="./chat-input-style.scss" lang="scss"></style>
