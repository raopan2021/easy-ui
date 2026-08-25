import type { DropdownProps } from './types'

import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'

/**
 * 下拉菜单的显隐、定位、触发器交互与全局监听逻辑。
 *
 * 将原本内联在 dropdown.vue 中的大量事件处理与生命周期监听抽离为独立 composable，
 * 让 .vue 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 *
 * @param props 下拉菜单 props（需传入响应式对象，composable 内部 computed/watch 会自动追踪依赖）
 */
export function useDropdown(props: DropdownProps) {
  /** 菜单是否可见 */
  const visible = ref(false)
  /** 触发器 DOM 引用（用于计算菜单位置） */
  const triggerRef = ref<HTMLElement | null>(null)
  /** 菜单 DOM 引用（用于点击内部/外部判断） */
  const menuRef = ref<HTMLElement | null>(null)
  /** 菜单 fixed 定位坐标与最小宽度 */
  const menuPosition = ref({ top: 0, left: 0, minWidth: 0 })

  const menuStyle = computed(() => ({
    // fixed 定位：脱离文档流，不受祖先 overflow:hidden 裁剪，且避免 Teleport 导致
    // slot 内组件（DropdownItem）的事件监听器丢失（onClick 无法触发）
    position: 'fixed' as const,
    top: `${menuPosition.value.top}px`,
    left: `${menuPosition.value.left}px`,
    minWidth: `${menuPosition.value.minWidth}px`,
    zIndex: 2050,
  }))

  function updatePosition() {
    if (!triggerRef.value)
      return
    const rect = triggerRef.value.getBoundingClientRect()
    menuPosition.value = {
      top: rect.bottom + 4,
      left: rect.left,
      minWidth: rect.width,
    }
  }

  function show() {
    visible.value = true
    nextTick(updatePosition)
  }

  function hide() {
    visible.value = false
  }

  function toggle() {
    if (visible.value) {
      hide()
    }
    else {
      show()
    }
  }

  function handleClick(event: MouseEvent) {
    if (props.trigger === 'click') {
      // 点击菜单内部（菜单项）时不触发 toggle：菜单项由 handleMenuClick 负责关闭，
      // 否则 hide() 后事件冒泡到触发器会再次 toggle 打开菜单
      if (menuRef.value?.contains(event.target as Node))
        return
      toggle()
    }
  }

  let hoverTimer: ReturnType<typeof setTimeout> | null = null

  function clearHoverTimer() {
    if (hoverTimer) {
      clearTimeout(hoverTimer)
      hoverTimer = null
    }
  }

  function handleMouseEnter() {
    if (props.trigger === 'hover') {
      clearHoverTimer()
      show()
    }
  }

  function handleMouseLeave() {
    if (props.trigger === 'hover') {
      hoverTimer = setTimeout(hide, 150)
    }
  }

  function handleMenuMouseEnter() {
    if (props.trigger === 'hover') {
      clearHoverTimer()
    }
  }

  function handleMenuMouseLeave() {
    if (props.trigger === 'hover') {
      hoverTimer = setTimeout(hide, 150)
    }
  }

  function handleMenuClick(event: MouseEvent) {
    // 点击菜单项（选项）后关闭；点击菜单自身空白区域不关闭
    if (event.target !== menuRef.value) {
      hide()
    }
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as Element | null
    if (!target)
      return
    if (triggerRef.value?.contains(target))
      return
    if (menuRef.value?.contains(target))
      return
    hide()
  }

  function handleScroll() {
    if (visible.value) {
      hide()
    }
  }

  onMounted(() => {
    document.addEventListener('click', handleClickOutside, true)
    window.addEventListener('scroll', handleScroll, true)
  })

  onUnmounted(() => {
    document.removeEventListener('click', handleClickOutside, true)
    window.removeEventListener('scroll', handleScroll, true)
    clearHoverTimer()
  })

  return {
    visible,
    triggerRef,
    menuRef,
    menuStyle,
    show,
    hide,
    toggle,
    isOpen: () => visible.value,
    handleClick,
    handleMouseEnter,
    handleMouseLeave,
    handleMenuMouseEnter,
    handleMenuMouseLeave,
    handleMenuClick,
  }
}
