<script setup lang="ts">
import type { TabItem } from '@/stores/tabs'
import { nextTick, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useTabsStore } from '@/stores/tabs'

defineOptions({ name: 'XlyWorktab' })

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

  if (tab.path !== tabsStore.activeTab) {
    router.push(tab.path)
  }

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

defineExpose({
  onTabsChange: () =>
    nextTick(() => {
      updateScrollState()
      scrollToActive()
    }),
})
</script>

<template>
  <div class="xly-worktab">
    <!-- 左滚动按钮 -->
    <button v-show="canScrollLeft" class="worktab-scroll-btn worktab-scroll-btn--left" @click="scrollBy(-scrollStep)">
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="15 18 9 12 15 6" />
      </svg>
    </button>

    <!-- 标签页内容 -->
    <div ref="scrollRef" class="worktab-scroll" @wheel.prevent="handleWheel">
      <TransitionGroup name="tab-fade" tag="div" class="worktab-list">
        <div
          v-for="tab in tabsStore.tabs"
          :key="tab.path"
          class="worktab-item"
          :class="{
            'is-active': tab.path === tabsStore.activeTab,
            'is-affix': tab.affix,
          }"
          @click="handleClick(tab)"
          @contextmenu.prevent="(e) => handleContextMenu(e, tab)"
        >
          <!-- 标题 -->
          <span class="worktab-item__title">{{ tab.title }}</span>
          <!-- 关闭按钮 -->
          <button v-if="!tab.affix" class="worktab-item__close" @click.stop="handleClose(tab.path)">
            <svg
              viewBox="0 0 24 24"
              width="10"
              height="10"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>

    <!-- 右滚动按钮 -->
    <button v-show="canScrollRight" class="worktab-scroll-btn worktab-scroll-btn--right" @click="scrollBy(scrollStep)">
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>

    <!-- 分隔线 -->
    <div class="worktab-divider" />

    <!-- 操作按钮 -->
    <el-dropdown trigger="click" @command="handleCommand">
      <button class="worktab-action-btn" title="更多操作">
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
        >
          <circle cx="12" cy="5" r="1.2" fill="currentColor" />
          <circle cx="12" cy="12" r="1.2" fill="currentColor" />
          <circle cx="12" cy="19" r="1.2" fill="currentColor" />
        </svg>
      </button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="refresh">
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="margin-right: 8px"
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            刷新当前
          </el-dropdown-item>
          <el-dropdown-item command="close-current" divided>
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="margin-right: 8px"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            关闭当前
          </el-dropdown-item>
          <el-dropdown-item command="close-left">
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="margin-right: 8px"
            >
              <polyline points="15 18 9 12 15 6" />
              <line x1="3" y1="12" x2="21" y2="12" />
            </svg>
            关闭左侧
          </el-dropdown-item>
          <el-dropdown-item command="close-right">
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="margin-right: 8px"
            >
              <polyline points="9 18 15 12 9 6" />
              <line x1="3" y1="12" x2="21" y2="12" />
            </svg>
            关闭右侧
          </el-dropdown-item>
          <el-dropdown-item command="close-other">
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="margin-right: 8px"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
            关闭其他
          </el-dropdown-item>
          <el-dropdown-item command="close-all">
            <svg
              viewBox="0 0 24 24"
              width="14"
              height="14"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              style="margin-right: 8px"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            关闭全部
          </el-dropdown-item>
        </el-dropdown-menu>
      </template>
    </el-dropdown>
  </div>

  <!-- 右键菜单 -->
  <Teleport to="body">
    <Transition name="ctx-fade">
      <div
        v-if="contextMenu.visible"
        class="worktab-ctx"
        :style="{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }"
        @click.stop
      >
        <div
          class="worktab-ctx__item"
          :class="{ 'is-disabled': contextMenu.tab?.affix }"
          @click="ctxAction('close-current')"
        >
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          关闭
        </div>
        <div class="worktab-ctx__item" @click="ctxAction('close-left')">
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="15 18 9 12 15 6" />
            <line x1="3" y1="12" x2="21" y2="12" />
          </svg>
          关闭左侧
        </div>
        <div class="worktab-ctx__item" @click="ctxAction('close-right')">
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="9 18 15 12 9 6" />
            <line x1="3" y1="12" x2="21" y2="12" />
          </svg>
          关闭右侧
        </div>
        <div class="worktab-ctx__divider" />
        <div class="worktab-ctx__item" @click="ctxAction('close-other')">
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
          关闭其他
        </div>
        <div class="worktab-ctx__item" @click="ctxAction('close-all')">
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          关闭全部
        </div>
        <div class="worktab-ctx__divider" />
        <div class="worktab-ctx__item" @click="ctxAction('refresh')">
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="23 4 23 10 17 10" />
            <polyline points="1 20 1 14 7 14" />
            <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
          </svg>
          刷新
        </div>
      </div>
    </Transition>
    <div v-if="contextMenu.visible" class="worktab-ctx-overlay" @click="contextMenu.visible = false" />
  </Teleport>
</template>

<style scoped lang="scss">
@use '../../styles/tokens' as *;

$radius: 6px;
$transition: all 0.15s ease;

.xly-worktab {
  display: flex;
  align-items: center;
  height: 46px;
  background: var(--el-bg-color);
  border-bottom: 1px solid $border-light;
  padding: 0 8px;
  flex-shrink: 0;
  gap: 0;
}

.worktab-scroll {
  flex: 1;
  overflow: hidden;
  min-width: 0;
  height: 100%;
}

.worktab-list {
  display: flex;
  align-items: center;
  height: 100%;
  gap: 8px;
  padding: 0 4px;
  white-space: nowrap;
}

// 滚动按钮
.worktab-scroll-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: none;
  border-radius: 5px;
  background: transparent;
  color: var(--el-text-color-placeholder);
  cursor: pointer;
  flex-shrink: 0;
  transition: $transition;

  &:hover {
    background: var(--el-fill-color-light);
    color: var(--el-text-color-primary);
  }

  &:active {
    transform: scale(0.92);
  }
}

// 标签项 — 独立卡片样式
.worktab-item {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  padding: 0 10px 0 10px;
  border: 1px solid $border-light;
  border-radius: $radius;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  user-select: none;
  transition: $transition;
  background: var(--el-bg-color);
  flex-shrink: 0;
  max-width: 160px;

  .worktab-item__title {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100px;
    line-height: 1;
  }

  .worktab-item__close {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: inherit;
    cursor: pointer;
    flex-shrink: 0;
    opacity: 0;
    transition: $transition;
    padding: 0;
    margin-left: 2px;

    &:hover {
      background: #fee2e2;
      color: var(--el-color-danger);
    }
  }

  // 悬浮态
  &:hover:not(.is-active) {
    border-color: var(--el-border-color);
    color: var(--el-text-color-primary);

    .worktab-item__close {
      opacity: 0.6;
    }
  }

  // 激活态 — 蓝色边框 + 蓝色文字
  &.is-active {
    background: $white;
    color: $brand-blue;
    font-weight: 500;
    border-color: $brand-blue;
    box-shadow: 0 0 0 1px $primary-bg-strong;

    .worktab-item__close {
      opacity: 0.5;
      color: var(--el-text-color-placeholder);

      &:hover {
        opacity: 1;
        background: #fee2e2;
        color: var(--el-color-danger);
      }
    }
  }

  // 固定标签
  &.is-affix {
    padding-right: 10px;
  }
}

// 悬停/激活时显示关闭按钮
.worktab-item:hover .worktab-item__close,
.worktab-item.is-active .worktab-item__close {
  opacity: 0.5;
}

// 分隔线
.worktab-divider {
  width: 1px;
  height: 18px;
  background: $border-light;
  margin: 0 8px;
  flex-shrink: 0;
}

// 操作按钮
.worktab-action-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  border: none;
  border-radius: 5px;
  background: transparent;
  color: var(--el-text-color-placeholder);
  cursor: pointer;
  transition: $transition;

  &:hover {
    background: var(--el-fill-color-light);
    color: var(--el-text-color-primary);
  }

  &:active {
    transform: scale(0.92);
  }
}

// 标签动画
.tab-fade-enter-active {
  transition: all 0.18s ease;
}
.tab-fade-leave-active {
  transition: all 0.12s ease;
}
.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(-4px);
}
.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

// 右键菜单遮罩
.worktab-ctx-overlay {
  position: fixed;
  inset: 0;
  z-index: 2999;
}

// 右键菜单
.worktab-ctx {
  position: fixed;
  z-index: 3000;
  min-width: 146px;
  padding: 5px;
  background: var(--el-bg-color);
  border: 1px solid $border-light;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  .worktab-ctx__item {
    display: flex;
    align-items: center;
    gap: 8px;
    height: 32px;
    padding: 0 10px;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    border-radius: 5px;
    transition: $transition;
    white-space: nowrap;

    svg {
      color: var(--el-text-color-placeholder);
      flex-shrink: 0;
      transition: $transition;
    }

    &:hover:not(.is-disabled) {
      background: $brand-blue-light;
      color: $brand-blue;

      svg {
        color: $brand-blue;
      }
    }

    &.is-disabled {
      color: var(--el-text-color-placeholder);
      cursor: not-allowed;
      svg {
        color: var(--el-text-color-placeholder);
      }
    }
  }

  .worktab-ctx__divider {
    height: 1px;
    background: $border-light;
    margin: 4px 6px;
  }
}

.ctx-fade-enter-active {
  transition: all 0.1s ease;
}
.ctx-fade-leave-active {
  transition: all 0.08s ease;
}
.ctx-fade-enter-from {
  opacity: 0;
  transform: scale(0.95) translateY(-3px);
}
.ctx-fade-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>

<style lang="scss">
html.dark .xly-worktab {
  border-bottom-color: var(--el-border-color);
}
html.dark .xly-worktab__scroll-btn,
html.dark .xly-worktab__action-btn {
  color: var(--el-text-color-secondary);
}
html.dark .xly-worktab__scroll-btn:hover,
html.dark .xly-worktab__action-btn:hover {
  color: var(--el-text-color-primary);
  background: var(--el-fill-color-light);
}
html.dark .xly-worktab__item {
  color: var(--el-text-color-regular);
  border-color: var(--el-border-color);
}
html.dark .xly-worktab__item:hover:not(.is-active) {
  border-color: var(--el-border-color-darker);
  color: var(--el-text-color-primary);
}
html.dark .xly-worktab__item--close:hover {
  background: rgba(239, 68, 68, 0.15);
}
html.dark .xly-worktab__divider {
  background: var(--el-border-color);
}
html.dark .xly-worktab__ctx {
  background: var(--el-bg-color-overlay);
  border-color: var(--el-border-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
html.dark .xly-worktab__ctx__item {
  color: var(--el-text-color-regular);
}
html.dark .xly-worktab__ctx__item svg {
  color: var(--el-text-color-secondary);
}
html.dark .xly-worktab__ctx__item:hover:not(.is-disabled) {
  background: rgba(79, 110, 247, 0.12);
  color: var(--el-color-primary);
}
html.dark .xly-worktab__ctx__divider {
  background: var(--el-border-color);
}
</style>
