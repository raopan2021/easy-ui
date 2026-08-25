// html2pdf.js 无内置类型定义，这里补充最小类型
declare module 'html2pdf.js' {
  interface Html2PdfWorker {
    set: (options: Record<string, unknown>) => Html2PdfWorker
    from: (element: HTMLElement) => Html2PdfWorker
    toContainer: () => Html2PdfWorker
    toCanvas: () => Html2PdfWorker
    toImg: () => Html2PdfWorker
    toPdf: () => Html2PdfWorker
    outputPdf: (type: 'blob') => Promise<Blob>
    save: (filename?: string) => Promise<void>
  }

  interface Html2PdfFactory {
    (options?: Record<string, unknown>): Html2PdfWorker
  }

  const html2pdf: Html2PdfFactory
  export default html2pdf
}
