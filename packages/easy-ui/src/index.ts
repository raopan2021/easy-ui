// ============================================================
// Easy UI — 组件库统一入口
// 支持 tree-shaking：只打包实际使用的组件
// ============================================================
import type { App } from 'vue'
import ElementPlus from 'element-plus'
import { setupEasy } from './utils/easy'
import { easyComponentResolver as _easyUiResolver } from './utils/easyComponentResolver'

// ──── 样式聚合入口（确保主入口 dist/index.css 包含所有组件样式） ────
// 每个组件的 .vue <style scoped> 块通过 style/css.ts 显式触发 CSS 提取
import '../../components/avatar/style/css'
import '../../components/badge/style/css'
import '../../components/barcode/style/css'
import '../../components/button/style/css'
import '../../components/card/style/css'
import '../../components/carousel/style/css'
import '../../components/cascader/style/css'
import '../../components/chart/style/css'
import '../../components/chat/style/css'
import '../../components/china-map/style/css'
import '../../components/col/style/css'
import '../../components/date-picker/style/css'
import '../../components/date-range-picker/style/css'
import '../../components/date-time-picker/style/css'
import '../../components/date-time-range-picker/style/css'
import '../../components/dept-tree/style/css'
import '../../components/descriptions/style/css'
import '../../components/dict-select/style/css'
import '../../components/dict-tag/style/css'
import '../../components/divider/style/css'
import '../../components/doc-code/style/css'
import '../../components/drawer/style/css'
import '../../components/dropdown/style/css'
import '../../components/empty/style/css'
import '../../components/file-upload/style/css'
import '../../components/form/style/css'
import '../../components/gantt/style/css'
import '../../components/icon/style/css'
import '../../components/image/style/css'
import '../../components/image-cropper/style/css'
import '../../components/image-upload/style/css'
import '../../components/info-card/style/css'
import '../../components/input/style/css'
import '../../components/input-range/style/css'
import '../../components/json-viewer/style/css'
import '../../components/list/style/css'
import '../../components/loading/style/css'
import '../../components/message/style/css'
import '../../components/modal/style/css'
import '../../components/msgbox/style/css'
import '../../components/permission/style/css'
import '../../components/progress/style/css'
import '../../components/qrcode/style/css'
import '../../components/radio/style/css'
import '../../components/rate/style/css'
import '../../components/row/style/css'
import '../../components/search-form/style/css'
import '../../components/select/style/css'
import '../../components/signature/style/css'
import '../../components/statistic/style/css'
import '../../components/steps/style/css'
import '../../components/super-form/style/css'
import '../../components/switch/style/css'
import '../../components/table/style/css'
import '../../components/tabs/style/css'
import '../../components/tag/style/css'
import '../../components/time-picker/style/css'
import '../../components/time-range-picker/style/css'
import '../../components/timeline/style/css'
import '../../components/tour/style/css'
import '../../components/tree-chart/style/css'
import '../../components/user-picker/style/css'
import '../../components/video/style/css'
import '../../components/watermark/style/css'
import '../../components/worktab/style/css'

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
