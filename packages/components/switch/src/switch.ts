import type { ExtractPropTypes } from 'vue'

import { buildProps, definePropType } from '../../../utils'

export const switchProps = buildProps({
  modelValue: {
    type: definePropType<boolean | string | number>([Boolean, String, Number]),
    default: false,
  },
  activeValue: {
    type: definePropType<boolean | string | number>([Boolean, String, Number]),
    default: true,
  },
  inactiveValue: {
    type: definePropType<boolean | string | number>([Boolean, String, Number]),
    default: false,
  },
  disabled: Boolean,
  size: {
    type: definePropType<'large' | 'default' | 'small'>(String),
    default: 'default',
  },
  activeColor: {
    type: String,
    default: '#4f6ef7',
  },
  inactiveColor: {
    type: String,
    default: '#e2e4ed',
  },
  activeText: {
    type: String,
    default: '',
  },
  inactiveText: {
    type: String,
    default: '',
  },
  loading: Boolean,
} as const)

export type SwitchProps = ExtractPropTypes<typeof switchProps>

export const switchEmits = {
  'update:modelValue': (_value: boolean | string | number) => true,
  'change': (_value: boolean | string | number) => true,
}
export interface SwitchEmits {
  'update:modelValue': [value: boolean | string | number]
  'change': [value: boolean | string | number]
}
