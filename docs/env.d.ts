/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<object, object, unknown>
  export default component
}

// @vue-office 系列无官方类型声明，提供空声明
declare module '@vue-office/docx/lib/v3/vue-office-docx.mjs'
declare module '@vue-office/excel/lib/v3/vue-office-excel.mjs'
declare module '@vue-office/pdf/lib/v3/vue-office-pdf.mjs'
