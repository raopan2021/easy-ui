/**
 * 结束节点（End）属性设置面板类型定义。
 *
 * 从原 end.vue 内联 defineProps 抽离，供 .vue 与组合式逻辑 use-end.ts 共用。
 */

/** 结束节点属性设置面板属性 */
export interface EndProps {
  /** 节点表单数据（v-model） */
  modelValue?: any
  /** 是否禁用 */
  disabled?: boolean
}
