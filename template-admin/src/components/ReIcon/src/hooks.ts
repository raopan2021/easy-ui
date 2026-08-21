import type { Component } from 'vue'
import type { iconType } from './types'
import { defineComponent, h } from 'vue'
import { PureIcon } from '../index'

/**
 * 图标名称 → Vue 组件映射表（用于菜单等字符串图标解析）
 * 支持 Element Plus 图标 和自定义 SVG 组件
 */
const iconMap = new Map<string, Component>()

/** 注册图标 */
export function registerIcon(name: string, component: Component): void {
  iconMap.set(name, component)
}

/** 批量注册图标 */
export function registerIcons(icons: Array<[string, Component]>): void {
  icons.forEach(([name, component]) => registerIcon(name, component))
}

/**
 * 支持 Element Plus 图标、自定义 SVG 组件和字符串名称
 * 字符串名称需通过 registerIcon 预先注册
 */
export function useRenderIcon(icon: any, attrs?: iconType): Component {
  // typeof icon === "function" 或是一个有 render 的对象 → SVG 组件
  if (typeof icon === 'function' || typeof icon?.render === 'function') {
    return attrs ? h(icon, { ...attrs }) : icon
  }
  // 字符串 → 从注册表查找
  if (typeof icon === 'string' && iconMap.has(icon)) {
    const comp = iconMap.get(icon)!
    return attrs ? h(comp, { ...attrs }) : comp
  }
  // 对象 → 直接渲染
  if (typeof icon === 'object') {
    return defineComponent({
      name: 'DynamicIcon',
      render() {
        return h(PureIcon, { icon, ...attrs })
      },
    })
  }
  // 字符串无匹配 → 返回空
  return defineComponent({
    name: 'EmptyIcon',
    render() {
      return null
    },
  })
}
