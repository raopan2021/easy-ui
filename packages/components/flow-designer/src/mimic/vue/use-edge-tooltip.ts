import type { EdgeTooltipEmits, EdgeTooltipProps } from './edge-tooltip-types'

/**
 * 边操作浮层（EdgeTooltip）组合式逻辑。
 *
 * 从原 EdgeTooltip.vue 抽离：选项数据、定位计算与交互事件。.vue 仅承担组合 + 模板渲染，
 * 保持对外 props / emits 完全一致。
 */
import { computed } from 'vue'

export function useEdgeTooltip(props: EdgeTooltipProps, emit: EdgeTooltipEmits) {
  const options = [
    { icon: 'check', label: '审批节点' },
    { icon: 'serial', label: '互斥网关' },
    { icon: 'parallel', label: '并行网关' },
  ]

  const descMap: Record<string, string> = {
    check: '串行审批，按顺序执行',
    serial: '条件分支，只走一条路径',
    parallel: '并行分支，同时执行多条路径',
  }

  // 企业级风格 inline SVG 图标 — 圆角方形 + 品牌色
  const iconMap: Record<string, string> = {
    check: `<svg viewBox="0 0 40 40" width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="38" height="38" rx="10" fill="#E8F5E9" stroke="#43A047" stroke-width="1.2"/>
    <circle cx="20" cy="20" r="10" fill="#43A047" opacity="0.1"/>
    <path d="M13 20L18 25L27 15" stroke="#43A047" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
    serial: `<svg viewBox="0 0 40 40" width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="38" height="38" rx="10" fill="#FFF3E0" stroke="#EF6C00" stroke-width="1.2"/>
    <circle cx="20" cy="20" r="10" fill="#EF6C00" opacity="0.1"/>
    <path d="M20 10V30M20 10L15 15M20 10L25 15M20 30L15 25M20 30L25 25" stroke="#EF6C00" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    <path d="M10 20H30" stroke="#EF6C00" stroke-width="1.6" stroke-linecap="round"/>
  </svg>`,
    parallel: `<svg viewBox="0 0 40 40" width="36" height="36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="38" height="38" rx="10" fill="#E3F2FD" stroke="#1E88E5" stroke-width="1.2"/>
    <circle cx="20" cy="20" r="10" fill="#1E88E5" opacity="0.1"/>
    <path d="M20 10V30M20 10L15 15M20 10L25 15M20 30L15 25M20 30L25 25" stroke="#1E88E5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`,
  }

  // 仅保留定位相关的 inline style，其余全部交给 CSS class
  const tooltipPosition = computed(() => ({
    top: `${props.position!.y - 80}px`,
    left: `${props.position!.x}px`,
    position: 'absolute' as const,
    pointerEvents: 'auto' as const,
  }))

  function handleTooltipEnter() {
    ;(window as any).isTooltipHovered = true
  }

  function handleTooltipLeave() {
    ;(window as any).isTooltipHovered = false
    emit('close-tooltip')
  }

  function handleClick(item: { icon: string, label: string }) {
    const content: Record<string, any> = {
      label: item.label,
      icon: item.icon === 'check' ? 'between' : item.icon,
    }
    content.tooltipEdge = props.tooltipEdge
    emit('option-click', content)
  }

  return {
    options,
    descMap,
    iconMap,
    tooltipPosition,
    handleTooltipEnter,
    handleTooltipLeave,
    handleClick,
  }
}
