// ============================================================
// EasyMarkdown markdown-it 扩展
// 参考 solomd 项目（lib/markdown.ts）沉淀的能力：
//  1. 容错预处理：表格分隔行修复 / inline HTML 块解包 / 列表缩进归一化
//     —— 让 AI / PDF 导出的 Markdown 渲染效果对齐 Typora / Obsidian
//  2. GitHub 任务列表（- [ ] / - [x] → checkbox）
//  3. GitHub callout（> [!NOTE] 等 → 彩色提示卡片）
//  4. 代码块行号（cb-line 包装，CSS counter 显示）
//  5. 编辑区行高测量（mirror 文本度量，用于行号 gutter）
// ============================================================
import type MarkdownIt from 'markdown-it'

// ──── 1. 容错预处理 ────

/** 将一行按未转义的 `|` 拆分（`\|` 是单元格内字面量竖线） */
function splitTableRow(line: string): string[] {
  const cells: string[] = []
  let cur = ''
  for (let i = 0; i < line.length; i++) {
    const c = line[i]
    if (c === '\\' && i + 1 < line.length) {
      cur += c + line[i + 1]
      i++
      continue
    }
    if (c === '|') {
      cells.push(cur)
      cur = ''
      continue
    }
    cur += c
  }
  cells.push(cur)
  return cells
}

/** 去掉首尾空 cell（`| a | b |` 的外边框），得到 markdown-it 视角的列数 */
function tableRowCells(line: string): string[] {
  const cells = splitTableRow(line.trim())
  if (cells.length && cells[0].trim() === '')
    cells.shift()
  if (cells.length && cells[cells.length - 1].trim() === '')
    cells.pop()
  return cells
}

const TABLE_DELIM_CELL_RE = /^\s*:?-+:?\s*$/

function isTableDelimiterRow(line: string): boolean {
  const cells = tableRowCells(line)
  if (cells.length === 0)
    return false
  let hasRealCell = false
  for (const c of cells) {
    if (c.trim() === '')
      continue
    if (!TABLE_DELIM_CELL_RE.test(c))
      return false
    hasRealCell = true
  }
  return hasRealCell
}

function normalizeDelimiterCell(raw: string | undefined): string {
  const t = (raw ?? '').trim()
  const left = t.startsWith(':')
  const right = t.endsWith(':')
  if (left && right)
    return ':---:'
  if (right)
    return '---:'
  if (left)
    return ':---'
  return '---'
}

/**
 * 修复畸形表格分隔行：AI 导出经常多/少一个 `|---|` cell 导致整表被渲染成
 * 纯文本段落，这里按表头列数重写分隔行（保留对齐冒号）。跳过 fenced 代码块。
 */
function normalizeTableDelimiters(source: string): string {
  const lines = source.split('\n')
  const out: string[] = []
  let inFence = false
  let fenceChar = ''
  const fenceRe = /^\s*(`{3,}|~{3,})/
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const fm = fenceRe.exec(line)
    if (fm) {
      if (!inFence) {
        inFence = true
        fenceChar = fm[1][0]
        out.push(line)
        continue
      }
      if (fm[1][0] === fenceChar) {
        inFence = false
        out.push(line)
        continue
      }
    }
    if (inFence) {
      out.push(line)
      continue
    }

    const next = lines[i + 1]
    const headerLooksTabular = line.includes('|') && line.trim() !== ''
    if (headerLooksTabular && next !== undefined && next.includes('|') && isTableDelimiterRow(next)) {
      const headerCells = tableRowCells(line)
      const delimCells = tableRowCells(next)
      const needsRepair = delimCells.length !== headerCells.length || delimCells.some(c => c.trim() === '')
      if (headerCells.length >= 1 && needsRepair) {
        const fixed: string[] = []
        for (let k = 0; k < headerCells.length; k++)
          fixed.push(normalizeDelimiterCell(delimCells[k]))
        const indent = (next.match(/^\s*/) as RegExpMatchArray)[0]
        out.push(line)
        out.push(`${indent}| ${fixed.join(' | ')} |`)
        i++
        continue
      }
    }
    out.push(line)
  }
  return out.join('\n')
}

/** markdown-it 会作为 HTML 块解析的标签（须顶格 + 空行分隔） */
const HTML_BLOCK_PASSTHROUGH_TAGS = [
  'table',
  'div',
  'details',
  'figure',
  'iframe',
  'blockquote',
  'pre',
  'section',
  'article',
  'aside',
]
const HTML_BLOCK_RE = new RegExp(
  `^[ \\t]*(<(?:${HTML_BLOCK_PASSTHROUGH_TAGS.join('|')})\\b[\\s\\S]*?</(?:${HTML_BLOCK_PASSTHROUGH_TAGS.join('|')})>)[ \\t]*$`,
  'gim',
)

/**
 * 将嵌在段落中间 / 缩进的块级 HTML（如 mineru / AI PDF 转 Markdown 产出的
 * `<table>`）拉回顶格并加空行，让 markdown-it 按 HTML 块而不是转义文本渲染。
 * 跳过 fenced 代码块。
 */
function unwrapInlineHtmlBlocks(source: string): string {
  const FENCE_RE = /(?:^|\n)(```|~~~)[^\n]*\n[\s\S]*?\n\1[ \t]*(?=\n|$)/g
  const segments: { text: string, isFence: boolean }[] = []
  let lastIndex = 0
  let m = FENCE_RE.exec(source)
  while (m !== null) {
    if (m.index > lastIndex)
      segments.push({ text: source.slice(lastIndex, m.index), isFence: false })
    segments.push({ text: m[0], isFence: true })
    lastIndex = m.index + m[0].length
    m = FENCE_RE.exec(source)
  }
  if (lastIndex < source.length)
    segments.push({ text: source.slice(lastIndex), isFence: false })
  return segments
    .map((seg) => {
      if (seg.isFence)
        return seg.text
      return seg.text.replace(HTML_BLOCK_RE, (_match, html) => `\n\n${html}\n\n`)
    })
    .join('')
}

/**
 * 将嵌套列表统一为 2 空格步进。CommonMark 把缩进 ≥4 空格的子列表当作缩进代码块，
 * 用户用 Tab（8 列）缩进时列表会被渲染成代码块，这里在解析前重写为规范缩进。
 */
function normalizeListIndent(source: string): string {
  const expand = (ws: string): number => {
    let n = 0
    for (const c of ws)
      n += c === '\t' ? 4 - (n % 4) : 1
    return n
  }
  const lines = source.split('\n')
  const out: string[] = []
  const stack: { orig: number, norm: number, markerWidth: number }[] = []
  let inFence = false
  let fenceChar = ''
  let curDelta = 0
  let curOrig = -1
  const markRe = /^([ \t]*)([-*+]|\d{1,9}[.)])([ \t]+)(\S[\s\S]*)?$/
  const fenceRe = /^\s*(`{3,}|~{3,})/
  for (const line of lines) {
    const fm = fenceRe.exec(line)
    if (fm) {
      if (!inFence) {
        inFence = true
        fenceChar = fm[1][0]
        out.push(line)
        continue
      }
      if (fm[1][0] === fenceChar) {
        inFence = false
        out.push(line)
        continue
      }
    }
    if (inFence) {
      out.push(line)
      continue
    }
    const m = markRe.exec(line)
    if (m) {
      const orig = expand(m[1])
      const markerWidth = m[2].length + m[3].length
      while (stack.length && orig < stack[stack.length - 1].orig)
        stack.pop()
      const top = stack[stack.length - 1]
      let norm: number
      if (top && orig === top.orig) {
        norm = top.norm
        top.markerWidth = markerWidth
      }
      else if (top && orig > top.orig) {
        norm = top.norm + top.markerWidth
        stack.push({ orig, norm, markerWidth })
      }
      else {
        norm = 0
        stack.length = 0
        stack.push({ orig, norm, markerWidth })
      }
      curDelta = norm - orig
      curOrig = orig
      out.push(' '.repeat(norm) + m[2] + m[3] + (m[4] ?? ''))
    }
    else if (line.trim() === '') {
      out.push(line)
    }
    else {
      const leadWs = (line.match(/^\s*/) as RegExpMatchArray)[0]
      const lead = expand(leadWs)
      if (stack.length && curOrig >= 0 && lead >= curOrig) {
        out.push(' '.repeat(Math.max(0, lead + curDelta)) + line.slice(leadWs.length))
      }
      else {
        stack.length = 0
        curDelta = 0
        curOrig = -1
        out.push(line)
      }
    }
  }
  return out.join('\n')
}

/** 渲染前统一做一遍容错预处理 */
export function preprocessMarkdown(source: string): string {
  return normalizeListIndent(normalizeTableDelimiters(unwrapInlineHtmlBlocks(source || '')))
}

// ──── 2. 渲染增强（task list / callout / 代码块行号）────

/** 代码块行号开关（渲染前由组件同步） */
let codeBlockLineNumbersEnabled = false

export function setCodeBlockLineNumbers(enabled: boolean): void {
  codeBlockLineNumbersEnabled = enabled
}

/** GitHub 风格任务列表核心规则 */
function taskListRule(state: any): boolean {
  const tokens = state.tokens
  const TASK_RE = /^\[([ x])\][ \u00A0]/i
  for (let i = 0; i < tokens.length; i++) {
    const tok = tokens[i]
    if (tok.type !== 'list_item_open')
      continue
    const paragraphOpen = tokens[i + 1]
    const inlineTok = tokens[i + 2]
    if (
      !paragraphOpen
      || paragraphOpen.type !== 'paragraph_open'
      || !inlineTok
      || inlineTok.type !== 'inline'
      || !inlineTok.children
      || inlineTok.children.length === 0
    ) {
      continue
    }
    const firstChild = inlineTok.children[0]
    if (firstChild.type !== 'text')
      continue
    const m = TASK_RE.exec(firstChild.content)
    if (!m)
      continue

    const checked = m[1] !== ' '
    firstChild.content = firstChild.content.slice(m[0].length)

    const checkboxToken = new state.Token('html_inline', '', 0)
    checkboxToken.content = `<input class="task-list-item-checkbox" type="checkbox"${checked ? ' checked=""' : ''} disabled=""> `
    inlineTok.children.unshift(checkboxToken)

    const existingClass = tok.attrGet('class')
    tok.attrSet('class', existingClass ? `${existingClass} task-list-item` : 'task-list-item')
    const line = tok.map && tok.map.length > 0 ? tok.map[0] + 1 : 0
    tok.attrSet('data-line', String(line))

    for (let k = i - 1; k >= 0; k--) {
      const p = tokens[k]
      if (p.type === 'bullet_list_open' || p.type === 'ordered_list_open') {
        const cls = p.attrGet('class')
        if (!cls || !/\bcontains-task-list\b/.test(cls))
          p.attrSet('class', cls ? `${cls} contains-task-list` : 'contains-task-list')
        break
      }
      if (p.type === 'bullet_list_close' || p.type === 'ordered_list_close')
        break
    }
  }
  return false
}

/** GitHub 风格 callout：> [!NOTE] 等 → 彩色提示卡片 */
function calloutRule(state: any): boolean {
  const tokens = state.tokens
  const CALLOUT_RE = /^\[!(NOTE|TIP|IMPORTANT|WARNING|CAUTION)\][ \t]*/i
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type !== 'blockquote_open')
      continue
    const pOpen = tokens[i + 1]
    const inline = tokens[i + 2]
    if (
      !pOpen
      || pOpen.type !== 'paragraph_open'
      || !inline
      || inline.type !== 'inline'
      || !inline.children
      || inline.children.length === 0
    ) {
      continue
    }
    const first = inline.children[0]
    if (first.type !== 'text')
      continue
    const m = CALLOUT_RE.exec(first.content)
    if (!m)
      continue
    const kind = m[1].toLowerCase()
    tokens[i].attrJoin('class', `md-callout md-callout--${kind}`)
    first.content = first.content.slice(m[0].length)
    if (first.content === '') {
      const next = inline.children[1]
      inline.children.splice(0, next && (next.type === 'softbreak' || next.type === 'hardbreak') ? 2 : 1)
    }
  }
  return false
}

/**
 * 应用渲染增强：
 * - task list / callout 核心规则
 * - fence 渲染器：为每行包一层 <span class="cb-line">，配合 CSS counter 显示代码块行号。
 *   highlight.js 的 span 可能跨行，直接按 '\n' split 会破坏 HTML 结构（每行必须
 *   自闭合），因此用 tokenize 方式在换行处关掉当前打开的 span、换行后重新打开。
 */
export function applyMarkdownExtras(md: MarkdownIt): void {
  md.core.ruler.after('inline', 'easy_task_lists', taskListRule)
  md.core.ruler.after('inline', 'easy_callouts', calloutRule)

  const defaultFenceRenderer = md.renderer.rules.fence
  md.renderer.rules.fence = function (tokens, idx, options, env, self) {
    const html = defaultFenceRenderer
      ? defaultFenceRenderer(tokens, idx, options, env, self)
      : self.renderToken(tokens, idx, options)
    if (!codeBlockLineNumbersEnabled)
      return html
    const tok = tokens[idx]
    const info = (tok.info || '').trim().toLowerCase()
    const lang = info.split(/\s+/)[0]
    if (lang === 'mermaid')
      return html
    return html.replace(/<code([^>]*)>([\s\S]*?)<\/code>/, (_m, codeAttrs, inner) => {
      const trimmed = inner.endsWith('\n') ? inner.slice(0, -1) : inner
      const openSpans: string[] = []
      let out = ''
      let line = ''
      const flush = () => {
        out += `<span class="cb-line">${line || ' '}</span>`
        line = ''
      }
      for (const tok2 of trimmed.match(/<span\b[^>]*>|<\/span>|\n|[^<\n]+|</g) ?? []) {
        if (tok2 === '\n') {
          line += '</span>'.repeat(openSpans.length)
          flush()
          out += '\n'
          line = openSpans.join('')
        }
        else if (tok2.startsWith('<span')) {
          openSpans.push(tok2)
          line += tok2
        }
        else if (tok2 === '</span>') {
          openSpans.pop()
          line += tok2
        }
        else {
          line += tok2
        }
      }
      flush()
      return `<code${codeAttrs}>${out}</code>`
    }).replace(/<pre([^>]*)>/, (_m, attrs) => {
      // 合并 class，兼容 hljs 已输出的 `<pre class="hljs">`
      const classAttr = attrs.match(/class="([^"]*)"/)
      if (classAttr)
        return `<pre${attrs.replace(classAttr[0], `class="${classAttr[1]} cb-numbered"`)}>`
      return `<pre${attrs} class="cb-numbered">`
    })
  }
}

// ──── 3. 编辑区行高测量（行号 gutter）────

const MIRROR_PROPS = [
  'fontFamily',
  'fontSize',
  'fontWeight',
  'fontStyle',
  'letterSpacing',
  'lineHeight',
  'tabSize',
  'textTransform',
  'wordSpacing',
  'whiteSpace',
  'overflowWrap',
  'wordBreak',
] as const

function lineHeightPx(el: HTMLTextAreaElement): number {
  const cs = getComputedStyle(el)
  const lh = Number.parseFloat(cs.lineHeight)
  if (!Number.isNaN(lh))
    return lh
  return Number.parseFloat(cs.fontSize) * 1.2 || 16
}

function createMirror(el: HTMLTextAreaElement): HTMLDivElement {
  const mirror = document.createElement('div')
  const cs = getComputedStyle(el)
  for (const prop of MIRROR_PROPS)
    (mirror.style as unknown as Record<string, string>)[prop] = cs[prop as keyof CSSStyleDeclaration] as string
  const width = el.clientWidth - Number.parseFloat(cs.paddingLeft || '0') - Number.parseFloat(cs.paddingRight || '0')
  mirror.style.width = `${Math.max(width, 1)}px`
  mirror.style.position = 'absolute'
  mirror.style.top = '-99999px'
  mirror.style.left = '0'
  mirror.style.visibility = 'hidden'
  mirror.style.boxSizing = 'content-box'
  mirror.style.padding = '0'
  mirror.style.border = '0'
  document.body.appendChild(mirror)
  return mirror
}

/**
 * 每个逻辑行在 textarea 当前宽度 / 换行设置下的实际渲染高度。
 * 用与 textarea 相同文本度量的隐藏 mirror 计算，软换行时行高为行高的整数倍。
 */
export function measureLineHeights(el: HTMLTextAreaElement, text: string): number[] {
  const lines = text.split('\n')
  const cs = getComputedStyle(el)
  if (cs.whiteSpace === 'pre' || cs.whiteSpace === 'nowrap') {
    const lh = lineHeightPx(el)
    return lines.map(() => lh)
  }
  const mirror = createMirror(el)
  try {
    for (const line of lines) {
      const div = document.createElement('div')
      // 零宽空格让空行也保持一行高度
      div.textContent = line.length ? line : '\u200B'
      mirror.appendChild(div)
    }
    const lh = lineHeightPx(el)
    return Array.from(mirror.children).map((c) => {
      const h = (c as HTMLElement).getBoundingClientRect().height
      return h > 0 ? h : lh
    })
  }
  finally {
    mirror.remove()
  }
}
