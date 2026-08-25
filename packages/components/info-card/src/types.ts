/** 描述信息项（description 传对象数组时的元素结构） */
export interface InfoCardDescItem {
  /** 描述文本 */
  text: string
  /** 前置图标（可选） */
  icon?: string
}

/** 状态标签类型（决定标签的预设配色） */
export type InfoCardStatusType = 'default' | 'primary' | 'success' | 'warning' | 'danger'

/** 信息卡片组件 props（与 defineProps 内联定义保持一致的对外类型） */
export interface InfoCardProps {
  /** 左侧图片地址 */
  image?: string
  /** 标题前的图标 */
  icon?: string
  /** 图标尺寸 */
  iconSize?: number
  /** 卡片标题 */
  title: string
  /** 描述信息，支持字符串数组或对象数组 */
  description?: string | string[] | InfoCardDescItem[]
  /** 状态标签文字 */
  status?: string
  /** 状态标签类型 */
  statusType?: InfoCardStatusType
  /** 自定义背景色 */
  backgroundColor?: string
  /** 自定义文字颜色 */
  textColor?: string
  /** 自定义标题颜色 */
  titleColor?: string
  /** 自定义描述文字颜色 */
  descriptionColor?: string
  /** 自定义状态标签背景色 */
  statusBackgroundColor?: string
  /** 自定义状态标签文字颜色 */
  statusTextColor?: string
  /** 是否可点击 */
  clickable?: boolean
  /** 是否显示边框 */
  bordered?: boolean
  /** 圆角大小 */
  radius?: number | string
}

/**
 * 组件内部使用的 props 类型：经 withDefaults 填充后所有可选项均已有值。
 *
 * 除 title 外的每个 prop 都在 .vue 中声明了默认值，因此这里用 Required 去掉可选性，
 * composable 内即可直接消费（无需重复兜底判断）。
 */
export type InfoCardResolvedProps = Required<InfoCardProps>

/** 信息卡片组件事件（defineEmits 与内部 composable 共用） */
export interface InfoCardEmits {
  /** 点击卡片（仅 clickable 为 true 时派发），透传原生事件对象 */
  click: [event: MouseEvent]
}
