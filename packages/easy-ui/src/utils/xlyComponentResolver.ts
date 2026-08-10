/**
 * easy-ui 组件自动导入解析器（unplugin-vue-components）
 *
 * 使用方式：
 * ```ts
 * // vite.config.ts
 * import { EasyUiResolver } from 'easy-ui'
 * import Components from 'unplugin-vue-components/vite'
 *
 * Components({ resolvers: [EasyUiResolver()] })
 * ```
 *
 * 规则：
 * - EasyXxxYyy → easy-ui（由打包工具 tree-shaking）
 */
import type { ComponentResolver } from 'unplugin-vue-components'

/** 库包名 — 消费方 import 的来源 */
const LIB = 'easy-ui'

export function xlyComponentResolver(): ComponentResolver {
  return {
    type: 'component',

    resolve(name: string) {
      if (!name.startsWith('Easy'))
        return

      return {
        from: LIB,
        name,
      }
    },
  }
}
