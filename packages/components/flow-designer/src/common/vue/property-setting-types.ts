/**
 * 节点属性设置弹框（PropertySetting）类型定义。
 *
 * 从原 propertySetting.vue 内联 defineProps 抽离，供 .vue 与组合式逻辑
 * use-property-setting.ts 共用。该组件无 emits（通过 props.lf 直接回写）。
 */

/** 节点属性设置弹框属性 */
export interface PropertySettingProps {
  /** 表单值（未直接使用，保留以兼容原 Props 声明） */
  value?: any
  /** 当前选中的节点 / 边模型 */
  node?: any
  /** LogicFlow 实例，用于回写节点属性 */
  lf?: any
  /** 是否禁止 */
  disabled?: boolean
  /** 是否显示跳转条件 */
  skipConditionShow?: boolean
  /** 节点列表 */
  nodes?: any[]
  /** 连线列表 */
  skips?: any[]
}
