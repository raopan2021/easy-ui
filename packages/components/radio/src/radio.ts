import type { ExtractPropTypes } from 'vue'

import { buildProps, definePropType } from '../../../utils'

export const radioProps = buildProps({
  label: {
    type: definePropType<string | number | boolean>([String, Number, Boolean]),
    default: undefined,
  },
  modelValue: {
    type: definePropType<string | number | boolean>([String, Number, Boolean]),
    default: undefined,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  size: {
    type: definePropType<'large' | 'default' | 'small'>(String),
    default: 'default',
  },
  name: {
    type: String,
    default: '',
  },
  border: {
    type: Boolean,
    default: false,
  },
} as const)

export type RadioProps = ExtractPropTypes<typeof radioProps>

export const radioEmits = {
  'update:modelValue': (_value: string | number | boolean) => true,
  'change': (_value: string | number | boolean) => true,
}
export interface RadioEmits {
  'update:modelValue': [value: string | number | boolean]
  'change': [value: string | number | boolean]
}
