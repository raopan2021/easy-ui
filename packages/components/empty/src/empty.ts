import type { ExtractPropTypes } from 'vue'

import { buildProps, definePropType } from '../../../utils'

export type EmptyType = 'default' | 'data' | 'search' | 'network' | 'permission' | 'list'
export type EmptySize = 'small' | 'default' | 'large'

export const emptyProps = buildProps({
  /** 空状态类型，影响内置插图 */
  type: {
    type: definePropType<EmptyType>(String),
    default: 'default',
  },
  /** 自定义图片地址（优先级高于 type） */
  image: {
    type: String,
    default: undefined,
  },
  /** 图片尺寸（宽度，高度等比） */
  imageSize: {
    type: definePropType<number | string>([Number, String]),
    default: undefined,
  },
  /** 描述文字 */
  description: {
    type: String,
    default: undefined,
  },
  /** 组件尺寸 */
  size: {
    type: definePropType<EmptySize>(String),
    default: 'default',
  },
} as const)

export type EmptyProps = ExtractPropTypes<typeof emptyProps>
