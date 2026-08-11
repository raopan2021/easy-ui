import type { Plugin } from 'vite'
import { readdir, stat } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import vue from '@vitejs/plugin-vue'
import boxen from 'boxen'
import gradient from 'gradient-string'
/**
 * easy-ui 库构建配置
 *
 * 产物：
 * - dist/index.mjs（主入口 ESM）+ dist/index.css（全量样式）
 * - dist/file-preview.mjs / dist/flow-designer.mjs（重型组件独立子入口）
 */
import { defineConfig } from 'vite'

const __dirname = fileURLToPath(new URL('.', import.meta.url))

/** 统计目录总字节数 */
async function getDirSize(dir: string): Promise<number> {
  let total = 0
  const entries = await readdir(dir, { withFileTypes: true })
  for (const entry of entries) {
    const full = join(dir, entry.name)
    if (entry.isDirectory())
      total += await getDirSize(full)
    else if (entry.isFile())
      total += (await stat(full)).size
  }
  return total
}

/** 格式化字节数 */
function formatBytes(bytes: number): string {
  if (bytes <= 0)
    return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  return `${(bytes / 1024 ** i).toFixed(2)} ${units[i]}`
}

/** 库构建信息提示 */
function libBuildInfo(): Plugin {
  let start = 0
  return {
    name: 'vite:lib-build-info',
    config(_c, { command }) {
      if (command === 'build')
        start = Date.now()
    },
    buildStart() {
      if (start) {
        console.log(
          boxen(
            gradient(['cyan', 'magenta']).multiline('🚀 开始构建 easy-ui 组件库...'),
            { padding: 1, margin: 1, borderStyle: 'double', borderColor: 'cyan' },
          ),
        )
      }
    },
    closeBundle() {
      if (!start)
        return
      getDirSize(resolve(__dirname, 'dist'))
        .then((size) => {
          const sec = ((Date.now() - start) / 1000).toFixed(2)
          console.log(
            boxen(
              gradient(['green', 'cyan']).multiline(
                [
                  '🎉 easy-ui 打包完成！',
                  '',
                  `📦 产物大小：${formatBytes(size)}`,
                  `🕐  构建耗时：${sec}s`,
                ].join('\n'),
              ),
              { padding: 1, margin: 1, borderStyle: 'double', borderColor: 'green' },
            ),
          )
        })
        .catch(() => {})
    },
  }
}

const external = [
  'vue',
  'vue-router',
  'element-plus',
  '@element-plus/icons-vue',
  // 运行时依赖（dependencies）
  '@vueuse/core',
  'axios',
  'pinia',
  // 可选 peerDependencies
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
  plugins: [vue(), libBuildInfo()],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
    // Vite 默认 extensions 不含 .vue，显式添加以支持无扩展名导入
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    cssCodeSplit: false,
    cssMinify: false,
    minify: false,
    lib: {
      entry: {
        index: resolve(__dirname, 'src/index.ts'),
        'file-preview': resolve(__dirname, 'file-preview.ts'),
        'flow-designer': resolve(__dirname, 'flow-designer.ts'),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.mjs`,
    },
    rollupOptions: {
      external,
      output: {
        exports: 'named',
        assetFileNames: (assetInfo) => {
          const name = (assetInfo.name || '').replace(/\?.*$/, '')
          return name.endsWith('.css') ? '[name].css' : 'assets/[name]-[hash][extname]'
        },
      },
    },
    sourcemap: true,
  },
})
