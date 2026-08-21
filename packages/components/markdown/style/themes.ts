// ============================================================
// EasyMarkdown 主题定义
// 每个主题包含「导出用 CSS」（PDF / HTML 导出时注入的独立文档样式），
// 样式以独立 .css 文件维护（theme-css/ 目录），此处通过 ?raw 导入为字符串。
// 预览区样式见 markdown.vue 中 scoped 的 [data-theme] 覆盖块
// ============================================================
import baseCss from './theme-css/base.css?raw'
import cleanThemeCss from './theme-css/clean.css?raw'
import defaultThemeCss from './theme-css/default.css?raw'
import githubThemeCss from './theme-css/github.css?raw'
import hljsCss from './theme-css/hljs.css?raw'

export interface MarkdownTheme {
  /** 主题 key（同时用作 data-theme 与 <option> value） */
  key: string
  /** 下拉框显示名 */
  label: string
  /** 导出 PDF / HTML 时注入的完整文档样式 */
  exportCss: string
}

/**
 * 导出文档共用的 highlight.js 代码高亮样式（GitHub 配色）
 * 与预览区 scoped 样式保持一致的观感
 */
export const hljsGithubCss = hljsCss

const defaultExportCss = `${baseCss}\n${defaultThemeCss}`
const githubExportCss = `${baseCss}\n${githubThemeCss}`
const cleanExportCss = `${baseCss}\n${cleanThemeCss}`

/** 内置主题列表 */
export const markdownThemes: MarkdownTheme[] = [
  { key: 'default', label: '默认主题', exportCss: defaultExportCss },
  { key: 'github', label: 'GitHub主题', exportCss: githubExportCss },
  { key: 'clean', label: '简约主题', exportCss: cleanExportCss },
]

export const defaultMarkdownTheme = 'default'

/** 按 key 查找内置主题 */
export function getMarkdownTheme(key: string): MarkdownTheme {
  return markdownThemes.find(t => t.key === key) ?? markdownThemes[0]!
}
