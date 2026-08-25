/**
 * EasyIcon 组件类型定义。
 *
 * 将原本内联在 icon.vue 中的 props / emits 类型抽离到独立文件，
 * 供 .vue 与内部 composable 共用（对齐 markdown 组件拆分规范）。
 */

/** 图标解析模式：Element Plus 图标 / 自定义 SVG / 普通图片 */
export type IconMode = 'element' | 'svg' | 'image'

/** 组件 props */
export interface EasyIconProps {
  /**
   * 图标名称，通过前缀区分类型：
   * - `el:Search` / `el:arrow-down` → Element Plus 图标
   * - `svg:edit` / `svg:dashboard` → assets/icon/svg/ 下的 SVG 文件
   * - `@/assets/icon/img/img.png` / `@/assets/logo.png` → 支持 Vite 别名路径的图片
   * - 无前缀或以 http(s):// 开头：图片 URL（.png/.jpg/.webp 等）
   */
  name: string
  /** 图标大小，单位 px */
  size?: number | string
  /** 图标颜色 */
  color?: string
  /** 自定义 CSS 类名 */
  iconClass?: string
  /** 是否可点击（添加 cursor:pointer 和 hover 效果） */
  clickable?: boolean
  /** 图片 alt 文本 */
  alt?: string
}

/** 组件事件（defineEmits 与内部 composable 共用） */
export interface EasyIconEmits {
  (e: 'click', event: MouseEvent): void
}
