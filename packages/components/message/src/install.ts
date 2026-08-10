import type { App } from 'vue'
import { createApp } from 'vue'
import { EasyMsg } from './message'
import EasyMessageComp from './message.vue'

/**
 * 全局安装消息提示组件
 *
 * 在 main.ts 中调用：
 * ```ts
 * import { setupEasyMessage } from './install'
 * setupEasyMessage(app)
 * ```
 *
 * 安装后任意组件中直接使用：
 * - 模板：`@click="EasyMsg.success('成功')"`
 * - 脚本：`EasyMsg.success('成功')`
 */
export function setupEasyMessage(app: App) {
  // 防重复挂载（HMR 时 body 中已有容器）
  if (document.getElementById('easy-message-global-container'))
    return

  // 挂载隐藏的消息容器到 body
  const container = document.createElement('div')
  container.id = 'easy-message-global-container'
  document.body.appendChild(container)

  const messageApp = createApp(EasyMessageComp)
  messageApp.mount(container)

  // 同时挂载两处，确保 script setup 和模板都能访问
  app.config.globalProperties.EasyMsg = EasyMsg
  app.provide('__EASY_MSG__', EasyMsg)

  // mixin 将 EasyMsg 注入到每个组件的渲染上下文（模板中直接使用）
  app.mixin({
    computed: {
      EasyMsg() {
        return EasyMsg
      },
    },
  })
}
