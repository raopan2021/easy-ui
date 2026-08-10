import type { ExtractPropTypes } from 'vue'

import { buildProps, definePropType } from '../../../utils'

export const buttonProps = buildProps({
  type: {
    type: definePropType<'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text' | 'ghost'>(String),
    default: 'primary',
  },
  size: {
    type: definePropType<'large' | 'default' | 'small'>(String),
    default: 'default',
  },
  shape: {
    type: definePropType<'default' | 'round' | 'circle'>(String),
    default: 'default',
  },
  loading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  bold: {
    type: Boolean,
    default: false,
  },
  link: {
    type: Boolean,
    default: false,
  },
  htmlType: {
    type: definePropType<'button' | 'submit' | 'reset'>(String),
    default: 'button',
  },
} as const)

export type ButtonProps = ExtractPropTypes<typeof buttonProps>

export const buttonEmits = {
  click: (event: MouseEvent) => event instanceof MouseEvent,
}

export interface ButtonEmits {
  click: [event: MouseEvent]
}
