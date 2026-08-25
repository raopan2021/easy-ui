/**
 * 仿钉钉风格基础节点（BaseNode）类型定义。
 *
 * 从原 baseNode.vue 内联 defineProps / defineEmits 抽离，
 * 供 .vue 与组合式逻辑 use-base-node.ts 共用。
 */

/** 仿钉钉风格基础节点属性 */
export interface BaseNodeProps {
  /** 节点名称文本 */
  text?: string
  /** 办理人标识 */
  permissionFlag?: string
  /** 流程状态颜色配置（非空时进入只读展示态） */
  chartStatusColor?: any[]
  /** 节点状态：0 未完成 / 1 待办 / 2 已完成 */
  status?: number | null
  /** 节点类型（between 时显示删除按钮） */
  type?: string
  /** 填充色 */
  fill?: string
  /** 描边色 */
  stroke?: string
}

/** 基础节点事件（defineEmits 与内部 composable 共用） */
export interface BaseNodeEmits {
  (e: 'updateNodeName', value: string): void
  (e: 'deleteNode'): void
  (e: 'editNode'): void
}
