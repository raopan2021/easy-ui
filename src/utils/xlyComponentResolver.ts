/**
 * xly 组件自动导入解析器（unplugin-vue-components）
 *
 * 使用方式：
 * ```ts
 * // vite.config.ts
 * import { xlyComponentResolver } from 'easy-ui'
 * import Components from 'unplugin-vue-components/vite'
 *
 * Components({ resolvers: [xlyComponentResolver()] })
 * ```
 *
 * 规则：
 * - XlyXxxYyy → easy-ui（由打包工具 tree-shaking）
 */
import type { ComponentResolver } from 'unplugin-vue-components'

/** 库包名 — 消费方 import 的来源 */
const LIB = 'easy-ui'

export function xlyComponentResolver(): ComponentResolver {
  const SPECIAL_NAMES = new Set([
    'XlyFormItem',
    'XlyDescriptionsItem',
    'XlyRadioGroup',
    'XlyUpload',
    'XlyFileUpload',
    'XlySteps',
    'XlyStep',
    'XlyDropdownItem',
    'XlyTabPane',
    'XlyTimelineItem',
    'XlyDocCode',
  ])

  return {
    type: 'component',

    resolve(name: string) {
      if (!name.startsWith('Xly'))
        return

      // 所有组件统一从主入口导入，消费方打包工具负责 tree-shaking
      // 特殊名称（别名 / 子组件）需要显式导出映射
      const importName = SPECIAL_NAMES.has(name) ? name : undefined

      return {
        from: LIB,
        ...(importName ? { importName } : { name }),
      }
    },
  }
}
