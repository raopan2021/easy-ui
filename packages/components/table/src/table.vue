<script setup lang="ts">
import type { TableEmits } from './table'
import { useSlots } from 'vue'
import EasyButton from '../../button'
import EasyIcon from '../../icon'
import EasySelect from '../../select'

import { tableProps } from './table'
import { useTableAutoHeight } from './use-table-auto-height'
import { useTableCellRendering } from './use-table-cells'
import { useTableColumns } from './use-table-columns'
import { useTableExpand } from './use-table-expand'
import { useTableLayout } from './use-table-layout'
import { useTablePagination } from './use-table-pagination'
import { useTableSelection } from './use-table-selection'
import { useTableSort } from './use-table-sort'
import { useTableSummary } from './use-table-summary'
import { useTableToolbar } from './use-table-toolbar'
import { useTableTooltip } from './use-table-tooltip'
import { useTableTree } from './use-table-tree'

defineOptions({ name: 'EasyTable' })

/* ====================================================
   Props & Emits（类型来自 table.ts，作为统一类型模块）
==================================================== */
const props = defineProps(tableProps)

const emit = defineEmits<TableEmits>()

const slots = useSlots()

/* ====================================================
   组合各 concern 的 composable（逻辑抽离，保持行为一致）
==================================================== */
// ──── Ellipsis Tooltip ────
const { tooltipState, showCellTooltip, hideCellTooltip, updateTooltipPosition } = useTableTooltip()

// ──── 列配置（本地列/可见列/列设置/固定列偏移/列宽样式/最小宽度）────
const {
  localColumns,
  visibleColumns,
  showColumnSettingsPanel,
  dragState,
  isColumnDraggable,
  handleDragStart,
  handleDragOver,
  handleDrop,
  handleDragEnd,
  handleColumnVisibleChange,
  resetColumnVisibility,
  getColStyle,
  totalColCount,
  tableMinWidth,
} = useTableColumns(props, emit, slots)

// ──── 排序 ────
const { sortState, handleSort, sortedData } = useTableSort(props, emit)

// ──── 分页（前端/服务端）────
const {
  currentPage,
  currentPageSize,
  total,
  totalPages,
  displayData,
  pageSizeSelectOptions,
  handlePageChange,
  handlePageSizeChange,
  pageNumbers,
  jumpPageInput,
  handleJumpPage,
  handleJumpPageEnter,
} = useTablePagination(props, emit, sortedData)

// ──── 工具栏 + 刷新/导出 ────
const { toolbarLeftVisible, toolbarRightVisible, handleRefresh, handleExport } = useTableToolbar(props, emit, slots)

// ──── 树形数据 ────
const {
  toggleTreeExpand,
  handleTreeNodeClick,
  expandRow,
  collapseRow,
  expandAllTree,
  collapseAllTree,
  isTreeExpanded,
  treeFlatData,
} = useTableTree(props, emit, displayData)

// ──── 展开行 ────
const {
  hasExpandSlot,
  toggleRowExpand,
  handleExpandClick,
  expandAll,
  collapseAll,
  displayDataWithExpand,
} = useTableExpand(props, emit, displayData, slots)

// ──── 行选择 ────
const {
  isRowSelected,
  isAllSelected,
  isIndeterminate,
  handleSelectAll,
  handleRowSelect,
  clearSelection,
  getSelection,
} = useTableSelection(props, emit, displayData, treeFlatData)

// ──── 自动高度 ────
const { tableRootRef, computedMaxHeight } = useTableAutoHeight(
  props,
  toolbarLeftVisible,
  toolbarRightVisible,
  total,
)

// ──── 布局/样式 ────
const { tableClass, containerStyle } = useTableLayout(props, computedMaxHeight)

// ──── 合计行 ────
const { summaryRow, hasSummary, summaryMixed } = useTableSummary(props, visibleColumns)

// ──── 单元格取值/格式化/序号 ────
const { getCellValue, formatCell, getRowIndex } = useTableCellRendering(props, currentPage, currentPageSize)

/* ====================================================
   行点击（emit row-click）
==================================================== */
function handleRowClick(row: Record<string, any>, index: number) {
  if (!props.rowClickable)
    return
  emit('row-click', row, index)
}

/* ====================================================
   暴露方法（保持原 defineExpose 表面不变）
==================================================== */
defineExpose({
  clearSelection,
  getSelection,
  expandAll,
  collapseAll,
  // 树形相关
  expandRow,
  collapseRow,
  expandAllTree,
  collapseAllTree,
  isTreeExpanded,
})

// 保持对外类型导出兼容（原 inline 定义已迁移至 table.ts）
export type { TableEmits, TableProps } from './table'
</script>

<template>
  <div ref="tableRootRef" class="easy-table" :class="tableClass">
    <!-- 工具栏（左侧或右侧有内容时才显示） -->
    <div v-if="toolbarLeftVisible || toolbarRightVisible" class="easy-table__toolbar">
      <!-- 左侧区域：始终渲染，flex:1 填充空间，左侧无内容时右侧按钮靠左 -->
      <div class="easy-table__toolbar-left">
        <span v-if="title" class="easy-table__title">{{ title }}</span>
        <slot name="toolbar" />
        <slot name="toolbar-left" />
      </div>
      <!-- 右侧区域：始终渲染 -->
      <div v-if="toolbarRightVisible" class="easy-table__toolbar-right">
        <!-- 刷新按钮 -->
        <EasyButton v-if="showRefresh" type="ghost" size="small" shape="circle" @click="handleRefresh">
          <template #icon>
            <EasyIcon name="el:Refresh" :size="16" />
          </template>
        </EasyButton>
        <!-- 导出按钮 -->
        <EasyButton v-if="showExport" type="ghost" size="small" shape="circle" @click="handleExport">
          <template #icon>
            <EasyIcon name="el:Download" :size="16" />
          </template>
        </EasyButton>
        <!-- 列设置按钮 -->
        <EasyButton
          v-if="showColumnSettings" type="ghost" size="small" shape="circle"
          @click="showColumnSettingsPanel = true"
        >
          <template #icon>
            <EasyIcon name="el:Operation" :size="16" />
          </template>
        </EasyButton>
        <slot name="toolbar-right" />
      </div>
    </div>

    <!-- 表格容器 -->
    <div class="easy-table__container" :style="containerStyle">
      <table class="easy-table__inner" :style="{ minWidth: tableMinWidth }">
        <!-- 表头 -->
        <thead class="easy-table__thead">
          <tr>
            <!-- 树形展开列 -->
            <th v-if="tree" class="easy-table__th easy-table__th--tree-expand" />
            <!-- 普通展开列 -->
            <th v-else-if="expandable" class="easy-table__th easy-table__th--expand" />
            <!-- 选择列 - 多选模式 -->
            <th v-if="selectable && selectionMode === 'multiple'" class="easy-table__th easy-table__th--selection">
              <label class="easy-table__checkbox">
                <input
                  type="checkbox" :checked="isAllSelected" :indeterminate="isIndeterminate"
                  @change="handleSelectAll"
                >
                <span class="easy-table__checkbox-inner" />
              </label>
            </th>
            <!-- 选择列 - 单选模式 -->
            <th v-if="selectable && selectionMode === 'single'" class="easy-table__th easy-table__th--selection" />
            <!-- 序号列 -->
            <th v-if="showIndex" class="easy-table__th easy-table__th--index">
              {{ indexLabel }}
            </th>
            <!-- 数据列 -->
            <th
              v-for="col in visibleColumns"
              :key="col.prop"
              class="easy-table__th"
              :class="[
                col.align ? `easy-table__th--${col.align}` : '',
                col.sortable ? 'is-sortable' : '',
                sortState.key === col.prop ? 'is-sorted' : '',
                col.fixed ? `easy-table__th--fixed easy-table__th--fixed-${col.fixed}` : '',
              ]"
              :style="getColStyle(col)"
              @click="col.sortable ? handleSort(col.prop) : undefined"
            >
              <span class="easy-table__th-inner">
                <span class="easy-table__th-label">{{ col.name }}</span>
                <span v-if="col.sortable" class="easy-table__sort-icons">
                  <svg
                    class="easy-table__sort-icon"
                    :class="{
                      'is-active': sortState.key === col.prop && sortState.order === 'asc',
                    }"
                    viewBox="0 0 24 24"
                    width="1em"
                    height="1em"
                  >
                    <path d="M12 7l-5 5h10z" fill="currentColor" />
                  </svg>
                  <svg
                    class="easy-table__sort-icon"
                    :class="{
                      'is-active': sortState.key === col.prop && sortState.order === 'desc',
                    }"
                    viewBox="0 0 24 24"
                    width="1em"
                    height="1em"
                  >
                    <path d="M12 17l5-5H7z" fill="currentColor" />
                  </svg>
                </span>
              </span>
            </th>
            <!-- 操作列 -->
            <th
              v-if="$slots.action"
              class="easy-table__th easy-table__th--action"
              :class="actionFixed ? `easy-table__th--fixed easy-table__th--fixed-${actionFixed}` : ''"
              :style="
                actionFixed
                  ? {
                    [actionFixed]: '0px',
                    width: actionWidth ? `${actionWidth}px` : '120px',
                  }
                  : {}
              "
            >
              {{ actionLabel }}
            </th>
          </tr>
        </thead>

        <!-- 表体 -->
        <tbody class="easy-table__tbody">
          <!-- 数据行 -->
          <!-- 树形模式渲染 -->
          <template v-if="tree">
            <template v-for="node in treeFlatData" :key="node.key">
              <tr
                class="easy-table__tr is-tree-node"
                :class="{
                  'is-selected': isRowSelected(node.row),
                  'is-tree-expanded': node.expanded,
                }"
                @click="handleTreeNodeClick(node.row); handleRowClick(node.row, 0)"
              >
                >
                <!-- 树形展开列（只在第一列前显示） -->
                <td class="easy-table__td easy-table__td--tree-expand">
                  <span
                    v-if="node.hasChildren"
                    class="easy-table__tree-icon"
                    :class="{
                      'is-expanded': node.expanded,
                      'is-loading': node.loading,
                    }"
                    @click.stop="toggleTreeExpand(node.row)"
                  >
                    <svg
                      v-if="!node.loading" viewBox="0 0 24 24" width="16" height="16" fill="none"
                      stroke="currentColor" stroke-width="2"
                    >
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                    <svg
                      v-else class="easy-table__loading-icon" viewBox="0 0 24 24" width="16" height="16" fill="none"
                      stroke="currentColor" stroke-width="2"
                    >
                      <circle cx="12" cy="12" r="10" stroke-dasharray="60" stroke-dashoffset="20" />
                    </svg>
                  </span>
                </td>
                <!-- 选择列 - 多选模式 -->
                <td v-if="selectable && selectionMode === 'multiple'" class="easy-table__td easy-table__td--selection">
                  <label class="easy-table__checkbox" @click.stop>
                    <input type="checkbox" :checked="isRowSelected(node.row)" @change="handleRowSelect(node.row)">
                    <span class="easy-table__checkbox-inner" />
                  </label>
                </td>
                <!-- 选择列 - 单选模式 -->
                <td v-if="selectable && selectionMode === 'single'" class="easy-table__td easy-table__td--selection">
                  <label class="easy-table__radio" @click.stop="handleRowSelect(node.row)">
                    <span class="easy-table__radio-inner" :class="{ 'is-checked': isRowSelected(node.row) }" />
                  </label>
                </td>
                <!-- 序号列 -->
                <td v-if="showIndex" class="easy-table__td easy-table__td--index">
                  {{ node.treeIndex }}
                </td>
                <!-- 数据列 -->
                <td
                  v-for="(col, colIndex) in visibleColumns"
                  :key="col.prop"
                  class="easy-table__td"
                  :class="[
                    col.align ? `easy-table__td--${col.align}` : '',
                    col.fixed ? `easy-table__td--fixed easy-table__td--fixed-${col.fixed}` : '',
                    colIndex === 0 ? 'easy-table__td--tree-first' : '',
                  ]"
                  :style="getColStyle(col)"
                >
                  <!-- 第一列需要添加缩进 -->
                  <template v-if="colIndex === 0">
                    <span
                      class="easy-table__tree-indent"
                      :style="{
                        paddingLeft: `${node.level * treeIndentSize}px`,
                      }"
                    />
                    <slot
                      :name="`col-${col.prop}`"
                      v-bind="{
                        row: node.row,
                        col,
                        value: getCellValue(node.row, col.prop),
                        index: 0,
                      }"
                    >
                      <span class="easy-table__cell-text" :class="{ 'is-ellipsis': col.ellipsis }">{{
                        formatCell(node.row, col)
                      }}</span>
                    </slot>
                  </template>
                  <template v-else>
                    <slot
                      :name="`col-${col.prop}`"
                      v-bind="{
                        row: node.row,
                        col,
                        value: getCellValue(node.row, col.prop),
                        index: 0,
                      }"
                    >
                      <span class="easy-table__cell-text" :class="{ 'is-ellipsis': col.ellipsis }">{{
                        formatCell(node.row, col)
                      }}</span>
                    </slot>
                  </template>
                </td>
                <!-- 操作列 -->
                <td
                  v-if="$slots.action"
                  class="easy-table__td easy-table__td--action"
                  :class="actionFixed ? `easy-table__td--fixed easy-table__td--fixed-${actionFixed}` : ''"
                  :style="
                    actionFixed
                      ? {
                        [actionFixed]: '0px',
                        width: actionWidth ? `${actionWidth}px` : '120px',
                      }
                      : {}
                  "
                >
                  <slot name="action" v-bind="{ row: node.row, index: 0 }" />
                </td>
              </tr>
            </template>
          </template>

          <!-- 普通模式渲染（展开行） -->
          <template v-else>
            <template v-for="item in displayDataWithExpand" :key="item.key">
              <!-- 主数据行 -->
              <tr
                class="easy-table__tr"
                :class="{
                  'is-selected': isRowSelected(item.row),
                  'is-stripe': stripe && item.index % 2 === 1,
                  'is-clickable': rowClickable || expandable,
                }"
                :style="{ cursor: expandable ? 'pointer' : rowClickable ? 'pointer' : 'default' }"
                @click="
                  handleExpandClick(item.row, item.index);
                  handleRowClick(item.row, item.index)
                "
              >
                <!-- 展开列 -->
                <td v-if="expandable" class="easy-table__td easy-table__td--expand">
                  <span
                    class="easy-table__expand-icon" :class="{ 'is-expanded': item.expanded }"
                    @click.stop="toggleRowExpand(item.row, item.index)"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </span>
                </td>
                <!-- 选择列 - 多选模式 -->
                <td v-if="selectable && selectionMode === 'multiple'" class="easy-table__td easy-table__td--selection">
                  <label class="easy-table__checkbox" @click.stop>
                    <input type="checkbox" :checked="isRowSelected(item.row)" @change="handleRowSelect(item.row)">
                    <span class="easy-table__checkbox-inner" />
                  </label>
                </td>
                <!-- 选择列 - 单选模式 -->
                <td v-if="selectable && selectionMode === 'single'" class="easy-table__td easy-table__td--selection">
                  <label class="easy-table__radio" @click.stop="handleRowSelect(item.row)">
                    <span class="easy-table__radio-inner" :class="{ 'is-checked': isRowSelected(item.row) }" />
                  </label>
                </td>
                <!-- 序号列 -->
                <td v-if="showIndex" class="easy-table__td easy-table__td--index">
                  {{ getRowIndex(item.index) }}
                </td>
                <!-- 数据列 -->
                <td
                  v-for="col in visibleColumns"
                  :key="col.prop"
                  class="easy-table__td"
                  :class="[
                    col.align ? `easy-table__td--${col.align}` : '',
                    col.fixed ? `easy-table__td--fixed easy-table__td--fixed-${col.fixed}` : '',
                  ]"
                  :style="getColStyle(col)"
                >
                  <slot
                    :name="`col-${col.prop}`"
                    v-bind="{
                      row: item.row,
                      col,
                      value: getCellValue(item.row, col.prop),
                      index: item.index,
                    }"
                  >
                    <span
                      class="easy-table__cell-text"
                      :class="{ 'is-ellipsis': col.ellipsis }"
                      @mouseenter="
                        col.ellipsis && showCellTooltip($event, String(getCellValue(item.row, col.prop) ?? ''))
                      "
                      @mousemove="col.ellipsis && updateTooltipPosition($event)"
                      @mouseleave="col.ellipsis && hideCellTooltip()"
                    >{{ formatCell(item.row, col) }}</span>
                  </slot>
                </td>
                <!-- 操作列 -->
                <td
                  v-if="$slots.action"
                  class="easy-table__td easy-table__td--action"
                  :class="actionFixed ? `easy-table__td--fixed easy-table__td--fixed-${actionFixed}` : ''"
                  :style="
                    actionFixed
                      ? {
                        [actionFixed]: '0px',
                        width: actionWidth ? `${actionWidth}px` : '120px',
                      }
                      : {}
                  "
                >
                  <slot name="action" v-bind="{ row: item.row, index: item.index }" />
                </td>
              </tr>

              <!-- 展开行内容 -->
              <tr v-if="item.expanded && hasExpandSlot" class="easy-table__expand-row">
                <td :colspan="totalColCount" class="easy-table__expand-cell">
                  <slot name="expand" v-bind="{ row: item.row, index: item.index }" />
                </td>
              </tr>
            </template>
          </template>
        </tbody>

        <!-- 合计行（不支持选择/选中） -->
        <tfoot v-if="hasSummary" class="easy-table__tfoot">
          <tr class="easy-table__summary-row">
            <!-- 树形/展开占位列 -->
            <td v-if="tree || expandable" class="easy-table__td easy-table__td--summary-placeholder" />
            <!-- 选择列占位：合计行不参与选择，显示为空格占位 -->
            <td v-if="selectable" class="easy-table__td easy-table__td--summary-placeholder easy-table__td--no-select" />
            <!-- 序号列 → 显示"合计"标签 -->
            <td v-if="showIndex" class="easy-table__td easy-table__td--summary-label">
              {{ summaryLabel }}
            </td>
            <!-- 数据列 -->
            <td
              v-for="(col, colIdx) in visibleColumns"
              :key="col.prop"
              class="easy-table__td easy-table__td--summary"
              :class="[
                col.align ? `easy-table__td--${col.align}` : '',
                col.fixed ? `easy-table__td--fixed easy-table__td--fixed-${col.fixed}` : '',
              ]"
              :style="getColStyle(col)"
            >
              <!-- 没有序号列时，第一列显示合计标签 -->
              <template v-if="!showIndex && colIdx === 0">
                <span class="easy-table__summary-title">{{ summaryLabel }}</span>
                <span v-if="summaryRow[col.prop]?.value" class="easy-table__summary-sep"> / </span>
                <template v-if="summaryRow[col.prop]?.value">
                  <span
                    v-if="summaryMixed && (summaryRow[col.prop].type === 'sum' || summaryRow[col.prop].type === 'avg')"
                    class="easy-table__summary-badge" :class="[`easy-table__summary-badge--${summaryRow[col.prop].type}`]"
                  >{{ summaryRow[col.prop].type === 'sum' ? '合计' : '均值' }}</span>
                  <span>{{ summaryRow[col.prop].value }}</span>
                </template>
              </template>
              <template v-else>
                <template v-if="summaryRow[col.prop]?.type === 'sum' || summaryRow[col.prop]?.type === 'avg'">
                  <span
                    v-if="summaryMixed" class="easy-table__summary-badge"
                    :class="[`easy-table__summary-badge--${summaryRow[col.prop].type}`]"
                  >{{ summaryRow[col.prop].type === 'sum' ? '合计' : '均值' }}</span>
                  <span>{{ summaryRow[col.prop].value }}</span>
                </template>
                <template v-else>
                  {{ summaryRow[col.prop]?.value }}
                </template>
              </template>
            </td>
          </tr>
        </tfoot>
      </table>

      <!-- 加载状态 - 始终显示（首次加载 / 刷新均用相同动画） -->
      <div v-if="loading" class="easy-table__empty" :class="{ 'easy-table__loading-overlay': displayData.length > 0 }">
        <div class="easy-table__loading">
          <div class="easy-table__loading-spinner">
            <div v-for="i in 5" :key="i" class="easy-table__loading-bar" :style="{ animationDelay: `${i * 0.1}s` }" />
          </div>
          <span v-if="loadingText" class="easy-table__loading-text">{{ loadingText }}</span>
        </div>
      </div>

      <!-- 空状态 - 放在表格外，避免因列过多滚动出视口 -->
      <div v-if="!loading && displayData.length === 0" class="easy-table__empty">
        <slot name="empty">
          <svg viewBox="0 0 80 60" fill="none" xmlns="http://www.w3.org/2000/svg" class="easy-table__empty-icon">
            <rect x="4" y="10" width="72" height="46" rx="4" fill="#f5f7fa" stroke="#e2e4ed" stroke-width="1.5" />
            <rect x="4" y="10" width="72" height="14" rx="4" fill="#eef0f6" stroke="#e2e4ed" stroke-width="1.5" />
            <rect x="14" y="32" width="26" height="4" rx="2" fill="#dde0ea" />
            <rect x="14" y="42" width="18" height="4" rx="2" fill="#dde0ea" />
            <rect x="46" y="32" width="20" height="4" rx="2" fill="#dde0ea" />
            <rect x="46" y="42" width="12" height="4" rx="2" fill="#dde0ea" />
          </svg>
          <p class="easy-table__empty-text">
            {{ emptyText }}
          </p>
        </slot>
      </div>
    </div>

    <!-- 分页 -->
    <div
      v-if="pagination && total > 0" class="easy-table__pagination"
      :class="`easy-table__pagination--${props.paginationPosition}`"
    >
      <!-- 总数 -->
      <span class="easy-table__pagination-total">共 {{ total }} 条</span>

      <!-- 页码按钮 -->
      <div class="easy-table__pagination-pages">
        <button
          class="easy-table__page-btn easy-table__page-btn--prev" :disabled="currentPage <= 1"
          @click="handlePageChange(currentPage - 1)"
        >
          <svg
            viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <button
          v-for="p in pageNumbers"
          :key="p"
          class="easy-table__page-btn"
          :class="{
            'is-current': p === currentPage,
            'is-ellipsis': p === '...',
          }"
          :disabled="typeof p === 'string'"
          @click="typeof p === 'number' && handlePageChange(p)"
        >
          <template v-if="typeof p === 'string'">
            ···
          </template>
          <template v-else>
            {{ p }}
          </template>
        </button>

        <button
          class="easy-table__page-btn easy-table__page-btn--next" :disabled="currentPage >= totalPages"
          @click="handlePageChange(currentPage + 1)"
        >
          <svg
            viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      <!-- 页码输入 -->
      <div v-if="showPageInput" class="easy-table__pagination-jump">
        <span>跳至</span>
        <input
          v-model.number="jumpPageInput" type="number" class="easy-table__pagination-input" :min="1"
          :max="totalPages" @keyup.enter="handleJumpPageEnter"
        >
        <span>页</span>
        <button class="easy-table__pagination-go" @click="handleJumpPage">
          Go
        </button>
      </div>

      <!-- 每页条数选择 -->
      <EasySelect
        v-if="showPageSize" v-model="currentPageSize" :options="pageSizeSelectOptions" size="small"
        style="width: 120px" class="easy-table__page-size-select" @change="handlePageSizeChange"
      />
    </div>

    <!-- 列设置面板 -->
    <div
      v-if="showColumnSettingsPanel" class="easy-table__column-settings-overlay"
      @click="showColumnSettingsPanel = false"
    >
      <div class="easy-table__column-settings-panel" @click.stop>
        <div class="easy-table__column-settings-header">
          <h3>列设置</h3>
          <button class="easy-table__column-settings-close" @click="showColumnSettingsPanel = false">
            <svg
              viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div class="easy-table__column-settings-body">
          <div
            v-for="(col, index) in localColumns"
            :key="col.prop"
            class="easy-table__column-settings-item"
            :draggable="isColumnDraggable(col) && props.columnDraggable"
            :class="{
              'is-dragging': dragState.draggingIndex === index,
              'is-drag-over': dragState.dragOverIndex === index,
              'is-disabled': !isColumnDraggable(col) || !props.columnDraggable,
            }"
            @dragstart="handleDragStart($event, index)"
            @dragover="handleDragOver($event, index)"
            @drop="handleDrop($event, index)"
            @dragend="handleDragEnd"
          >
            <div
              class="easy-table__column-settings-drag-handle"
              :class="{
                'is-disabled': !isColumnDraggable(col) || !props.columnDraggable,
              }"
            >
              <svg
                viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round"
              >
                <line x1="8" y1="6" x2="8" y2="6" />
                <line x1="8" y1="12" x2="8" y2="12" />
                <line x1="8" y1="18" x2="8" y2="18" />
                <line x1="16" y1="6" x2="16" y2="6" />
                <line x1="16" y1="12" x2="16" y2="12" />
                <line x1="16" y1="18" x2="16" y2="18" />
              </svg>
            </div>
            <label class="easy-table__column-settings-label">
              <input
                type="checkbox" :checked="col.visible !== false"
                @change="handleColumnVisibleChange(col.prop, $event)"
              >
              <span>{{ col.name }}</span>
            </label>
          </div>
        </div>
        <div class="easy-table__column-settings-footer">
          <button class="easy-table__column-settings-btn--reset" @click="resetColumnVisibility">
            重置
          </button>
          <button class="easy-table__column-settings-btn--confirm" @click="showColumnSettingsPanel = false">
            确定
          </button>
        </div>
      </div>
    </div>

    <!-- Ellipsis Tooltip -->
    <Teleport to="body">
      <Transition name="easy-tooltip-fade">
        <div
          v-if="tooltipState.visible" class="easy-table__tooltip"
          :style="{ left: `${tooltipState.x}px`, top: `${tooltipState.y}px` }"
        >
          {{ tooltipState.content }}
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped src="./table-style.scss" lang="scss"></style>

<!-- ========== Dark Mode Overrides ========== -->
<style lang="scss">
html.dark .easy-table {
  background: var(--el-bg-color);
  border-color: var(--el-border-color);
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);

  &:hover {
    box-shadow: 0 12px 28px rgba(0, 0, 0, 0.32);
  }
}

/* Toolbar */
html.dark .easy-table__toolbar {
  background: var(--el-bg-color);
  border-bottom-color: var(--el-border-color-light);
}

html.dark .easy-table__title {
  color: var(--el-text-color-primary);
}

/* Container & Scrollbar */
html.dark .easy-table__container {
  background: var(--el-bg-color);
  scrollbar-color: var(--el-border-color-lighter) transparent;

  &::-webkit-scrollbar-thumb {
    background: var(--el-border-color-lighter);
  }
}

/* Table Head */
html.dark .easy-table__th {
  color: var(--el-text-color-primary);
  background: var(--el-fill-color-lighter);
  border-bottom-color: var(--el-border-color);
}

html.dark .easy-table__th--selection,
html.dark .easy-table__th--index,
html.dark .easy-table__th--expand,
html.dark .easy-table__th--tree-expand {
  color: var(--el-text-color-secondary);
}

html.dark .easy-table__th.is-sortable:hover {
  color: var(--el-color-primary);
  background: var(--el-fill-color-light);
}

html.dark .easy-table__th.is-sorted {
  color: var(--el-color-primary);
  background: rgba(79, 110, 247, 0.12);
}

html.dark .easy-table__sort-icon {
  color: var(--el-text-color-disabled);

  &.is-active {
    color: var(--el-color-primary);
  }
}

/* Rows */
html.dark .easy-table__tr.is-stripe > .easy-table__td {
  background: var(--el-fill-color-lighter);
}

html.dark .easy-table__tr.is-selected > .easy-table__td {
  background: rgba(79, 110, 247, 0.15) !important;
}

html.dark .easy-table--highlight .easy-table__tbody .easy-table__tr:hover > .easy-table__td {
  background: var(--el-fill-color-light);
}

html.dark .easy-table__tr.is-tree-node:hover > td {
  background: var(--el-fill-color-light);
}

/* Cells */
html.dark .easy-table__td {
  color: var(--el-text-color-regular);
  border-bottom-color: var(--el-border-color-light);
  background: var(--el-bg-color);
}

html.dark .easy-table__td--selection,
html.dark .easy-table__td--index,
html.dark .easy-table__td--expand {
  color: var(--el-text-color-secondary);
}

/* Fixed columns */
html.dark .easy-table__td--fixed {
  background: var(--el-bg-color);
}

html.dark .easy-table__th--fixed {
  background: var(--el-fill-color-lighter);
}

html.dark .easy-table__th--fixed::after,
html.dark .easy-table__td--fixed::after {
  background: var(--el-border-color-light);
}

html.dark .easy-table__th--fixed-left,
html.dark .easy-table__td--fixed-left {
  box-shadow: 6px 0 12px rgba(0, 0, 0, 0.25);
}

html.dark .easy-table__th--fixed-right,
html.dark .easy-table__td--fixed-right {
  box-shadow: -6px 0 12px rgba(0, 0, 0, 0.25);
}

/* Checkbox & Radio */
html.dark .easy-table__checkbox .easy-table__checkbox-inner {
  border-color: var(--el-border-color);
  background: var(--el-fill-color);
}

html.dark .easy-table__radio .easy-table__radio-inner {
  border-color: var(--el-border-color);
  background: var(--el-fill-color);
}

/* Loading */
html.dark .easy-table__loading {
  color: var(--el-text-color-secondary);
}

html.dark .easy-table__loading-text {
  color: var(--el-text-color-secondary);
}

/* Empty State */
html.dark .easy-table__empty-text {
  color: var(--el-text-color-secondary);
}

html.dark .easy-table__empty-icon rect {
  fill: var(--el-fill-color);
  stroke: var(--el-border-color);
}

html.dark .easy-table__empty-icon rect:nth-child(2) {
  fill: var(--el-fill-color-lighter);
  stroke: var(--el-border-color);
}

html.dark .easy-table__empty-icon rect:nth-child(3),
html.dark .easy-table__empty-icon rect:nth-child(4),
html.dark .easy-table__empty-icon rect:nth-child(5),
html.dark .easy-table__empty-icon rect:nth-child(6),
html.dark .easy-table__empty-icon rect:nth-child(7) {
  fill: var(--el-border-color-lighter);
}

/* Pagination */
html.dark .easy-table__pagination {
  background: var(--el-bg-color);
  border-top-color: var(--el-border-color-light);
}

html.dark .easy-table__pagination-total {
  color: var(--el-text-color-secondary);
}

html.dark .easy-table__page-btn {
  border-color: var(--el-border-color-light);
  background: var(--el-fill-color);
  color: var(--el-text-color-regular);

  &:hover:not(:disabled):not(.is-current):not(.is-ellipsis) {
    border-color: var(--el-color-primary);
    color: var(--el-color-primary);
    background: rgba(79, 110, 247, 0.12);
  }
}

html.dark .easy-table__page-btn.is-current {
  background: var(--el-color-primary);
  border-color: var(--el-color-primary);
}

html.dark .easy-table__page-btn.is-ellipsis {
  color: var(--el-text-color-secondary);
}

html.dark .easy-table__pagination-input {
  border-color: var(--el-border-color-light);
  color: var(--el-text-color-regular);
  background: var(--el-fill-color);
}

html.dark .easy-table__pagination-go {
  border-color: var(--el-border-color-light);
  background: var(--el-fill-color);
  color: var(--el-text-color-regular);
}

html.dark .easy-table__pagination-go:hover {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
  background: rgba(79, 110, 247, 0.1);
}

/* Column Settings */
html.dark .easy-table__column-settings-overlay {
  background: rgba(0, 0, 0, 0.6);
}

html.dark .easy-table__column-settings-panel {
  background: var(--el-bg-color-overlay);
  border-color: var(--el-border-color);
}

html.dark .easy-table__column-settings-header {
  background: var(--el-bg-color-overlay);
  border-bottom-color: var(--el-border-color-light);
}

html.dark .easy-table__column-settings-header h3 {
  color: var(--el-text-color-primary);
}

html.dark .easy-table__column-settings-close {
  color: var(--el-text-color-secondary);
}

html.dark .easy-table__column-settings-close:hover {
  background: var(--el-fill-color);
  color: var(--el-text-color-regular);
}

html.dark .easy-table__column-settings-body {
  background: var(--el-bg-color-overlay);
}

html.dark .easy-table__column-settings-item:hover:not(.is-disabled) {
  background: var(--el-fill-color);
}

html.dark .easy-table__column-settings-item.is-drag-over {
  background: rgba(79, 110, 247, 0.12);
}

html.dark .easy-table__column-settings-drag-handle {
  color: var(--el-text-color-disabled);
}

html.dark .easy-table__column-settings-label {
  color: var(--el-text-color-regular);
}

html.dark .easy-table__column-settings-footer {
  border-top-color: var(--el-border-color-light);
}

html.dark .easy-table__column-settings-btn--reset {
  background: var(--el-fill-color);
  color: var(--el-text-color-regular);
  border-color: var(--el-border-color-light);
}

html.dark .easy-table__column-settings-btn--confirm {
  box-shadow: none;
}

/* Expand Row */
html.dark .easy-table__expand-row {
  background: var(--el-fill-color-lighter);
}

html.dark .easy-table__expand-row td {
  border-bottom-color: var(--el-border-color-light);
}

html.dark .easy-table__expand-cell {
  background: var(--el-fill-color-extra-light);
}

/* Expand & Tree Icons */
html.dark .easy-table__expand-icon {
  color: var(--el-text-color-secondary);
}

html.dark .easy-table__expand-icon:hover {
  color: var(--el-color-primary);
  background: rgba(79, 110, 247, 0.12);
}

html.dark .easy-table__tree-icon {
  color: var(--el-text-color-secondary);
}

html.dark .easy-table__tree-icon:hover {
  color: var(--el-color-primary);
  background: rgba(79, 110, 247, 0.12);
}

/* Summary Row */
html.dark .easy-table__summary-row {
  --easy-table-summary-bg: var(--el-fill-color-lighter);
  border-top-color: var(--el-border-color);
}

html.dark .easy-table__summary-row .easy-table__td {
  color: var(--el-text-color-primary);
}

html.dark .easy-table__td--summary-label {
  color: var(--el-text-color-secondary);
}

html.dark .easy-table__summary-title {
  color: var(--el-text-color-secondary);
}

html.dark .easy-table__summary-sep {
  color: var(--el-text-color-secondary);
}

/* Summary Badges */
html.dark .easy-table__summary-badge--sum {
  color: #5b8dd9;
  background: rgba(91, 141, 217, 0.15);
}

html.dark .easy-table__summary-badge--avg {
  color: #4ecca0;
  background: rgba(78, 204, 160, 0.15);
}

/* Tooltip */
html.dark .easy-table__tooltip {
  background: rgba(30, 30, 30, 0.95);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.4);
}
</style>
