import { buildProps, definePropType } from '../../../utils'

/**
 * 卡片运行时 props 定义。
 *
 * 组件内部已改用泛型 `defineProps<CardProps>()`（类型见 ./types），
 * 此处保留运行时 props 主要用于需要运行时 prop 定义的兼容场景，
 * 并对外保持 `cardProps` 导出不变。
 */
export const cardProps = buildProps({
  title: {
    type: String,
    default: '',
  },
  icon: {
    type: String,
    default: '',
  },
  rounded: {
    type: Boolean,
    default: true,
  },
  bordered: {
    type: Boolean,
    default: true,
  },
  shadow: {
    type: definePropType<'always' | 'hover' | 'never'>(String),
    default: 'always',
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  hoverable: {
    type: Boolean,
    default: false,
  },
  /** 高度占满父容器剩余空间（父容器建议 flex 布局或定高，卡片内部自动切换为 flex 纵向布局） */
  fill: {
    type: Boolean,
    default: false,
  },
  /** 是否允许通过底部拖拽手柄手动调整高度 */
  resizable: {
    type: Boolean,
    default: false,
  },
  /** 卡片高度（支持 v-model:height，拖拽调整时自动更新） */
  height: {
    type: Number,
    default: undefined,
  },
  /** 拖拽调整高度的最小值（像素） */
  minHeight: {
    type: Number,
    default: 120,
  },
  /** 拖拽调整高度的最大值（像素），不传则不限制 */
  maxHeight: {
    type: Number,
    default: undefined,
  },
} as const)

// 保持对外类型导出兼容（类型定义统一维护在 ./types）
export type { CardEmits, CardProps } from './types'
