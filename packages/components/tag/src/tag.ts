import type { ExtractPropTypes } from 'vue'

import { buildProps, definePropType } from '../../../utils'

export type TagType = 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
export type TagSize = 'large' | 'default' | 'small'
export type TagEffect = 'light' | 'plain' | 'dark'

export const tagProps = buildProps({
  /** 标签类型 */
  type: {
    type: definePropType<TagType>(String),
    default: 'default',
  },
  /** 标签尺寸 */
  size: {
    type: definePropType<TagSize>(String),
    default: 'default',
  },
  /** 主题效果 */
  effect: {
    type: definePropType<TagEffect>(String),
    default: 'light',
  },
  /** 是否可关闭 */
  closable: Boolean,
  /** 是否为圆角胶囊形 */
  round: Boolean,
  /** 是否可点击（带 hover 效果） */
  clickable: Boolean,
  /** 前置图标（Element Plus 图标名） */
  icon: {
    type: String,
    default: undefined,
  },
  /** 自定义颜色（覆盖 type） */
  color: {
    type: String,
    default: undefined,
  },
  /** 是否禁用 */
  disabled: Boolean,
} as const)

export type TagProps = ExtractPropTypes<typeof tagProps>

export const tagEmits = {
  close: (event: MouseEvent) => event instanceof MouseEvent,
  click: (event: MouseEvent) => event instanceof MouseEvent,
}
export interface TagEmits {
  close: [event: MouseEvent]
  click: [event: MouseEvent]
}
