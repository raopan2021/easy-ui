// 响应式storage
import type { App } from 'vue'
import Storage from 'responsive-storage'
import { responsiveStorageNameSpace } from '@/config'
import { routerArrays } from '@/layout/types'

export function injectResponsiveStorage(app: App, config: PlatformConfigs) {
  const nameSpace = responsiveStorageNameSpace()
  const configObj = Object.assign(
    {
      // layout模式以及主题
      layout: Storage.getData('layout', nameSpace) ?? {
        layout: config.Layout ?? 'vertical',
        theme: config.Theme ?? 'light',
        darkMode: config.DarkMode ?? false,
        sidebarStatus: config.SidebarStatus ?? true,
        epThemeColor: config.EpThemeColor ?? '#409EFF',
        overallStyle: config.OverallStyle ?? 'light',
      },
      // 系统配置-界面显示
      configure: Storage.getData('configure', nameSpace) ?? {
        grey: config.Grey ?? false,
        weak: config.Weak ?? false,
        hideTabs: config.HideTabs ?? false,
        hideFooter: config.HideFooter ?? true,
        showLogo: config.ShowLogo ?? true,
        showModel: config.ShowModel ?? 'smart',
        multiTagsCache: config.MultiTagsCache ?? false,
        stretch: config.Stretch ?? false,
      },
    },
    config.MultiTagsCache
      ? {
          // 默认显示顶级菜单tag
          tags: Storage.getData('tags', nameSpace) ?? routerArrays,
        }
      : {},
  )

  app.use(Storage, { nameSpace, memory: configObj })
}
