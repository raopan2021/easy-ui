import type { Rule } from 'eslint'

/**
 * 自定义格式化规则：把多行开标签的属性合并为"紧凑填充式"。
 *
 * 示例：
 *   <EasyButton
 *     type="text"
 *     size="small"
 *   >
 *   ->
 *   <EasyButton type="text" size="small">
 *
 * 折行策略：标签名 + 属性尽量填满一行（<= 120 字符），放不下时
 * 剩余属性换行缩进（父缩进 + 2），关闭标签 `>` 紧跟最后一个属性。
 *
 * 说明：eslint 默认遍历不含 vue 的 templateBody，因此这里手动遍历
 * `sourceCode.ast.templateBody` 来找到所有 VStartTag 节点。
 */

const MAX_LINE_LENGTH = 120

interface AttrLike {
  range: [number, number]
  loc: {
    start: { line: number, column: number }
    end: { line: number, column: number }
  }
}

interface VStartTagLike {
  range: [number, number]
  loc: {
    start: { line: number, column: number }
    end: { line: number, column: number }
  }
  attributes: AttrLike[]
  selfClosing: boolean
}

function buildCompactText(node: VStartTagLike, sourceCode: Rule.SourceCode): string | null {
  // 仅处理跨行开始标签
  if (node.loc.start.line === node.loc.end.line)
    return null
  if (node.attributes.length === 0)
    return null

  // 属性值本身必须都在单行，否则跳过（避免破坏多行绑定）
  for (const attr of node.attributes) {
    if (attr.loc.start.line !== attr.loc.end.line)
      return null
  }

  const startTagText = sourceCode.getText(node as unknown as Rule.Node)

  // 基础缩进：标签所在行行首到标签前的文本，必须全是空白。
  // 注意：node.range 从 `<` 开始（不含前导缩进），文件中的缩进会保留，
  // 因此新文本第一行不加前缀，只有折行后的后续行才需要 baseIndent + 2。
  const lineStart = sourceCode.lines[node.loc.start.line - 1]
  const beforeNode = lineStart.slice(0, node.loc.start.column)
  if (!/^\s*$/.test(beforeNode))
    return null
  const baseIndent = beforeNode
  const attrIndent = `${baseIndent}  `

  // 属性之间必须只含空白（避免遇到注释等无法安全合并的内容）
  for (let i = 0; i < node.attributes.length - 1; i++) {
    const between = startTagText.slice(
      node.attributes[i].range[1] - node.range[0],
      node.attributes[i + 1].range[0] - node.range[0],
    )
    if (!/^\s*$/.test(between))
      return null
  }

  // 头部（标签名部分）与各属性文本
  const firstAttr = node.attributes[0]
  const headText = startTagText
    .slice(0, firstAttr.range[0] - node.range[0])
    .trimEnd()
  const attrTexts = node.attributes.map(attr =>
    startTagText.slice(attr.range[0] - node.range[0], attr.range[1] - node.range[0]),
  )

  // 填充式折行：第一行至少放一个属性，其余按行宽尽量填充
  const lines: string[] = []
  let current = headText
  for (let i = 0; i < attrTexts.length; i++) {
    const candidate = `${current} ${attrTexts[i]}`
    if (i === 0 || candidate.length + baseIndent.length <= MAX_LINE_LENGTH) {
      current = candidate
    }
    else {
      lines.push(current)
      current = attrTexts[i]
    }
  }
  // 自闭合标签输出 ` />`（与项目既有风格、vue/html-closing-bracket-spacing 一致），
  // 普通标签输出 `>`，避免与其它规则互相 fix 造成循环
  const closer = node.selfClosing ? ' />' : '>'
  lines.push(`${current}${closer}`)

  // 第一行不加前缀（node.range 前已存在的缩进会保留），后续行加 baseIndent + 2
  return lines
    .map((line, i) => (i === 0 ? '' : attrIndent) + line)
    .join('\n')
}

export const attributesFillRule: Rule.RuleModule = {
  meta: {
    type: 'layout',
    fixable: 'code',
    schema: [],
    messages: {
      merge: '合并标签属性为紧凑填充式',
    },
  },
  create(context) {
    const sourceCode = context.sourceCode
    const ast = sourceCode.ast as unknown as { templateBody?: { children?: any[] } }
    const templateBody = ast.templateBody
    if (!templateBody || !Array.isArray(templateBody.children))
      return {}

    // 手动遍历 templateBody，收集所有 VStartTag
    const startTags: VStartTagLike[] = []
    const walk = (nodes: any[]) => {
      for (const n of nodes) {
        if (n?.type === 'VElement') {
          if (n.startTag)
            startTags.push(n.startTag)
          if (Array.isArray(n.children))
            walk(n.children)
        }
      }
    }
    walk(templateBody.children)

    for (const node of startTags) {
      const newText = buildCompactText(node, sourceCode)
      if (newText == null)
        continue

      const original = sourceCode.getText(node as unknown as Rule.Node)
      if (newText === original)
        continue

      context.report({
        node: node as unknown as Rule.Node,
        messageId: 'merge',
        fix: fixer => fixer.replaceText(node as unknown as Rule.Node, newText),
      })
    }

    return {}
  },
}
