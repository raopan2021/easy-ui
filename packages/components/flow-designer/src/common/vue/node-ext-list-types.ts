/**
 * 节点扩展属性（NodeExtList）面板类型定义。
 *
 * 从原 nodeExtList.vue 内联 defineProps / ExtField 抽离，
 * 供 .vue 与组合式逻辑 use-node-ext-list.ts 共用。
 */

/** 扩展字段描述 */
export interface ExtField {
  /** 字段中文名（作为 label） */
  label: string
  /** 字段编码（作为 form 属性 key 与校验 prop） */
  code: string
  /** 是否必填 */
  must: boolean
  /** 字段类型：1 单行文本 / 2 多行文本 / 3 下拉 / 4 单选或复选 */
  type: number
  /** 是否多选（type=3/4 时生效） */
  multiple?: boolean
  /** 下拉 / 单选字典项 */
  dict?: Array<{ label: string, value: string }>
}

/** 节点扩展属性面板属性 */
export interface NodeExtListProps {
  /** 扩展属性表单数据（v-model） */
  modelValue?: any
  /** 扩展字段配置列表 */
  formList?: ExtField[]
  /** 是否禁用 */
  disabled?: boolean
}
