/**
 * 流程设计器（FlowDesigner）类型定义。
 *
 * 从原 flow-designer.vue 内联 `interface Props` 与 `defineEmits` 抽离，
 * 供 .vue 与组合式逻辑 use-flow-designer.ts 共用，保持对外类型导出兼容。
 */

/** 流程设计器组件属性 */
export interface FlowDesignerProps {
  /** 流程定义数据（warm-flow 格式），传入即初始化设计器画布 */
  flow?: any
}

/** 流程设计器事件（defineEmits 与内部 composable 共用） */
export interface FlowDesignerEmits {
  (e: 'save', value: any): void
}

/** 兼容原 flow-designer.vue 直接导出的 Props 类型 */
export type Props = FlowDesignerProps
