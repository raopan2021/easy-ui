/**
 * Element Plus 按需注册
 *
 * 组件注册由 `unplugin-vue-components` + `ElementPlusResolver({ importStyle: true })` 自动处理（CSS 同样按需加载）。
 * 此文件仅注册 JS API 插件（ElMessage、ElMessageBox、ElLoading），
 * 并手动导入它们对应的 CSS（因为这些组件不会出现在 .vue template 中，resolver 无法检测到）。
 */
import type { App } from 'vue'

// ========== 插件（JS API 式调用，必须手动注册） ==========
import ElLoading from 'element-plus/es/components/loading/index.mjs'
import ElMessageBox from 'element-plus/es/components/message-box/index.mjs'
import ElMessage from 'element-plus/es/components/message/index.mjs'

// ========== CSS 按需导入（仅 JS API 组件需要手动引入） ==========
import 'element-plus/es/components/loading/style/css'
import 'element-plus/es/components/message/style/css'
import 'element-plus/es/components/message-box/style/css'

export function useElementPlus(app: App) {
  // 仅注册 JS API 插件（组件由 unplugin-vue-components 自动导入）
  app.use(ElLoading)
  app.use(ElMessage)
  app.use(ElMessageBox as any)
}
