import type { ExtractPropTypes } from 'vue'

import { buildProps, definePropType } from '../../../utils'

export const tabPaneProps = buildProps({
  /** 选项卡标识，对应 Tabs 的 modelValue */
  name: {
    type: definePropType<string | number>([String, Number]),
    default: '',
  },
  /** 选项卡标题 */
  label: {
    type: String,
    default: '',
  },
  /** 是否禁用 */
  disabled: Boolean,
  /** 标题前缀图标（Element Plus 图标名称） */
  icon: {
    type: String,
    default: undefined,
  },
} as const)

export type TabPaneProps = ExtractPropTypes<typeof tabPaneProps>
