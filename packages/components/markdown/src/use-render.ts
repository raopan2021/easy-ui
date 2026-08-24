import type { MarkdownProps } from './types'
import hljs from 'highlight.js'
import MarkdownIt from 'markdown-it'

import { computed } from 'vue'
import { applyMarkdownExtras, preprocessMarkdown, setCodeBlockLineNumbers } from './markdown-it-ext'

/**
 * markdown-it 渲染管线：复用实例 + highlight.js 高亮 + 组件扩展规则，
 * 渲染前先做容错预处理（表格修复 / HTML 块解包 / 列表缩进归一化）。
 */
export function useMarkdownRender(props: MarkdownProps) {
  const md = new MarkdownIt({
    html: true,
    linkify: true,
    breaks: true,
    highlight(code: string, lang: string) {
      // 保留 language-* class（Mermaid 等特殊语言块依赖它做后处理）
      const codeClass = lang ? ` class="language-${md.utils.escapeHtml(lang.toLowerCase())}"` : ''
      if (lang && hljs.getLanguage(lang)) {
        try {
          return `<pre class="hljs"><code${codeClass}>${hljs.highlight(code, { language: lang, ignoreIllegals: true }).value}</code></pre>`
        }
        catch {
          // ignore
        }
      }
      return `<pre class="hljs"><code${codeClass}>${md.utils.escapeHtml(code)}</code></pre>`
    },
  })

  applyMarkdownExtras(md)

  const renderedHtml = computed(() => {
    setCodeBlockLineNumbers(props.codeBlockLineNumbers)
    const content = props.modelValue ?? ''
    if (!content.trim())
      return '<p class="easy-markdown__empty">内容为空</p>'
    return md.render(preprocessMarkdown(content))
  })

  return { md, renderedHtml }
}
