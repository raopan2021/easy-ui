/**
 * @raopan/easy-ui 组件自动导入解析器（unplugin-vue-components）
 *
 * 使用方式：
 * ```ts
 * // vite.config.ts
 * import { easyComponentResolver } from '@raopan/easy-ui'
 * import Components from 'unplugin-vue-components/vite'
 *
 * Components({ resolvers: [easyComponentResolver()] })
 * ```
 *
 * 规则：
 * - EasyXxxYyy → @raopan/easy-ui（由打包工具 tree-shaking）
 */
import type { ComponentResolver } from 'unplugin-vue-components'

/** 库包名 — 消费方 import 的来源 */
const LIB = '@raopan/easy-ui'

/**
 * 依赖 optional 包、需独立子入口的组件映射。
 * 这些组件从主入口拆出，改为从 `@raopan/easy-ui/<name>` 子路径导入，
 * 避免消费方不安装 optional 依赖时整个库无法构建。
 */
const SUB_ENTRY: Record<string, string> = {
  EasyFilePreview: 'file-preview',
  EasyFlowDesigner: 'flow-designer',
  EasyMarkdown: 'markdown',
  EasyRichText: 'richtext',
}

export function easyComponentResolver(): ComponentResolver {
  return {
    type: 'component',

    resolve(name: string) {
      if (!name.startsWith('Easy'))
        return

      // 独立子入口组件：@raopan/easy-ui/file-preview / @raopan/easy-ui/flow-designer
      const sub = SUB_ENTRY[name]
      if (sub) {
        return {
          from: `${LIB}/${sub}`,
          name,
        }
      }

      return {
        from: LIB,
        name,
      }
    },
  }
}
