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
} as const)

export type CardProps = ExtractPropTypes<typeof cardProps>
