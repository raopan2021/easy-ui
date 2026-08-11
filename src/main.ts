import * as ElementPlusIconsVue from '@element-plus/icons-vue'
// easy-ui 全局服务 + 组件
import { EasyDocCode, setupEasy, setupWatermarkDirective } from '@raopan/easy-ui'

// Element Plus
import ElementPlus from 'element-plus'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

import { createPinia } from 'pinia'
import { createApp } from 'vue'
import { useThemeStore } from '@/stores/theme'
import App from './App.vue'

import router from './router'

import '@/styles/theme.css'

// 导入公共样式
import '@/styles/index.scss'
import 'element-plus/dist/index.css'
import '@raopan/easy-ui/dist/easy-ui.css'

const app = createApp(App)

// 全局注册文档代码展示组件
app.component('EasyDocCode', EasyDocCode)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
// 全局注册常用的 Element Plus 组件
app.use(ElementPlus, { locale: zhCn })

app.use(createPinia())
app.use(router)

// 初始化主题（订阅系统偏好并同步 <html> 的 dark class）
useThemeStore()

// 全局安装 easy 服务（消息提示、加载等）
setupEasy(app)

// 全局注册水印指令
setupWatermarkDirective(app)

app.mount('#app')
