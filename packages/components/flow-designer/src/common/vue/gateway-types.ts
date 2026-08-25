/**
 * 网关节点（Gateway）属性设置面板类型定义。
 *
 * 从原 gateway.vue 内联 defineProps / defineEmits 抽离，
 * 供 .vue 与组合式逻辑 use-gateway.ts 共用。
 */

/** 网关节点属性设置面板属性 */
export interface GatewayProps {
  /** 节点表单数据（v-model） */
  modelValue?: any
  /** 是否禁用 */
  disabled?: boolean
}

/** 网关节点事件（defineEmits 与内部 composable 共用） */
export interface GatewayEmits {
  (e: 'change', value: any): void
}
