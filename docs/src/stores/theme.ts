import { usePreferredDark, useStorage } from '@vueuse/core'
import { defineStore } from 'pinia'
import { computed, watch } from 'vue'

/** 主题模式：auto=跟随系统，light=浅色，dark=深色 */
export type ThemeMode = 'auto' | 'light' | 'dark'

/** localStorage 持久化 key（需与 index.html 内联脚本保持一致） */
export const THEME_STORAGE_KEY = 'ease-ui-theme-mode'

/** 将「是否暗色」应用到 <html> 的 dark class（与 dark.scss 的 html.dark 选择器对齐） */
function applyDarkClass(isDark: boolean) {
  const el = document.documentElement
  el.classList.toggle('dark', isDark)
  // 同步 Element Plus 暗色变量作用域
  el.style.colorScheme = isDark ? 'dark' : 'light'
}

export const useThemeStore = defineStore('theme', () => {
  // 持久化的主题模式，默认跟随系统
  const mode = useStorage<ThemeMode>(THEME_STORAGE_KEY, 'auto')
  // 系统偏好（响应 prefers-color-scheme 变化）
  const systemDark = usePreferredDark()

  /** 当前是否为暗色：auto 时取系统偏好，否则取手动值 */
  const isDark = computed(() => {
    if (mode.value === 'auto')
      return systemDark.value
    return mode.value === 'dark'
  })

  // isDark 变化时同步 DOM，立即执行一次确保初始状态正确
  watch(isDark, val => applyDarkClass(val), { immediate: true })

  /** 设置主题模式 */
  function setMode(next: ThemeMode) {
    mode.value = next
  }

  /** 三态循环切换：auto → light → dark → auto */
  function toggleMode() {
    const order: ThemeMode[] = ['auto', 'light', 'dark']
    const idx = order.indexOf(mode.value)
    mode.value = order[(idx + 1) % order.length]
  }

  return {
    mode,
    isDark,
    systemDark,
    setMode,
    toggleMode,
  }
})
