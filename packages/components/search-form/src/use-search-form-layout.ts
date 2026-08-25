import type { ComputedRef } from 'vue'
import type { SearchItem } from './types'

import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'

/**
 * 根据 item span 计算 grid-column，实现响应式栅格。
 *
 * @param item 搜索项配置
 * @returns 作用于 EasyFormItem 的行内样式
 */
export function getGridItemStyle(item: SearchItem): Record<string, string> {
  const span = item.span
  // 范围选择器占 2 列
  if (
    item.type === 'daterange'
    || item.type === 'datetimerange'
    || item.type === 'timerange'
    || item.type === 'range'
  ) {
    return { gridColumn: 'span 2' }
  }
  if (!span || span <= 8)
    return {}
  if (span >= 18)
    return { gridColumn: '1 / -1' }
  return { gridColumn: 'span 2' }
}

/**
 * 按钮区栅格自适应：测量按钮组自然宽度，动态占据 1~N 个网格单元。
 *
 * 监听可见项变化与容器尺寸变化（ResizeObserver）重新测量，卸载时释放监听。
 *
 * @param visibleItems 当前可见的搜索项（展开 / 收起会改变布局）
 */
export function useSearchFormLayout(visibleItems: ComputedRef<SearchItem[]>) {
  /** 按钮区 EasyFormItem 实例引用 */
  const searchActionsRef = ref()
  /** 按钮区需要占据的列数 */
  const spanColumns = ref(1)
  let resizeObserver: ResizeObserver | null = null

  /** 按钮区行内样式 */
  const searchActionsStyle = computed<Record<string, string>>(() =>
    spanColumns.value > 1 ? { gridColumn: `span ${spanColumns.value}` } : { gridColumn: 'auto' },
  )

  /** 测量按钮区自然总宽，计算需要占据的单元格数 */
  async function measureActions() {
    await nextTick()
    const actionsEl = searchActionsRef.value?.$el as HTMLElement | undefined
    const control = actionsEl?.querySelector('.easy-form-item__control') as HTMLElement | null
    const gridEl = actionsEl?.closest('.search-grid-form') as HTMLElement | null
    if (!control || !gridEl)
      return

    // 强制单行、不收缩，测出内容自然宽度
    control.classList.add('is-measuring')
    const children = Array.from(control.children) as HTMLElement[]
    const gap = Number.parseFloat(getComputedStyle(control).columnGap) || 0
    const needWidth = children.reduce((sum, el) => sum + el.offsetWidth, 0) + gap * Math.max(children.length - 1, 0)
    control.classList.remove('is-measuring')

    // 单个单元格的实际宽度与 grid 列信息
    const gridStyle = getComputedStyle(gridEl)
    const columns = gridStyle.gridTemplateColumns.split(' ').filter(Boolean)
    const cellWidth = Number.parseFloat(columns[0]) || 250
    const gridGap = Number.parseFloat(gridStyle.columnGap) || 0
    const maxColumns = Math.max(columns.length, 1)

    // 占 N 列可用宽度 = N * cellWidth + (N - 1) * gridGap，求能容纳内容的最小 N
    const next = Math.min(Math.max(Math.ceil((needWidth + 1 + gridGap) / (cellWidth + gridGap)), 1), maxColumns)
    if (next !== spanColumns.value) {
      spanColumns.value = next
    }
  }

  // 展开/收起变化时重新测量按钮区
  watch(visibleItems, () => measureActions())

  onMounted(() => {
    measureActions()

    // 容器尺寸变化时重新测量
    const actionsEl = searchActionsRef.value?.$el as HTMLElement | undefined
    const gridEl = actionsEl?.closest('.search-grid-form') as HTMLElement | null
    if (gridEl) {
      resizeObserver = new ResizeObserver(() => measureActions())
      resizeObserver.observe(gridEl)
    }
  })

  onUnmounted(() => {
    resizeObserver?.disconnect()
    resizeObserver = null
  })

  return {
    searchActionsRef,
    spanColumns,
    searchActionsStyle,
    measureActions,
  }
}
