/**
 * 跳转边（Skip）属性设置面板类型定义。
 *
 * 从原 skip.vue 内联 defineProps 抽离，供 .vue 与组合式逻辑 use-skip.ts 共用。
 */

/** 跳转边属性设置面板属性 */
export interface SkipProps {
  /** 边表单数据（v-model） */
  modelValue?: any
  /** 是否禁用 */
  disabled?: boolean
  /** 是否显示跳转条件 */
  skipConditionShow?: boolean
}
