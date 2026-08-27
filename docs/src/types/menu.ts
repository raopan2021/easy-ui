export interface MenuItem {
  key: string // 唯一标识符，菜单渲染、路由匹配、badge 动态更新均依赖此字段（menu.json 中无 id 字段，key 即唯一标识）
  name: string
  icon?: string
  path?: string
  component?: string // 组件路径，用于动态路由加载
  badge?: string
  isHide?: number // 控制是否在菜单中显示，0：隐藏 1：显示
  isTabHide?: number // 控制在workTab是否显示，0：隐藏 1：显示
  children?: MenuItem[]
}
