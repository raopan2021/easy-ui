import type MarkdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token.mjs'

type DocxModule = typeof import('docx')
type TextRun = InstanceType<DocxModule['TextRun']>
type ExternalHyperlink = InstanceType<DocxModule['ExternalHyperlink']>
type Paragraph = InstanceType<DocxModule['Paragraph']>
type Table = InstanceType<DocxModule['Table']>

const CODE_FILL = 'F6F8FA'
const UL_BULLETS = ['•', '◦', '▪'] as const
const HEADING_LEVELS = ['Heading1', 'Heading2', 'Heading3', 'Heading4', 'Heading5', 'Heading6'] as const

/**
 * 生成 Word 文档 Blob（docx 库，可选依赖）。
 * 参考 solomd 的 docx-export 精简：遍历 markdown-it tokens 构建文档对象。
 * 说明：Web 环境无法读取本地图片文件，图片统一输出为占位文本。
 */
export async function markdownToDocxBlob(content: string, md: MarkdownIt): Promise<Blob> {
  const docx = await import('docx')
  const tokens = md.parse(content, {})
  const body = buildBody(docx, tokens)
  const document = new docx.Document({
    numbering: buildNumbering(docx),
    styles: {
      default: {
        document: {
          run: { size: 21, font: 'Microsoft YaHei' },
        },
      },
    },
    sections: [{
      children: body,
    }],
  })
  const blob = await docx.Packer.toBlob(document)
  return blob
}

/** 行内内容（文本 / 加粗 / 斜体 / 删除线 / 行内代码 / 链接）→ docx runs */
function buildRuns(docx: DocxModule, tokens: Token[]): Array<TextRun | ExternalHyperlink> {
  const runs: Array<TextRun | ExternalHyperlink> = []
  let bold = false
  let italic = false
  let strike = false
  let href = ''
  let buffer = ''

  const flush = () => {
    if (!buffer)
      return
    const runOptions = {
      text: buffer,
      bold,
      italics: italic,
      strike,
    }
    runs.push(
      href
        ? new docx.ExternalHyperlink({ link: href, children: [new docx.TextRun(runOptions)] })
        : new docx.TextRun(runOptions),
    )
    buffer = ''
  }

  for (const token of tokens) {
    switch (token.type) {
      case 'text':
        buffer += token.content
        break
      case 'code_inline':
        // 行内代码：独立 run，等宽字体 + 浅色底
        runs.push(new docx.TextRun({
          text: token.content,
          font: 'Courier New',
          shading: { type: docx.ShadingType.CLEAR, color: 'auto', fill: CODE_FILL },
        }))
        break
      case 'softbreak':
      case 'hardbreak':
        buffer += '\n'
        break
      case 'strong_open':
        bold = true
        break
      case 'strong_close':
        flush()
        bold = false
        break
      case 'em_open':
        italic = true
        break
      case 'em_close':
        flush()
        italic = false
        break
      case 's_open':
        strike = true
        break
      case 's_close':
        flush()
        strike = false
        break
      case 'link_open':
        flush()
        href = token.attrGet('href') ?? ''
        break
      case 'link_close':
        flush()
        href = ''
        break
      case 'image':
        // Web 环境无法读取本地图片文件，输出占位文本
        runs.push(new docx.TextRun({ text: `[图片: ${token.attrGet('alt') ?? ''}]`, italics: true, color: '#888888' }))
        break
      default:
        break
    }
  }
  flush()
  return runs
}

/** 引用块的左边框 + 缩进（内部段落共用） */
function quoteBorder(docx: DocxModule) {
  return { left: { color: 'CCCCCC', style: docx.BorderStyle.SINGLE, size: 12, space: 8 } }
}

/** 查找与 openType 匹配的 close token 下标（支持嵌套） */
function findClose(tokens: Token[], openIndex: number, openType: string, closeType: string): number {
  let depth = 0
  for (let i = openIndex; i < tokens.length; i++) {
    if (tokens[i].type === openType) {
      depth++
    }
    else if (tokens[i].type === closeType) {
      depth--
      if (depth === 0)
        return i
    }
  }
  return openIndex
}

/** 代码块 → 每行一个带底色 Paragraph */
function buildCodeBlock(docx: DocxModule, token: Token): Paragraph[] {
  const lines = token.content.split('\n')
  return lines.map(line => new docx.Paragraph({
    children: [new docx.TextRun({ text: line || ' ', font: 'Courier New', size: 18 })],
    shading: { type: docx.ShadingType.CLEAR, color: 'auto', fill: CODE_FILL },
    spacing: { after: 0, line: 240 },
  }))
}

/** 有序 / 无序列表（递归处理嵌套列表） */
function buildList(docx: DocxModule, tokens: Token[], reference: 'markdown-ul' | 'markdown-ol', level: number, quote: boolean): Array<Paragraph | Table> {
  const blocks: Array<Paragraph | Table> = []
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].type !== 'list_item_open')
      continue
    const itemEnd = findClose(tokens, i, 'list_item_open', 'list_item_close')
    blocks.push(...buildListItem(docx, tokens.slice(i + 1, itemEnd), reference, level, quote))
    i = itemEnd
  }
  return blocks
}

function buildListItem(docx: DocxModule, tokens: Token[], reference: 'markdown-ul' | 'markdown-ol', level: number, quote: boolean): Array<Paragraph | Table> {
  const blocks: Array<Paragraph | Table> = []
  let first = true
  const border = quote ? quoteBorder(docx) : undefined
  const indent = quote ? { left: 480 } : undefined

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token.type === 'paragraph_open') {
      const inline = tokens[i + 1]
      if (inline?.type === 'inline') {
        blocks.push(new docx.Paragraph({
          // 仅首段挂 numbering，后续段落保持缩进但不重复编号
          numbering: first ? { reference, level: Math.min(level, 8) } : undefined,
          children: buildRuns(docx, inline.children ?? []),
          indent,
          border,
        }))
        first = false
      }
      i += 2
    }
    else if (token.type === 'bullet_list_open' || token.type === 'ordered_list_open') {
      const isUl = token.type === 'bullet_list_open'
      const end = findClose(tokens, i, token.type, isUl ? 'bullet_list_close' : 'ordered_list_close')
      blocks.push(...buildList(docx, tokens.slice(i + 1, end), isUl ? 'markdown-ul' : 'markdown-ol', level + 1, quote))
      i = end
      first = false
    }
    else if (token.type === 'blockquote_open') {
      const end = findClose(tokens, i, 'blockquote_open', 'blockquote_close')
      blocks.push(...buildBody(docx, tokens.slice(i + 1, end), level, true))
      i = end
      first = false
    }
    else if (token.type === 'fence' || token.type === 'code_block') {
      blocks.push(...buildCodeBlock(docx, token))
      first = false
    }
  }
  return blocks
}

/** 表格 → docx Table（表头加粗） */
function buildTable(docx: DocxModule, tokens: Token[]): Table {
  const rows: Array<InstanceType<DocxModule['TableRow']>> = []
  let cells: Array<InstanceType<DocxModule['TableCell']>> = []
  let header = false

  const flushRow = () => {
    if (cells.length) {
      rows.push(new docx.TableRow({ tableHeader: header, children: cells }))
      cells = []
    }
    header = false
  }

  for (const token of tokens) {
    if (token.type === 'tr_open') {
      if (cells.length)
        flushRow()
    }
    else if (token.type === 'th_open') {
      header = true
    }
    else if (token.type === 'td_open') {
      header = false
    }
    else if (token.type === 'inline') {
      cells.push(new docx.TableCell({
        children: [new docx.Paragraph({ children: buildRuns(docx, token.children ?? []) })],
      }))
    }
  }
  flushRow()

  return new docx.Table({
    rows,
    width: { size: 100, type: docx.WidthType.PERCENTAGE },
  })
}

/** 顶层块级结构遍历 */
function buildBody(docx: DocxModule, tokens: Token[], level = 0, quote = false): Array<Paragraph | Table> {
  const blocks: Array<Paragraph | Table> = []
  const border = quote ? quoteBorder(docx) : undefined
  const indent = quote ? { left: 480 } : undefined

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    switch (token.type) {
      case 'heading_open': {
        const inline = tokens[i + 1]
        const size = Number.parseInt(token.tag.replace('h', ''), 10) || 1
        const heading = HEADING_LEVELS[Math.min(Math.max(size, 1), 6) - 1]
        blocks.push(new docx.Paragraph({
          heading,
          children: buildRuns(docx, inline?.children ?? []),
          indent,
          border,
        }))
        i += 2
        break
      }
      case 'paragraph_open': {
        const inline = tokens[i + 1]
        if (inline?.type === 'inline') {
          blocks.push(new docx.Paragraph({
            children: buildRuns(docx, inline.children ?? []),
            indent,
            border,
          }))
        }
        i += 2
        break
      }
      case 'bullet_list_open': {
        const end = findClose(tokens, i, 'bullet_list_open', 'bullet_list_close')
        blocks.push(...buildList(docx, tokens.slice(i + 1, end), 'markdown-ul', level, quote))
        i = end
        break
      }
      case 'ordered_list_open': {
        const end = findClose(tokens, i, 'ordered_list_open', 'ordered_list_close')
        blocks.push(...buildList(docx, tokens.slice(i + 1, end), 'markdown-ol', level, quote))
        i = end
        break
      }
      case 'blockquote_open': {
        const end = findClose(tokens, i, 'blockquote_open', 'blockquote_close')
        blocks.push(...buildBody(docx, tokens.slice(i + 1, end), level, true))
        i = end
        break
      }
      case 'table_open': {
        const end = findClose(tokens, i, 'table_open', 'table_close')
        blocks.push(buildTable(docx, tokens.slice(i + 1, end)))
        i = end
        break
      }
      case 'hr':
        blocks.push(new docx.Paragraph({
          border: { bottom: { color: 'CCCCCC', style: docx.BorderStyle.SINGLE, size: 6, space: 4 } },
          spacing: { after: 160 },
        }))
        break
      case 'fence':
      case 'code_block':
        blocks.push(...buildCodeBlock(docx, token))
        break
      default:
        break
    }
  }
  return blocks
}

/** 有序 / 无序列表的 numbering 配置 */
function buildNumbering(docx: DocxModule) {
  const ulLevels = [0, 1, 2].map(level => ({
    level,
    format: docx.LevelFormat.BULLET,
    text: UL_BULLETS[level] ?? '•',
    alignment: docx.AlignmentType.LEFT,
    style: { paragraph: { indent: { left: 720 + level * 360, hanging: 360 } } },
  }))
  const olLevels = [0, 1, 2].map(level => ({
    level,
    format: docx.LevelFormat.DECIMAL,
    text: `%${level + 1}.`,
    alignment: docx.AlignmentType.LEFT,
    style: { paragraph: { indent: { left: 720 + level * 360, hanging: 360 } } },
  }))
  return {
    config: [
      { reference: 'markdown-ul', levels: ulLevels },
      { reference: 'markdown-ol', levels: olLevels },
    ],
  }
}
