<script setup lang="ts">
import { Setting } from '@element-plus/icons-vue'
import { isAllEmpty } from '@pureadmin/utils'
import { toRaw } from 'vue'
import { useRenderIcon } from '@/components/ReIcon/src/hooks'
import { useNav } from '@/layout/hooks/useNav'
import { findRouteByPath, getParentPaths } from '@/router/utils'
import { usePermissionStoreHook } from '@/store/modules/permission'
import { hideLoading, showLoading } from '@/utils/xly'
import LaySearch from '../lay-search/index.vue'
import LaySidebarExtraIcon from '../lay-sidebar/components/SidebarExtraIcon.vue'

import LaySidebarFullScreen from '../lay-sidebar/components/SidebarFullScreen.vue'

const menuRef = ref()
const defaultActive = ref(null)

const {
  route,
  device,
  logout,
  onPanel,
  resolvePath,
  username,
  userAvatar,
  getDivStyle,
  avatarsStyle,
} = useNav()

function getDefaultActive(routePath) {
  const wholeMenus = usePermissionStoreHook().wholeMenus
  /** 当前路由的父级路径 */
  const parentRoutes = getParentPaths(routePath, wholeMenus)[0]
  defaultActive.value = !isAllEmpty(route.meta?.activePath)
    ? route.meta.activePath
    : findRouteByPath(parentRoutes, wholeMenus)?.children[0]?.path
}

onMounted(() => {
  getDefaultActive(route.path)
})

nextTick(() => {
  menuRef.value?.handleResize()
})

// 菜单数据为空时显示全屏 loading
watch(
  () => usePermissionStoreHook().wholeMenus.length,
  (length) => {
    if (length === 0)
      showLoading('加载中...')
    else hideLoading()
  },
)

watch(
  () => [route.path, usePermissionStoreHook().wholeMenus],
  () => {
    getDefaultActive(route.path)
  },
)
</script>

<template>
  <div v-if="device !== 'mobile'" class="horizontal-header">
    <el-menu ref="menuRef" router mode="horizontal" popper-class="pure-scrollbar" class="horizontal-header-menu"
      :default-active="defaultActive">
      <el-menu-item v-for="route in usePermissionStoreHook().wholeMenus" :key="route.path"
        :index="resolvePath(route) || route.redirect">
        <template #title>
          <div v-if="toRaw(route.meta.icon)" class="sub-menu-icon" :class="[route.meta.icon]">
            <component :is="useRenderIcon(route.meta && toRaw(route.meta.icon))" />
          </div>
          <div :style="getDivStyle">
            <span class="select-none">
              {{ route.meta.title }}
            </span>
            <LaySidebarExtraIcon :extra-icon="route.meta.extraIcon" />
          </div>
        </template>
      </el-menu-item>
    </el-menu>
    <div class="horizontal-header-right">
      <!-- 菜单搜索 -->
      <LaySearch id="header-search" />
      <!-- 全屏 -->
      <LaySidebarFullScreen id="full-screen" />
      <!-- 消息通知 -->
      <!-- <LayNotice id="header-notice" /> -->
      <!-- 退出登录 -->
      <el-dropdown trigger="click">
        <span class="el-dropdown-link navbar-bg-hover select-none">
          <img :src="userAvatar" :style="avatarsStyle" width="22" height="22">
          <p v-if="username" class="dark:text-white">{{ username }}</p>
        </span>
        <template #dropdown>
          <el-dropdown-menu class="logout">
            <el-dropdown-item @click="logout">
              <SvgIcon name="logout" :size="16" style="margin: 5px" />
              退出系统
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <span class="set-icon navbar-bg-hover" title="打开系统配置" @click="onPanel">
        <PureIcon :icon="Setting" :size="20" />
      </span>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.logout {
  width: 120px;

  :deep(.el-dropdown-menu__item) {
    display: inline-flex;
    flex-wrap: wrap;
    min-width: 100%;
  }
}
</style>
