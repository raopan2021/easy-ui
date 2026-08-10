import type { ExtractPropTypes } from 'vue'

import { buildProps, definePropType } from '../../../utils'

export type TimelineDirection = 'horizontal' | 'vertical'

export const timelineProps = buildProps({
  /** 时间线方向 */
  direction: {
    type: definePropType<TimelineDirection>(String),
    default: 'vertical',
  },
  /** 是否倒序显示 */
  reverse: Boolean,
  /** 自定义类名 */
  customClass: {
    type: String,
    default: '',
  },
} as const)

export type TimelineProps = ExtractPropTypes<typeof timelineProps>
