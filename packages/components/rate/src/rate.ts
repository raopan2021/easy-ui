import type { ExtractPropTypes } from 'vue'

import { buildProps, definePropType } from '../../../utils'

export const rateProps = buildProps({
  modelValue: {
    type: Number,
    default: 0,
  },
  max: {
    type: Number,
    default: 5,
  },
  disabled: Boolean,
  allowHalf: Boolean,
  showText: Boolean,
  texts: {
    type: definePropType<string[]>(Array),
    default: () => [],
  },
  color: {
    type: String,
    default: '#f5a623',
  },
  voidColor: {
    type: String,
    default: '#e2e4ed',
  },
  size: {
    type: definePropType<'large' | 'default' | 'small'>(String),
    default: 'default',
  },
} as const)

export type RateProps = ExtractPropTypes<typeof rateProps>

export const rateEmits = {
  'update:modelValue': (value: number) => typeof value === 'number',
  'change': (value: number) => typeof value === 'number',
}
export interface RateEmits {
  'update:modelValue': [value: number]
  'change': [value: number]
}
