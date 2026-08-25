import type { Slots } from 'vue'
import type { TableColumn, TableEmits, TableProps } from './table'

import { computed, ref, watch } from 'vue'

/**
 * 列配置管理 composable。
 *
 * 负责：本地响应式列（`localColumns`，用于拖拽排序/可见性修改而不污染外部 props）、
 * 可见列计算、列设置面板（显示/隐藏 + 拖拽排序）、固定列 sticky 偏移量计算、
 * 列宽样式生成、合计行 colspan 计算、表格最小宽度计算。
 *
 * 与原始 table.vue 内联实现保持行为一致，仅将逻辑抽离为独立可复用单元。
 *
 * @param props 表格 props
 * @param emit  表格 emit（拖拽排序后回传 column-order-change）
 * @param slots 插槽对象（用于判断 action 插槽是否存在，影响最小宽度）
 */
export function useTableColumns(props: TableProps, emit: TableEmits, slots: Slots | undefined) {
  /** 获取列的实际像素宽度（用于固定列偏移与最小宽度累加） */
  function getColumnActualWidth(col: TableColumn): number {
    if (col.width) {
      return typeof col.width === 'number' ? col.width : parseInt(col.width as string, 10)
    }
    // 如果没有设置宽度，使用 minWidth 或默认值
    if (col.minWidth) {
      return typeof col.minWidth === 'number' ? col.minWidth : parseInt(col.minWidth as string, 10)
    }
    return 0 // 0 表示 auto
  }

  // 本地列配置（用于响应式修改，避免直接改动 props.columns）
  const localColumns = ref<TableColumn[]>([])

  // 监听 props.columns 变化，浅层同步到本地（仅比对 prop 列表 + 列数，避免内部改动被重置）
  watch(
    () => `${props.columns.map(c => c.prop).join(',')}:${props.columns.length}`,
    () => {
      localColumns.value = [...props.columns.map(col => ({ ...col }))]
    },
    { immediate: true },
  )

  /** 过滤掉 visible === false 的列 */
  const visibleColumns = computed(() => localColumns.value.filter(col => col.visible !== false))

  /** 列设置面板显隐状态 */
  const showColumnSettingsPanel = ref(false)

  /** 拖拽状态（当前拖拽项 / 拖拽悬停项索引） */
  const dragState = ref({
    draggingIndex: -1,
    dragOverIndex: -1,
  })

  /** 判断列是否可拖动（未显式设置 drag=false 默认可拖） */
  function isColumnDraggable(col: TableColumn) {
    return col.drag !== false
  }

  /** 拖拽开始：记录源索引并写入 dataTransfer */
  function handleDragStart(event: DragEvent, index: number) {
    dragState.value.draggingIndex = index
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', String(index))
    }
  }

  /** 拖拽经过：阻止默认以允许放置，并更新悬停索引 */
  function handleDragOver(event: DragEvent, index: number) {
    event.preventDefault()
    if (dragState.value.draggingIndex !== index) {
      dragState.value.dragOverIndex = index
    }
  }

  /** 放置：交换列位置并回传最新列顺序 */
  function handleDrop(event: DragEvent, targetIndex: number) {
    event.preventDefault()
    const sourceIndex = dragState.value.draggingIndex

    if (sourceIndex === -1 || sourceIndex === targetIndex) {
      return
    }

    // 交换列位置
    const [removed] = localColumns.value.splice(sourceIndex, 1)
    localColumns.value.splice(targetIndex, 0, removed)

    // 更新父组件的列配置
    emit('column-order-change', [...localColumns.value])

    dragState.value.draggingIndex = -1
    dragState.value.dragOverIndex = -1
  }

  /** 拖拽结束：清空拖拽状态 */
  function handleDragEnd() {
    dragState.value.draggingIndex = -1
    dragState.value.dragOverIndex = -1
  }

  /** 保存原始可见性配置，用于重置 */
  const originalColumnVisibility = ref<Record<string, boolean>>({})

  watch(
    () => props.columns,
    (cols) => {
      originalColumnVisibility.value = cols.reduce(
        (acc, col) => {
          acc[col.prop] = col.visible !== false
          return acc
        },
        {} as Record<string, boolean>,
      )
    },
    { immediate: true },
  )

  /** 切换单列显示/隐藏 */
  function handleColumnVisibleChange(prop: string, event: Event) {
    const target = event.target as HTMLInputElement
    const col = localColumns.value.find(c => c.prop === prop)
    if (col) {
      col.visible = target.checked
    }
  }

  /** 重置所有列可见性到初始状态 */
  function resetColumnVisibility() {
    localColumns.value.forEach((col) => {
      col.visible = originalColumnVisibility.value[col.prop] !== false
    })
  }

  /**
   * 计算固定列的 left/right 偏移量（sticky 定位需要）。
   * 注意：selection/index/expand 等前置列不占用固定列偏移空间，
   * 固定列偏移只在同方向的固定列之间累加。
   */
  const fixedOffsets = computed<Record<string, number>>(() => {
    const offsets: Record<string, number> = {}
    const cols = visibleColumns.value

    // ---- fixed-left：从左到右，在 fixed-left 列之间累加偏移 ----
    let leftOffset = 0
    for (const col of cols) {
      if (col.fixed === 'left') {
        offsets[col.prop] = leftOffset
        leftOffset += getColumnActualWidth(col)
      }
    }

    // ---- fixed-right：从右到左，在 fixed-right 列之间累加偏移 ----
    let rightOffset = 0
    for (let i = cols.length - 1; i >= 0; i--) {
      const col = cols[i]
      if (col.fixed === 'right') {
        offsets[col.prop] = rightOffset
        rightOffset += getColumnActualWidth(col)
      }
    }

    return offsets
  })

  /** 生成单个列的 style（宽度/最小宽度 + 固定列 left/right 偏移） */
  function getColStyle(col: TableColumn) {
    const style: Record<string, string> = {}
    if (col.width) {
      style.width = typeof col.width === 'number' ? `${col.width}px` : col.width
      style.maxWidth = style.width // 限制最大宽度，确保 ellipsis 生效
    }
    else {
      // 没传 width 时给个默认最小宽度，防止列被压缩
      style.minWidth = col.minWidth
        ? (typeof col.minWidth === 'number' ? `${col.minWidth}px` : col.minWidth)
        : '120px'
    }
    if (col.minWidth)
      style.minWidth = typeof col.minWidth === 'number' ? `${col.minWidth}px` : col.minWidth

    // 固定列：注入 left / right 偏移，确保多列固定时不互相遮挡
    if (col.fixed === 'left') {
      style.left = `${fixedOffsets.value[col.prop] ?? 0}px`
    }
    else if (col.fixed === 'right') {
      style.right = `${fixedOffsets.value[col.prop] ?? 0}px`
    }

    return style
  }

  /** 总列数（用于合计行 colspan 计算） */
  const totalColCount = computed(() => {
    let count = visibleColumns.value.length
    // 树形模式下有树展开列，否则有普通展开列
    if (props.tree)
      count++
    else if (props.expandable)
      count++
    if (props.selectable)
      count++
    if (props.showIndex)
      count++
    return count
  })

  /** 计算表格最小宽度（所有列宽度之和 + 额外列宽度），确保列宽不被压缩 */
  const tableMinWidth = computed(() => {
    let total = 0
    for (const col of visibleColumns.value) {
      total += getColumnActualWidth(col)
    }
    // 额外列：展开列/树展开列、选择列、序号列
    if (props.tree || props.expandable)
      total += 32
    if (props.selectable)
      total += 56
    if (props.showIndex)
      total += 56
    // 操作列预估宽度
    if (slots?.action)
      total += 120
    return total > 0 ? `${total}px` : undefined
  })

  return {
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
  }
}
