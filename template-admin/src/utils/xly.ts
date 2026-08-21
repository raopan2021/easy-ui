import type { LoadingInstance, LoadingOptions } from '@raopan/easy-ui'
import type { App } from 'vue'
import {
  easy,

  setupEasy,
} from '@raopan/easy-ui'

/**
 * easy 全局工具对象（来自 @raopan/easy-ui，替代旧版 xly）
 *
 * 使用方式：
 * ```ts
 * import { easy } from "@/utils/xly"
 *
 * // 消息提示
 * easy.$msg.success("操作成功")
 * easy.$msg.warning("注意")
 * easy.$msg.danger("出错了")
 * easy.$msg.info("提示信息")
 *
 * // 加载
 * const loading = easy.$loading.open({ text: "加载中..." })
 * loading.close()
 * easy.$loading.fullscreen("加载中...")
 * easy.$loading.container(".my-box", "加载中...")
 *
 * // 操作引导
 * const tour = easy.$tour({ steps: [...] })
 * tour.finish()
 * ```
 */
export { easy, setupEasy }

/** easy 全屏 loading 实例类型（复用 LoadingInstance） */
type FullscreenLoading = LoadingInstance

/* ============================================================
   统一 loading 工具（基于 easy.$loading）
   替代各页面零散的 v-loading ref + loadingInstance 写法
   - 内部维护一个 fullscreen 实例，多次调用复用
   - showLoading 再次调用会替换文案；hideLoading 幂等
   - withLoading 自动 try/finally，失败分支不会卡 loading
   ============================================================ */

/** 全屏 loading 实例（懒加载） */
let _fullscreenLoading: FullscreenLoading | null = null

/**
 * 显示全屏 loading（默认文字"加载中..."）
 * - 多次调用：替换文字（不叠加新实例）
 * - 同一页面只需一个 loading 时使用
 */
export function showLoading(text = '加载中...'): FullscreenLoading {
  if (_fullscreenLoading && !_fullscreenLoading.closed) {
    _fullscreenLoading.setText(text)
    return _fullscreenLoading
  }
  _fullscreenLoading = easy.$loading.fullscreen(text)
  return _fullscreenLoading
}

/**
 * 关闭全屏 loading（幂等）
 */
export function hideLoading(): void {
  _fullscreenLoading?.close()
  _fullscreenLoading = null
}

/**
 * 一行版：包住异步操作，loading 自动开/关
 *
 * @example
 *   await withLoading("保存中...", () => saveApi());
 *   // 或指定 type
 *   await withLoading({ text: "加载中", type: "spinner" }, fetchData);
 */
export async function withLoading<T>(
  textOrOpts: string | LoadingOptions,
  fn: () => Promise<T>,
): Promise<T> {
  const text = typeof textOrOpts === 'string' ? textOrOpts : (textOrOpts.text ?? '加载中...')
  showLoading(text)
  try {
    return await fn()
  }
  finally {
    hideLoading()
  }
}

// 类型导出（统一转发自 @raopan/easy-ui）
export type {
  BadgeInstance,
  BadgeOptions,
  LoadingInstance,
  LoadingOptions,
  MessageOptions,
  MsgBoxAction,
  MsgBoxInputConfig,
  MsgBoxOptions,
  MsgBoxType,
  TourInstance,
  TourOptions,
} from '@raopan/easy-ui'

/**
 * 全局安装 easy 服务（@raopan/easy-ui）
 *
 * 在 main.ts 中调用：
 * ```ts
 * import { setupEasy } from "@/utils/xly"
 * setupEasy(app)
 * ```
 */
export function setupEasyApp(app: App) {
  setupEasy(app)
}
