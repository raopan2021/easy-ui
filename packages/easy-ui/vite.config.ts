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

/**
 * 外部化判断：
 * - JS 模块按包名/子路径 external（由消费者自行安装）
 * - css 资源导入（cropperjs/dist/cropper.css、@vue-office/*.css 等）**不** external，
 *   交给 Rolldown 提取进 dist/*.css，从 JS 产物中移除。
 *   否则主入口保留 `import 'xxx.css'`，Node ESM 加载时报
 *   `Unknown file extension ".css"`（vite 加载 config 时即触发）。
 */
function isExternal(id: string): boolean {
  if (/\.(css|scss|sass|less|svg|png|jpe?g|gif|webp|woff2?)$/.test(id))
    return false
  return external.includes(id)
    || /^@logicflow\//.test(id)
    || /^@vue-office\//.test(id)
    || /^@wangeditor\//.test(id)
    || /^cropperjs\//.test(id)
}

export default defineConfig({
  plugins: [vue(), libBuildInfo()],
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
    // Vite 默认 extensions 不含 .vue，显式添加以支持无扩展名导入
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue'],
  },
  build: {
    outDir: 'dist',
    // emptyOutDir 关闭：IDE 沙箱的 safe-delete 会拦截 dist 批量清空（>500 文件阈值）
    // 导致 vite:prepare-out-dir 失败。改为增量覆盖构建（Rolldown 覆盖同名输出）。
    // 如需完全干净构建，可手动清空 dist 后临时改回 true（在无沙箱的 CI/本机环境无需此改动）。
    emptyOutDir: false,
    cssCodeSplit: false,
    cssMinify: false,
    minify: false,
    lib: {
      entry: {
        'index': resolve(__dirname, 'src/index.ts'),
        'file-preview': resolve(__dirname, 'file-preview.ts'),
        'flow-designer': resolve(__dirname, 'flow-designer.ts'),
        'markdown': resolve(__dirname, 'markdown.ts'),
        'richtext': resolve(__dirname, 'richtext.ts'),
      },
      formats: ['es'],
      fileName: (_format, entryName) => `${entryName}.mjs`,
    },
    rollupOptions: {
      external: isExternal,
      output: {
        exports: 'named',
        assetFileNames: (assetInfo) => {
          const name = (assetInfo.name || '').replace(/\?.*$/, '')
          return name.endsWith('.css') ? '[name].css' : 'assets/[name]-[hash][extname]'
        },
        // Rolldown 共享 chunk 拆分：
        // 独立子入口组件（flow-designer / file-preview / markdown / richtext）依赖
        // optional peer 包（@logicflow、pptx-preview、@vue-office 等），默认构建会把
        // 与之共享的基础组件合并进它们的 chunk，导致主入口 index.mjs 静态依赖子入口 chunk
        // → 未安装 optional peer 的项目加载主入口即崩溃（Node ESM 无法解析其目录导入/lodash 等）。
        // 这里把主入口组件的共享模块独立为 easy-base chunk，四个子入口组件完全排除在分组外。
        codeSplitting: {
          groups: [
            {
              name: 'easy-base',
              test: /packages[\\/]components[\\/](?!(?:flow-designer|file-preview|markdown|richtext)(?:[\\/]|$))/,
              priority: 20,
            },
          ],
        },
      },
    },
    sourcemap: true,
  },
})
