import { config } from '@vue/test-utils'
import ResizeObserver from 'resize-observer-polyfill'
import { vi } from 'vitest'

// 全局注入 ResizeObserver（jsdom 不提供，组件如 signature/search-form 需要）
vi.stubGlobal('ResizeObserver', ResizeObserver)

// 全局注入 MutationObserver（signature 依赖它监听 dark class）
if (typeof globalThis.MutationObserver === 'undefined') {
  class MutationObserverMock {
    private callback: MutationCallback

    constructor(callback: MutationCallback) {
      this.callback = callback
    }

    observe() {}

    disconnect() {}

    takeRecords(): MutationRecord[] {
      return []
    }
  }
  vi.stubGlobal('MutationObserver', MutationObserverMock)
}

// matchMedia：useDark / usePreferredDark 等 @vueuse/core 钩子依赖它
if (typeof window !== 'undefined' && !window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {},
      removeListener: () => {},
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => false,
    }),
  })
}

// 清空 @vue/test-utils 的默认全局 stub，保持组件原样渲染
config.global.stubs = {}

// 组件测试中若直接渲染 <EasyIcon> / <el-icon>，避免 "Failed to resolve component" 警告。
// EasyIcon 渲染为图标节点，测试主要校验结构/文本，不影响断言，这里以轻量 span stub 代替。
config.global.components = {
  'EasyIcon': {
    name: 'EasyIcon',
    props: {
      name: String,
      size: [String, Number],
    },
    template: '<span class="easy-icon-stub" />',
  },
  'el-icon': {
    name: 'ElIcon',
    template: '<span class="el-icon-stub" />',
  },
}
