import type MarkdownIt from 'markdown-it'
import type { ComputedRef, Ref } from 'vue'

import type {
  Html2CanvasFn,
  MarkdownDownloadType,
  MarkdownEmits,
  MarkdownImageType,
  MarkdownProps,
} from './types'
import { onBeforeUnmount, ref } from 'vue'
import { downloadBlob } from '../../../utils/download'
import { getMarkdownTheme, hljsGithubCss } from '../style/themes'
import { markdownToDocxBlob } from './export-docx'
import { buildExportShell, EXPORT_VARIABLES_CSS, markdownToPdfBlob } from './export-pdf'

/** 图片导出布局样式：复用组件预览全局样式 + 强制亮色变量，保证与 PDF/HTML 导出观感一致 */
const IMAGE_EXPORT_CSS = `${EXPORT_VARIABLES_CSS}
  .easy-markdown.easy-markdown-export {
    width: fit-content;
    max-width: 100%;
    min-width: 0;
    border: none;
    border-radius: 0;
    overflow: visible;
    background: transparent;
  }
  .easy-markdown-export .easy-markdown__preview {
    box-sizing: border-box;
    width: fit-content;
    min-width: 480px;
    max-width: 820px;
    padding: 48px 56px;
    background: #ffffff;
    color: #303133;
    font: 15px/1.7 -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', 'Helvetica Neue', Arial, sans-serif;
    -webkit-font-smoothing: antialiased;
  }
  .easy-markdown-export .easy-markdown__preview h1:first-child,
  .easy-markdown-export .easy-markdown__preview h2:first-child,
  .easy-markdown-export .easy-markdown__preview h3:first-child {
    margin-top: 0;
  }
`

const imageFormatMap: Record<MarkdownImageType, { ext: string, mime: string }> = {
  png: { ext: 'png', mime: 'image/png' },
  jpeg: { ext: 'jpg', mime: 'image/jpeg' },
  webp: { ext: 'webp', mime: 'image/webp' },
}

/** useMarkdownDownload 上下文（由组件在 setup 中组装） */
export interface MarkdownDownloadContext {
  currentTheme: Ref<string>
  renderedHtml: ComputedRef<string>
  /** markdown-it 实例（Word 导出需要解析 tokens） */
  md: MarkdownIt
  /** 导出图片/PDF 前渲染 Mermaid（由 use-mermaid 提供） */
  renderMermaidBlocks: (container: HTMLElement) => Promise<void>
  emit: MarkdownEmits
}

/**
 * 下载导出逻辑：md / html / pdf（打印）/ pdf-file（直接生成）/ docx / png / jpg / webp。
 * 图片/PDF 直接生成为离屏渲染 + 可选依赖（html2canvas / html2pdf.js / docx），未安装时静默忽略。
 */
export function useMarkdownDownload(props: Pick<MarkdownProps, 'modelValue' | 'exportName' | 'mermaid'>, ctx: MarkdownDownloadContext) {
  const { currentTheme, renderedHtml, md, renderMermaidBlocks, emit } = ctx

  // 下载类型下拉（选择后自动下载并复位）
  const downloadType = ref('')
  const downloadOptions: { value: MarkdownDownloadType, label: string }[] = [
    { value: 'md', label: '下载 .md' },
    { value: 'html', label: '下载 .html' },
    { value: 'docx', label: '下载 .docx' },
    { value: 'pdf-file', label: '下载 PDF' },
    { value: 'pdf', label: '打印 PDF' },
    { value: 'png', label: '下载 .png' },
    { value: 'jpeg', label: '下载 .jpg' },
    { value: 'webp', label: '下载 .webp' },
  ]

  function handleDownloadChange(type: MarkdownDownloadType) {
    // 复位为占位项，避免重复选择同一格式时无法触发
    downloadType.value = ''
    if (type === 'md')
      handleDownloadMd()
    else if (type === 'html')
      handleDownloadHtml()
    else if (type === 'docx')
      void handleDownloadDocx()
    else if (type === 'pdf-file')
      void handleDownloadPdfFile()
    else if (type === 'pdf')
      handleDownloadPdf()
    else
      void handleDownloadImage(type)
  }

  // 转义 HTML（用于 .html 导出的 title 等）
  function escapeHtml(str: string): string {
    return String(str ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  // 下载 .md 文件
  function handleDownloadMd() {
    const content = props.modelValue ?? ''
    downloadBlob(content, `${props.exportName}.md`, 'text/markdown;charset=utf-8')
    emit('download', 'md', content)
  }

  /** 构建导出文档（含 @page 打印样式、当前主题样式、代码高亮） */
  function buildPrintableHtml(): string {
    const theme = getMarkdownTheme(currentTheme.value)
    const content = props.modelValue ?? ''
    const body = content.trim() ? renderedHtml.value : ''
    return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(props.exportName)}</title>
  <style>
${theme.exportCss}
${hljsGithubCss}
  </style>
</head>
<body>
  ${body}
</body>
</html>`
  }

  // 下载 .html 文件（包含完整页面骨架、当前主题样式与代码高亮）
  function handleDownloadHtml() {
    const html = buildPrintableHtml()
    downloadBlob(html, `${props.exportName}.html`, 'text/html;charset=utf-8')
    emit('download', 'html', html)
  }

  // 下载 .pdf：将渲染结果注入隐藏 iframe 并调用浏览器打印，
  // 用户可在打印对话框中「另存为 PDF」（与 print-js 原理一致，零依赖）
  let printFrame: HTMLIFrameElement | null = null

  function handleDownloadPdf() {
    const html = buildPrintableHtml()
    if (printFrame) {
      printFrame.remove()
      printFrame = null
    }
    const iframe = document.createElement('iframe')
    iframe.setAttribute('aria-hidden', 'true')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = '0'
    printFrame = iframe
    document.body.appendChild(iframe)

    const win = iframe.contentWindow
    if (!win) {
      iframe.remove()
      printFrame = null
      return
    }
    win.document.open()
    win.document.write(html)
    win.document.close()

    const cleanup = () => {
      iframe.remove()
      if (printFrame === iframe) {
        printFrame = null
      }
      win.removeEventListener('afterprint', cleanup)
    }
    // 打印完成 / 对话框关闭后清理
    win.addEventListener('afterprint', cleanup)
    // 兜底清理，避免长期占用隐藏 iframe
    window.setTimeout(cleanup, 60_000)

    win.focus()
    win.print()
    emit('download', 'pdf', html)
  }

  // 下载 .png / .jpg / .webp：离屏渲染预览 + html2canvas 截图（html2canvas 为可选依赖）
  // 下载 .docx（Word）：docx 库直接生成（可选依赖，未安装时静默忽略）
  async function handleDownloadDocx() {
    const content = props.modelValue ?? ''
    if (!content.trim())
      return
    try {
      const blob = await markdownToDocxBlob(content, md)
      downloadBlob(blob, `${props.exportName}.docx`, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')
      emit('download', 'docx', content)
    }
    catch {
      // docx 库未安装
    }
  }

  // 下载 .pdf（直接生成文件）：html2pdf.js（可选依赖，未安装时静默忽略）
  async function handleDownloadPdfFile() {
    const content = props.modelValue ?? ''
    if (!content.trim())
      return
    try {
      const blob = await markdownToPdfBlob(renderedHtml.value, currentTheme.value, props.mermaid ? renderMermaidBlocks : undefined)
      downloadBlob(blob, `${props.exportName}.pdf`, 'application/pdf')
      emit('download', 'pdf-file', content)
    }
    catch {
      // html2pdf.js 未安装
    }
  }

  async function handleDownloadImage(type: MarkdownImageType) {
    const content = props.modelValue ?? ''
    if (!content.trim())
      return
    const { ext, mime } = imageFormatMap[type]
    // 动态加载 html2canvas（可选依赖，未安装时静默忽略）
    let html2canvasFn: Html2CanvasFn
    try {
      const mod = await import('html2canvas')
      html2canvasFn = (mod as { default?: Html2CanvasFn }).default ?? (mod as unknown as Html2CanvasFn)
    }
    catch {
      return
    }

    const { root, article, styleEl } = buildExportShell(renderedHtml.value, currentTheme.value, IMAGE_EXPORT_CSS)

    try {
      // 可选：先渲染 Mermaid 图表再截图
      if (props.mermaid)
        await renderMermaidBlocks(article)
      // 等待字体 / 布局稳定后再截图
      await new Promise(r => setTimeout(r, 60))
      const canvas = await html2canvasFn(article, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
      })
      const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(b => (b ? resolve(b) : reject(new Error('canvas.toBlob 返回 null'))), mime, 0.92)
      })
      downloadBlob(blob, `${props.exportName}.${ext}`, mime)
      emit('download', type, content)
    }
    finally {
      root.remove()
      styleEl.remove()
    }
  }

  onBeforeUnmount(() => {
    if (printFrame) {
      printFrame.remove()
      printFrame = null
    }
  })

  return {
    downloadType,
    downloadOptions,
    handleDownloadChange,
    downloadMd: handleDownloadMd,
    downloadHtml: handleDownloadHtml,
    downloadPdf: handleDownloadPdf,
    downloadPdfFile: handleDownloadPdfFile,
    downloadDocx: handleDownloadDocx,
    downloadImage: (type: MarkdownImageType) => handleDownloadImage(type),
  }
}
