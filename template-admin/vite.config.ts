import type { ConfigEnv, UserConfigExport } from 'vite-plus'
import { loadEnv } from 'vite-plus'
import { getPluginsList } from './build/plugins'
import {
  __APP_INFO__,
  alias,
  pathResolve,
  root,
  wrapperEnv,
} from './build/utils'

export default ({ mode }: ConfigEnv): UserConfigExport => {
  const { VITE_PORT, VITE_COMPRESSION, VITE_PUBLIC_PATH, VITE_API_URL, VITE_OUTDIR }
    = wrapperEnv(loadEnv(mode, root))

  return {
    base: VITE_PUBLIC_PATH,
    root,
    resolve: { alias },
    css: {
      // 使用 Lightning CSS 替代 PostCSS 作为 CSS 转换引擎，提升热更新与打包阶段的 CSS 处理速度
      transformer: 'lightningcss',
      lightningcss: {
        // 与 build.target: "esnext" 保持一致，仅对现代浏览器未支持的语法做降级
        targets: {
          chrome: 111,
          edge: 111,
          firefox: 128,
          safari: 16,
        },
      },
    },
    // 服务端渲染
    server: {
      port: VITE_PORT,
      host: '0.0.0.0',
      // 本地跨域代理 https://cn.vitejs.dev/config/server-options.html#server-proxy
      proxy: {
        // 测试环境后端(10.0.7.5:18200)要求保留 /api 前缀，
        // 故不再 rewrite 去除 /api；如切换到需要去除前缀的后端，再放开 rewrite
        '/api': {
          target: VITE_API_URL,
          changeOrigin: true,
          // rewrite: path => path.replace(/^\/api/, "")
        },
      },
      // 预热文件以提前转换和缓存结果，降低启动期间的初始页面加载时长并防止转换瀑布
      warmup: {
        clientFiles: ['./index.html', './src/{views,components}/*'],
      },
    },
    preview: {
      port: VITE_PORT,
      host: '0.0.0.0',
      // preview 代理，不需要rewrite，否则本地预览 dist 时无法访问后端
      // 注意：不要 rewrite /api 前缀，让 nginx 的 location /api/ 能匹配上
      proxy: {
        '/api': {
          target: VITE_API_URL,
          changeOrigin: true,
        },
      },
    },
    plugins: getPluginsList(VITE_COMPRESSION),
    // https://cn.vitejs.dev/config/dep-optimization-options.html#dep-optimization-options
    optimizeDeps: {
      // 依赖预构建，`vite` 启动时会将下面 include 里的模块，编译成 esm 格式并缓存到 node_modules/.vite 文件夹，页面加载到对应模块时如果浏览器有缓存就读取浏览器缓存，如果没有会读取本地缓存并按需加载
      // 尤其当您禁用浏览器缓存时（这种情况只应该发生在调试阶段）必须将对应模块加入到 include里，否则会遇到开发环境切换页面卡顿的问题（vite 会认为它是一个新的依赖包会重新加载并强制刷新页面），因为它既无法使用浏览器缓存，又没有在本地 node_modules /.vite 里缓存
      // 温馨提示：如果您使用的第三方库是全局引入，也就是引入到 src / main.ts 文件里，就不需要再添加到 include 里了，因为 vite 会自动将它们缓存到 node_modules /.vite
      include: [
        'qs',
        'mitt',
        'dayjs',
        'axios',
        'pinia',
        'vue-types',
        'js-cookie',
        'vue-tippy',
        'pinyin-pro',
        'sortablejs',
        '@vueuse/core',
        '@pureadmin/utils',
        'responsive-storage',
      ],
      // Vite 8: 排除 unplugin-auto-import 虚拟模块，避免 Rolldown 预构建时丢失注入
      exclude: ['unimport'],
    },
    build: {
      // https://vite.dev/guide/build.html#browser-compatibility
      target: 'esnext',
      // lightningcss 作为 transformer 时，会对 tailwind 的 oklch() 生成 @supports (color: lab()) 回退，
      // 其内部裸声明块被 lightningcss 自身 minify 误判为 "empty selector" 而报错，
      // 故 minify 改用 esbuild（同样高速，且对裸声明兼容）。
      cssMinify: 'esbuild',
      outDir: VITE_OUTDIR,
      sourcemap: false,
      chunkSizeWarningLimit: 1500,
      reportCompressedSize: false, // 关闭 gzip 计算
      assetsInlineLimit: 4096,
      rolldownOptions: {
        input: {
          index: pathResolve('./index.html', import.meta.url),
        },
        // 屏蔽 @vueuse/core 的纯标注注释警告（第三方包，不影响构建）
        onwarn(warning, defaultHandler) {
          if (/@vueuse\/core/.test(warning.id || '') && warning.message.includes('PURE'))
            return
          defaultHandler(warning)
        },
        // 静态资源分类打包
        output: {
          // 生产环境由 Oxc minifier 原生移除 console（替代 vite-plugin-remove-console 插件，消除其构建开销）
          minify: {
            compress: {
              dropConsole: true,
            },
          },
          // 代码分割产生的异步 chunk 文件命名， 比如路由懒加载 () => import(...) 拆出来的 JS 文件
          chunkFileNames(chunkInfo) {
            // manualChunks 分离的第三方库不加 hash，其余加 hash
            const manualNames = ['vue']
            return manualNames.includes(chunkInfo.name)
              ? 'static/js/[name].js'
              : 'static/js/[name]-[hash].js'
          },
          // 入口文件打包后的命名，比如 index.html 对应的主入口 JS
          entryFileNames: 'static/js/[name]-[hash].js',
          //  静态资源（CSS、图片、字体等）的命名
          assetFileNames: 'static/[ext]/[name]-[hash].[ext]',
          // 分离第三方库，充分利用浏览器缓存
          // Vite 8: manualChunks 对象形式已移除，改用函数形式
          manualChunks(id: string) {
            if (id.includes('node_modules')) {
              // vue 运行时核心：每个页面都依赖，体积稳定，单独分包利于浏览器长期缓存
              if (/[/\\]node_modules[/\\](vue|vue-router|pinia|vue-types)[/\\]/.test(id)) {
                return 'vue'
              }
            }
          },
        },
      },
    },
    define: {
      __INTLIFY_PROD_DEVTOOLS__: false,
      __APP_INFO__: JSON.stringify(__APP_INFO__),
    },
  }
}
