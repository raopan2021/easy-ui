import { fileURLToPath, URL } from 'node:url'

import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'
import { defineConfig } from 'vite'
import viteCompression from 'vite-plugin-compression'
import { xlyComponentResolver } from './packages/easy-ui/src/utils/xlyComponentResolver.ts'

// https://vite.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    vue(),
    // 自动按需导入 API
    AutoImport({
      imports: ['vue', 'vue-router', 'pinia', '@vueuse/core'],
      dts: 'src/types/import/auto-imports.d.ts',
      resolvers: [ElementPlusResolver()],
      eslintrc: {
        enabled: true,
        filepath: './.auto-import.json',
        globalsPropValue: true,
      },
    }),
    // 自动按需导入组件
    Components({
      dts: 'src/types/import/components.d.ts',
      resolvers: [xlyComponentResolver(), ElementPlusResolver()],
    }),
    // 压缩
    viteCompression({
      verbose: false, // 是否在控制台输出压缩结果
      disable: false, // 是否禁用
      algorithm: 'gzip', // 压缩算法
      ext: '.gz', // 压缩后的文件名后缀
      threshold: 10240, // 只有大小大于该值的资源会被处理 10240B = 10KB
      deleteOriginFile: false, // 压缩后是否删除原文件
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
    // Vite 默认 extensions 不含 .vue，显式添加以支持无扩展名导入
    extensions: ['.mjs', '.js', '.mts', '.ts', '.jsx', '.tsx', '.json', '.vue'],
    // 确保 workspace 包使用同一份 vue / element-plus 实例
    dedupe: ['vue', 'element-plus'],
  },
  css: {
    transformer: 'lightningcss',
    lightningcss: {
      targets: { chrome: 111, edge: 111, firefox: 128, safari: 16 },
    },
  },
  server: {
    port: 3000,
    open: true,
    warmup: {
      clientFiles: ['./index.html', './src/{views,components,layouts}/*'],
    },
  },
  optimizeDeps: {
    exclude: ['easy-ui', 'unimport'],
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : [],
  },
  build: {
    // https://vite.dev/guide/build.html#browser-compatibility
    target: 'esnext',
    // lightningcss 作为 transformer 时，其 minify 对裸声明块存在误判，
    // 故 minify 改用 esbuild（同样高速，且对裸声明兼容）
    cssMinify: 'esbuild',
    // 生产环境 JS 压缩：使用 esbuild（稳定且高速），并移除 console/debugger
    minify: 'esbuild',
    outDir: 'dist',
    // 生产环境关闭 sourcemap：减小产物体积并显著降低构建内存占用（与参考项目一致）
    sourcemap: false,
    reportCompressedSize: false, // 关闭 gzip 体积计算，加快构建
    // Vite 8 默认使用 Rolldown 打包器，rollupOptions 迁移为 rolldownOptions
    rolldownOptions: {
      // 屏蔽 @vueuse/core 的纯标注注释警告（第三方包，不影响构建）
      onwarn(warning, defaultHandler) {
        if (/@vueuse\/core/.test(warning.id || '') && warning.message.includes('PURE'))
          return
        defaultHandler(warning)
      },
      // 静态资源分类打包
      output: {
        // 代码分割产生的异步 chunk 文件命名（如路由懒加载拆出的 JS）
        chunkFileNames(chunkInfo) {
          // manualChunks 分离的第三方库不加 hash，其余加 hash
          const manualNames = ['vue-vendor', 'element-plus']
          return manualNames.includes(chunkInfo.name) ? 'static/js/[name].js' : 'static/js/[name]-[hash].js'
        },
        // 入口文件打包后的命名
        entryFileNames: 'static/js/[name]-[hash].js',
        // 静态资源（CSS、图片、字体等）的命名
        assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
        // 分离第三方库，充分利用浏览器缓存
        // Vite 8: manualChunks 对象形式已移除，改用函数形式
        manualChunks(id: string) {
          if (id.includes('node_modules')) {
            // vue 运行时核心：每个页面都依赖，体积稳定，单独分包利于浏览器长期缓存
            if (/[/\\]node_modules[/\\](?:vue|vue-router|pinia|@vue)[/\\]/.test(id)) {
              return 'vue-vendor'
            }
            // element-plus 及其图标库
            if (/[/\\]node_modules[/\\](?:element-plus|@element-plus)[/\\]/.test(id)) {
              return 'element-plus'
            }
          }
        },
      },
    },
    // 调整chunk大小警告限制
    chunkSizeWarningLimit: 1500,
  },
}))
