/**
 * Loading 组件 props 类型定义（从原 loading.vue 内联 `interface LoadingProps` 提取）。
 *
 * 保持对外类型导出兼容：loading.ts 中 `import type { LoadingProps } from './loading.vue'`
 * 仍可用（loading.vue 末尾 re-export 自此文件）。
 */
export interface LoadingProps {
  /** 是否显示加载 */
  modelValue?: boolean
  /** 加载类型: spinner-旋转点 | wave-波浪 | pulse-脉冲 | ring-环形进度 | default-双点 */
  type?: 'spinner' | 'wave' | 'wave1' | 'pulse' | 'ring' | 'default'
  /** 加载文本 */
  text?: string
  /** 是否显示遮罩 */
  mask?: boolean
  /** 遮罩颜色 */
  maskColor?: string
  /** 加载颜色 */
  color?: string
  /** 背景颜色 */
  backgroundColor?: string
  /** 文本颜色 */
  textColor?: string
  /** 大小: small-24px | medium-32px | large-48px | 自定义数字 */
  size?: 'small' | 'medium' | 'large' | number
  /** 是否全屏 */
  fullscreen?: boolean
  /** 是否锁定滚动 */
  lock?: boolean
  /** 是否容器内全屏（相对于父容器） */
  containerFullscreen?: boolean
  /** 是否在遮罩层上显示（用于弹窗等场景） */
  overlayMode?: boolean
  /** 自定义类名 */
  customClass?: string
  /** 环形进度百分比 (0-100) */
  progress?: number
}

/**
 * Loading 组件事件（defineEmits 与内部 composable 共用）。
 *
 * 采用 callable interface 形式（与 markdown/src/use-theme.ts 一致），
 * 直接作为 composable 的 `emit` 参数类型，禁止写成 `EmitFn<LoadingEmits>`。
 */
export interface LoadingEmits {
  (e: 'update:modelValue', value: boolean): void
}

/**
 * 已应用 `withDefaults` 默认值的 props 解析类型（供内部 composable 使用）。
 *
 * `LoadingProps` 全部成员均为可选（对外兼容 loading.ts 的 `Omit<LoadingProps, 'modelValue'>`），
 * 但组件内部通过 `withDefaults` 提供了默认值，故 composable 接收的是「全必填」版本，
 * 此处用 `Required<LoadingProps>` 推导，避免 strict 模式下可选成员参与运算报错。
 */
export type LoadingResolvedProps = Required<LoadingProps>
