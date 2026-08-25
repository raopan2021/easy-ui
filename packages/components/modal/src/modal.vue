<script setup lang="ts">
import type { ModalEmits, ModalProps } from './types'

import EasyButton from '../../button'
import { useModalActions } from './use-modal-actions'
import { useModalLayout } from './use-modal-layout'

// 保持对外类型导出兼容（原定义在 modal.vue 内联）
export type { ModalEmits, ModalPlacement, ModalProps, ModalSize, ModalTransition } from './types'

defineOptions({ name: 'EasyModal', inheritAttrs: false })

const props = withDefaults(defineProps<ModalProps>(), {
  title: '',
  size: 'default',
  showClose: true,
  showHeader: true,
  showFooter: true,
  showMask: true,
  showConfirm: true,
  confirmText: '确定',
  cancelText: '取消',
  confirmLoading: false,
  closeOnClickModal: true,
  transition: 'zoom',
  width: undefined,
  placement: 'center',
  offset: () => ({ x: '0', y: '0' }),
  customClass: '',
})
const emit = defineEmits<ModalEmits>()

// ──── 布局 / 定位（纯 props 派生）────
const { maskStyle, modalStyle, modalClass } = useModalLayout(props)

// ──── 交互 / 生命周期事件 ────
const { modalRef, handleMaskClick, handleConfirm, handleCancel, handleClose } = useModalActions(props, emit)
</script>

<template>
  <Teleport to="body">
    <Transition name="easy-modal-fade">
      <div v-if="modelValue" class="easy-modal-mask" :class="{ 'easy-modal-mask--transparent': !showMask }"
        :style="maskStyle" @click.self="handleMaskClick">
        <Transition :name="`easy-modal-${transition}`" appear>
          <div v-if="modelValue" ref="modalRef" class="easy-modal" :class="modalClass" :style="modalStyle">
            <!-- 头部 -->
            <div v-if="showHeader" class="easy-modal__header">
              <div class="easy-modal__title">
                <slot name="header">
                  <span>{{ title }}</span>
                </slot>
              </div>
              <button v-if="showClose" class="easy-modal__close" @click="handleClose">
                <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </button>
            </div>

            <!-- 主体 -->
            <div class="easy-modal__body">
              <slot />
            </div>

            <!-- 底部 -->
            <div v-if="$slots.footer || showFooter" class="easy-modal__footer">
              <slot name="footer">
                <div class="easy-modal__footer-actions">
                  <EasyButton type="text" @click="handleCancel">
                    {{ cancelText }}
                  </EasyButton>
                  <EasyButton v-if="showConfirm" type="primary" :loading="confirmLoading" @click="handleConfirm">
                    {{ confirmText }}
                  </EasyButton>
                </div>
              </slot>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<!-- 组件核心样式（scoped，独立维护在 modal-style.scss） -->
<style scoped src="./modal-style.scss" lang="scss"></style>
