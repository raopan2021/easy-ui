import type { App } from 'vue'
import { easyBadge } from '../../../components/badge'
import { vEasyLoading } from '../../../components/loading'
import { EasyMsg, setupEasyMessage } from '../../../components/message'
import { EasyMsgBox, setupEasyMsgBox } from '../../../components/msgbox'
import { vEasyTour } from '../../../components/tour'

/**
 * easy 全局工具对象
 *
 * 使用方式：
 * ```ts
 * import { easy } from '@raopan/easy-ui'
 *
 * // 消息提示
 * easy.$msg.success('操作成功')
 * easy.$msg.warning('注意')
 * easy.$msg.danger('出错了')
 * easy.$msg.info('提示信息')
 *
 * // 加载
 * const loading = easy.$loading.open({ text: '加载中...' })
 * loading.close()
 * easy.$loading.fullscreen('加载中...')
 * easy.$loading.container('.my-box', '加载中...')
 *
 * // 操作引导
 * const tour = easy.$tour({ steps: [...] })
 * tour.finish()
 * ```
 */
export const easy = {
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
 * 全局安装 easy 服务
 *
 * 在 main.ts 中调用：
 * ```ts
 * import { setupEasy } from '@raopan/easy-ui'
 * setupEasy(app)
 * ```
 *
 * 安装后任意组件中直接使用：
 * - 脚本：`easy.$msg.success('成功')` / `easy.$loading.open()`
 * - 模板：`@click="easy.$msg.success('成功')"`
 */
export function setupEasy(app: App) {
  // 挂载消息提示组件容器
  setupEasyMessage(app)

  // 挂载消息弹出框容器
  setupEasyMsgBox(app)

  // 同时挂载两处，确保 script setup 和模板都能访问 easy
  app.config.globalProperties.easy = easy
  app.provide('__EASY__', easy)

  // mixin 注入到每个组件的渲染上下文
  app.mixin({
    computed: {
      easy() {
        return easy
      },
    },
  })
}

export type { BadgeInstance, BadgeOptions } from '../../../components/badge'
export type { LoadingInstance, LoadingOptions } from '../../../components/loading'
export type { MessageOptions } from '../../../components/message'
export type { MsgBoxAction, MsgBoxInputConfig, MsgBoxOptions, MsgBoxType } from '../../../components/msgbox'
export type { TourInstance, TourOptions } from '../../../components/tour'
