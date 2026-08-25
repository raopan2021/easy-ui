/**
 * Switch 开关组件 - 类型与事件定义。
 *
 * 仅声明对外 props / emits 类型，组件交互逻辑已抽离到 use-switch.ts，
 * 样式独立维护在 switch-style.scss（对齐 markdown 组件的拆分规范）。
 */

/** 开关组件 props（全部可选，默认值在 switch.vue 的 withDefaults 中提供） */
export interface SwitchProps {
  /** 绑定值（开启 / 关闭对应的 activeValue / inactiveValue） */
  modelValue?: boolean | string | number
  /** 选中态对应的值 */
  activeValue?: boolean | string | number
  /** 未选中态对应的值 */
  inactiveValue?: boolean | string | number
  /** 是否禁用 */
  disabled?: boolean
  /** 尺寸：large | default | small */
  size?: 'large' | 'default' | 'small'
  /** 选中态背景色 */
  activeColor?: string
  /** 未选中态背景色 */
  inactiveColor?: string
  /** 选中态文字 */
  activeText?: string
  /** 未选中态文字 */
  inactiveText?: string
  /** 是否加载中（加载中禁止切换） */
  loading?: boolean
}

/** 组件事件（defineEmits 与内部 composable 共用，callable 形式便于 emit 直接标注类型） */
export interface SwitchEmits {
  (e: 'update:modelValue', value: boolean | string | number): void
  (e: 'change', value: boolean | string | number): void
}
