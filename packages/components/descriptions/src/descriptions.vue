<script setup lang="ts">
import type { VNode } from 'vue'
import { Comment, computed, Fragment, Text, useSlots } from 'vue'
import EasyIcon from '../../icon'

defineOptions({ name: 'EasyDescriptions' })

const props = withDefaults(
  defineProps<{
    title?: string
    column?: number
    colon?: boolean
    bordered?: boolean
    layout?: 'horizontal' | 'vertical'
    size?: 'small' | 'default' | 'large'
    labelWidth?: string | number
    labelAlign?: 'left' | 'right' | 'center'
  }>(),
  {
    title: '',
    column: 3,
    colon: false,
    bordered: false,
    layout: 'horizontal',
    size: 'default',
    labelWidth: '',
    labelAlign: 'left',
  },
)

const slots = useSlots()

interface ParsedItem {
  label: string
  icon: string
  span: number
  children: VNode[]
}

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

const lastRowPadding = computed(() => {
  if (rows.value.length === 0)
    return 0
  const used = rows.value[rows.value.length - 1].reduce((s, i) => s + i.span, 0)
  return props.column - used
})

// 垂直布局：计算每个 item 是否是"该行最后一列"和"最后一行"，用于控制边框
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

const descriptionsClass = computed(() => [
  `easy-descriptions--${props.size}`,
  `easy-descriptions--${props.layout}`,
  { 'is-bordered': props.bordered },
])

// CSS 变量：传递 column 给 grid-template-columns
const cssVars = computed(() => ({
  '--easy-desc-columns': props.column,
}))

const labelCellStyle = computed(() => {
  const style: Record<string, string> = { textAlign: props.labelAlign }
  if (props.labelWidth) {
    style.width = typeof props.labelWidth === 'number' ? `${props.labelWidth}px` : String(props.labelWidth)
  }
  return style
})
</script>

<template>
  <div class="easy-descriptions" :class="descriptionsClass" :style="cssVars">
    <!-- 标题栏 -->
    <div v-if="title || $slots.title || $slots.extra" class="easy-descriptions__header">
      <div class="easy-descriptions__title">
        <slot name="title">
          {{ title }}
        </slot>
      </div>
      <div v-if="$slots.extra" class="easy-descriptions__extra">
        <slot name="extra" />
      </div>
    </div>

    <!-- 内容表格 (水平布局) -->
    <div v-if="layout === 'horizontal'" class="easy-descriptions__body">
      <table class="easy-descriptions__table">
        <tbody>
          <tr v-for="(row, rowIndex) in rows" :key="rowIndex" class="easy-descriptions__row">
            <template v-for="(cell, cellIndex) in row" :key="cellIndex">
              <td class="easy-descriptions__label" :style="labelCellStyle">
                <EasyIcon v-if="cell.icon" :name="cell.icon" :size="13" class="label-icon" />
                <span class="label-text">{{ cell.label }}</span>
              </td>
              <td class="easy-descriptions__content" :colspan="cell.span * 2 - 1">
                <component :is="() => cell.children" />
              </td>
            </template>
            <!-- 末行补齐空白 -->
            <template v-if="rowIndex === rows.length - 1 && lastRowPadding > 0">
              <td class="easy-descriptions__label is-empty" />
              <td class="easy-descriptions__content" :colspan="lastRowPadding * 2 - 1" />
            </template>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 内容网格 (垂直布局) -->
    <div v-else class="easy-descriptions__body easy-descriptions__body--vertical">
      <div class="easy-descriptions__grid">
        <div
          v-for="(item, idx) in items"
          :key="idx"
          class="easy-descriptions__item"
          :class="getItemClass(idx)"
          :style="{ gridColumn: `span ${item.span}` }"
        >
          <div class="easy-descriptions__label easy-descriptions__label--vertical">
            <EasyIcon v-if="item.icon" :name="item.icon" :size="13" class="label-icon" />
            <span class="label-text">{{ item.label }}</span>
          </div>
          <div class="easy-descriptions__content easy-descriptions__content--vertical">
            <component :is="() => item.children" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../../easy-ui/src/styles/tokens' as *;

// ─── 现代设计 Token ───────────────────────────────────────────
$radius: 12px;
$radius-sm: 8px;

// ─── Base ────────────────────────────────────────────────────
.easy-descriptions {
  width: 100%;
  font-family: -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif;

  // ── Header ──
  .easy-descriptions__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 20px;
  }

  .easy-descriptions__title {
    font-size: 15px;
    font-weight: 600;
    color: $text-heading;
    line-height: 1.4;
    position: relative;
    padding-left: 12px;

    &::before {
      content: '';
      position: absolute;
      left: 0;
      top: 2px;
      bottom: 2px;
      width: 3px;
      background: #1677ff;
      border-radius: 2px;
    }
  }

  .easy-descriptions__extra {
    font-size: 13px;
    color: $text-label;
  }

  // ── Table body ──
  .easy-descriptions__body {
    width: 100%;
    overflow: hidden;
  }

  .easy-descriptions__table {
    width: 100%;
    table-layout: auto;
  }

  // ── Label (水平) ──
  .easy-descriptions__label {
    white-space: nowrap;
    vertical-align: middle;
    font-weight: 500;

    .label-icon {
      color: $text-subtle;
      vertical-align: middle;
      margin-right: 6px;
      margin-top: -1px;
    }

    .label-text {
      color: $text-label;
      font-weight: 500;
    }
  }

  // ── Content (水平) ──
  .easy-descriptions__content {
    color: $text-body;
    word-break: break-word;
    vertical-align: middle;
    font-weight: 400;
    min-width: 120px;
  }

  // ─── 垂直布局 ────────────────────────────────────────────────
  .easy-descriptions__body--vertical {
    width: 100%;
  }

  .easy-descriptions__grid {
    display: grid;
    grid-template-columns: repeat(var(--easy-desc-columns, 3), 1fr);
  }

  .easy-descriptions__item {
    display: flex;
    flex-direction: column;
  }

  .easy-descriptions__label--vertical {
    display: flex;
    align-items: center;
    white-space: nowrap;

    .label-text {
      color: $text-label;
      font-weight: 500;
    }

    .label-icon {
      color: $text-subtle;
      margin-right: 6px;
    }
  }

  .easy-descriptions__content--vertical {
    color: $text-body;
    font-weight: 400;
    word-break: break-word;
  }

  // ─── Size ────────────────────────────────────────────────────
  &.easy-descriptions--small {
    .easy-descriptions__label:not(.easy-descriptions__label--vertical),
    .easy-descriptions__content:not(.easy-descriptions__content--vertical) {
      font-size: 12px;
      padding: 8px 12px;
      line-height: 1.5;
    }
    .easy-descriptions__item {
      padding: 12px 14px;
    }
    .easy-descriptions__label--vertical {
      font-size: 11px;
      margin-bottom: 4px;
    }
    .easy-descriptions__content--vertical {
      font-size: 13px;
      line-height: 1.5;
    }
    .easy-descriptions__title {
      font-size: 14px;
      padding-left: 10px;
    }
  }

  &.easy-descriptions--default {
    .easy-descriptions__label:not(.easy-descriptions__label--vertical),
    .easy-descriptions__content:not(.easy-descriptions__content--vertical) {
      font-size: 13px;
      padding: 10px 16px;
      line-height: 1.6;
    }
    .easy-descriptions__item {
      padding: 16px 20px;
    }
    .easy-descriptions__label--vertical {
      font-size: 12px;
      margin-bottom: 6px;
    }
    .easy-descriptions__content--vertical {
      font-size: 14px;
      line-height: 1.6;
    }
    .easy-descriptions__title {
      font-size: 15px;
      padding-left: 12px;
    }
  }

  &.easy-descriptions--large {
    .easy-descriptions__label:not(.easy-descriptions__label--vertical),
    .easy-descriptions__content:not(.easy-descriptions__content--vertical) {
      font-size: 14px;
      padding: 12px 20px;
      line-height: 1.6;
    }
    .easy-descriptions__item {
      padding: 20px 24px;
    }
    .easy-descriptions__label--vertical {
      font-size: 13px;
      margin-bottom: 8px;
    }
    .easy-descriptions__content--vertical {
      font-size: 15px;
      line-height: 1.6;
    }
    .easy-descriptions__title {
      font-size: 16px;
      padding-left: 14px;
    }
  }

  // ─── 水平 · 无边框 ───────────────────────────────────────────
  &.easy-descriptions--horizontal:not(.is-bordered) {
    .easy-descriptions__body {
      border: none;
      border-radius: $radius-sm;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }

    .easy-descriptions__label {
      // background: $bg-soft;
      min-width: 120px;
    }

    .easy-descriptions__row {
      // &:nth-child(even) .easy-descriptions__content { background: $bg-soft; }
    }
  }

  // ─── 水平 · 有边框 ───────────────────────────────────────────
  &.is-bordered--horizontal.is-bordered {
    .easy-descriptions__body {
      border: 1px solid $border-subtle;
      border-radius: $radius-sm;
      overflow: hidden;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    }

    .easy-descriptions__label {
      background: var(--el-fill-color-lighter);
      border-right: 1px solid $border-subtle;
      min-width: 120px;
    }

    .easy-descriptions__row {
      &:not(:last-child) td {
        border-bottom: 1px solid $border-subtle;
      }
      td + td {
        border-left: 1px solid $border-subtle;
      }
    }
  }

  // ─── 垂直 · 无边框 ───────────────────────────────────────────
  &.easy-descriptions--vertical:not(.is-bordered) {
    .easy-descriptions__body {
      border: none;
      border-radius: $radius-sm;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
    }

    .easy-descriptions__item {
      &.is-last-col {
        border-right: none;
      }
      &.is-last-row {
        border-bottom: none;
      }
    }
  }

  // ─── 垂直 · 有边框 ───────────────────────────────────────────
  &.is-bordered--vertical.is-bordered {
    .easy-descriptions__body {
      border: 1px solid $border-subtle;
      border-radius: $radius-sm;
      overflow: hidden;
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
    }

    .easy-descriptions__item {
      border-right: 1px solid $border-subtle;
      border-bottom: 1px solid $border-subtle;
      padding: 0 !important;

      &.is-last-col {
        border-right: none;
      }
      &.is-last-row {
        border-bottom: none;
      }

      .easy-descriptions__label--vertical {
        background: var(--el-fill-color-lighter);
        border-bottom: 1px solid $border-subtle;
        padding: 10px 16px;
        margin-bottom: 0 !important;
      }

      .easy-descriptions__content--vertical {
        padding: 12px 16px;
      }
    }
  }

  html.dark & {
    .easy-descriptions__body {
      background: var(--el-bg-color);
    }
    .easy-descriptions__body tbody {
      background: transparent;
    }
    &.easy-descriptions__body--horizontal:not(.is-bordered) .easy-descriptions__body {
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    }
    &.easy-descriptions__body--horizontal.is-bordered .easy-descriptions__body,
    &.easy-descriptions__body--vertical:not(.is-bordered) .easy-descriptions__body {
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
    }
    &.easy-descriptions__body--vertical.is-bordered .easy-descriptions__body {
      box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
    }
    .easy-descriptions__title {
      color: var(--el-text-color-primary);
    }
    .easy-descriptions__extra {
      color: var(--el-text-color-secondary);
    }
    .easy-descriptions__label .label-text {
      color: var(--el-text-color-regular) !important;
    }
    .easy-descriptions__content {
      color: var(--el-text-color-primary) !important;
    }
    .easy-descriptions__label .label-icon {
      color: var(--el-text-color-placeholder);
    }
    .easy-descriptions__label--vertical .label-text {
      color: var(--el-text-color-regular);
    }
    .easy-descriptions__label--vertical .label-icon {
      color: var(--el-text-color-placeholder);
    }
    &.easy-descriptions__body--horizontal.is-bordered .easy-descriptions__body,
    &.easy-descriptions__body--vertical.is-bordered .easy-descriptions__body {
      border-color: var(--el-border-color);
    }
    &.easy-descriptions__body--horizontal.is-bordered .easy-descriptions__label {
      background: var(--el-fill-color);
      border-color: var(--el-border-color);
    }
    &.easy-descriptions__body--vertical.is-bordered .easy-descriptions__label--vertical {
      background: var(--el-fill-color);
      border-color: var(--el-border-color);
    }
    &.easy-descriptions__body--horizontal.is-bordered .easy-descriptions__row td {
      border-color: var(--el-border-color);
    }
    &.easy-descriptions__body--vertical.is-bordered .easy-descriptions__item {
      border-color: var(--el-border-color);
    }
    &.easy-descriptions__body--vertical:not(.is-bordered) .easy-descriptions__item {
      border-color: transparent;
    }
  }
}
</style>
