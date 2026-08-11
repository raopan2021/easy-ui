<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import EasyButton from '../../button'

defineOptions({ name: 'EasyModal', inheritAttrs: false })

// 右侧垂直居中

const props = withDefaults(
  defineProps<{
    /** 是否显示弹窗（v-model） */
    modelValue: boolean
    /** 弹窗标题 */
    title?: string
    /** 弹窗尺寸 */
    size?: ModalSize
    /** 是否显示关闭按钮 */
    showClose?: boolean
    /** 是否显示头部 */
    showHeader?: boolean
    /** 是否显示底部 */
    showFooter?: boolean
    /** 是否显示遮罩层 */
    showMask?: boolean
    /** 是否显示确认按钮 */
    showConfirm?: boolean
    /** 确认按钮文字 */
    confirmText?: string
    /** 取消按钮文字 */
    cancelText?: string
    /** 确认按钮加载中 */
    confirmLoading?: boolean
    /** 点击遮罩是否关闭 */
    closeOnClickModal?: boolean
    /** 弹窗打开动画 */
    transition?: ModalTransition
    /** 自定义宽度，优先级高于 size */
    width?: string | number
    /** 弹窗弹出位置，默认居中 */
    placement?: ModalPlacement
    /** 偏移量，与 placement 配合使用，如 { x: '20px', y: '20px' } */
    offset?: string | { x?: string, y?: string }
    /** 自定义类名 */
    customClass?: string
  }>(),
  {
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
  },
)
const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
  (e: 'close'): void
  (e: 'open'): void
  (e: 'opened'): void
  (e: 'afterClose'): void
}>()
type ModalSize = 'small' | 'default' | 'large' | 'fullscreen'
type ModalTransition = 'zoom' | 'slide-up' | 'slide-down' | 'fade'
type ModalPlacement
  = | 'center' // 页面居中（默认）
    | 'top' // 顶部水平居中
    | 'top-left' // 左上角
    | 'top-right' // 右上角
    | 'bottom' // 底部水平居中
    | 'bottom-left' // 左下角
    | 'bottom-right' // 右下角
    | 'left' // 左侧垂直居中
    | 'right'

const modalRef = ref<HTMLDivElement>()

const sizeMap: Record<ModalSize, string> = {
  small: '480px',
  default: '560px',
  large: '780px',
  fullscreen: '100%',
}

/** 解析 offset 为 { x, y } */
function parseOffset(): { x: string, y: string } {
  if (typeof props.offset === 'string') {
    return { x: props.offset, y: props.offset }
  }
  return {
    x: props.offset?.x ?? '0',
    y: props.offset?.y ?? '0',
  }
}

/** 遮罩层样式：根据 placement 决定 flex 对齐 */
const maskStyle = computed(() => {
  const p = props.placement
  const { x, y } = parseOffset()
  const style: Record<string, string> = {}

  // 水平方向
  if (p.includes('left')) {
    style.justifyContent = 'flex-start'
    style.paddingLeft = x
  }
  else if (p.includes('right')) {
    style.justifyContent = 'flex-end'
    style.paddingRight = x
  }
  else {
    style.justifyContent = 'center'
  }

  // 垂直方向
  if (p.startsWith('top')) {
    style.alignItems = 'flex-start'
    style.paddingTop = y
  }
  else if (p.startsWith('bottom')) {
    style.alignItems = 'flex-end'
    style.paddingBottom = y
  }
  else if (p === 'left' || p === 'right') {
    style.alignItems = 'center'
  }
  else {
    // center：垂直居中
    style.alignItems = 'center'
  }

  // 基础 padding
  if (!style.paddingLeft)
    style.paddingLeft = '20px'
  if (!style.paddingRight)
    style.paddingRight = '20px'
  if (!style.paddingTop)
    style.paddingTop = '20px'
  if (!style.paddingBottom)
    style.paddingBottom = '20px'

  return style
})

const modalStyle = computed(() => {
  const width = props.width ?? sizeMap[props.size]
  const style: Record<string, string> = {
    width: String(width),
  }
  if (props.size === 'fullscreen') {
    style.width = '100%'
    style.height = '100%'
    style.borderRadius = '0'
  }
  return style
})

const modalClass = computed(() => [`easy-modal--${props.size}`, props.customClass])

function handleClose() {
  emit('update:modelValue', false)
  emit('close')
}

function handleMaskClick() {
  if (props.closeOnClickModal) {
    handleClose()
  }
}

function handleConfirm() {
  emit('confirm')
}

function handleCancel() {
  handleClose()
  emit('cancel')
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      emit('open')
      // 等 DOM 渲染完后触发 opened
      requestAnimationFrame(() => {
        emit('opened')
      })
    }
  },
)

// ESC 关闭
watch(
  () => props.modelValue,
  (val) => {
    if (!val)
      return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && props.modelValue) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handler)
    // 关闭后移除
    watch(
      () => props.modelValue,
      (v) => {
        if (!v) {
          window.removeEventListener('keydown', handler)
          emit('afterClose')
        }
      },
      { once: true },
    )
  },
)
</script>

<template>
  <Teleport to="body">
    <Transition name="easy-modal-fade">
      <div
        v-if="modelValue"
        class="easy-modal-mask"
        :class="{ 'easy-modal-mask--transparent': !showMask }"
        :style="maskStyle"
        @click.self="handleMaskClick"
      >
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
                <svg
                  viewBox="0 0 24 24"
                  width="1em"
                  height="1em"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                >
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

<style scoped lang="scss">
@use '../../../easy-ui/src/styles/tokens' as *;

/* ========== 设计令牌 ========== */
$radius: 14px;
$shadow:
  0 20px 60px rgba(0, 0, 0, 0.15),
  0 4px 16px rgba(0, 0, 0, 0.06);
$transition-fast: 0.2s ease;

/* ========== 遮罩层 ========== */
.easy-modal-mask {
  position: fixed;
  inset: 0;
  z-index: 2000;
  background-color: $mask;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow-y: auto;
  padding: 20px;
  transition: background-color 0.25s ease;

  &.easy-modal-mask--transparent {
    background-color: transparent;
  }

  html.dark & {
    background-color: rgba(0, 0, 0, 0.6);
  }
}

/* ========== 弹窗主体 ========== */
.easy-modal {
  position: relative;
  background-color: var(--el-bg-color);
  border-radius: $radius;
  box-shadow: $shadow;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  max-width: calc(100vw - 40px);

  &.easy-modal--fullscreen {
    border-radius: 0;
    max-width: 100%;
    height: 100vh;
  }

  html.dark & {
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
  }
}

/* ========== 头部 ========== */
.easy-modal__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px 12px;
  user-select: none;
}

.easy-modal__title {
  font-size: 17px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1.4;
  flex: 1;
  min-width: 0;
}

.easy-modal__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  color: var(--el-text-color-regular);
  transition: all $transition-fast;
  flex-shrink: 0;
  margin: -4px -4px -4px 8px;

  &:hover {
    background-color: var(--el-fill-color-light);
    color: var(--el-text-color-secondary);
  }
  &:active {
    background-color: var(--el-fill-color-light);
  }
}

/* ========== 主体 ========== */
.easy-modal__body {
  padding: 4px 24px 20px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  line-height: 1.7;
  overflow-y: auto;
  flex: 1;

  // 美化滚动条
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--el-fill-color-light);
    border-radius: 4px;
  }
}

/* ========== 底部 ========== */
.easy-modal__footer {
  padding: 12px 24px 20px;
}

.easy-modal__footer-actions {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}

/* ========== 动画 ========== */

// 遮罩淡入淡出
.easy-modal-fade-enter-active {
  transition: opacity 0.25s ease;
}
.easy-modal-fade-leave-active {
  transition: opacity 0.2s ease;
}
.easy-modal-fade-enter-from,
.easy-modal-fade-leave-to {
  opacity: 0;
}

// 弹窗缩放
.easy-modal-zoom-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.easy-modal-zoom-leave-active {
  transition: all 0.2s ease;
}
.easy-modal-zoom-enter-from {
  opacity: 0;
  transform: scale(0.85) translateY(10px);
}
.easy-modal-zoom-leave-to {
  opacity: 0;
  transform: scale(0.95);
}

// 弹窗从下方滑入
.easy-modal-slide-up-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.3, 0.64, 1);
}
.easy-modal-slide-up-leave-active {
  transition: all 0.2s ease;
}
.easy-modal-slide-up-enter-from {
  opacity: 0;
  transform: translateY(40px);
}
.easy-modal-slide-up-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

// 弹窗从上方滑入
.easy-modal-slide-down-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.3, 0.64, 1);
}
.easy-modal-slide-down-leave-active {
  transition: all 0.2s ease;
}
.easy-modal-slide-down-enter-from {
  opacity: 0;
  transform: translateY(-40px);
}
.easy-modal-slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

// 弹窗淡入
.easy-modal-fade-enter-active {
  transition: all 0.3s ease;
}
.easy-modal-fade-leave-active {
  transition: all 0.2s ease;
}
.easy-modal-fade-enter-from,
.easy-modal-fade-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
