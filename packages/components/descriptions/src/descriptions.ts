import type { ExtractPropTypes } from 'vue'

import { buildProps, definePropType } from '../../../utils'

export const descriptionsProps = buildProps({
  title: {
    type: String,
    default: '',
  },
  column: {
    type: Number,
    default: 3,
  },
  colon: Boolean,
  bordered: Boolean,
  layout: {
    type: definePropType<'horizontal' | 'vertical'>(String),
    default: 'horizontal',
  },
  size: {
    type: definePropType<'small' | 'default' | 'large'>(String),
    default: 'default',
  },
  labelWidth: {
    type: definePropType<string | number>([String, Number]),
    default: '',
  },
  labelAlign: {
    type: definePropType<'left' | 'right' | 'center'>(String),
    default: 'left',
  },
} as const)

export type DescriptionsProps = ExtractPropTypes<typeof descriptionsProps>

export const descriptionsItemProps = buildProps({
  /** 标签文字 */
  label: {
    type: String,
    default: '',
  },
  /** 标签图标 */
  icon: {
    type: String,
    default: '',
  },
  /** 跨列数 */
  span: {
    type: Number,
    default: 1,
  },
} as const)

export type DescriptionsItemProps = ExtractPropTypes<typeof descriptionsItemProps>
