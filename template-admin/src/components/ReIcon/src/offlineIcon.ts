// Element Plus 图标（从 barrel 入口导入，避免子路径解析问题）
import {
  HomeFilled,
  InfoFilled,
  Memo,
  Menu,
  Search,
} from '@element-plus/icons-vue'

// 在 src/layout/index.vue 中加载
import { registerIcons } from './hooks'

// 注册菜单图标（图标名称 → Vue 组件）
// 后端路由 meta.icon 返回的字符串与此处 key 匹配即可渲染菜单图标
registerIcons([
  ['ep/home-filled', HomeFilled],
  ['ep/menu', Menu],
  ['ep/memo', Memo],
  ['ri/search-line', Search],
  ['ri/information-line', InfoFilled],
])
