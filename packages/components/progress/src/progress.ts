import type { ExtractPropTypes } from 'vue'

import { buildProps, definePropType } from '../../../utils'

export type ProgressStatus = 'normal' | 'success' | 'exception' | 'warning' | 'active'
export type ProgressType = 'line' | 'circle' | 'dashboard'

export const progressProps = buildProps({
  /** 进度百分比（0-100） */
  percentage: {
    type: Number,
    default: 0,
  },
  /** 是否为不确定进度（动画效果） */
  indeterminate: Boolean,
  /** 进度条状态 */
  status: {
    type: definePropType<ProgressStatus>(String),
    default: 'normal',
  },
  /** 进度条类型 */
  type: {
    type: definePropType<ProgressType>(String),
    default: 'line',
  },
  /** 是否显示进度文字 */
  showInfo: {
    type: Boolean,
    default: true,
  },
  /** 自定义文本 */
  text: {
    type: String,
    default: '',
  },
  /** 轨道高度（line 类型，单位 px） */
  strokeWidth: {
    type: Number,
    default: 6,
  },
  /** 进度条颜色 */
  color: {
    type: definePropType<string | ((percentage: number) => string)>([String, Function]),
    default: '',
  },
  /** 轨道背景色 */
  trackColor: {
    type: String,
    default: '',
  },
  /** 圆形进度条宽度（circle/dashboard 类型，单位 px） */
  circleSize: {
    type: Number,
    default: 120,
  },
  /** 是否开启环形进度条动画（circle/dashboard 类型） */
  animated: {
    type: Boolean,
    default: true,
  },
  /** 自定义类名 */
  customClass: {
    type: String,
    default: '',
  },
} as const)

export type ProgressProps = ExtractPropTypes<typeof progressProps>
