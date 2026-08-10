import type { App } from 'vue'
import { easyBadge, EasyMsg, EasyMsgBox, setupEasyMessage, setupEasyMsgBox, vEasyLoading, vEasyTour } from 'easy-ui'

/**
 * xly 全局工具对象
 *
 * 使用方式：
 * ```ts
 * import { xly } from 'easy-ui'
 *
 * // 消息提示
 * xly.$msg.success('操作成功')
 * xly.$msg.warning('注意')
 * xly.$msg.danger('出错了')
 * xly.$msg.info('提示信息')
 *
 * // 加载
 * const loading = xly.$loading.open({ text: '加载中...' })
 * loading.close()
 * xly.$loading.fullscreen('加载中...')
 * xly.$loading.container('.my-box', '加载中...')
 *
 * // 操作引导
 * const tour = xly.$tour({ steps: [...] })
 * tour.finish()
 * ```
 */
export const xly = {
  /** 消息提示 */
  $msg: EasyMsg,
  /** 加载 */
  $loading: vEasyLoading,
  /** 操作引导 */
  $tour: vEasyTour,
  /** 徽标 */
  $badge: easyBadge,
  /** 消息弹出框 */
  $msgbox: EasyMsgBox,
}

/**
 * 全局安装 xly 服务
 *
 * 在 main.ts 中调用：
 * ```ts
 * import { setupXly } from 'easy-ui'
 * setupXly(app)
 * ```
 *
 * 安装后任意组件中直接使用：
 * - 脚本：`xly.$msg.success('成功')` / `xly.$loading.open()`
 * - 模板：`@click="xly.$msg.success('成功')"`
 */
export function setupXly(app: App) {
  // 挂载消息提示组件容器
  setupEasyMessage(app)

  // 挂载消息弹出框容器
  setupEasyMsgBox(app)

  // 同时挂载两处，确保 script setup 和模板都能访问 xly
  app.config.globalProperties.xly = xly
  app.provide('__XLY__', xly)

  // mixin 注入到每个组件的渲染上下文
  app.mixin({
    computed: {
      xly() {
        return xly
      },
    },
  })
}

// 类型导出
export type { MessageOptions } from 'easy-ui'
export type { LoadingInstance, LoadingOptions } from 'easy-ui'
export type { TourInstance, TourOptions } from 'easy-ui'
export type { BadgeInstance, BadgeOptions } from 'easy-ui'
export type { MsgBoxAction, MsgBoxInputConfig, MsgBoxOptions, MsgBoxType } from 'easy-ui'
