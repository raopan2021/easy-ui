import type { Ref } from 'vue'
import type { TableProps } from './table'

import { computed } from 'vue'

/**
 * 布局与根容器样式 composable。
 *
 * 生成根节点类名（`tableClass`）与容器样式（`containerStyle`）。
 * 容器样式优先级：`maxHeight` 显式值 > `autoHeight` 计算值 > 仅横向滚动。
 * 依赖上游 `computedMaxHeight`（来自 useTableAutoHeight）。
 *
 * @param props            表格 props
 * @param computedMaxHeight 自动高度计算值（ref）
 */
export function useTableLayout(props: TableProps, computedMaxHeight: Ref<number>) {
  const tableClass = computed(() => ({
    'easy-table--border': props.border,
    'easy-table--stripe': props.stripe,
    'easy-table--compact': props.compact,
    'easy-table--highlight': props.highlight,
    'easy-table--loading': props.loading,
  }))

  const containerStyle = computed(() => {
    // 显式 maxHeight 优先级最高，覆盖 autoHeight
    if (props.maxHeight != null) {
      return {
        maxHeight: typeof props.maxHeight === 'number' ? `${props.maxHeight}px` : props.maxHeight,
        overflowY: 'auto' as const,
        overflowX: 'auto' as const,
      }
    }

    // 自动高度模式（无显式 maxHeight 时生效）
    if (props.autoHeight) {
      const h = computedMaxHeight.value
      if (h > 0) {
        return {
          maxHeight: `${h}px`,
          overflowY: 'auto' as const,
          overflowX: 'auto' as const,
        }
      }
      return { overflowX: 'auto' as const }
    }

    // 无 maxHeight 也无 autoHeight，只需要横向滚动
    return { overflowX: 'auto' as const }
  })

  return { tableClass, containerStyle }
}
