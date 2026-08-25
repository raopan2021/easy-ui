/**
 * 边操作浮层（EdgeTooltip）类型定义。
 *
 * 从原 EdgeTooltip.vue 内联 defineProps / defineEmits 抽离，
 * 供 .vue 与组合式逻辑 use-edge-tooltip.ts 共用。
 */

/** 边操作浮层属性 */
export interface EdgeTooltipProps {
  /** 浮层定位坐标 */
  position?: any
  /** 当前操作的边模型 */
  tooltipEdge?: any
}

/** 边操作浮层事件（defineEmits 与内部 composable 共用） */
export interface EdgeTooltipEmits {
  (e: 'option-click', value: any): void
  (e: 'close-tooltip'): void
}
