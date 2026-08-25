/**
 * 组件库预留组件的第三方依赖模块声明
 *
 * 以下模块对应的 npm 包并未安装（组件库预留组件，业务层暂未使用）：
 * - @logicflow/core / @logicflow/extension（xly-flow-designer）
 * - jsbarcode（xly-barcode）
 * - cropperjs（xly-image-cropper）
 * - markdown-it（xly-chat-message）
 * - @vue-office/* 、 pptx-preview（xly-file-preview）
 *
 * 声明为 any 仅用于通过类型检查；如需真正启用对应组件，
 * 请先安装对应依赖并移除本文件中对应的声明。
 */

declare module 'jsbarcode';
declare module 'markdown-it';
declare module 'cropperjs' {
  const Cropper: any
  export type Cropper = any
  export default Cropper
}
declare module '@logicflow/core';
declare module '@logicflow/core/lib/style/index.css';
declare module '@logicflow/extension';
declare module '@logicflow/extension/lib/style/index.css';
declare module '@logicflow/extension/lib/materials/curved-edge';
declare module '@vue-office/docx/lib/v3/vue-office-docx.mjs';
declare module '@vue-office/excel/lib/v3/vue-office-excel.mjs';
declare module '@vue-office/pdf/lib/v3/vue-office-pdf.mjs';
declare module 'pptx-preview' {
  export const init: any
}
declare module 'pptx-preview/dist/index' {
  export type PPTXPreviewer = any
}
