import type { ExtractPropTypes } from 'vue'

import { buildProps } from '../../../utils'

export const stepProps = buildProps({
  /** 步骤标题 */
  title: {
    type: String,
    default: '',
  },
  /** 步骤描述 */
  description: {
    type: String,
    default: '',
  },
  /** 手动指定状态 */
  status: {
    type: String,
    default: undefined,
  },
  /** 步骤索引（自动计算，也可手动指定） */
  index: {
    type: Number,
    default: undefined,
  },
  /** 自定义图标名称（支持 el: 前缀使用 Element Plus 图标） */
  icon: {
    type: String,
    default: undefined,
  },
} as const)

export type StepProps = ExtractPropTypes<typeof stepProps>
