import type { ExtractPropTypes } from 'vue'

import { buildProps, definePropType } from '../../../utils'

export const dividerProps = buildProps({
  direction: {
    type: definePropType<'horizontal' | 'vertical'>(String),
    default: 'horizontal',
  },
  borderStyle: {
    type: definePropType<'solid' | 'dashed' | 'dotted'>(String),
    default: 'solid',
  },
  contentPosition: {
    type: definePropType<'left' | 'center' | 'right'>(String),
    default: 'center',
  },
  height: {
    type: String,
    default: '',
  },
  width: {
    type: String,
    default: '',
  },
} as const)

export type DividerProps = ExtractPropTypes<typeof dividerProps>
