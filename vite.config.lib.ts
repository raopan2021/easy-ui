/**
 * Vite 库模式构建配置
 *
 * 生成产物：
 *   dist/index.mjs                        — 统一入口（tree-shakeable）
 *   dist/components/xly-xxx/index.mjs     — 按组件拆分
 *   dist/components/xly-xxx/index.css     — 按组件 CSS
 */
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

// 外部依赖 — 不打包进库，由消费方自行安装
const external = [
  'vue',
  'vue-router',
  'element-plus',
  '@element-plus/icons-vue',
  // optional peer（按需安装）
  'echarts',
  /^@logicflow/,
  /^@vue-office/,
  'cropperjs',
  'jsbarcode',
  'qrcode',
  'markdown-it',
  'pdf-lib',
  'pdfjs-dist',
  'pptx-preview',
  'crypto-js',
  'jszip',
  'highlight.js',
]

export default defineConfig({
  plugins: [vue()],

  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },

  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: true,         // 按组件拆分 CSS
    cssMinify: 'lightningcss',
    minify: false,              // 库不压缩（消费方自行压缩）

    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'index.mjs',
    },

    rollupOptions: {
      external,
      output: {
        // 保持模块结构 → tree-shaking
        preserveModules: true,
        preserveModulesRoot: 'src',
        exports: 'named',
        // CSS 随模块输出
        assetFileNames: ({ name }) => {
          if (name?.endsWith('.css')) return name.replace(/^src[\\/]?/, '')
          return 'assets/[name]-[hash][extname]'
        },
      },
    },

    sourcemap: true,
  },
})
