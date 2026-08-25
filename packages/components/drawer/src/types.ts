/** 抽屉弹出方向 */
export type DrawerDirection = 'left' | 'right' | 'top' | 'bottom'

/** 抽屉组件 props（与 defineProps 内联定义保持一致的对外类型） */
export interface DrawerProps {
  /** 是否显示抽屉（v-model） */
  modelValue: boolean
  /** 抽屉标题 */
  title?: string
  /** 抽屉方向 */
  direction?: DrawerDirection
  /** 是否显示关闭按钮 */
  showClose?: boolean
  /** 是否显示头部 */
  showHeader?: boolean
  /** 是否显示遮罩层 */
  showMask?: boolean
  /** 点击遮罩是否关闭 */
  closeOnClickModal?: boolean
  /** 自定义宽度/高度，方向为 left/right 时为宽度，为 top/bottom 时为高度 */
  size?: string | number
  /** 自定义类名 */
  customClass?: string
  /** 是否显示底部插槽区域 */
  showFooter?: boolean
}

/** 抽屉组件事件（defineEmits 与内部 composable 共用） */
export interface DrawerEmits {
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
  (e: 'open'): void
  (e: 'opened'): void
  (e: 'afterClose'): void
}
