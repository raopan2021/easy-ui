// ============================================================
// Easy UI — file-preview 独立子入口
// 依赖 @vue-office/* / pptx-preview 等 optional 包，按需安装
// 用法：import { EasyFilePreview } from '@raopan/easy-ui/file-preview'
// ============================================================
import type { App } from 'vue'
import ElementPlus from 'element-plus'
import { setupEasy } from './src/utils/easy'

// ──── 自动导入解析器 ────
import { easyComponentResolver as _easyUiResolver } from './src/utils/easyComponentResolver'

// ──── 组件 ────
export * from '../components/file-preview'

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
export const EasyUiResolver = _easyUiResolver

// ──── 默认安装（app.use） ────
export function install(app: App) {
  app.use(ElementPlus)
  setupEasy(app)
}

export default { install }
