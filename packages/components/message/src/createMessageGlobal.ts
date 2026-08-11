/**
 * 全局消息提示 API
 *
 * 在 main.ts 中调用 setupEasyMessage(app) 安装后，在任意组件中使用：
 * ```ts
 * import { EasyMessage } from '../../message'
 *
 * // 在 setup 中获取实例
 * const { success, danger } = EasyMessage()
 * // 或直接解构后模板中使用
 * const msg = EasyMessage()
 * msg.success('操作成功')
 * ```
 */
export { useMessage as EasyMessage } from './useMessage'
