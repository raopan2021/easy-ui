import type { ExtractPropTypes } from 'vue'

import { buildProps, definePropType } from '../../../utils'

export type TimelineStatus = 'wait' | 'process' | 'finish' | 'error'

export const timelineItemProps = buildProps({
  /** 节点状态 */
  status: {
    type: definePropType<TimelineStatus>(String),
    default: 'finish',
  },
  /** 时间戳 */
  timestamp: {
    type: String,
    default: '',
  },
  /** 图标名称（如 el:Check, el:Clock） */
  icon: {
    type: String,
    default: '',
  },
} as const)

export type TimelineItemProps = ExtractPropTypes<typeof timelineItemProps>
