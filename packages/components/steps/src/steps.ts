import type { ExtractPropTypes } from 'vue'

import { buildProps, definePropType } from '../../../utils'

export type StepStatus = 'wait' | 'process' | 'finish' | 'success' | 'error'

export const stepsProps = buildProps({
  /** 当前激活步骤（从 0 开始） */
  active: {
    type: Number,
    default: 0,
  },
  /** 方向 */
  direction: {
    type: definePropType<'horizontal' | 'vertical'>(String),
    default: 'horizontal',
  },
  /** 已完成步骤的状态 */
  finishStatus: {
    type: definePropType<'success' | 'finish'>(String),
    default: 'success',
  },
  /** 当前步骤的状态 */
  processStatus: {
    type: definePropType<'process' | 'error'>(String),
    default: 'process',
  },
  /** 是否居中对齐 */
  alignCenter: Boolean,
  /** 自定义状态颜色 */
  color: {
    type: definePropType<{
      primary?: string
      success?: string
      error?: string
      wait?: string
    }>(Object),
    default: undefined,
  },
} as const)

export type StepsProps = ExtractPropTypes<typeof stepsProps>
