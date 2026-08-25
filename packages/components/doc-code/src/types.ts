/**
 * EasyDocCode 代码展示组件类型定义。
 *
 * 原内联在 doc-code.vue 中的 props（code / lang / collapseHeight）收敛到此文件。
 */

/** 代码展示组件 props */
export interface DocCodeProps {
  /** 代码内容 */
  code: string
  /** 代码语言（auto 自动识别），默认 'auto' */
  lang?: string
  /** 折叠高度（px），超过则显示展开/收起，默认 100 */
  collapseHeight?: number
}
