import type { Slots, VNode } from 'vue'

import type { DescriptionsProps } from './descriptions'
import { Comment, computed, Fragment, Text } from 'vue'

/**
 * 已应用 `withDefaults` 默认值的 props 解析类型（供内部 composable 使用）。
 *
 * `DescriptionsProps` 成员为可选（对外兼容），但组件内部通过 `withDefaults` 提供了默认值，
 * 故 composable 接收的是「全必填」版本，`Required<DescriptionsProps>` 推导可避免 strict
 * 模式下可选成员（如 `column`、`labelWidth`）参与运算报错。
 */
type DescriptionsResolvedProps = Required<DescriptionsProps>

/** 解析后的描述项结构（含标签 / 图标 / 跨列 / 渲染后的子节点） */
interface ParsedItem {
  label: string
  icon: string
  span: number
  children: VNode[]
}

/**
 * 将插槽 VNode 拍平（忽略注释 / 文本节点，展开 Fragment）。
 *
 * 描述项以 `<EasyDescriptionsItem>` 形式置于默认插槽，可能嵌套在 Fragment 中，
 * 这里递归展开为平铺的 VNode 数组，供后续解析标签 / 跨列使用。
 *
 * @param vnodes 待拍平的 VNode 列表
 */
function flattenVNodes(vnodes: VNode[]): VNode[] {
  const result: VNode[] = []
  for (const vnode of vnodes) {
    if (!vnode)
      continue
    if (vnode.type === Comment || vnode.type === Text)
      continue
    if (vnode.type === Fragment) {
      result.push(...flattenVNodes(vnode.children as VNode[]))
    }
    else {
      result.push(vnode)
    }
  }
  return result
}

/**
 * Descriptions 布局与样式派生计算（纯 props + 插槽派生，无副作用）。
 *
 * 将原本内联在 descriptions.vue 中的插槽解析、水平行分组、垂直布局行列索引、
 * 各项类名、根类名、CSS 变量与标签单元格样式等逻辑抽离为独立 composable，
 * 让 .vue 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 *
 * @param props Descriptions props（需传入响应式对象，已应用默认值）
 * @param slots 组件 slots（用于解析默认插槽中的描述项）
 */
export function useDescriptions(props: DescriptionsResolvedProps, slots: Slots) {
  /** 解析后的描述项列表（标签 / 图标 / 跨列 / 渲染子节点） */
  const items = computed<ParsedItem[]>(() => {
    const flat = flattenVNodes(slots.default?.() || [])
    return flat.map((vnode) => {
      const p = (vnode.props || {}) as Record<string, unknown>
      const children: VNode[] = []
      if (vnode.children && typeof vnode.children === 'object') {
        const c = vnode.children as Record<string, unknown>
        if (typeof c.default === 'function') {
          const rendered = c.default()
          if (Array.isArray(rendered))
            children.push(...rendered)
          else children.push(rendered as VNode)
        }
      }
      return {
        label: String(p.label ?? ''),
        icon: String(p.icon ?? ''),
        span: Math.max(1, Number(p.span ?? 1)),
        children,
      }
    })
  })

  // 水平布局行分组
  const rows = computed(() => {
    const result: ParsedItem[][] = []
    let currentRow: ParsedItem[] = []
    let currentCols = 0
    items.value.forEach((item) => {
      const span = Math.min(item.span, props.column)
      // 当前行放不下此 item（且当前行非空），先结束当前行再开新行
      if (currentRow.length > 0 && currentCols + span > props.column) {
        result.push(currentRow)
        currentRow = []
        currentCols = 0
      }
      currentRow.push({ ...item, span })
      currentCols += span
      if (currentCols >= props.column) {
        result.push(currentRow)
        currentRow = []
        currentCols = 0
      }
    })
    if (currentRow.length > 0)
      result.push(currentRow)
    return result
  })

  /** 末行补齐空白列数 */
  const lastRowPadding = computed(() => {
    if (rows.value.length === 0)
      return 0
    const used = rows.value[rows.value.length - 1].reduce((s, i) => s + i.span, 0)
    return props.column - used
  })

  // 垂直布局：计算总行数（用于控制边框）
  const totalRows = computed(() => {
    let col = 0
    let rowCount = 0
    items.value.forEach((item) => {
      if (col > 0 && col + item.span > props.column) {
        rowCount++
        col = 0
      }
      col += item.span
      if (col >= props.column) {
        rowCount++
        col = 0
      }
    })
    if (col > 0)
      rowCount++
    return rowCount
  })

  // 计算每个 item 所在行号（0-based）
  const itemRowIndex = computed(() => {
    const result: number[] = []
    let col = 0
    let row = 0
    items.value.forEach((item) => {
      if (col > 0 && col + item.span > props.column) {
        row++
        col = 0
      }
      result.push(row)
      col += item.span
      if (col >= props.column) {
        row++
        col = 0
      }
    })
    return result
  })

  // 计算每个 item 所在列号（0-based）
  const itemColIndex = computed(() => {
    const result: number[] = []
    let col = 0
    items.value.forEach((item) => {
      if (col > 0 && col + item.span > props.column) {
        col = 0
      }
      result.push(col)
      col += item.span
      if (col >= props.column)
        col = 0
    })
    return result
  })

  /** 计算某个 item 是否为末列 / 末行（用于边框控制） */
  function getItemClass(idx: number) {
    const colIdx = itemColIndex.value[idx]
    const rowIdx = itemRowIndex.value[idx]
    const span = items.value[idx]?.span ?? 1
    const isLastCol = colIdx + span >= props.column
    const isLastRow = rowIdx === totalRows.value - 1
    return {
      'is-last-col': isLastCol,
      'is-last-row': isLastRow,
    }
  }

  /** 根节点组合类名（尺寸 / 布局 / 边框） */
  const descriptionsClass = computed(() => [
    `easy-descriptions--${props.size}`,
    `easy-descriptions--${props.layout}`,
    { 'is-bordered': props.bordered },
  ])

  // CSS 变量：传递 column 给 grid-template-columns
  const cssVars = computed(() => ({
    '--easy-desc-columns': props.column,
  }))

  /** 标签单元格行内样式（对齐 + 固定宽度） */
  const labelCellStyle = computed(() => {
    const style: Record<string, string> = { textAlign: props.labelAlign }
    if (props.labelWidth) {
      style.width = typeof props.labelWidth === 'number' ? `${props.labelWidth}px` : String(props.labelWidth)
    }
    return style
  })

  return {
    items,
    rows,
    lastRowPadding,
    totalRows,
    itemRowIndex,
    itemColIndex,
    getItemClass,
    descriptionsClass,
    cssVars,
    labelCellStyle,
  }
}
