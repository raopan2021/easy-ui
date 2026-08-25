<script setup lang="ts">
import type { MenuItem } from '@/utils/menu'
import { nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getMenuData } from '@/utils/menu'

const router = useRouter()
const route = useRoute()

const menuList = ref<MenuItem[]>([])

/** 当前激活的菜单项 index（即 path 或 id） */
const activeMenu = ref('')

/** 需要展开的 sub-menu 的 index 列表 */
const openedMenus = ref<string[]>([])

/**
 * 递归查找从根到 targetPath 的祖先 id 链
 * 返回所有需要展开的 sub-menu id 列表
 */
function findAncestors(items: MenuItem[], targetPath: string, ancestors: string[] = []): string[] | null {
  for (const item of items) {
    if (item.path === targetPath) {
      return ancestors
    }
    if (item.children?.length) {
      const result = findAncestors(item.children, targetPath, [...ancestors, item.id])
      if (result !== null)
        return result
    }
  }
  return null
}

/** 根据当前路径更新激活项和展开项 */
function updateActiveByPath(path: string) {
  activeMenu.value = path
  // 创建新数组引用确保 el-menu 能检测到变化
  openedMenus.value = [...(findAncestors(menuList.value, path) ?? [])]
}

/** 根据 index（path 或 id）递归查找 MenuItem */
function findItemByIndex(items: MenuItem[], index: string): MenuItem | null {
  for (const item of items) {
    if (item.path === index || item.id === index)
      return item
    if (item.children?.length) {
      const found = findItemByIndex(item.children, index)
      if (found)
        return found
    }
  }
  return null
}

/** 找到第一个有 path 的叶子后代 */
function findFirstLeafPath(item: MenuItem): string | null {
  if (item.path)
    return item.path
  if (item.children?.length) {
    for (const child of item.children) {
      const leaf = findFirstLeafPath(child)
      if (leaf)
        return leaf
    }
  }
  return null
}

/** 处理菜单选中：有 path 则导航；否则跳转到第一个叶子子项 */
function handleSelect(index: string) {
  const item = findItemByIndex(menuList.value, index)
  if (!item)
    return
  const target = item.path || findFirstLeafPath(item)
  if (target) {
    nextTick(() => router.push(target))
  }
}

onMounted(async () => {
  const data = await getMenuData()
  menuList.value = data
  updateActiveByPath(route.path)
})

// URL 变化时同步菜单状态
watch(
  () => route.path,
  (path) => {
    updateActiveByPath(path)
  },
)
</script>

<template>
  <aside class="sidebar">
    <el-menu :default-active="activeMenu" :default-openeds="openedMenus" unique-opened class="sidebar-menu"
      @select="handleSelect">
      <template v-for="item in menuList" :key="item.id">
        <!-- 根级叶子节点（首页等） -->
        <el-menu-item v-if="!item.children?.length" :index="item.path || item.id">
          <EasyIcon v-if="item.icon" :name="`el:${item.icon}`" class="fixed-sidebar__menu-icon" />
          <span>{{ item.name }}</span>
        </el-menu-item>

        <!-- 根级分组 -->
        <el-sub-menu v-else :index="item.id">
          <template #title>
            <EasyIcon v-if="item.icon" :name="`el:${item.icon}`" class="fixed-sidebar__menu-icon" />
            <span>{{ item.name }}</span>
          </template>

          <template v-for="child in item.children" :key="child.id">
            <!-- 二级叶子 -->
            <el-menu-item v-if="!child.children?.length" :index="child.path || child.id">
              {{ child.name }}
            </el-menu-item>

            <!-- 二级分组（含三级菜单） -->
            <el-sub-menu v-else :index="child.id">
              <template #title>
                {{ child.name }}
              </template>
              <el-menu-item v-for="grand in child.children" :key="grand.id" :index="grand.path || grand.id">
                {{ grand.name }}
              </el-menu-item>
            </el-sub-menu>
          </template>
        </el-sub-menu>
      </template>
    </el-menu>
  </aside>
</template>

<style scoped lang="scss">
.sidebar {
  flex-shrink: 0;
  min-height: 0;
}

.fixed-sidebar__menu-icon {
  margin-right: 4px;
  font-size: 16px;
}

.sidebar-menu {
  width: 220px;
  height: calc(100vh - 100px);
  overflow-y: auto;
  overflow-x: hidden;
  border-right: none;

  // 美化滚动条
  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--el-border-color);
    border-radius: 4px;
    &:hover {
      background: var(--el-text-color-placeholder);
    }
  }

  // 隐藏 sub-menu 前的竖线指示器
  :deep(.el-sub-menu) {
    .el-sub-menu__icon-arrow {
      transition: transform 0.2s ease;
    }
  }
}
</style>
