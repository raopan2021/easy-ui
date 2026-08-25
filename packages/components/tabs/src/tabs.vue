<script setup lang="ts">
import type { TabsEmits } from './tabs'

import { tabsProps } from './tabs'
import { useTabsNav } from './use-tabs-nav'
import { useTabsPanes } from './use-tabs-panes'

defineOptions({ name: 'EasyTabs' })

const props = defineProps(tabsProps)
const emit = defineEmits<TabsEmits>()

// ──── 面板注册表 + provide 上下文 ────
const { panes } = useTabsPanes(props)

// ──── 导航 / 滚动 / 活动指示条 ────
const {
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
} = useTabsNav(props, emit, panes)
</script>

<template>
  <div class="easy-tabs" :class="tabsClass">
    <!-- 选项卡头部导航 -->
    <div class="easy-tabs__header" :class="{ 'is-sticky': sticky }" :style="sticky ? { top: stickyTop } : undefined">
      <div class="easy-tabs__nav-wrap">
        <!-- 左滚动按钮 -->
        <span v-if="scrollable && scrollOffset > 0" class="easy-tabs__nav-btn easy-tabs__nav-btn--prev"
          @click="scrollBy(-scrollStep)">
          <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </span>

        <div ref="navScrollRef" class="easy-tabs__nav-scroll" @wheel.prevent="handleWheel">
          <div ref="navRef" class="easy-tabs__nav">
            <div
              v-for="pane in panes"
              :key="pane.uid"
              :ref="(el) => setItemRef(el, pane.uid)"
              class="easy-tabs__item"
              :class="{
                'is-active': pane.name === modelValue,
                'is-disabled': pane.disabled,
              }"
              @click="handleTabClick(pane)"
            >
              <span v-if="pane.icon" class="easy-tabs__item-icon">
                <el-icon><component :is="pane.icon" /></el-icon>
              </span>
              <span class="easy-tabs__item-label">{{ pane.label }}</span>
            </div>
            <!-- 活动指示条（line 类型） -->
            <div v-if="type === 'line'" class="easy-tabs__active-bar" :style="activeBarStyle" />
          </div>
        </div>

        <!-- 右滚动按钮 -->
        <span v-if="scrollable && canScrollRight" class="easy-tabs__nav-btn easy-tabs__nav-btn--next"
          @click="scrollBy(scrollStep)">
          <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </span>
      </div>
    </div>

    <!-- 选项卡内容区域 -->
    <div class="easy-tabs__content">
      <slot />
    </div>
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 tabs-style.scss） -->
<style scoped src="./tabs-style.scss" lang="scss"></style>

<!-- 暗色模式覆盖（非 scoped，全局 html.dark 作用域） -->
<style lang="scss">
/* ========== Dark Mode ========== */
html.dark .easy-tabs__nav {
  border-bottom-color: var(--el-border-color);
}
html.dark .easy-tabs--card .easy-tabs__nav {
  border-bottom-color: var(--el-border-color);
}
html.dark .easy-tabs--card .easy-tabs__item.is-active {
  border-color: var(--el-border-color);
}
html.dark .easy-tabs--card .easy-tabs__item:hover:not(.is-active):not(.is-disabled),
html.dark .easy-tabs--segment .easy-tabs__item:hover:not(.is-active):not(.is-disabled) {
  background-color: var(--el-fill-color-light);
}
html.dark .easy-tabs__nav-btn:hover {
  color: var(--el-color-primary);
  background-color: var(--el-fill-color-light);
}
</style>
