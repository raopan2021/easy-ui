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
  <a href="https://ease-ui.com">🌐 在线预览</a> &nbsp;|&nbsp;
  <a href="https://gitee.com/yun_hua_admin/ease-ui">⭐ Gitee 仓库</a>
</p>

---

## 📦 安装

```bash
npm install easy-ui element-plus @element-plus/icons-vue
```

## 🚀 快速开始

### 方式一：完整安装（推荐新项目）

```ts
import EasyUI from 'easy-ui'
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.use(EasyUI) // 自动注册 Element Plus + xly 全局服务
app.mount('#app')
```

### 方式二：按需 + Tree-shaking（推荐生产项目）

```ts
import { setupXly } from 'easy-ui'
import ElementPlus from 'element-plus'
// main.ts
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus)
setupXly(app) // 仅注册全局服务，组件按需导入
app.mount('#app')
```

### 方式三：自动导入（零手写 import）

```ts
// vite.config.ts
import { xlyComponentResolver } from 'easy-ui'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  plugins: [
    Components({
      resolvers: [
        xlyComponentResolver(), // Xly* 组件自动导入
        ElementPlusResolver({ importStyle: 'css' }), // EP 组件
      ],
    }),
  ],
})
```

```vue
<!-- 组件直接使用，无需 import -->
<template>
  <XlyButton type="primary">
    提交
  </XlyButton>
  <XlyTable :data="list" :columns="columns" />
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
.xly-card {
  background: var(--el-bg-color-overlay); // 亮色 #fff → 暗色 #1d1e1f
  border-color: var(--el-border-color-light); // 亮色 #e4e7ed → 暗色 #4c4d4f
  color: var(--el-text-color-primary); // 亮色 #303133 → 暗色 #e5eaf3
}
```

## 🎯 Tree-shaking

`easy-ui` 支持完整的 tree-shaking，仅打包实际使用的组件：

```
只使用 XlyButton → 仅引入 dist/components/xly-button/index.mjs (~3KB)
只使用 XlyTable  → 仅引入 dist/components/xly-table/index.mjs (~15KB)
```

Vite/Rollup/webpack 5+ 均自动支持，无需额外配置。

## 🛠 全局 xly 服务

```ts
import { setupXly, xly } from 'easy-ui'

// 安装后全局可用
setupXly(app)

// 消息提示
xly.$msg.success('操作成功')
xly.$msg.warning('请注意')
xly.$msg.danger('操作失败')
xly.$msg.info('提示信息')

// 加载状态
const loading = xly.$loading.open('加载中...')
loading.close()

// 消息弹窗
xly.$msgbox.confirm('确定删除？').then(() => { /* ... */ })

// 操作引导
const tour = xly.$tour({ steps: [1, 2, 3] })
tour.finish()
```

## 📦 依赖分层

| 级别                 | 包                                                                                                                      | 说明           |
| -------------------- | ----------------------------------------------------------------------------------------------------------------------- | -------------- |
| **peerDependencies** | `vue` `vue-router` `element-plus` `@element-plus/icons-vue`                                                             | 消费方必须安装 |
| **dependencies**     | `@vueuse/core` `axios` `pinia`                                                                                          | 自动安装       |
| **optional**         | `echarts` `@logicflow/*` `cropperjs` `jsbarcode` `qrcode` `markdown-it` `pdfjs-dist` `pptx-preview` `crypto-js` `jszip` | 按需安装       |

## ✨ 核心优势

### 基于 Element Plus，自动适配主题

组件不重新发明轮子，直接扩展 Element Plus 的能力。使用与 Element Plus 完全一致的 CSS 变量体系，暗色模式、主题定制零配置。

### Tree-shaking 友好

每个组件独立构建为 `.mjs` + `.css`，打包工具自动剔除未使用的组件，不影响产物体积。

### 命令式 API

`xly.$msg` / `xly.$loading` / `xly.$msgbox` / `xly.$tour` — 消息提示、加载、弹窗全部支持命令式调用，一行代码搞定。

---

## 📂 项目结构

```
ease-ui/
├── src/
│   ├── components/          # 组件源码（每个组件独立目录）
│   │   ├── xly-button/      # 按钮
│   │   ├── xly-table/       # 表格
│   │   ├── xly-form/        # 表单
│   │   └── ...              # 65+ 组件
│   ├── utils/
│   │   ├── xly.ts           # 全局服务 API
│   │   └── xlyComponentResolver.ts  # 自动导入解析器
│   └── index.ts             # 库入口
├── vite.config.lib.ts       # 库模式构建配置
├── tsconfig.lib.json        # 类型声明生成配置
├── dist/                    # 构建产物（发布到 npm）
│   ├── index.mjs            # 统一入口
│   └── components/          # 按组件拆分
│       └── xly-button/
│           ├── index.mjs    # 组件 JS
│           └── index.css    # 组件 CSS
└── package.json
```

---

> 以下为**在线文档站点**相关文档（本地 `npm run dev` 启动）

## 💡 在线预览

**在线预览：** https://ease-ui.com

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
