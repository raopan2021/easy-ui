import type { ComputedRef, Ref } from 'vue'
import type { MarkdownProps, MarkdownView, MermaidModule } from './types'

import { onBeforeUnmount, watch } from 'vue'

/**
 * Mermaid 图表渲染（mermaid 为可选依赖，未安装时自动降级为代码块）。
 * 预览区与图片导出共用 renderMermaidBlocks。
 */
export function useMarkdownMermaid(
  props: Pick<MarkdownProps, 'mermaid'>,
  view: Ref<MarkdownView>,
  previewEl: Ref<HTMLElement | undefined>,
  renderedHtml: ComputedRef<string>,
) {
  let mermaidModule: MermaidModule | null = null
  let mermaidIdSeq = 0
  let mermaidTimer: ReturnType<typeof setTimeout> | null = null

  async function ensureMermaid(): Promise<boolean> {
    if (mermaidModule)
      return true
    try {
      const mod = await import('mermaid')
      const mermaid = ((mod as { default?: MermaidModule }).default ?? mod) as MermaidModule
      mermaid.initialize({ startOnLoad: false, securityLevel: 'strict', theme: 'default' })
      mermaidModule = mermaid
      return true
    }
    catch {
      return false
    }
  }

  function scheduleMermaid() {
    if (!props.mermaid)
      return
    if (view.value !== 'split' && view.value !== 'preview')
      return
    if (mermaidTimer)
      clearTimeout(mermaidTimer)
    mermaidTimer = setTimeout(() => {
      mermaidTimer = null
      void renderMermaid()
    }, 120)
  }

  /** 将容器内所有 `pre > code.language-mermaid` 渲染为 SVG（预览与图片导出共用） */
  async function renderMermaidBlocks(container: HTMLElement) {
    const blocks = container.querySelectorAll('pre > code.language-mermaid')
    if (blocks.length === 0)
      return
    const ok = await ensureMermaid()
    if (!ok)
      return
    for (const block of Array.from(blocks)) {
      const pre = block.parentElement as HTMLElement | null
      if (!pre || pre.dataset.rendered === '1')
        continue
      const code = (block.textContent ?? '').trim()
      if (!code)
        continue
      try {
        const { svg } = await mermaidModule.render(`easy-mmd-${++mermaidIdSeq}`, code)
        const wrap = document.createElement('div')
        wrap.className = 'easy-markdown__mermaid'
        wrap.innerHTML = svg
        pre.replaceWith(wrap)
      }
      catch {
        // 渲染失败标记为已处理，避免反复重试
        pre.dataset.rendered = '1'
      }
    }
  }

  async function renderMermaid() {
    const host = previewEl.value
    if (!host)
      return
    await renderMermaidBlocks(host)
  }

  // 内容或视图变化时重新调度渲染（v-html 会重建预览区 DOM，Mermaid SVG 需重绘）
  watch([renderedHtml, view], () => scheduleMermaid())

  onBeforeUnmount(() => {
    if (mermaidTimer)
      clearTimeout(mermaidTimer)
  })

  return { renderMermaidBlocks }
}
