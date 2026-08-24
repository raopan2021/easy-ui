import type { ExtractPropTypes } from 'vue'

import { buildProps, definePropType } from '../../../utils'

export const cardProps = buildProps({
  title: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
  rounded: {
    type: Boolean,
    default: true,
  },
  bordered: {
    type: Boolean,
    default: true,
  },
  shadow: {
    type: definePropType<'always' | 'hover' | 'never'>(String),
    default: 'always',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  hoverable: {
    type: Boolean,
    default: false,
  },
  /** 高度占满父容器剩余空间（父容器建议 flex 布局或定高，卡片内部自动切换为 flex 纵向布局） */
  fill: {
    type: Boolean,
    default: false,
  },
  /** 是否允许通过底部拖拽手柄手动调整高度 */
  resizable: {
    type: Boolean,
    default: false,
  },
  /** 卡片高度（支持 v-model:height，拖拽调整时自动更新） */
  height: {
    type: Number,
    default: undefined,
  },
  /** 拖拽调整高度的最小值（像素） */
  minHeight: {
    type: Number,
    default: 120,
  },
  /** 拖拽调整高度的最大值（像素），不传则不限制 */
  maxHeight: {
    type: Number,
    default: undefined,
  },
} as const)

export type CardProps = ExtractPropTypes<typeof cardProps>
