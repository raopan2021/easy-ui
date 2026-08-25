/**
 * Rate 评分组件 - 类型与事件定义。
 *
 * 仅声明对外 props / emits 类型，组件交互逻辑已抽离到 use-rate.ts，
 * 样式独立维护在 rate-style.scss（对齐 markdown 组件的拆分规范）。
 */

/** 评分组件 props（全部可选，默认值在 rate.vue 的 withDefaults 中提供） */
export interface RateProps {
  /** 绑定值（当前评分，支持半星，例如 3.5） */
  modelValue?: number
  /** 最大分值 / 星星数量 */
  max?: number
  /** 是否禁用 */
  disabled?: boolean
  /** 是否允许半选 */
  allowHalf?: boolean
  /** 是否显示辅助文字 */
  showText?: boolean
  /** 辅助文字数组（按分值索引，1 分对应 texts[0]） */
  texts?: string[]
  /** 选中星星颜色 */
  color?: string
  /** 未选中星星颜色 */
  voidColor?: string
  /** 尺寸：large | default | small */
  size?: 'large' | 'default' | 'small'
}

/** 组件事件（defineEmits 与内部 composable 共用，callable 形式便于 emit 直接标注类型） */
export interface RateEmits {
  (e: 'update:modelValue', value: number): void
  (e: 'change', value: number): void
}
