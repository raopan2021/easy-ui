import type html2pdf from 'html2pdf.js'

/**
 * 导出容器强制亮色变量：离屏渲染复用页面已加载的预览样式（基于 Element Plus 的
 * `--el-*` 变量），在 dark 模式下这些变量是深色背景 / 浅色文字，而截图强制白底，
 * 会导致白底浅字（一片空白）。这里在导出容器作用域内重定义变量为亮色值，
 * 使 PDF / 图片导出始终以亮色渲染，不受页面明暗主题影响。
 */
export const EXPORT_VARIABLES_CSS = `
  .easy-markdown.easy-markdown-export {
    --el-bg-color: #ffffff;
    --el-text-color-primary: #1f2328;
    --el-text-color-regular: #24292e;
    --el-text-color-secondary: #57606a;
    --el-text-color-placeholder: #6e7781;
    --el-fill-color-light: #f6f8fa;
    --el-fill-color-blank: #ffffff;
    --el-border-color: #d1d9e0;
    --el-border-color-light: #d1d9e0;
    --el-border-color-lighter: #d0d7de;
    --el-color-primary: #0969da;
    --el-color-primary-light-9: #f0f6ff;
    --el-color-success: #1a7f37;
    --el-color-success-light-9: #e6f6ec;
    --el-color-warning: #9a6700;
    --el-color-warning-light-9: #fff8e5;
    --el-color-danger: #cf222e;
    --el-color-danger-light-9: #ffebe9;
  }
  /* 兜底：即使变量覆盖在克隆文档中失效，也强制导出容器为亮色 */
  .easy-markdown.easy-markdown-export[data-theme] .easy-markdown__preview {
    color: #24292e;
    background: #ffffff;
  }
`

/** PDF 布局 CSS：GitHub 文档风格排版 + 分页控制（全部带 .easy-markdown-export 前缀，不污染页面） */
const PDF_EXPORT_CSS = `${EXPORT_VARIABLES_CSS}
  .easy-markdown.easy-markdown-export {
    width: 800px;
    max-width: 100%;
    box-sizing: border-box;
    border: none;
    border-radius: 0;
    overflow: visible;
    background: transparent;
  }
  .easy-markdown-export .easy-markdown__preview {
    box-sizing: border-box;
    padding: 24px 40px 36px;
    background: #ffffff;
    color: #24292e;
    font: 14px/1.75 -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
    word-wrap: break-word;
  }
  .easy-markdown-export .easy-markdown__preview h1,
  .easy-markdown-export .easy-markdown__preview h2,
  .easy-markdown-export .easy-markdown__preview h3,
  .easy-markdown-export .easy-markdown__preview h4,
  .easy-markdown-export .easy-markdown__preview h5,
  .easy-markdown-export .easy-markdown__preview h6 {
    margin: 1.5em 0 0.6em;
    font-weight: 600;
    color: #1f2328;
    line-height: 1.3;
  }
  .easy-markdown-export .easy-markdown__preview h1 {
    font-size: 24px;
    padding-bottom: 0.3em;
    border-bottom: 1px solid #d1d9e0;
  }
  .easy-markdown-export .easy-markdown__preview h2 {
    font-size: 20px;
    padding-bottom: 0.3em;
    border-bottom: 1px solid #d1d9e0;
  }
  .easy-markdown-export .easy-markdown__preview h3 {
    font-size: 17px;
  }
  .easy-markdown-export .easy-markdown__preview h1:first-child,
  .easy-markdown-export .easy-markdown__preview h2:first-child,
  .easy-markdown-export .easy-markdown__preview h3:first-child {
    margin-top: 0;
  }
  .easy-markdown-export .easy-markdown__preview p {
    margin: 0 0 1em;
  }
  .easy-markdown-export .easy-markdown__preview a {
    color: #0969da;
    text-decoration: none;
  }
  .easy-markdown-export .easy-markdown__preview strong {
    color: #1f2328;
  }
  .easy-markdown-export .easy-markdown__preview blockquote {
    margin: 1em 0;
    padding: 0.4em 1em;
    border-left: 4px solid #d1d9e0;
    background: #f6f8fa;
    color: #57606a;
    border-radius: 0 6px 6px 0;
  }
  .easy-markdown-export .easy-markdown__preview pre {
    margin: 1em 0;
    padding: 12px 16px;
    background: #f6f8fa;
    border-radius: 6px;
    font-size: 13px;
    line-height: 1.6;
    white-space: pre-wrap;
    word-break: break-word;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .easy-markdown-export .easy-markdown__preview code {
    font-family: 'SF Mono', Consolas, 'Courier New', monospace;
  }
  .easy-markdown-export .easy-markdown__preview :not(pre) > code {
    padding: 0.15em 0.4em;
    background: rgba(27, 31, 35, 0.08);
    border-radius: 4px;
    font-size: 0.9em;
  }
  .easy-markdown-export .easy-markdown__preview table {
    width: 100%;
    margin: 1em 0;
    border-collapse: collapse;
    font-size: 13px;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .easy-markdown-export .easy-markdown__preview th,
  .easy-markdown-export .easy-markdown__preview td {
    padding: 6px 12px;
    border: 1px solid #d0d7de;
    text-align: left;
  }
  .easy-markdown-export .easy-markdown__preview th {
    background: #f6f8fa;
    font-weight: 600;
  }
  .easy-markdown-export .easy-markdown__preview ul,
  .easy-markdown-export .easy-markdown__preview ol {
    margin: 0 0 1em;
    padding-left: 1.6em;
  }
  .easy-markdown-export .easy-markdown__preview li {
    margin: 0.25em 0;
  }
  .easy-markdown-export .easy-markdown__preview hr {
    margin: 1.5em 0;
    border: none;
    border-top: 1px solid #d1d9e0;
  }
  .easy-markdown-export .easy-markdown__preview img {
    max-width: 100%;
    page-break-inside: avoid;
    break-inside: avoid;
  }
  .easy-markdown-export .easy-markdown__preview h1,
  .easy-markdown-export .easy-markdown__preview h2,
  .easy-markdown-export .easy-markdown__preview h3 {
    page-break-after: avoid;
    break-after: avoid;
  }
`

/**
 * 离屏构建导出容器（PDF / 图片共用结构）：
 * 复用页面已加载的组件预览全局样式（`.easy-markdown[data-theme] .easy-markdown__preview`，
 * 带类名前缀，不会污染页面），仅追加带 `.easy-markdown-export` 前缀的导出布局 CSS。
 * 返回可截图 / 分页的 article。
 */
export function buildExportShell(renderedHtml: string, themeKey: string, css: string): { root: HTMLElement, article: HTMLElement, styleEl: HTMLStyleElement } {
  const root = document.createElement('div')
  root.style.cssText = 'position:fixed; left:-10000px; top:0; z-index:-1;'
  const styleEl = document.createElement('style')
  styleEl.setAttribute('data-easy-export', '')
  styleEl.textContent = css
  // 关键：注入到 <head> 末尾而不是离屏容器内。html2canvas / html2pdf 克隆 DOM 时
  // 只可靠地带走 head 中的样式，若放在 body 离屏节点内，导出 CSS（含亮色变量）
  // 可能丢失，导致 dark 模式下白底浅字一片空白。
  document.head.appendChild(styleEl)
  const shell = document.createElement('div')
  shell.className = 'easy-markdown easy-markdown-export'
  shell.setAttribute('data-theme', themeKey)
  const article = document.createElement('article')
  article.className = 'easy-markdown__preview markdown-body'
  article.innerHTML = renderedHtml
  shell.appendChild(article)
  root.appendChild(shell)
  document.body.appendChild(root)
  return { root, article, styleEl }
}

/** 清理 html2pdf.js 残留的 overlay / canvas iframe */
function cleanupHtml2Pdf() {
  document.querySelectorAll('.html2pdf__overlay, iframe.html2canvas-container').forEach(el => el.remove())
}

/**
 * 直接生成 PDF Blob（html2pdf.js = html2canvas + jsPDF，可选依赖）。
 * 与 solomd 的 pdf-export 同思路：离屏渲染预览 → html2pdf 分页 → Blob。
 * 未安装 html2pdf.js 时抛出错误（由调用方静默忽略）。
 */
export async function markdownToPdfBlob(
  renderedHtml: string,
  themeKey: string,
  renderMermaidBlocks?: (container: HTMLElement) => Promise<void>,
): Promise<Blob> {
  let factory: typeof html2pdf
  try {
    const mod = await import('html2pdf.js')
    factory = (mod as { default?: typeof html2pdf }).default ?? (mod as unknown as typeof html2pdf)
  }
  catch {
    throw new Error('html2pdf.js is not installed')
  }

  const { root, article, styleEl } = buildExportShell(renderedHtml, themeKey, PDF_EXPORT_CSS)
  try {
    // 可选：先渲染 Mermaid 图表再转 PDF
    if (renderMermaidBlocks)
      await renderMermaidBlocks(article)
    // 等待字体 / 布局稳定
    await new Promise(r => setTimeout(r, 60))
    const blob = await factory()
      .set({
        // 页面四周留出边距（mm），避免内容紧贴纸张边缘
        margin: [12, 14, 12, 14],
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false, backgroundColor: '#ffffff' },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
      })
      .from(article)
      .outputPdf('blob')
    return blob
  }
  finally {
    root.remove()
    styleEl.remove()
    cleanupHtml2Pdf()
  }
}
