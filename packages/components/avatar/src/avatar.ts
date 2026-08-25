/**
 * Avatar 头像组件 - 类型与事件定义。
 *
 * 仅声明对外 props / emits 类型，组件展示与事件逻辑已抽离到 use-avatar.ts，
 * 样式独立维护在 avatar-style.scss（对齐 markdown 组件的拆分规范）。
 */

/** 头像组件 props（全部可选，默认值在 avatar.vue 的 withDefaults 中提供） */
export interface AvatarProps {
  /** 图片地址 */
  src?: string
  /** 图片 srcset（响应式图片） */
  srcSet?: string
  /** 图片替代文本 */
  alt?: string
  /** 尺寸：预设字符串 small/default/large 或具体数值（px）/ 长度字符串 */
  size?: number | string
  /** 形状：circle（圆） | square（方） */
  shape?: 'circle' | 'square'
  /** 背景色（无图片时生效） */
  color?: string
  /** 图片填充模式 */
  fit?: 'fill' | 'contain' | 'cover' | 'none' | 'scale-down'
  /** 自定义 class（透传到根节点，配合 inheritAttrs:false 使用） */
  customClass?: string
}

/** 组件事件（defineEmits 与内部 composable 共用，callable 形式便于 emit 直接标注类型） */
export interface AvatarEmits {
  (e: 'update:modelValue', value: string): void
  (e: 'click', evt: MouseEvent): void
  (e: 'error', evt: Event): void
}
