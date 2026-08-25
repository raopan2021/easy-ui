import type { Ref } from 'vue'

import type { TabPaneInfo, TabsEmits, TabsProps } from './tabs'
import { computed, nextTick, onMounted, onUpdated, ref, watch } from 'vue'

/**
 * Tabs 导航（滚动 + 活动指示条 + 点击）逻辑与派生样式。
 *
 * 将原本内联在 tabs.vue 中的导航滚动状态、活动指示条计算、点击切换、生命周期
 * 刷新布局等逻辑抽离为独立 composable，让 .vue 仅承担「组合 + 模板」职责
 * （对齐 markdown 组件拆分规范）。
 *
 * @param props Tabs props（需传入响应式对象）
 * @param emit  Tabs 事件触发函数（类型直接为 `TabsEmits` callable interface）
 * @param panes 由 useTabsPanes 提供的面板列表 ref（活动指示条需按面板定位）
 */
export function useTabsNav(props: TabsProps, emit: TabsEmits, panes: Ref<TabPaneInfo[]>) {
  // ──── 导航相关 ref（模板 ref，必须在 .vue 模板中绑定）────
  /** 滚动容器（overflow:hidden 的外层） */
  const navScrollRef = ref<HTMLDivElement>()
  /** 导航内层（含活动指示条，用于测量偏移） */
  const navRef = ref<HTMLDivElement>()
  /** 当前横向滚动偏移量 */
  const scrollOffset = ref(0)
  /** 是否还能继续向右滚动 */
  const canScrollRight = ref(false)
  /** 各面板项 DOM 引用（uid → 元素），用于活动指示条定位 */
  const itemRefs: Record<number, HTMLElement> = {}

  /** 单次滚动步长 */
  const scrollStep = 200

  // ──── 派生类名 / 样式 ────
  /** 根节点组合类名（类型 / 尺寸 / 位置） */
  const tabsClass = computed(() => [
    `easy-tabs--${props.type}`,
    `easy-tabs--${props.size}`,
    `easy-tabs--${props.tabPosition}`,
  ])

  /** 活动指示条样式（非 line 类型隐藏） */
  const activeBarStyle = computed(() => {
    if (props.type !== 'line')
      return { display: 'none' }
    return {
      backgroundColor: props.activeColor,
    }
  })

  // ──── 模板 ref 回调：收集面板项 DOM ────
  function setItemRef(el: any, uid: number) {
    if (el) {
      itemRefs[uid] = el as HTMLElement
    }
  }

  // ──── 交互 ────
  /** 点击选项卡：禁用态忽略；切换时 emit update:modelValue + tab-change；始终 emit tab-click */
  function handleTabClick(pane: TabPaneInfo) {
    if (pane.disabled)
      return
    if (pane.name !== props.modelValue) {
      emit('update:modelValue', pane.name)
      emit('tab-change', pane.name)
    }
    emit('tab-click', pane)
  }

  /** 滚轮横向滚动（仅 scrollable 时） */
  function handleWheel(e: WheelEvent) {
    if (!props.scrollable)
      return
    const delta = e.deltaY || e.deltaX
    scrollBy(Math.abs(delta) > 40 ? (delta > 0 ? scrollStep : -scrollStep) : delta)
  }

  /** 按偏移量滚动并夹紧边界、更新可滚动态 */
  function scrollBy(offset: number) {
    const el = navScrollRef.value
    if (!el)
      return
    const maxOffset = Math.max(0, el.scrollWidth - el.clientWidth)
    scrollOffset.value = Math.min(maxOffset, Math.max(0, scrollOffset.value + offset))
    updateScrollState()
  }

  /** 更新「是否还能向右滚动」状态 */
  function updateScrollState() {
    const el = navScrollRef.value
    if (!el)
      return
    canScrollRight.value = scrollOffset.value < el.scrollWidth - el.clientWidth
  }

  /** 更新活动指示条（line 类型）：定位到当前激活面板项 */
  function updateActiveBar() {
    if (props.type !== 'line' || !navRef.value)
      return
    const activeIdx = panes.value.findIndex(p => p.name === props.modelValue)
    if (activeIdx === -1)
      return

    const bar = navRef.value.querySelector('.easy-tabs__active-bar') as HTMLElement
    const item = itemRefs[panes.value[activeIdx]!.uid]
    if (!bar || !item)
      return

    const navRect = navRef.value.getBoundingClientRect()
    const itemRect = item.getBoundingClientRect()

    bar.style.left = `${itemRect.left - navRect.left + scrollOffset.value}px`
    bar.style.width = `${itemRect.width}px`
  }

  /** 刷新布局（滚动态 + 活动指示条），延后到 DOM 更新后 */
  function refreshLayout() {
    nextTick(() => {
      updateScrollState()
      updateActiveBar()
    })
  }

  // ──── 生命周期：挂载 / 更新 / 激活态或类型变化均刷新布局 ────
  onMounted(() => {
    refreshLayout()
  })

  onUpdated(() => {
    refreshLayout()
  })

  watch(
    () => props.modelValue,
    () => {
      refreshLayout()
    },
  )

  watch(
    () => props.type,
    () => {
      refreshLayout()
    },
  )

  return {
    navScrollRef,
    navRef,
    scrollOffset,
    canScrollRight,
    scrollStep,
    tabsClass,
    activeBarStyle,
    setItemRef,
    handleTabClick,
    handleWheel,
    scrollBy,
  }
}
