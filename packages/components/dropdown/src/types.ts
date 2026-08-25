/**
 * EasyDropdown 下拉菜单组件类型定义。
 *
 * 原内联在 dropdown.vue 与 dropdown-item.vue 中的 props/emits 收敛到此文件，
 * 供两个 SFC 共用同一份类型（避免同目录出现多个 types 文件）。
 */

/** 下拉菜单触发器 props */
export interface DropdownProps {
  /** 触发器文本（简化用法） */
  label?: string
  /** 触发方式 */
  trigger?: 'click' | 'hover'
}

/** 下拉菜单项 props */
export interface DropdownItemProps {
  /** 菜单项图标 */
  icon?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否显示分隔符 */
  divided?: boolean
}

/** 下拉菜单项事件（defineEmits 与内部逻辑共用） */
export interface DropdownItemEmits {
  /** 菜单项点击时触发 */
  (e: 'click', event: MouseEvent): void
}
