import '@/styles/theme.css'
// 导入公共样式
import '@/styles/index.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'


// Element Plus
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'
import zhCn from 'element-plus/es/locale/lang/zh-cn'

// xly 全局服务安装
import { setupXly } from '@/utils/xly'

// XlyWatermark 全局指令注册
import { setupWatermarkDirective } from '@/components/xly-watermark/directive'

import { useThemeStore } from '@/stores/theme'

import App from './App.vue'
import router from './router'

const app = createApp(App)

// 全局注册文档代码展示组件
import DocCode from '@/components/DocCode.vue'
app.component('DocCode', DocCode)

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component)
}
// 全局注册常用的 Element Plus 组件
app.use(ElementPlus, { locale: zhCn });

app.use(createPinia())
app.use(router)

// 初始化主题（订阅系统偏好并同步 <html> 的 dark class）
useThemeStore()

// 全局安装 xly 服务（消息提示、加载等）
setupXly(app)

// 全局注册水印指令
setupWatermarkDirective(app)

app.mount('#app')
