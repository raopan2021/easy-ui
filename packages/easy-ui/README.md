# Easy UI

<p align="center">
  <img src="https://img.shields.io/badge/Vue-3.5+-brightgreen.svg" alt="Vue 3.5+">
  <img src="https://img.shields.io/badge/TypeScript-5.9+-blue.svg" alt="TypeScript 5.9+">
  <img src="https://img.shields.io/badge/Vite-8.1+-purple.svg" alt="Vite 8.1+">
  <img src="https://img.shields.io/badge/Element_Plus-2.13+-409EFF.svg" alt="Element Plus 2.13+">
  <img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT">
</p>

<p align="center">
  <b>Vue 3 企业级组件库，基于 Element Plus 扩展</b>
</p>

<p align="center">
  <a href="./CHANGELOG.md">📋 更新记录</a> &nbsp;|&nbsp;
  <a href="https://raopan2021.github.io/easy-ui/">🌐 在线预览</a> &nbsp;|&nbsp;
  <a href="https://gitee.com/yun_hua_admin/ease-ui">⭐ Gitee 仓库</a>
</p>

---

## 📦 安装

```bash
npm install @raopan/easy-ui element-plus @element-plus/icons-vue
```

## 🚀 快速开始

### 方式一：完整安装（推荐新项目）

```ts
import EasyUI from '@raopan/easy-ui'
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.use(EasyUI) // 自动注册 Element Plus + easy 全局服务
app.mount('#app')
```

### 方式二：按需 + Tree-shaking（推荐生产项目）

```ts
import { setupEasy } from '@raopan/easy-ui'
import ElementPlus from 'element-plus'
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus)
setupEasy(app) // 仅注册全局服务，组件按需导入
app.mount('#app')
```

### 方式三：自动导入（零手写 import）

```ts
// vite.config.ts
import { easyComponentResolver } from '@raopan/easy-ui'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  plugins: [
    Components({
      resolvers: [
        easyComponentResolver(), // Easy* 组件自动导入
        ElementPlusResolver({ importStyle: 'css' }), // EP 组件
      ],
    }),
  ],
})
```

```vue
<!-- 组件直接使用，无需 import -->
<template>
  <EasyButton type="primary">
    提交
  </EasyButton>
  <EasyTable :data="list" :columns="columns" />
</template>
```

## 🌓 Dark Mode

组件全部使用 Element Plus CSS 变量，无缝适配暗色模式：

```ts
// main.ts — 方式一：手动切换
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)
```

```html
<!-- 方式二：CSS 类名控制 -->
<html class="dark">
  <!-- 所有 Easy UI 组件自动切换暗色 -->
</html>
```

```scss
// 组件样式中使用的 CSS 变量（自动跟随主题）
.easy-card {
  background: var(--el-bg-color-overlay); // 亮色 #fff → 暗色 #1d1e1f
  border-color: var(--el-border-color-light); // 亮色 #e4e7ed → 暗色 #4c4d4f
  color: var(--el-text-color-primary); // 亮色 #303133 → 暗色 #e5eaf3
}
```

## 🎯 Tree-shaking

`easy-ui` 支持完整的 tree-shaking，仅打包实际使用的组件：

```ts
import { EasyButton } from '@raopan/easy-ui'  // 未使用的组件被自动剔除
```

Vite/Rollup/webpack 5+ 均自动支持，无需额外配置。重型组件 `EasyFilePreview`/`EasyFlowDesigner` 使用独立子入口（`easy-ui/file-preview`、`easy-ui/flow-designer`），仅在使用时才被引入。

## 🛠 全局 easy 服务

```ts
import { setupEasy, easy } from '@raopan/easy-ui'

// 安装后全局可用
setupEasy(app)

// 消息提示
easy.$msg.success('操作成功')
easy.$msg.warning('请注意')
easy.$msg.danger('操作失败')
easy.$msg.info('提示信息')

// 加载状态
const loading = easy.$loading.open('加载中...')
loading.close()

// 消息弹窗
easy.$msgbox.confirm('确定删除？').then(() => { /* ... */ })

// 操作引导
const tour = easy.$tour({ steps: [1, 2, 3] })
tour.finish()
```

## 📦 依赖分层

| 级别                 | 包                                                                                                                      | 说明           |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------- |
| **peerDependencies** | `vue` `vue-router` `element-plus` `@element-plus/icons-vue`                                                             | 消费方必须安装 |
| **dependencies**     | `@vueuse/core` `axios` `pinia`                                                                                          | 自动安装       |
| **optional**         | `echarts` `@logicflow/*` `cropperjs` `jsbarcode` `qrcode` `markdown-it` `pdfjs-dist` `pptx-preview` `crypto-js` `jszip` | 按需安装       |

> **独立子入口**：`EasyFilePreview`（文档/Office 预览）与 `EasyFlowDesigner`（流程设计器）依赖重型 optional 包，为不影响其他组件的按需加载，已拆分为独立子入口。使用它们时请从子路径导入（`easyComponentResolver` 已自动处理）：
> ```ts
> import { EasyFilePreview } from '@raopan/easy-ui/file-preview'      // 需安装 @vue-office/*、pptx-preview
> import { EasyFlowDesigner } from '@raopan/easy-ui/flow-designer'    // 需安装 @logicflow/core、@logicflow/extension
> ```

## ✨ 核心优势

### 基于 Element Plus，自动适配主题

组件不重新发明轮子，直接扩展 Element Plus 的能力。使用与 Element Plus 完全一致的 CSS 变量体系，暗色模式、主题定制零配置。

### Tree-shaking 友好

构建为单 ESM 入口（`dist/index.mjs`）+ 全量样式（`dist/index.css`），命名导出（`import { EasyButton } from '@raopan/easy-ui'`）配合打包工具自动剔除未使用的组件，不影响产物体积。重型组件（`EasyFilePreview`/`EasyFlowDesigner`）独立子入口按需加载。

### 命令式 API

`easy.$msg` / `easy.$loading` / `easy.$msgbox` / `easy.$tour` — 消息提示、加载、弹窗全部支持命令式调用，一行代码搞定。

---

## 📂 项目结构

```
ease-ui/
├── src/
│   ├── components/          # 组件源码（每个组件独立目录）
│   │   ├── easy-button/      # 按钮
│   │   ├── easy-table/       # 表格
│   │   ├── easy-form/        # 表单
│   │   └── ...              # 65+ 组件
│   ├── utils/
│   │   ├── easy.ts           # 全局服务 API
│   │   └── easyComponentResolver.ts  # 自动导入解析器
│   └── index.ts             # 库入口
├── vite.config.lib.ts       # 库模式构建配置
├── tsconfig.lib.json        # 类型声明生成配置
├── dist/                    # 构建产物（发布到 npm）
│   ├── index.mjs            # 主入口（ESM）
│   ├── index.css            # 全量样式
│   ├── file-preview.mjs     # 独立子入口
│   ├── flow-designer.mjs    # 独立子入口
│   └── easy-ui/             # 类型声明
└── package.json
```

---

> 以下为**在线文档站点**相关文档（本地 `npm run dev` 启动）

## 💡 在线预览

**在线预览：** https://raopan2021.github.io/easy-ui/

本地启动文档站点：

```bash
git clone https://gitee.com/yun_hua_admin/ease-ui.git
cd ease-ui
pnpm install
pnpm dev
```

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交修改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

[MIT](./LICENSE) © 2026 Easy UI

---

<p align="center">
  <b>🌟 如果这个项目对你有帮助，请给它一个 Star！</b>
</p>
