import type { PluginOption } from 'vite'
import { resolve } from 'node:path'
// @raopan/easy-ui 组件自动导入解析器
import { easyComponentResolver } from '@raopan/easy-ui'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { codeInspectorPlugin } from 'code-inspector-plugin'
import AutoImport from 'unplugin-auto-import/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

import Components from 'unplugin-vue-components/vite'
import removeNoMatch from 'vite-plugin-router-warn'
import svgLoader from 'vite-svg-loader'
import { configCompressPlugin } from './compress'
import { cssAsyncLoad } from './cssAsyncLoad'
import { viteBuildInfo } from './info'

import { root } from './utils'

/** 打包压缩格式类型 */
type ViteCompression
  = | 'none'
    | 'gzip'
    | 'brotli'
    | 'both'
    | 'gzip-clear'
    | 'brotli-clear'
    | 'both-clear'

export function getPluginsList(
  VITE_COMPRESSION: ViteCompression,
): PluginOption[] {
  return [
    tailwindcss(),
    // 全局自动导入函数：vue / vue-router / element-plus 工具 / 项目内部
    // 必须在 vue() 之前注册，确保 transform 在 Vue SFC 编译前注入 import
    AutoImport({
      imports: [
        'vue',
        'vue-router',
        { '@/utils/xly': ['withLoading'] },
        { 'element-plus': ['ElMessage', 'ElMessageBox'] },
      ],
      dts: resolve(root, 'types/auto-imports.d.ts'),
      include: [/\.[jt]sx?$/, /\.vue$/, /\.vue\?vue/],
    }),
    // 全局自动导入组件：@raopan/easy-ui 组件 + Element Plus 图标（按需导入避免 barrel import 循环依赖）
    Components({
      resolvers: [
        easyComponentResolver(), // @raopan/easy-ui 组件自动导入解析器
        ElementPlusResolver({ importStyle: true }),
      ],
      // 仅解析 xly 组件 + 图标，避免全局扫描 src 目录
      dirs: [],
      dts: resolve(root, 'types/components.d.ts'),
      include: [/\.vue$/, /\.vue\?vue/],
    }),
    vue(),
    // jsx、tsx语法支持
    vueJsx(),
    /**
     * 在页面上按住组合键时，鼠标在页面移动即会在 DOM 上出现遮罩层并显示相关信息，点击一下将自动打开 IDE 并将光标定位到元素对应的代码位置
     * Mac 默认组合键 Option + Shift
     * Windows 默认组合键 Alt + Shift
     * 更多用法看 https://inspector.fe-dev.cn/guide/start.html
     */
    codeInspectorPlugin({
      bundler: 'vite',
      hideConsole: true,
    }),
    viteBuildInfo(),
    /**
     * 开发环境下移除非必要的vue-router动态路由警告No match found for location with path
     * 非必要具体看 https://github.com/vuejs/router/issues/521 和 https://github.com/vuejs/router/issues/359
     * vite-plugin-router-warn只在开发环境下启用，只处理vue-router文件并且只在服务启动或重启时运行一次，性能消耗可忽略不计
     */
    removeNoMatch(),
    // svg组件化支持
    svgLoader(),
    configCompressPlugin(VITE_COMPRESSION),
    // CSS 异步加载，减少渲染阻塞（构建产物 CSS 改为 preload + onload 应用）
    cssAsyncLoad(),
  ]
}
