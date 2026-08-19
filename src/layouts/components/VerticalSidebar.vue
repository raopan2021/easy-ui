<script setup lang="ts">
import type { MenuItem } from '@/utils/menu'
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { flattenMenu, getMenuData } from '@/utils/menu'

const router = useRouter()

const menuList = ref<MenuItem[]>([])

onMounted(async () => {
  const menuData = await getMenuData()
  menuList.value = flattenMenu(menuData)
})

function resetActive() {
  menuList.value.forEach((m) => {
    m.active = false
    m.open = false
    if (m.children) {
      m.children.forEach((c) => {
        c.active = false
        c.open = false
        if (c.children)
          c.children.forEach(g => (g.active = false))
      })
    }
  })
}

function handleMenuClick(item: MenuItem) {
  if (item.children?.length) {
    item.open = !item.open
  }
  else if (item.path) {
    resetActive()
    item.active = true
    router.push(item.path)
  }
}

function handleChildClick(child: MenuItem, parent: MenuItem) {
  resetActive()
  parent.active = true
  parent.open = true
  if (child.children?.length) {
    child.active = true
    child.open = !child.open
  }
  else {
    if (child.path) {
      child.active = true
      router.push(child.path)
    }
  }
}

function handleGrandClick(grand: MenuItem, child: MenuItem, parent: MenuItem) {
  resetActive()
  parent.active = true
  parent.open = true
  child.active = true
  child.open = true
  grand.active = true
  if (grand.path) {
    router.push(grand.path)
  }
}
</script>

<template>
  <aside class="vertical-sidebar">
    <div class="vertical-sidebar__menu">
      <div v-for="item in menuList" :key="item.id" class="vertical-sidebar__item">
        <!-- 主菜单 -->
        <div
          class="vertical-sidebar__main"
          :class="{ active: item.active, expanded: item.open }"
          @click="handleMenuClick(item)"
        >
          <EasyIcon v-if="item.icon" class="vertical-sidebar__icon" :name="`el:${item.icon}`" />
          <span class="vertical-sidebar__name">{{ item.name }}</span>
          <EasyIcon v-if="item.children?.length" class="vertical-sidebar__arrow" name="el:ArrowRight" />
        </div>

        <!-- 子菜单 -->
        <div v-if="item.children?.length && item.open" class="vertical-sidebar__submenu">
          <template v-for="child in item.children" :key="child.id">
            <!-- 有三级菜单 -->
            <div
              v-if="child.children?.length"
              class="vertical-sidebar__submenu-parent"
              :class="{ active: child.active, expanded: child.open }"
              @click="handleChildClick(child, item)"
            >
              <span>{{ child.name }}</span>
              <EasyIcon class="vertical-sidebar__arrow" name="el:ArrowRight" />
            </div>
            <!-- 无三级菜单 -->
            <div
              v-else
              class="vertical-sidebar__submenu-item"
              :class="{ active: child.active }"
              @click="handleChildClick(child, item)"
            >
              {{ child.name }}
            </div>
            <!-- 三级菜单 -->
            <div v-if="child.children?.length && child.open" class="vertical-sidebar__third-menu">
              <div
                v-for="grand in child.children"
                :key="grand.id"
                class="vertical-sidebar__third-menu-item"
                :class="{ active: grand.active }"
                @click.stop="handleGrandClick(grand, child, item)"
              >
                {{ grand.name }}
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </aside>
</template>

<style scoped lang="scss">
$primary: var(--el-color-primary);
$text-primary: var(--el-text-color-primary);
$text-regular: var(--el-text-color-regular);
$text-secondary: var(--el-text-color-secondary);
$bg-hover: var(--el-fill-color-light);
$border-color: var(--el-border-color-lighter);

.vertical-sidebar {
  width: 200px;
  min-width: 200px;
  height: 100%;
  background: var(--el-fill-color-light);
  border-right: 1px solid $border-color;
  flex-shrink: 0;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-thumb {
    background: var(--el-fill-color-light);
    border-radius: 2px;
  }

  .vertical-sidebar__menu {
    padding: 12px 0;
  }

  .vertical-sidebar__item {
    margin: 0 12px;
    margin-bottom: 4px;
  }

  .vertical-sidebar__main {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 12px;
    color: $text-regular;
    font-size: 14px;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      color: $text-primary;
      background: $bg-hover;
    }

    &.active {
      color: $primary;
      background: var(--el-color-primary-light-9);

      .vertical-sidebar__icon {
        color: $primary;
      }
    }

    &.expanded {
      color: $text-primary;

      .vertical-sidebar__arrow {
        transform: rotate(90deg);
      }
    }
  }

  .vertical-sidebar__icon {
    font-size: 16px;
    color: $text-secondary;
    flex-shrink: 0;
  }

  .vertical-sidebar__name {
    flex: 1;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .vertical-sidebar__arrow {
    font-size: 12px;
    color: $text-secondary;
    flex-shrink: 0;
    transition: transform 0.2s;
  }

  .vertical-sidebar__submenu {
    padding: 4px 0 8px 38px;
  }

  .vertical-sidebar__submenu-item {
    padding: 10px 12px;
    color: $text-regular;
    font-size: 13px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 2px;

    &:hover {
      color: $primary;
      background: $bg-hover;
    }

    &.active {
      color: $primary;
      background: var(--el-color-primary-light-9);
      font-weight: 500;
    }
  }

  // 有三级菜单的父级
  .vertical-sidebar__submenu-parent {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10px 12px;
    color: $text-regular;
    font-size: 13px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 2px;

    &:hover {
      color: $primary;
      background: $bg-hover;
    }

    &.active {
      color: $primary;
      background: var(--el-color-primary-light-9);
      font-weight: 500;
    }

    &.expanded {
      .vertical-sidebar__arrow {
        transform: rotate(90deg);
      }
    }
  }

  // 三级菜单
  .vertical-sidebar__third-menu {
    padding-left: 16px;
    margin-bottom: 4px;
  }

  .vertical-sidebar__third-menu-item {
    padding: 10px 12px;
    color: $text-regular;
    font-size: 13px;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    margin-bottom: 4px;

    &:hover {
      color: $primary;
      background: $bg-hover;
    }

    &.active {
      color: $primary;
      background: var(--el-color-primary-light-9);
      font-weight: 500;
    }
  }
}
</style>
