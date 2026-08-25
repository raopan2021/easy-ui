import type { Slots } from 'vue'
import type { TableEmits, TableProps } from './table'

import { computed } from 'vue'

/**
 * 工具栏显示控制 + 刷新/导出按钮事件 composable。
 *
 * 根据 props 与插槽是否存在，决定左右工具栏区域是否渲染：
 * - 左侧：标题 / toolbar 插槽 / toolbar-left 插槽
 * - 右侧：刷新 / 导出 / 列设置 按钮 / toolbar-right 插槽
 *
 * @param props 表格 props
 * @param emit  表格 emit（回传 refresh / export）
 * @param slots 插槽对象
 */
export function useTableToolbar(props: TableProps, emit: TableEmits, slots: Slots | undefined) {
  // 左侧是否有内容可显示
  const toolbarLeftVisible = computed(() => {
    return !!(props.title || slots?.toolbar || slots?.['toolbar-left'])
  })

  // 右侧是否有内容可显示
  const toolbarRightVisible = computed(() => {
    return !!(props.showRefresh || props.showExport || props.showColumnSettings || slots?.['toolbar-right'])
  })

  /** 刷新按钮：回传 refresh 事件 */
  function handleRefresh() {
    emit('refresh')
  }

  /** 导出按钮：回传 export 事件 */
  function handleExport() {
    emit('export')
  }

  return { toolbarLeftVisible, toolbarRightVisible, handleRefresh, handleExport }
}
