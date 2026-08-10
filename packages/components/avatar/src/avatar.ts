import type { ExtractPropTypes } from 'vue'
import { UPDATE_MODEL_EVENT } from '../../../constants'

import { buildProps, definePropType } from '../../../utils'

export const avatarProps = buildProps({
  src: String,
  srcSet: String,
  alt: {
    type: String,
    default: '',
  },
  size: {
    type: definePropType<number | string>([Number, String]),
    default: 'default',
  },
  shape: {
    type: definePropType<'circle' | 'square'>(String),
    default: 'circle',
  },
  color: {
    type: String,
    default: '',
  },
  fit: {
    type: definePropType<'fill' | 'contain' | 'cover' | 'none' | 'scale-down'>(String),
    default: 'cover',
  },
  customClass: {
    type: String,
    default: '',
  },
} as const)

export type AvatarProps = ExtractPropTypes<typeof avatarProps>

export const avatarEmits = {
  [UPDATE_MODEL_EVENT]: (value: string) => typeof value === 'string',
  click: (evt: MouseEvent) => evt instanceof MouseEvent,
  error: (evt: Event) => evt instanceof Event,
}

export interface AvatarEmits {
  [UPDATE_MODEL_EVENT]: [value: string]
  click: [evt: MouseEvent]
  error: [evt: Event]
}
