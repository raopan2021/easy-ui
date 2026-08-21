import { darken, lighten, storageLocal, useGlobal } from '@pureadmin/utils'
import { getConfig } from '@/config'
import { routerArrays } from '@/layout/types'
import { resetRouter, router } from '@/router'
import { useAppStoreHook } from '@/store/modules/app'
import { useEpThemeStoreHook } from '@/store/modules/epTheme'
import { useMultiTagsStoreHook } from '@/store/modules/multiTags'
import { removeToken } from '@/utils/auth'
import { useLayout } from './useLayout'

export function useDataThemeChange() {
  const { layoutTheme, layout } = useLayout()

  const { $storage } = useGlobal<GlobalPropertiesApi>()
  const dataTheme = ref<boolean>($storage?.layout?.darkMode)
  const overallStyle = ref<string>($storage?.layout?.overallStyle)
  const body = document.documentElement as HTMLElement

  function toggleClass(flag: boolean, clsName: string, target?: HTMLElement) {
    const targetEl = target || document.body
    let { className } = targetEl
    className = className.replace(clsName, '').trim()
    targetEl.className = flag ? `${className} ${clsName}` : className
  }

  /** 设置导航主题 */
  function setTheme(theme: string) {
    layoutTheme.value.theme = theme
    document.documentElement.setAttribute('data-theme', theme)

    $storage.layout = {
      layout: layout.value,
      theme,
      darkMode: dataTheme.value,
      sidebarStatus: $storage.layout?.sidebarStatus,
      overallStyle: overallStyle.value,
    }

    if (theme === 'default' || theme === 'light') {
      setEpThemeColor(getConfig().EpThemeColor)
    }
  }

  function setPropertyPrimary(mode: string, i: number, color: string) {
    document.documentElement.style.setProperty(
      `--el-color-primary-${mode}-${i}`,
      dataTheme.value ? darken(color, i / 10) : lighten(color, i / 10),
    )
  }

  /** 设置 `element-plus` 主题色 */
  const setEpThemeColor = (color: string) => {
    useEpThemeStoreHook().setEpThemeColor(color)
    document.documentElement.style.setProperty('--el-color-primary', color)
    for (let i = 1; i <= 2; i++) {
      setPropertyPrimary('dark', i, color)
    }
    for (let i = 1; i <= 9; i++) {
      setPropertyPrimary('light', i, color)
    }
  }

  /** 浅色、深色整体风格切换 */
  function dataThemeChange(overall?: string) {
    overallStyle.value = overall
    const targetTheme
      = useEpThemeStoreHook().epTheme === 'light' && dataTheme.value
        ? 'default'
        : useEpThemeStoreHook().epTheme
    setTheme(targetTheme)

    if (dataTheme.value) {
      document.documentElement.classList.add('dark')
    }
    else {
      setTheme('light')
      document.documentElement.classList.remove('dark')
    }
  }

  /** 清空缓存并返回登录页 */
  function onReset() {
    removeToken()
    storageLocal().clear()
    const { Grey, Weak, MultiTagsCache, EpThemeColor, Layout } = getConfig()
    useAppStoreHook().setLayout(Layout)
    setEpThemeColor(EpThemeColor)
    useMultiTagsStoreHook().multiTagsCacheChange(MultiTagsCache)
    toggleClass(Grey, 'html-grey', document.querySelector('html'))
    toggleClass(Weak, 'html-weakness', document.querySelector('html'))
    router.push('/login')
    useMultiTagsStoreHook().handleTags('equal', [...routerArrays])
    resetRouter()
  }

  return {
    body,
    dataTheme,
    overallStyle,
    layoutTheme,
    onReset,
    toggleClass,
    dataThemeChange,
    setEpThemeColor,
  }
}
