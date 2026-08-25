/**
 * 中间节点（Between）属性设置面板类型定义。
 *
 * 从原 between.vue 内联 defineProps / defineEmits 抽离，
 * 供 .vue 与组合式逻辑 use-between.ts 共用。
 */

/** 中间节点属性设置面板属性 */
export interface BetweenProps {
  /** 节点表单数据（v-model） */
  modelValue?: any
  /** 是否禁用 */
  disabled?: boolean
  /** 是否展示协作方式选项 */
  showWays?: boolean
  /** 前置节点列表（用于驳回节点选择） */
  nodes?: any[]
  /** 连线列表 */
  skips?: any[]
}

/** 中间节点事件（defineEmits 与内部 composable 共用） */
export interface BetweenEmits {
  (e: 'update:modelValue', value: any): void
}
