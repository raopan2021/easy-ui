<script setup lang="ts">
import { Setting } from '@element-plus/icons-vue'
import { isAllEmpty, storageLocal } from '@pureadmin/utils'
import { responsiveStorageNameSpace } from '@/config'
import { useNav } from '@/layout/hooks/useNav'
import { usePermissionStoreHook } from '@/store/modules/permission'
import { emitter } from '@/utils/mitt'
import { hideLoading, showLoading } from '@/utils/xly'
import LayNotice from '../lay-notice/index.vue'
import LaySearch from '../lay-search/index.vue'
import LaySidebarFullScreen from '../lay-sidebar/components/SidebarFullScreen.vue'

import LaySidebarItem from '../lay-sidebar/components/SidebarItem.vue'

const menuRef = ref()
const showLogo = ref(
  storageLocal().getItem<StorageConfigs>(
    `${responsiveStorageNameSpace()}configure`,
  )?.showLogo ?? true,
)

const {
  route,
  title,
  logout,
  onPanel,
  getLogo,
  username,
  userAvatar,
  backTopMenu,
  avatarsStyle,
} = useNav()

const defaultActive = computed(() =>
  !isAllEmpty(route.meta?.activePath) ? route.meta.activePath : route.path,
)

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

onMounted(() => {
  emitter.on('logoChange', (key) => {
    showLogo.value = key
  })
})
</script>

<template>
  <div
    class="horizontal-header"
  >
    <div v-if="showLogo" class="horizontal-header-left" @click="backTopMenu">
      <img :src="getLogo()" alt="logo" width="32" height="32">
      <span>{{ title }}</span>
    </div>
    <el-menu
      ref="menuRef"
      mode="horizontal"
      popper-class="pure-scrollbar"
      class="horizontal-header-menu"
      :default-active="defaultActive"
    >
      <LaySidebarItem
        v-for="route in usePermissionStoreHook().wholeMenus"
        :key="route.path"
        :item="route"
        :base-path="route.path"
      />
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
        <span class="el-dropdown-link navbar-bg-hover">
          <img :src="userAvatar" :style="avatarsStyle" width="22" height="22">
          <p v-if="username" class="dark:text-white">{{ username }}</p>
        </span>
        <template #dropdown>
          <el-dropdown-menu class="logout">
            <el-dropdown-item @click="logout">
              <SvgIcon
                name="logout"
                :size="16"
                style="margin: 5px"
              />
              退出系统
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
      <span
        class="set-icon navbar-bg-hover"
        title="打开系统配置"
        @click="onPanel"
      >
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
