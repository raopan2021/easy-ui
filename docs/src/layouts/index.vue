<script setup lang="ts">
import { EasyWorktab } from '@raopan/easy-ui'
import { computed, nextTick, ref, watch } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import menuData from '@/data/menu.json'
import { useMenuLayoutStore } from '@/stores/menuLayout'
import { useTabsStore } from '@/stores/tabs'
import { useDocToc } from './composables/useDocToc'
import DocToc from './components/DocToc.vue'
import FixedSidebar from './components/FixedSidebar.vue'
import HeaderLayout from './components/HeaderLayout.vue'
import VerticalSidebar from './components/VerticalSidebar.vue'

const route = useRoute()
const tabsStore = useTabsStore()
const menuLayoutStore = useMenuLayoutStore()
const worktabRef = ref<InstanceType<typeof EasyWorktab>>()
const contentRef = ref<HTMLElement>()

// 文档页右侧目录：自动扫描标题、滚动高亮、点击定位、回到顶部
const { tocItems, activeId, hasToc, scrolled, refresh, scrollTo, scrollToTop } = useDocToc(contentRef)

// 菜单组件映射（水平布局时不需要单独组件）
const menuComponents = {
  vertical: VerticalSidebar,
  split: FixedSidebar,
}

// 当前菜单组件
const currentMenuComponent = computed(() => {
  return menuComponents[menuLayoutStore.currentLayout] || FixedSidebar
})

// 路由变化时重置内容区滚动位置，并重建右侧目录
watch(
  () => route.path,
  () => {
    if (contentRef.value) {
      contentRef.value.scrollTop = 0
    }
    refresh()
  },
  { immediate: true },
)

// 从菜单数据中匹配路由标题
function getRouteTitle(path: string): string {
  for (const item of menuData) {
    if (item.path === path)
      return item.name
    if (item.children) {
      for (const child of item.children) {
        if (child.path === path)
          return child.name
        if (child.children) {
          for (const grand of child.children) {
            if (grand.path === path)
              return grand.name
          }
        }
      }
    }
  }
  return path
}

// 监听路由变化，自动添加标签
watch(
  () => route.path,
  () => {
    tabsStore.addTab({
      ...route,
      meta: { ...route.meta, title: getRouteTitle(route.path) },
    })
    nextTick(() => {
      worktabRef.value?.onTabsChange()
    })
  },
  { immediate: true },
)
</script>

<template>
  <div class="layout-container">
    <!-- 顶部导航（包含水平菜单） -->
    <HeaderLayout />
    <!-- 主体区域 -->
    <div class="layout-body" :class="{ 'layout-body--horizontal': menuLayoutStore.currentLayout === 'horizontal' }">
      <!-- 左侧菜单 -->
      <component
        :is="currentMenuComponent"
        v-if="menuLayoutStore.currentLayout !== 'horizontal'"
        class="layout-sidebar"
      />
      <!-- 右侧内容 -->
      <div class="layout-main" :class="{ 'layout-main--horizontal': menuLayoutStore.currentLayout === 'horizontal' }">
        <!-- 标签页 -->
        <EasyWorktab ref="worktabRef" />
        <!-- 页面内容 + 右侧目录 -->
        <div class="layout-content-wrap">
          <!-- 页面内容（keep-alive 缓存） -->
          <main ref="contentRef" class="layout-content">
            <RouterView v-slot="{ Component, route: currentRoute }">
              <KeepAlive>
                <component :is="Component" :key="currentRoute.path" />
              </KeepAlive>
            </RouterView>
          </main>
          <!-- 右侧目录（仅文档组件页自动生成） -->
          <DocToc
            v-if="hasToc"
            :items="tocItems"
            :active-id="activeId"
            :scrolled="scrolled"
            @select="scrollTo"
            @back-top="scrollToTop"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
$corner-radius: 20px;

.layout-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  overflow: hidden;
}

.layout-body {
  display: flex;
  flex: 1;
  overflow: hidden;
  position: relative;

  &.layout-body--horizontal {
    background-color: var(--el-fill-color-light);
  }
}

.layout-sidebar {
  flex-shrink: 0;
}

.layout-content-wrap {
  display: flex;
  flex: 1;
  min-height: 0;
}

.layout-content {
  padding: 24px;
  flex: 1;
  overflow-y: auto;
}

.layout-main {
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background-color: var(--el-bg-color);
  border-top-left-radius: $corner-radius;

  /* 美化滚动条 */
  .layout-content::-webkit-scrollbar {
    width: 6px;
  }
  .layout-content::-webkit-scrollbar-thumb {
    background: var(--el-fill-color-light);
    border-radius: 3px;
  }
  .layout-content::-webkit-scrollbar-track {
    background: transparent;
  }

  &.layout-main--horizontal {
    border-radius: $corner-radius $corner-radius 0 0;
  }
}
</style>
