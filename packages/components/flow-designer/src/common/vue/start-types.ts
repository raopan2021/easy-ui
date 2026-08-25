/**
 * 开始节点（Start）属性设置面板类型定义。
 *
 * 从原 start.vue 内联 defineProps / defineEmits 抽离，
 * 供 .vue 与组合式逻辑 use-start.ts 共用。
 */

/** 开始节点属性设置面板属性 */
export interface StartProps {
  /** 节点表单数据（v-model） */
  modelValue?: any
  /** 是否禁用 */
  disabled?: boolean
}

/** 开始节点事件（defineEmits 与内部 composable 共用） */
export interface StartEmits {
  (e: 'change', value: any): void
}
