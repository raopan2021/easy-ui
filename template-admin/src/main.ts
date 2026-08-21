import type { Directive } from 'vue'
import { MotionPlugin } from '@vueuse/motion'
import VueTippy from 'vue-tippy'
// 全局注册 SVG 雪碧图图标组件，并注入 sprite（替代 vite-svg-loader 的 ?component）
import SvgIcon from '@/components/SvgIcon/index.vue'
// 自定义指令
import * as directives from '@/directives'
import { useElementPlus } from '@/plugins/elementPlus'
import { setupStore } from '@/store'
// 页面刷新时清除 CACHE_ 开头的 sessionStorage 缓存
import { clearSessionCache } from '@/utils/cache'

import { injectResponsiveStorage } from '@/utils/responsive'

import { setupSvgSprite } from '@/utils/svg-sprite'
// 全局安装 easy 服务（消息提示、加载等，来自 @raopan/easy-ui）
import { setupEasy } from '@/utils/xly'
import App from './App.vue'
// 全局注册通用图标组件
import { PureIcon } from './components/ReIcon'

import { getPlatformConfig } from './config'

import router from './router'

// 引入重置样式
import './style/reset.scss'
// 导入公共样式
import './style/index.scss'

// 一定要在main.ts中导入tailwind.css，防止vite每次hmr都会请求src/style/index.scss整体css文件导致热更新慢的问题
import './style/tailwind.css'
// Element Plus CSS 由 unplugin-vue-components 的 ElementPlusResolver({ importStyle: true }) 按需自动导入，
// 不再全量引入 element-plus/dist/index.css，避免 96%+ 未使用 CSS 被打包
// @raopan/easy-ui 组件样式（EasyXxx 组件通过 easyComponentResolver 按需导入，JS API 依赖此全量样式）
import '@raopan/easy-ui/dist/easy-ui.css'
// 全局注册vue-tippy
import 'tippy.js/dist/tippy.css'

import 'tippy.js/themes/light.css'

clearSessionCache()

const app = createApp(App)
Object.keys(directives).forEach((key) => {
  app.directive(key, (directives as { [key: string]: Directive })[key])
})
app.component('PureIcon', PureIcon)
app.component('SvgIcon', SvgIcon)
setupSvgSprite()
app.use(VueTippy)

getPlatformConfig(app).then(async (config) => {
  setupStore(app)
  app.use(router)
  await router.isReady()
  injectResponsiveStorage(app, config)
  app.use(MotionPlugin).use(useElementPlus)
  app.mount('#app')
})
setupEasy(app)
