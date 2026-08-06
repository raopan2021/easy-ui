// ============================================================
// Easy UI — 组件库统一入口
// 支持 tree-shaking：只打包实际使用的组件
// ============================================================
import type { App } from 'vue'
import ElementPlus from 'element-plus'
import { setupXly } from './utils/xly'

// ──── 组件 ────
export { default as XlyAvatar } from './components/xly-avatar/index.vue'
export { XlyBadge } from './components/xly-badge/badge'
export { default as XlyBarcode } from './components/xly-barcode/index.vue'
export { default as XlyButton } from './components/xly-button/index.vue'
export { default as XlyCard } from './components/xly-card/index.vue'
export { default as XlyCarousel } from './components/xly-carousel/index.vue'
export { default as XlyCascader } from './components/xly-cascader/index.vue'
export { default as XlyChart } from './components/xly-chart/index.vue'
export { default as XlyChat } from './components/xly-chat/index.vue'
export { default as XlyChinaMap } from './components/xly-china-map/index.vue'
export { default as XlyCol } from './components/xly-col/index.vue'
export { default as XlyDatePicker } from './components/xly-date-picker/index.vue'
export { default as XlyDateRangePicker } from './components/xly-date-range-picker/index.vue'
export { default as XlyDateTimePicker } from './components/xly-date-time-picker/index.vue'
export { default as XlyDateTimeRangePicker } from './components/xly-date-time-range-picker/index.vue'
export { default as XlyDeptTree } from './components/xly-dept-tree/index.vue'
export { default as XlyDescriptions } from './components/xly-descriptions/index.vue'
export { default as XlyDescriptionsItem } from './components/xly-descriptions/item.vue'
export { default as XlyDictSelect } from './components/xly-dict-select/index.vue'
export { default as XlyDictTag } from './components/xly-dict-tag/index.vue'
export { default as XlyDivider } from './components/xly-divider/index.vue'
export { default as XlyDrawer } from './components/xly-drawer/index.vue'
export { default as XlyDropdown } from './components/xly-dropdown/index.vue'
export { default as XlyDropdownItem } from './components/xly-dropdown/dropdown-item.vue'
export { default as XlyEmpty } from './components/xly-empty/index.vue'
export { default as XlyFilePreview } from './components/xly-file-preview/index.vue'
export { default as XlyFileUpload } from './components/xly-file-upload/index.vue'
// XlyUpload 指向同一个组件
export { default as XlyUpload } from './components/xly-file-upload/index.vue'
export { default as XlyFlowDesigner } from './components/xly-flow-designer/index.vue'
export { default as XlyForm } from './components/xly-form/index.vue'
export { default as XlyFormItem } from './components/xly-form/xly-form-item.vue'
export { default as XlyGantt } from './components/xly-gantt/index.vue'
export { default as XlyIcon } from './components/xly-icon/index.vue'
export { default as XlyImage } from './components/xly-image/index.vue'
export { default as XlyImageCropper } from './components/xly-image-cropper/index.vue'
export { default as XlyImageUpload } from './components/xly-image-upload/index.vue'
export { default as XlyInfoCard } from './components/xly-info-card/index.vue'
export { default as XlyInput } from './components/xly-input/index.vue'
export { default as XlyInputRange } from './components/xly-input-range/index.vue'
export { default as XlyJsonViewer } from './components/xly-json-viewer/index.vue'
export { default as XlyList } from './components/xly-list/index.vue'
export { default as XlyLoading } from './components/xly-loading/index.vue'
export { default as XlyModal } from './components/xly-modal/index.vue'
export { default as XlyMsgBox } from './components/xly-msgbox/index.vue'
export { default as XlyPermission } from './components/xly-permission/index.vue'
export { default as XlyProgress } from './components/xly-progress/index.vue'
export { default as XlyQrcode } from './components/xly-qrcode/index.vue'
export { default as XlyRadio } from './components/xly-radio/index.vue'
export { default as XlyRadioGroup } from './components/xly-radio/radio-group.vue'
export { default as XlyRate } from './components/xly-rate/index.vue'
export { default as XlyRow } from './components/xly-row/index.vue'
export { default as XlySearchForm } from './components/xly-search-form/index.vue'
export { default as XlySelect } from './components/xly-select/index.vue'
export { default as XlySignature } from './components/xly-signature/index.vue'
export { default as XlyStatistic } from './components/xly-statistic/index.vue'
export { default as XlySteps } from './components/xly-steps/index.vue'
export { default as XlyStep } from './components/xly-steps/step.vue'
export { default as XlySuperForm } from './components/xly-super-form/index.vue'
export { default as XlySwitch } from './components/xly-switch/index.vue'
export { default as XlyTable } from './components/xly-table/index.vue'
export { default as XlyTabs } from './components/xly-tabs/index.vue'
export { default as XlyTabPane } from './components/xly-tabs/xly-tab-pane.vue'
export { default as XlyTag } from './components/xly-tag/index.vue'
export { default as XlyTimePicker } from './components/xly-time-picker/index.vue'
export { default as XlyTimeRangePicker } from './components/xly-time-range-picker/index.vue'
export { default as XlyTimeline } from './components/xly-timeline/index.vue'
export { default as XlyTimelineItem } from './components/xly-timeline/timeline-item.vue'
export { default as XlyTour } from './components/xly-tour/index.vue'
export { default as XlyTreeChart } from './components/xly-tree-chart/index.vue'
export { default as XlyUserPicker } from './components/xly-user-picker/index.vue'
export { default as XlyVideo } from './components/xly-video/index.vue'
export { default as XlyWatermark } from './components/xly-watermark/index.vue'
export { default as XlyWorktab } from './components/xly-worktab/index.vue'

// ──── 文档组件 ────
export { default as XlyDocCode } from './components/xly-doc-code/index.vue'

// ──── 全局 xly 服务 ────
export { xly, setupXly } from './utils/xly'
export type {
  MessageOptions,
  LoadingInstance,
  LoadingOptions,
  TourInstance,
  TourOptions,
  BadgeInstance,
  BadgeOptions,
  MsgBoxOptions,
  MsgBoxType,
  MsgBoxAction,
  MsgBoxInputConfig,
} from './utils/xly'

// ──── 自动导入解析器 ────
export { xlyComponentResolver } from './utils/xlyComponentResolver'

// ──── 默认安装（app.use） ────
export function install(app: App) {
  app.use(ElementPlus)
  setupXly(app)
}

export default { install }

