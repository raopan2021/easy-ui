// ============================================================
// Easy UI — richtext 独立子入口
// 依赖 @wangeditor/editor 等 optional 包，按需安装
// 用法：import { EasyRichText } from '@raopan/easy-ui/richtext'
// ============================================================
import type { App } from 'vue'
import ElementPlus from 'element-plus'
import { setupEasy } from './src/utils/easy'

// ──── 组件 ────
export * from '../components/richtext'

// ──── 全局 easy 服务 ────
export { easy, setupEasy } from './src/utils/easy'
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
} from './src/utils/easy'

// ──── 自动导入解析器 ────
import { easyComponentResolver as _easyUiResolver } from './src/utils/easyComponentResolver'
export const EasyUiResolver = _easyUiResolver

// ──── 默认安装（app.use） ────
export function install(app: App) {
  app.use(ElementPlus)
  setupEasy(app)
}

export default { install }
