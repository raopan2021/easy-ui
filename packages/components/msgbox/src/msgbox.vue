<script setup lang="ts">
import { msgboxState } from './msgbox'
import { useMsgbox } from './use-msgbox'

defineOptions({ name: 'EasyMsgbox' })

// ──── 视图层交互逻辑（聚焦 / 图标 / 事件 / 校验）────
const { inputRef, showIcon, handleOverlayClick, handleEsc, handleClose, handleCancel, handleConfirm }
  = useMsgbox(msgboxState)
</script>

<template>
  <Teleport to="body">
    <Transition name="easy-msgbox-fade">
      <div
        v-if="msgboxState.visible" class="easy-msgbox-overlay easy-msgbox-overlay--center"
        @click.self="handleOverlayClick"
      >
        <Transition name="easy-msgbox-zoom">
          <div
            v-if="msgboxState.visible" class="easy-msgbox" :class="[msgboxState.options.customClass]" role="dialog"
            aria-modal="true" @keydown.esc="handleEsc"
          >
            <!-- 关闭按钮 -->
            <button
              v-if="msgboxState.options.showClose !== false" class="easy-msgbox__close" aria-label="关闭"
              @click="handleClose"
            >
              <svg
                viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5"
                stroke-linecap="round"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <!-- 头部：图标 + 标题 -->
            <div class="easy-msgbox__header" :class="{ 'easy-msgbox__header--no-title': !msgboxState.options.title }">
              <div
                v-if="showIcon" class="easy-msgbox__icon"
                :class="`easy-msgbox__icon--${msgboxState.options.type || 'info'}`"
              >
                <!-- success -->
                <svg
                  v-if="msgboxState.options.type === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="8,12 11,15 16,9" />
                </svg>
                <!-- warning -->
                <svg
                  v-else-if="msgboxState.options.type === 'warning'" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <!-- danger -->
                <svg
                  v-else-if="msgboxState.options.type === 'danger'" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <!-- info (default) -->
                <svg
                  v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round" stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </div>
              <span v-if="msgboxState.options.title" class="easy-msgbox__title">{{ msgboxState.options.title }}</span>
            </div>

            <!-- 内容 -->
            <div class="easy-msgbox__body">
              <!-- eslint-disable-next-line vue/no-v-html -->
              <p
                v-if="msgboxState.options.dangerouslyUseHTMLString" class="easy-msgbox__message"
                v-html="msgboxState.options.message"
              />
              <p v-else class="easy-msgbox__message">
                {{ msgboxState.options.message }}
              </p>

              <!-- 输入框 -->
              <div v-if="msgboxState.options.showInput" class="easy-msgbox__input-wrap">
                <textarea
                  v-if="msgboxState.options.input?.inputType === 'textarea'" ref="inputRef"
                  v-model="msgboxState.inputValue" class="easy-msgbox__input easy-msgbox__input--textarea"
                  :class="{ 'easy-msgbox__input--error': msgboxState.inputError }"
                  :placeholder="msgboxState.options.input?.placeholder || ''" rows="3" @keydown.enter.ctrl="handleConfirm"
                />
                <input
                  v-else ref="inputRef" v-model="msgboxState.inputValue" class="easy-msgbox__input"
                  :class="{ 'easy-msgbox__input--error': msgboxState.inputError }"
                  :type="msgboxState.options.input?.inputType || 'text'"
                  :placeholder="msgboxState.options.input?.placeholder || ''" @keydown.enter="handleConfirm"
                >
                <Transition name="easy-msgbox-err">
                  <span v-if="msgboxState.inputError" class="easy-msgbox__input-error">{{ msgboxState.inputError }}</span>
                </Transition>
              </div>
            </div>

            <!-- 按钮区 -->
            <div class="easy-msgbox__footer">
              <button
                v-if="msgboxState.options.showCancelButton !== false && msgboxState.options.showCancelButton"
                class="easy-msgbox__btn easy-msgbox__btn--cancel" :disabled="msgboxState.loading" @click="handleCancel"
              >
                {{ msgboxState.options.cancelButtonText || '取消' }}
              </button>
              <button
                v-if="msgboxState.options.showConfirmButton !== false"
                class="easy-msgbox__btn easy-msgbox__btn--confirm"
                :class="{
                  'easy-msgbox__btn--danger': msgboxState.options.confirmButtonDanger,
                }"
                :disabled="msgboxState.loading"
                @click="handleConfirm"
              >
                <span v-if="msgboxState.loading" class="easy-msgbox__btn-loader" />
                {{ msgboxState.options.confirmButtonText || '确定' }}
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<!-- 组件核心样式（scoped，独立维护在 msgbox-style.scss） -->
<style scoped src="./msgbox-style.scss" lang="scss"></style>
