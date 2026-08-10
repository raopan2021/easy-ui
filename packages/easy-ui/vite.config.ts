import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
/**
 * easy-ui 库构建配置
 *
 * 产物：dist/index.mjs + dist/components/* /index.mjs + dist/components/* /index.css
 */
import { defineConfig } from 'vite'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

const external = [
  'vue',
  'vue-router',
  'element-plus',
  '@element-plus/icons-vue',
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
    // Vite 默认 extensions 不含 .vue，显式添加以支持无扩展名导入
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: true,
    cssMinify: false,
    minify: false,
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: () => 'index.mjs',
    },
    rollupOptions: {
      external,
      output: {
        preserveModules: true,
        preserveModulesRoot: resolve(__dirname, 'src'),
        exports: 'named',
        assetFileNames: ({ name }) => {
          // Sanitize Vue SFC query params (rolldown bug on Windows)
          const clean = (name || '').replace(/\?.*$/, '')
          if (clean.endsWith('.css')) {
            return clean.replace(/^src[\\/]?/, '')
          }
          return 'assets/[name]-[hash][extname]'
        },
      },
    },
    sourcemap: true,
  },
})
