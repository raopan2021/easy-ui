# 更新记录

所有重要变更按版本和日期记录于此。格式参考 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)。

---

## [1.1.3] - 2026-08-26

### ✨ 新增

- 新增图片压缩组件

---

## [1.1.2] - 2026-08-25

### ✨ 新增

- 新增md下载pdf
- 新增富文本、md组件，优化水印
- 文档添加目录
- 系统添加dark切换

### 🐛 修复

- 调整端口、修复CI 部署失败
- refactor: 还原 doc 至 src/ 并修复 easy-ui 组件库样式与构建
- refactor: 统一 xly 前缀为 easy 并修复组件运行时问题
- 修复组件 composable 化遗留的 50+ 处 TS 类型错误（Props 可选字段兜底、`Date` 算术、`Array.from().fill()` 类型、`isNaN`/`parseFloat` 等）

### 🎨 优化

- 优化md滚动条问题
- search-form优化
- dark切换优化
- ESLint 全量清理：修复 chart/markdown 规则错误，豁免 `.workbuddy` / `.codebuddy` 工作记忆目录与 `template-admin` 独立 workspace

### ♻️ 重构

- refactor: 组件库迁移收尾 — 全面切换 Easy* 命名并移除旧 xly-* 目录
- 重构：组件迁移至 packages/easy-ui 包 + antfu ESLint 接入
- 组件拆分重构：所有组件 composable 化，规范拆分为 `use-*.ts` composable + `types.ts` + 纯函数模块，主 `.vue` 精简为编排层

### 📝 文档

- docs + admin 双 SPA 共用一个 Pages 站点时需要 hash，修复github404页面问题

### 🛠 工程化

- ci: 对齐 CI pnpm 版本到 11（lockfileVersion 9.0 兼容）
- 构建工具升级：Vite 8 → VitePlus（`@voidzero-dev/vite-plus-core@0.2.9`，`vp` CLI 驱动，workspace catalog + overrides 统一管理，产物含 rolldown-runtime）

---

## [1.1.1] - 2026-08-24

### ✨ 新增

- 新增md下载pdf
- 新增富文本、md组件，优化水印
- 文档添加目录
- 系统添加dark切换

### 🐛 修复

- 调整端口、修复CI 部署失败
- refactor: 还原 doc 至 src/ 并修复 easy-ui 组件库样式与构建
- refactor: 统一 xly 前缀为 easy 并修复组件运行时问题

### 🎨 优化

- 优化md滚动条问题、github404页面问题
- search-form优化
- dark切换优化

### ♻️ 重构

- refactor: 组件库迁移收尾 — 全面切换 Easy* 命名并移除旧 xly-* 目录
- 重构：组件迁移至 packages/easy-ui 包 + antfu ESLint 接入

### 📝 文档

- docs + admin 双 SPA 共用一个 Pages 站点时需要 hash

### 🛠 工程化

- ci: 对齐 CI pnpm 版本到 11（lockfileVersion 9.0 兼容）
- 构建工具升级：Vite 8 → VitePlus（`@voidzero-dev/vite-plus-core@0.2.9`，`vp` CLI 驱动，workspace catalog + overrides 统一管理）
- 组件样式

### 🔧 其他

- md组件升级
- 调整部署github
- 组件导出使用
- code复制展开
- 组件更新
- 依赖问题
- 初始化

---

## [1.1.0] - 2026-08-21

### ✨ 新增组件

- **`EasyMarkdown`** — Markdown 编辑器，支持编辑/分屏/预览三种视图、主题切换（默认/GitHub/Clean，可自定义）、`.md` / `.html` / `.pdf` 三种格式导出下载、工具栏保存按钮。独立子入口：`@raopan/easy-ui/markdown`
- **`EasyRichText`** — 富文本编辑器，基于 `@wangeditor/editor`。独立子入口：`@raopan/easy-ui/richtext`

### 🎨 优化

- **`EasyWatermark`** 水印组件优化
- **`EasyInputRange`** 区间输入组件优化
- **`EasySearchForm`** 搜索表单优化
- **`EasyChart`** 图表组件优化

### 🛠 工程化

- **构建产物拆分**：`index.mjs`（主入口）完全解耦可选 peer 依赖，新增 `easy-base` 共享 chunk；`file-preview` / `flow-designer` / `markdown` / `richtext` 四个独立子入口自包含，未安装 optional 依赖的项目加载主入口不再崩溃
- **CSS 提取**：第三方组件 CSS（cropperjs / @vue-office / @wangeditor）由 Rolldown 提取进 `dist/easy-ui.css`，JS 产物中不再残留 `import 'xxx.css'`
- **类型声明**：补齐 `markdown` / `richtext` 子入口的 `.d.ts` 生成

---

## [1.0.0] - 2026-08-10

**EasyUI 正式发布 🎉** — Vue 3 企业级组件库，基于 Element Plus 扩展，首版稳定发布。

### ✨ 新增组件（65+）

基于 Element Plus 深度扩展的 `Easy*` 前缀组件，覆盖企业级中后台常见场景：

| 类别           | 组件                                                                                                                                                                                                                                                             |
| -------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **基础组件**   | `EasyAvatar` `EasyBadge` `EasyButton` `EasyCard` `EasyCarousel` `EasyCol` `EasyRow` `EasyDivider` `EasyEmpty` `EasyIcon` `EasyImage` `EasyInput` `EasyList` `EasyProgress` `EasyRadio` `EasyRate` `EasySelect` `EasySteps` `EasySwitch` `EasyTag` `EasyTimeline` |
| **表单组件**   | `EasyCascader` `EasyDatePicker` `EasyDateRangePicker` `EasyDateTimePicker` `EasyDateTimeRangePicker` `EasyForm` `EasySearchForm` `EasySuperForm` `EasyTimePicker` `EasyTimeRangePicker` `EasyInputRange` `EasyDictSelect` `EasyDictTag`                          |
| **数据展示**   | `EasyDescriptions` `EasyStatistic` `EasyInfoCard` `EasyTable` `EasyTreeChart`                                                                                                                                                                                    |
| **弹层反馈**   | `EasyDrawer` `EasyDropdown` `EasyModal` `EasyTabs` `EasyLoading` `EasyMessage` `EasyMsgbox` `EasyTour`                                                                                                                                                           |
| **业务扩展**   | `EasyChat`（聊天）`EasyGantt`（甘特图）`EasyChart`（图表）`EasyChinaMap`（中国地图）`EasyDeptTree`（部门树）`EasyPermission`（权限）`EasyUserPicker`（用户选择）`EasyWorktab`（工作台页签）`EasyWatermark`（水印）                                               |
| **高级工具**   | `EasySignature`（签名）`EasyImageCropper`（图片裁剪）`EasyFileUpload`（文件上传）`EasyImageUpload`（图片上传）`EasyBarcode`（条形码）`EasyQrcode`（二维码）`EasyDocCode`（文档编码）`EasyJsonViewer`（JSON 查看器）                                              |
| **独立子入口** | `EasyFilePreview`（文档/Office 在线预览）`EasyFlowDesigner`（流程设计器）                                                                                                                                                                                        |

### ⭐ 核心特性

- **基于 Element Plus**：复用 EP 的 CSS 变量体系，暗色模式、主题定制零配置无缝适配。
- **Tree-shaking 友好**：构建为单 ESM 入口 + 命名导出，配合打包工具自动剔除未使用组件。
- **命令式全局 API**：`easy.$msg` / `easy.$loading` / `easy.$msgbox` / `easy.$tour` / `easy.$badge`，一行代码完成消息提示、加载、弹窗、引导、徽标。
- **多模式安装**：
  - 完整安装：`app.use(EasyUI)` 自动注册 Element Plus + easy 全局服务
  - 按需安装：`app.use(ElementPlus)` + `setupEasy(app)`，组件按需导入
  - 自动导入：`easyComponentResolver()` 配合 `unplugin-vue-components` 零手写 import
- **独立子入口**：`EasyFilePreview` / `EasyFlowDesigner` 依赖重型 optional 包，已拆分为独立子入口（`@raopan/easy-ui/file-preview`、`@raopan/easy-ui/flow-designer`），不影响其他组件按需加载。

### 📦 依赖分层

- **peerDependencies**（消费方必须安装）：`vue` `vue-router` `element-plus` `@element-plus/icons-vue`
- **dependencies**（自动安装）：`@vueuse/core` `axios` `pinia`
- **optional peerDependencies**（按需安装）：`echarts` `@logicflow/*` `@vue-office/*` `cropperjs` `jsbarcode` `qrcode` `markdown-it` `pdf-lib` `pdfjs-dist` `pptx-preview` `crypto-js` `jszip` `highlight.js`

### 🛠 工程化与工具链

- **Monorepo**（pnpm workspace）：`packages/easy-ui`（组件库）、`packages/components`（组件源码）、`packages/utils`（工具函数）、`packages/constants`（常量）、`packages/doc`（文档站点）。
- **构建**：Vite 8 + `vue-tsc` 类型声明生成，产出 ESM 入口 + 独立子入口 + 类型声明。
- **文档**：Storybook 10（`@storybook/vue3-vite`），组件 `*.stories.ts` 交互式文档，端口 6008。
- **代码质量**：`@antfu/eslint-config` 全量格式化（替代 Prettier）、`vue-tsc` 类型检查、`vitest` 单元测试。
- **发布**：`prepublishOnly` 自动构建，`dist` + `README.md` + `LICENSE` 随包发布至 npm。

### 📖 文档与网站

- 文档仓库：[https://github.com/raopan2021/easy-ui](https://github.com/raopan2021/easy-ui)
- 在线预览站点：[https://raopan2021.github.io/easy-ui/](https://raopan2021.github.io/easy-ui/)
- 提供完整安装指南、暗色模式、Tree-shaking、命令式 API 使用文档。

---
