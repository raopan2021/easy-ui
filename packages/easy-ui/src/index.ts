// ============================================================
// Easy UI — 组件库统一入口
// 支持 tree-shaking：只打包实际使用的组件
// ============================================================
import type { App } from 'vue'
import ElementPlus from 'element-plus'
import { setupEasy } from './utils/easy'
import { easyComponentResolver as _easyUiResolver } from './utils/easyComponentResolver'

// ──── 组件 / 子组件 / 函数式 API / 工具（统一由 components 聚合导出） ────
export * from '../../components'

// ──── 全局 easy 服务 ────
export { easy, setupEasy } from './utils/easy'
export type {
  BadgeInstance,
  BadgeOptions,
  LoadingInstance,
  LoadingOptions,
  MessageOptions,
  MsgBoxAction,
  MsgBoxInputConfig,
  MsgBoxOptions,
  MsgBoxType,
  TourInstance,
  TourOptions,
} from './utils/easy'

// ──── 自动导入解析器 ────
export { easyComponentResolver } from './utils/easyComponentResolver'
export const EasyUiResolver = _easyUiResolver

// ──── 默认安装（app.use） ────
export function install(app: App) {
  app.use(ElementPlus)
  setupEasy(app)
}

export default { install }
