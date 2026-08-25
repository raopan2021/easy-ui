/**
 * EasyCard 组件类型定义。
 *
 * 将原本内联在 card.vue 中的 props / emits 类型抽离到独立文件，
 * 供 .vue 与内部 composable 共用（对齐 markdown 组件拆分规范）。
 */

/** 卡片阴影展示时机 */
export type CardShadow = 'always' | 'hover' | 'never'

/** 组件 props */
export interface CardProps {
  /** 卡片标题 */
  title?: string
  /** 卡片标题前的图标字符 / 文本 */
  icon?: string
  /** 是否圆角 */
  rounded?: boolean
  /** 是否显示边框 */
  bordered?: boolean
  /** 阴影展示时机：always | hover | never */
  shadow?: CardShadow
  /** 是否禁用（禁用后不可交互、不可拖拽） */
  disabled?: boolean
  /** 是否可悬停（hover 时整体上浮 + 阴影） */
  hoverable?: boolean
  /** 高度占满父容器剩余空间（父容器建议 flex 布局或定高，卡片内部自动切换为 flex 纵向布局） */
  fill?: boolean
  /** 是否允许通过底部拖拽手柄手动调整高度 */
  resizable?: boolean
  /** 卡片高度（支持 v-model:height，拖拽调整时自动更新） */
  height?: number
  /** 拖拽调整高度的最小值（像素） */
  minHeight?: number
  /** 拖拽调整高度的最大值（像素），不传则不限制 */
  maxHeight?: number
}

/** 组件事件（defineEmits 与内部 composable 共用） */
export interface CardEmits {
  (e: 'update:height', value: number): void
  (e: 'resize', value: number): void
}
