<script setup lang="ts">
import { useWorktab } from './use-worktab'

// 保持对外类型导出兼容
export type { WorktabExpose } from './types'

defineOptions({ name: 'EasyWorktab' })

const {
  scrollRef,
  scrollStep,
  canScrollLeft,
  canScrollRight,
  tabsStore,
  scrollBy,
  handleWheel,
  handleClick,
  handleClose,
  handleCommand,
  contextMenu,
  handleContextMenu,
  ctxAction,
  onTabsChange,
} = useWorktab()

defineExpose({
  onTabsChange,
})
</script>

<template>
  <div class="easy-worktab">
    <!-- 左滚动按钮 -->
    <button v-show="canScrollLeft" class="worktab-scroll-btn worktab-scroll-btn--left" @click="scrollBy(-scrollStep)">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"
        stroke-linecap="round" stroke-linejoin="round">
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
            <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" stroke-width="2.5"
              stroke-linecap="round" stroke-linejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      </TransitionGroup>
    </div>

    <!-- 右滚动按钮 -->
    <button v-show="canScrollRight" class="worktab-scroll-btn worktab-scroll-btn--right" @click="scrollBy(scrollStep)">
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.5"
        stroke-linecap="round" stroke-linejoin="round">
        <polyline points="9 18 15 12 9 6" />
      </svg>
    </button>

    <!-- 分隔线 -->
    <div class="worktab-divider" />

    <!-- 操作按钮 -->
    <el-dropdown trigger="click" @command="handleCommand">
      <button class="worktab-action-btn" title="更多操作">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
          stroke-linecap="round">
          <circle cx="12" cy="5" r="1.2" fill="currentColor" />
          <circle cx="12" cy="12" r="1.2" fill="currentColor" />
          <circle cx="12" cy="19" r="1.2" fill="currentColor" />
        </svg>
      </button>
      <template #dropdown>
        <el-dropdown-menu>
          <el-dropdown-item command="refresh">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px">
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            刷新当前
          </el-dropdown-item>
          <el-dropdown-item command="close-current" divided>
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
            关闭当前
          </el-dropdown-item>
          <el-dropdown-item command="close-left">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px">
              <polyline points="15 18 9 12 15 6" />
              <line x1="3" y1="12" x2="21" y2="12" />
            </svg>
            关闭左侧
          </el-dropdown-item>
          <el-dropdown-item command="close-right">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px">
              <polyline points="9 18 15 12 9 6" />
              <line x1="3" y1="12" x2="21" y2="12" />
            </svg>
            关闭右侧
          </el-dropdown-item>
          <el-dropdown-item command="close-other">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px">
              <circle cx="12" cy="12" r="10" />
              <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
            </svg>
            关闭其他
          </el-dropdown-item>
          <el-dropdown-item command="close-all">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round" style="margin-right: 8px">
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
      <div v-if="contextMenu.visible" class="worktab-ctx"
        :style="{ left: `${contextMenu.x}px`, top: `${contextMenu.y}px` }" @click.stop>
        <div class="worktab-ctx__item" :class="{ 'is-disabled': contextMenu.tab?.affix }"
          @click="ctxAction('close-current')">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          关闭
        </div>
        <div class="worktab-ctx__item" @click="ctxAction('close-left')">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 18 9 12 15 6" />
            <line x1="3" y1="12" x2="21" y2="12" />
          </svg>
          关闭左侧
        </div>
        <div class="worktab-ctx__item" @click="ctxAction('close-right')">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <polyline points="9 18 15 12 9 6" />
            <line x1="3" y1="12" x2="21" y2="12" />
          </svg>
          关闭右侧
        </div>
        <div class="worktab-ctx__divider" />
        <div class="worktab-ctx__item" @click="ctxAction('close-other')">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
          </svg>
          关闭其他
        </div>
        <div class="worktab-ctx__item" @click="ctxAction('close-all')">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
          关闭全部
        </div>
        <div class="worktab-ctx__divider" />
        <div class="worktab-ctx__item" @click="ctxAction('refresh')">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round">
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

<!-- 组件核心样式（scoped，独立维护在 worktab-style.scss） -->
<style scoped src="./worktab-style.scss" lang="scss"></style>

<style lang="scss">
html.dark .easy-worktab {
  border-bottom-color: var(--el-border-color);
}
html.dark .easy-worktab__scroll-btn,
html.dark .easy-worktab__action-btn {
  color: var(--el-text-color-secondary);
}
html.dark .easy-worktab__scroll-btn:hover,
html.dark .easy-worktab__action-btn:hover {
  color: var(--el-text-color-primary);
  background: var(--el-fill-color-light);
}
html.dark .easy-worktab__item {
  color: var(--el-text-color-regular);
  border-color: var(--el-border-color);
}
html.dark .easy-worktab__item:hover:not(.is-active) {
  border-color: var(--el-border-color-darker);
  color: var(--el-text-color-primary);
}
html.dark .easy-worktab__item--close:hover {
  background: rgba(239, 68, 68, 0.15);
}
html.dark .easy-worktab__divider {
  background: var(--el-border-color);
}
html.dark .easy-worktab__ctx {
  background: var(--el-bg-color-overlay);
  border-color: var(--el-border-color);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
html.dark .easy-worktab__ctx__item {
  color: var(--el-text-color-regular);
}
html.dark .easy-worktab__ctx__item svg {
  color: var(--el-text-color-secondary);
}
html.dark .easy-worktab__ctx__item:hover:not(.is-disabled) {
  background: rgba(79, 110, 247, 0.12);
  color: var(--el-color-primary);
}
html.dark .easy-worktab__ctx__divider {
  background: var(--el-border-color);
}
</style>
