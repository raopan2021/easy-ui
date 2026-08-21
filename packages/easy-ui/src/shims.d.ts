// 全局模块声明：为缺少类型定义的依赖/模块提供声明
declare module '*.vue'

declare module '@vue-office/docx/lib/v3/vue-office-docx.mjs'
declare module '@vue-office/excel/lib/v3/vue-office-excel.mjs'
declare module '@vue-office/pdf/lib/v3/vue-office-pdf.mjs'

// 无内置类型声明的第三方依赖（声明为宽松模块）
declare module 'markdown-it'
declare module 'qrcode'

// flow-designer 内部 JS 工具模块（无类型声明的 .js）
declare module '*/common/js/tool'
declare module '*/classics/js/*'
declare module '*/mimic/js/*'
