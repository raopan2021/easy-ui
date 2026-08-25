import type { TabItem } from '../../../easy-ui/src/stores/tabs'

import { nextTick, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTabsStore } from '../../../easy-ui/src/stores/tabs'

/**
 * 工作标签页（Worktab）核心逻辑：滚动控制、右键菜单、关闭/切换命令处理。
 *
 * 将原本内联在 worktab.vue 中的状态、方法、生命周期抽离为独立 composable，
 * 便于单测复用，也让 .vue 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 *
 * 注意：本 composable 内部调用 useRouter() / useTabsStore()，必须在 setup 上下文中执行。
 */
export function useWorktab() {
  const router = useRouter()
  const tabsStore = useTabsStore()

  const scrollRef = ref<HTMLDivElement>()
  const scrollStep = 200
  const canScrollLeft = ref(false)
  const canScrollRight = ref(false)

  function updateScrollState() {
    const el = scrollRef.value
    if (!el)
      return
    canScrollLeft.value = el.scrollLeft > 0
    canScrollRight.value = el.scrollLeft < el.scrollWidth - el.clientWidth - 1
  }

  function scrollBy(offset: number) {
    const el = scrollRef.value
    if (!el)
      return
    el.scrollBy({ left: offset, behavior: 'smooth' })
    setTimeout(updateScrollState, 200)
  }

  function handleWheel(e: WheelEvent) {
    const delta = e.deltaY || e.deltaX
    const el = scrollRef.value
    if (!el)
      return
    const offset = Math.abs(delta) > 40 ? (delta > 0 ? scrollStep : -scrollStep) : delta
    el.scrollBy({ left: offset })
    nextTick(updateScrollState)
  }

  function handleClick(tab: TabItem) {
    if (tab.path === tabsStore.activeTab)
      return
    router.push(tab.path)
  }

  function handleClose(path: string) {
    const target = tabsStore.closeTab(path)
    if (target)
      router.push(target)
  }

  function handleCommand(command: string) {
    const path = tabsStore.activeTab
    switch (command) {
      case 'close-current': {
        const target = tabsStore.closeTab(path)
        if (target)
          router.push(target)
        break
      }
      case 'close-left':
        tabsStore.closeLeftTabs(path)
        break
      case 'close-right':
        tabsStore.closeRightTabs(path)
        break
      case 'close-other':
        tabsStore.closeOtherTabs(path)
        break
      case 'close-all': {
        const target = tabsStore.closeAllTabs()
        if (target)
          router.push(target)
        break
      }
      case 'refresh':
        router.go(0)
        break
    }
  }

  const contextMenu = reactive({
    visible: false,
    x: 0,
    y: 0,
    tab: null as TabItem | null,
  })

  function handleContextMenu(e: MouseEvent, tab: TabItem) {
    contextMenu.visible = true
    contextMenu.x = e.clientX
    contextMenu.y = e.clientY
    contextMenu.tab = tab
  }

  function ctxAction(action: string) {
    const tab = contextMenu.tab
    contextMenu.visible = false
    if (!tab)
      return

    if (tab.path !== tabsStore.activeTab)
      router.push(tab.path)

    nextTick(() => {
      switch (action) {
        case 'close-current': {
          if (!tab.affix) {
            const target = tabsStore.closeTab(tab.path)
            if (target)
              router.push(target)
          }
          break
        }
        case 'close-left':
          tabsStore.closeLeftTabs(tab.path)
          break
        case 'close-right':
          tabsStore.closeRightTabs(tab.path)
          break
        case 'close-other':
          tabsStore.closeOtherTabs(tab.path)
          break
        case 'close-all': {
          const target = tabsStore.closeAllTabs()
          if (target)
            router.push(target)
          break
        }
        case 'refresh':
          router.go(0)
          break
      }
    })
  }

  function scrollToActive() {
    const el = scrollRef.value
    if (!el)
      return
    const activeItem = el.querySelector('.worktab-item.is-active') as HTMLElement
    if (!activeItem)
      return
    const containerRect = el.getBoundingClientRect()
    const itemRect = activeItem.getBoundingClientRect()
    if (itemRect.left < containerRect.left || itemRect.right > containerRect.right) {
      const scrollLeft = el.scrollLeft + itemRect.left - containerRect.left - (containerRect.width - itemRect.width) / 2
      el.scrollTo({ left: scrollLeft, behavior: 'smooth' })
      setTimeout(updateScrollState, 200)
    }
  }

  onMounted(() => {
    nextTick(() => {
      updateScrollState()
      scrollToActive()
    })
  })

  /** 标签页变化后校正滚动状态并滚动到激活项（对外 expose） */
  function onTabsChange() {
    nextTick(() => {
      updateScrollState()
      scrollToActive()
    })
  }

  return {
    scrollRef,
    scrollStep,
    canScrollLeft,
    canScrollRight,
    tabsStore,
    updateScrollState,
    scrollBy,
    handleWheel,
    handleClick,
    handleClose,
    handleCommand,
    contextMenu,
    handleContextMenu,
    ctxAction,
    scrollToActive,
    onTabsChange,
  }
}
