import { reactive } from 'vue'

/** Ellipsis Tooltip 悬浮提示的响应式状态 */
export interface TooltipState {
  /** 是否可见 */
  visible: boolean
  /** 提示内容文本 */
  content: string
  /** 触发位置 X（clientX） */
  x: number
  /** 触发位置 Y（clientY） */
  y: number
}

/**
 * 单元格 ellipsis 省略文本的悬浮提示。
 *
 * 当列配置了 `ellipsis` 且文本被截断时，鼠标移入单元格显示跟随鼠标的浮层，
 * 移出后隐藏，移动时同步浮层位置（通过 Teleport 渲染到 body）。
 *
 * @returns tooltipState 状态对象与显隐/定位处理函数
 */
export function useTableTooltip() {
  const tooltipState = reactive<TooltipState>({
    visible: false,
    content: '',
    x: 0,
    y: 0,
  })

  /** 显示提示：记录内容与触发坐标 */
  function showCellTooltip(event: MouseEvent, content: string) {
    tooltipState.content = content
    tooltipState.x = event.clientX
    tooltipState.y = event.clientY
    tooltipState.visible = true
  }

  /** 隐藏提示 */
  function hideCellTooltip() {
    tooltipState.visible = false
  }

  /** 鼠标移动时同步浮层位置 */
  function updateTooltipPosition(event: MouseEvent) {
    tooltipState.x = event.clientX
    tooltipState.y = event.clientY
  }

  return { tooltipState, showCellTooltip, hideCellTooltip, updateTooltipPosition }
}
