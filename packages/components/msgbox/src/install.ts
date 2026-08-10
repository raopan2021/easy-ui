import type { App } from 'vue'
import { createApp } from 'vue'
import { EasyMsgBox } from './msgbox'
import EasyMsgBoxComp from './msgbox.vue'

/**
 * 全局安装 MessageBox 组件
 *
 * 在 main.ts 中调用：
 * ```ts
 * import { setupEasyMsgBox } from './install'
 * setupEasyMsgBox(app)
 * ```
 *
 * 安装后任意组件中直接使用：
 * - 脚本：`easy.$msgbox.confirm('确定删除？', '删除确认', { type: 'warning' })`
 * - 脚本：`easy.$msgbox.alert('操作成功', { type: 'success' })`
 * - 脚本：`easy.$msgbox.prompt('请输入名称', '新建')`
 */
export function setupEasyMsgBox(app: App) {
  // 防重复挂载
  if (document.getElementById('easy-msgbox-global-container'))
    return

  // 挂载弹框容器到 body
  const container = document.createElement('div')
  container.id = 'easy-msgbox-global-container'
  document.body.appendChild(container)

  const msgboxApp = createApp(EasyMsgBoxComp)
  msgboxApp.mount(container)

  // 挂载到全局属性
  app.config.globalProperties.EasyMsgBox = EasyMsgBox
  app.provide('__EASY_MSGBOX__', EasyMsgBox)

  // mixin 注入渲染上下文（模板直接访问）
  app.mixin({
    computed: {
      EasyMsgBox() {
        return EasyMsgBox
      },
    },
  })
}
