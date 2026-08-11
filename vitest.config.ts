import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import VueJsx from '@vitejs/plugin-vue-jsx'
import { configDefaults, defineConfig } from 'vitest/config'

// 说明：vite.config.ts 导出的是函数形式（依赖 mode），无法直接 merge 进 vitest 配置
// （vitest 的 mergeConfig 不支持函数形式）。因此这里独立声明测试所需的插件与别名。
export default defineConfig({
  plugins: [vue(), VueJsx()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    dedupe: ['vue', 'element-plus'],
  },
  test: {
    // 测试文件位于各模块 __tests__/ 目录，使用全局 API（describe/it/expect/vi 不 import）
    globals: true,
    environment: 'jsdom',
    // 全局测试 setup：stub ResizeObserver / MutationObserver / matchMedia
    setupFiles: ['./vitest.setup.ts'],
    // 每个测试后自动清除 mock
    clearMocks: true,
    exclude: [...configDefaults.exclude, 'e2e/**'],
    root: fileURLToPath(new URL('./', import.meta.url)),
    // 支持 .ts / .tsx / .vue 组件测试（.tsx 用于 JSX 渲染）
    include: ['packages/**/__tests__/**/*.test.{ts,tsx}'],
  },
})
