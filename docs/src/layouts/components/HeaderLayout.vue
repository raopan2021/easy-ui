<script setup lang="ts">
import { EasyIcon } from '@raopan/easy-ui'
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMenuLayoutStore } from '@/stores/menuLayout'
import { useThemeStore } from '@/stores/theme'
import { useUserStore } from '@/stores/user'
import HorizontalMenu from './HorizontalMenu.vue'
import MenuLayoutDrawer from './MenuLayoutDrawer.vue'
import MessageDrawer from './MessageDrawer.vue'

const router = useRouter()
const userStore = useUserStore()
const menuLayoutStore = useMenuLayoutStore()
const themeStore = useThemeStore()

// template-admin 后台管理模板入口地址（独立项目，默认 dev 端口 3100）
const adminUrl = import.meta.env.VITE_ADMIN_URL || 'http://localhost:3100/admin/'

// 主题按钮图标与提示：auto=显示器 / light=太阳 / dark=月亮
const themeIcon = computed(() => {
  if (themeStore.mode === 'light')
    return 'el:Sunny'
  if (themeStore.mode === 'dark')
    return 'el:Moon'
  return 'el:Monitor'
})
const themeTitle = computed(() => {
  if (themeStore.mode === 'light')
    return '当前：浅色（点击切换深色）'
  if (themeStore.mode === 'dark')
    return '当前：深色（点击切换跟随系统）'
  return '当前：跟随系统（点击切换浅色）'
})
const showUserMenu = ref(false)
const showMessageDrawer = ref(false)
const showLayoutDrawer = ref(false)
const messageDrawerRef = ref<InstanceType<typeof MessageDrawer>>()

// 模拟未读消息数量
const messageUnreadCount = ref(8)

// 全屏状态
const isFullscreen = ref(false)

// 切换全屏
function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    isFullscreen.value = true
  }
  else {
    document.exitFullscreen()
    isFullscreen.value = false
  }
}

// 监听 ESC 退出全屏
function handleFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement
}

function handleLogout() {
  userStore.logout()
  showUserMenu.value = false
  router.push({ name: 'Login' })
}

function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement
  if (!target.closest('.header__user') && !target.closest('.header__user-dropdown')) {
    showUserMenu.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
  document.addEventListener('fullscreenchange', handleFullscreenChange)
})
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
})
</script>

<template>
  <header class="header" :class="{ 'header--horizontal': menuLayoutStore.currentLayout === 'horizontal' }">
    <!-- 左侧：Logo + 系统名称 -->
    <div class="header__brand" :class="{ 'header__brand--horizontal': menuLayoutStore.currentLayout === 'horizontal' }">
      <div class="header__logo">
        <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="32" height="32" rx="8" fill="#4f6ef7" />
          <path
            d="M8 16C8 11.582 11.582 8 16 8C20.418 8 24 11.582 24 16" stroke="#fff" stroke-width="2.5"
            stroke-linecap="round"
          />
          <circle cx="16" cy="18" r="4" fill="#fff" />
        </svg>
      </div>
      <span class="header__title">EASE UI</span>
    </div>

    <!-- 水平菜单 -->
    <HorizontalMenu v-if="menuLayoutStore.currentLayout === 'horizontal'" class="header__horizontal-menu" />

    <!-- 右侧：功能操作区 -->
    <div
      class="header__actions"
      :class="{ 'header__actions--horizontal': menuLayoutStore.currentLayout === 'horizontal' }"
    >
      <!-- template-admin 后台模板入口 -->
      <a class="header__action-btn" :href="adminUrl" target="_blank" rel="noopener" title="打开后台管理模板 template-admin">
        <EasyIcon name="el:Monitor" :size="18" />
      </a>

      <!-- 消息通知 -->
      <button class="header__action-btn" title="消息通知" @click="showMessageDrawer = true">
        <EasyIcon name="el:Bell" :size="18" />
        <span v-if="messageUnreadCount > 0" class="header__badge">{{
          messageUnreadCount > 99 ? '99+' : messageUnreadCount
        }}</span>
      </button>

      <!-- 主题切换：跟随系统 / 浅色 / 深色 -->
      <button class="header__action-btn" :title="themeTitle" @click="themeStore.toggleMode()">
        <EasyIcon :name="themeIcon" :size="18" />
      </button>

      <!-- 布局切换 -->
      <button class="header__action-btn" title="切换布局" @click="showLayoutDrawer = true">
        <EasyIcon name="el:Operation" :size="18" />
      </button>

      <!-- 全屏切换 -->
      <button class="header__action-btn" :title="isFullscreen ? '退出全屏' : '全屏'" @click="toggleFullscreen">
        <EasyIcon :name="isFullscreen ? 'el:CloseBold' : 'el:FullScreen'" :size="18" />
      </button>

      <!-- 用户信息 -->
      <div class="header__user" @click="showUserMenu = !showUserMenu">
        <div class="header__avatar">
          <EasyIcon name="el:User" :size="18" color="#fff" />
        </div>
        <span class="header__username">Admin</span>
        <EasyIcon
          class="header__arrow" :class="{ 'is-open': showUserMenu }" name="el:ArrowDown" :size="12"
          color="#8e8ea0"
        />
      </div>

      <!-- 用户下拉菜单 -->
      <Transition name="dropdown-fade">
        <div v-if="showUserMenu" class="header__user-dropdown">
          <div class="header__user-dropdown-header">
            <div class="header__avatar header__avatar--dropdown">
              <EasyIcon name="el:User" :size="18" color="#fff" />
            </div>
            <div class="header__user-dropdown-info">
              <span class="header__user-dropdown-name">Admin</span>
              <span class="header__user-dropdown-email">admin@example.com</span>
            </div>
          </div>
          <div class="header__user-dropdown-divider" />
          <div class="header__user-dropdown-item">
            <EasyIcon name="el:UserFilled" :size="16" />
            <span>个人中心</span>
          </div>
          <div class="header__user-dropdown-item">
            <EasyIcon name="el:Plus" :size="16" />
            <span>新建</span>
          </div>
          <div class="header__user-dropdown-divider" />
          <div class="header__user-dropdown-item header__user-dropdown-item--danger" @click="handleLogout">
            <EasyIcon name="el:SwitchButton" :size="16" />
            <span>退出登录</span>
          </div>
        </div>
      </Transition>
    </div>

    <!-- 消息抽屉 -->
    <MessageDrawer ref="messageDrawerRef" v-model="showMessageDrawer" />
    <!-- 布局抽屉 -->
    <MenuLayoutDrawer v-model="showLayoutDrawer" />
  </header>
</template>

<style scoped lang="scss">
/* ========== 设计令牌 ========== */
$header-height: 60px;
$header-bg: var(--el-fill-color-lighter);
$text-primary: var(--el-text-color-primary);
$text-secondary: var(--el-text-color-secondary);
$text-default: var(--el-text-color-placeholder);
$primary: var(--el-color-primary);
$radius: 10px;

/* ========== Header ========== */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: $header-height;
  padding: 0 28px;
  background-color: $header-bg;
  flex-shrink: 0;
  position: relative;

  // 水平布局模式：Logo 左侧 + 菜单居中 + 操作右侧
  &.header--horizontal {
    padding: 0;
    gap: 0;
  }
}

.header__horizontal-menu {
  flex: 1;
}

/* ========== 右侧操作区 ========== */
.header__actions {
  display: flex;
  align-items: center;
  gap: 8px;

  &.header__actions--horizontal {
    padding-right: 28px;
  }
}

/* ========== 左侧品牌 ========== */
.header__brand {
  display: flex;
  align-items: center;
  gap: 12px;

  &.header__brand--horizontal {
    padding-left: 28px;
  }
}

.header__logo {
  width: 36px;
  height: 36px;
  flex-shrink: 0;

  svg {
    width: 100%;
    height: 100%;
  }
}

.header__title {
  font-size: 20px;
  font-weight: 700;
  color: $text-primary;
  letter-spacing: -0.02em;
  user-select: none;
}

/* ========== 操作按钮 ========== */
.header__action-btn {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border: none;
  border-radius: $radius;
  background: transparent;
  color: $text-secondary;
  cursor: pointer;
  transition: all 0.18s ease;

  &:hover {
    background: var(--el-fill-color-light);
    color: $text-primary;
  }

  &:active {
    transform: scale(0.95);
  }
}

/* ========== 通知徽标 ========== */
.header__badge {
  position: absolute;
  top: 4px;
  right: 4px;
  min-width: 16px;
  height: 16px;
  padding: 0 5px;
  font-size: 10px;
  font-weight: 600;
  color: #fff;
  background: var(--el-color-danger);
  border-radius: 8px;
  line-height: 16px;
  text-align: center;
  pointer-events: none;
}

/* ========== 用户信息 ========== */
.header__user {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-left: 8px;
  padding: 6px 12px 6px 6px;
  border-radius: $radius;
  cursor: pointer;
  transition: background-color 0.18s ease;

  &:hover {
    background: var(--el-fill-color-light);
  }
}

.header__avatar {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #4f6ef7, #8b5cf6);
  border-radius: 50%;
  color: #fff;
}

.header__username {
  font-size: 14px;
  font-weight: 500;
  color: $text-primary;
}

.header__arrow {
  width: 12px;
  height: 12px;
  color: $text-default;
  transition: transform 0.2s ease;

  &.is-open {
    transform: rotate(180deg);
  }
}

/* ========== 用户下拉菜单 ========== */
.header__user-dropdown {
  position: absolute;
  top: 100%;
  right: 28px;
  margin-top: 8px;
  width: 220px;
  background: var(--el-bg-color);
  border-radius: 12px;
  box-shadow:
    0 8px 30px rgba(0, 0, 0, 0.12),
    0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 6px;
  z-index: 100;
}

.header__user-dropdown-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 8px;
}

.header__avatar--dropdown {
  width: 34px;
  height: 34px;
}

.header__user-dropdown-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.header__user-dropdown-name {
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
}

.header__user-dropdown-email {
  font-size: 12px;
  color: $text-default;
}

.header__user-dropdown-divider {
  height: 1px;
  background: var(--el-fill-color-light);
  margin: 4px 0;
}

.header__user-dropdown-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  font-size: 13px;
  color: $text-secondary;
  cursor: pointer;
  transition: all 0.15s ease;

  &:hover {
    background: rgba(79, 110, 247, 0.06);
    color: $text-primary;
  }

  &.header__user-dropdown-item--danger {
    &:hover {
      background: rgba(245, 63, 63, 0.06);
      color: var(--el-color-danger);
    }
  }
}

/* ========== 下拉过渡 ========== */
.dropdown-fade-enter-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-fade-leave-active {
  transition: all 0.15s ease;
}

.dropdown-fade-enter-from {
  opacity: 0;
  transform: translateY(-6px);
}

.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
