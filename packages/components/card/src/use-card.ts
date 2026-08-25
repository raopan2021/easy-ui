import type { CardEmits, CardProps } from './types'

import { computed, onBeforeUnmount, ref, useSlots, watch } from 'vue'

/**
 * 卡片组件核心逻辑 composable。
 *
 * 将原本内联在 card.vue 中的「头部插槽判定 / 受控高度与拖拽高度合并 /
 * 根节点类名与样式 / 底部拖拽改高」抽离为独立 composable，
 * 便于单测复用，也让 .vue 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 *
 * @param props 组件 props（需传入响应式对象，computed 会自动追踪依赖）
 * @param emit  组件 emit（callable 形式，见 CardEmits）
 */
export function useCard(props: CardProps, emit: CardEmits) {
  /** 插槽对象（用于检测 header / icon 插槽，决定是否渲染头部区域） */
  const slots = useSlots()

  /** 是否渲染头部区域（标题 / icon 插槽 / header 插槽 任一存在即渲染） */
  const hasHeader = computed(() => props.title || slots.header || slots.icon)

  /** 卡片根节点 ref（拖拽起点高度回退取值用） */
  const cardEl = ref<HTMLElement>()

  /** 拖拽产生的内部高度（外部 v-model:height 未绑定时使用） */
  const dragHeight = ref<number | null>(null)

  /** 实际生效高度：外部受控 height 优先，否则使用内部拖拽值 */
  const currentHeight = computed(() => props.height ?? dragHeight.value)

  watch(() => props.height, (value) => {
    // 外部受控后清除内部拖拽值，避免残留旧高度
    if (value !== undefined)
      dragHeight.value = null
  })

  /** 根节点组合类名（状态 / 阴影时机 / 自定义 class） */
  const cardClass = computed(() => [
    {
      'is-rounded': props.rounded,
      'is-bordered': props.bordered,
      'is-disabled': props.disabled,
      'is-hoverable': props.hoverable,
      'is-fill': props.fill,
      'is-resizable': props.resizable,
    },
    `easy-card--shadow-${props.shadow}`,
  ])

  /** 根节点行内样式（禁用态透明 + 生效高度） */
  const cardStyle = computed(() => {
    const style: Record<string, string> = {}
    if (props.disabled) {
      style.opacity = '0.5'
      style.cursor = 'not-allowed'
    }
    if (currentHeight.value != null) {
      style.height = `${currentHeight.value}px`
      // 与 fill 组合时显式高度优先，避免 flex 拉伸覆盖拖拽结果
      style.flexGrow = '0'
      style.flexShrink = '0'
    }
    return style
  })

  // ──── 高度拖拽 ────
  let dragging = false
  let startY = 0
  let startHeight = 0

  /** 拖拽起点：记录起始坐标与起始高度，并绑定全局鼠标事件 */
  function onResizeStart(e: MouseEvent) {
    if (props.disabled)
      return
    e.preventDefault()
    dragging = true
    startY = e.clientY
    startHeight = currentHeight.value ?? cardEl.value?.offsetHeight ?? 0
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onResizeMove)
    document.addEventListener('mouseup', onResizeEnd)
  }

  /** 拖拽过程：按位移实时更新高度，并约束到 min/max 区间，同步 emit */
  function onResizeMove(e: MouseEvent) {
    if (!dragging)
      return
    let h = startHeight + e.clientY - startY
    if (props.minHeight != null)
      h = Math.max(h, props.minHeight)
    if (props.maxHeight != null)
      h = Math.min(h, props.maxHeight)
    dragHeight.value = h
    emit('update:height', h)
    emit('resize', h)
  }

  /** 拖拽结束：解绑全局事件并恢复选区 */
  function onResizeEnd() {
    if (!dragging)
      return
    dragging = false
    document.body.style.userSelect = ''
    document.removeEventListener('mousemove', onResizeMove)
    document.removeEventListener('mouseup', onResizeEnd)
  }

  /** 组件卸载时清理全局事件，避免内存泄漏 */
  onBeforeUnmount(() => {
    if (dragging) {
      document.body.style.userSelect = ''
      document.removeEventListener('mousemove', onResizeMove)
      document.removeEventListener('mouseup', onResizeEnd)
    }
  })

  return {
    cardEl,
    hasHeader,
    cardClass,
    cardStyle,
    onResizeStart,
  }
}
