import type { ExtractPropTypes } from 'vue'

import { buildProps, definePropType } from '../../../utils'

export type TabType = 'line' | 'card' | 'segment'
export type TabPosition = 'top' | 'bottom'
export type TabSize = 'large' | 'default' | 'small'

export interface TabPaneInfo {
  uid: number
  name: string | number
  label: string
  disabled: boolean
  icon?: string
}

export const tabsProps = buildProps({
  /** 当前激活的选项卡标识（v-model） */
  modelValue: {
    type: definePropType<string | number>([String, Number]),
    default: '',
  },
  /** 选项卡类型 */
  type: {
    type: definePropType<TabType>(String),
    default: 'line',
  },
  /** 尺寸 */
  size: {
    type: definePropType<TabSize>(String),
    default: 'default',
  },
  /** 选项卡位置 */
  tabPosition: {
    type: definePropType<TabPosition>(String),
    default: 'top',
  },
  /** 激活态颜色 */
  activeColor: {
    type: String,
    default: '#4f6ef7',
  },
  /** 是否可滚动（当选项卡过多时） */
  scrollable: {
    type: Boolean,
    default: true,
  },
  /** 是否开启粘性头部 */
  sticky: Boolean,
  /** 粘性定位的 top 值 */
  stickyTop: {
    type: String,
    default: '0px',
  },
} as const)

export type TabsProps = ExtractPropTypes<typeof tabsProps>

export const tabsEmits = {
  'update:modelValue': (_value: string | number) => true,
  'tab-click': (_pane: TabPaneInfo) => true,
  'tab-change': (_value: string | number) => true,
}
export interface TabsEmits {
  (e: 'update:modelValue', value: string | number): void
  (e: 'tab-click', pane: TabPaneInfo): void
  (e: 'tab-change', value: string | number): void
}
