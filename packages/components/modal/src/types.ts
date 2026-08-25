/**
 * Modal 弹窗组件类型定义。
 *
 * 从原 modal.vue 的内联类型抽离而来，保持对外类型兼容。
 * modal.vue 在 <script setup> 末尾通过 `export type { ... } from './types'`
 * 重新导出，确保外部（如 index.ts）的类型导入不受影响。
 */

/** 弹窗尺寸 */
export type ModalSize = 'small' | 'default' | 'large' | 'fullscreen'

/** 弹窗打开动画 */
export type ModalTransition = 'zoom' | 'slide-up' | 'slide-down' | 'fade'

/** 弹窗弹出位置，默认居中 */
export type ModalPlacement
  = | 'center' // 页面居中（默认）
    | 'top' // 顶部水平居中
    | 'top-left' // 左上角
    | 'top-right' // 右上角
    | 'bottom' // 底部水平居中
    | 'bottom-left' // 左下角
    | 'bottom-right' // 右下角
    | 'left' // 左侧垂直居中
    | 'right'

/** Modal 组件 props */
export interface ModalProps {
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
}

/** Modal 组件事件（defineEmits 与内部 composable 共用） */
export interface ModalEmits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
  (e: 'close'): void
  (e: 'open'): void
  (e: 'opened'): void
  (e: 'afterClose'): void
}
