// ============================================================
// Easy UI — 组件库统一入口
// 支持 tree-shaking：只打包实际使用的组件
// ============================================================
import type { App } from 'vue'
import ElementPlus from 'element-plus'
import { setupXly } from './utils/xly'
import { xlyComponentResolver as _easyUiResolver } from './utils/xlyComponentResolver'

// ──── 组件 / 子组件 / 函数式 API / 工具（统一由 components 聚合导出） ────
export * from '../../components'

// ──── 全局 xly 服务 ────
export { setupXly, xly } from './utils/xly'
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
} from './utils/xly'

// ──── 自动导入解析器 ────
export { xlyComponentResolver } from './utils/xlyComponentResolver'
export const EasyUiResolver = _easyUiResolver

// ──── 默认安装（app.use） ────
export function install(app: App) {
  app.use(ElementPlus)
  setupXly(app)
}

export default { install }
