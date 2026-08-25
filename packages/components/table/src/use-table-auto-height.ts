import type { ComputedRef } from 'vue'
import type { TableProps } from './table'

import { onMounted, onUnmounted, ref } from 'vue'

/**
 * 自动高度（autoHeight）composable。
 *
 * 当开启 `autoHeight` 且无显式 `maxHeight` 时，根据视口高度减去
 * 表格顶部偏移（工具栏 / 分页 / 额外偏移）计算 maxHeight，使表格填满剩余空间。
 * 监听窗口 resize 与根元素尺寸变化（ResizeObserver）实时重算。
 *
 * @param props                表格 props
 * @param toolbarLeftVisible   左侧工具栏是否可见
 * @param toolbarRightVisible  右侧工具栏是否可见
 * @param total                总数据量（有数据且分页开启时才计入分页高度）
 */
export function useTableAutoHeight(
  props: TableProps,
  toolbarLeftVisible: ComputedRef<boolean>,
  toolbarRightVisible: ComputedRef<boolean>,
  total: ComputedRef<number>,
) {
  // 根元素 ref（模板绑定 ref="tableRootRef"）
  const tableRootRef = ref<HTMLElement>()

  // 工具栏高度预估：padding 16*2 + 内容 ~36px + border-bottom 1px ≈ 69px
  const TOOLBAR_HEIGHT = 69
  // 分页高度预估：padding 20*2 + 内容 ~36px + border-top 1px ≈ 77px
  const PAGINATION_HEIGHT = 77

  const computedMaxHeight = ref(0)

  function calcAutoMaxHeight() {
    if (!props.autoHeight || !tableRootRef.value) {
      computedMaxHeight.value = 0
      return
    }

    const rect = tableRootRef.value.getBoundingClientRect()
    const viewportHeight = window.innerHeight

    // 表格顶部到视口顶部的距离
    let consumedHeight = rect.top

    // 工具栏
    if (toolbarLeftVisible.value || toolbarRightVisible.value) {
      consumedHeight += TOOLBAR_HEIGHT
    }

    // 分页（有数据且分页开启时才计入）
    if (props.pagination && total.value > 0) {
      consumedHeight += PAGINATION_HEIGHT
    }

    // 额外偏移 + 底部留白 16px
    consumedHeight += (props.autoHeightOffset ?? 0) + 10

    const h = viewportHeight - consumedHeight
    computedMaxHeight.value = Math.max(120, h)
  }

  let resizeObserver: ResizeObserver | null = null

  onMounted(() => {
    if (props.autoHeight) {
      calcAutoMaxHeight()
      // 监听窗口尺寸变化
      window.addEventListener('resize', calcAutoMaxHeight)
      // 监听根元素尺寸变化（如工具栏隐显、分页隐显）
      if (tableRootRef.value) {
        resizeObserver = new ResizeObserver(() => calcAutoMaxHeight())
        resizeObserver.observe(tableRootRef.value)
      }
    }
  })

  onUnmounted(() => {
    window.removeEventListener('resize', calcAutoMaxHeight)
    resizeObserver?.disconnect()
  })

  return { tableRootRef, computedMaxHeight }
}
