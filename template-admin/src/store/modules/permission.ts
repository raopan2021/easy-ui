import type { cacheType } from '../utils'
import { defineStore } from 'pinia'
import {
  ascending,

  constantMenus,
  filterNoPermissionTree,
  filterTree,
  formatFlatteningRoutes,
  getKeyList,
  store,
} from '../utils'
import { useMultiTagsStoreHook } from './multiTags'

export const usePermissionStore = defineStore('pure-permission', {
  state: () => ({
    // 静态路由生成的菜单
    constantMenus,
    // 整体路由生成的菜单（静态、动态）
    wholeMenus: [],
    // 整体路由（一维数组格式）
    flatteningRoutes: [],
    // 缓存页面keepAlive
    cachePageList: [],
  }),
  actions: {
    /** 组装整体路由生成的菜单 */
    handleWholeMenus(routes: any[]) {
      // 左侧menu
      // 过滤没权限的菜单
      const menus = filterNoPermissionTree(
        filterTree(ascending(this.constantMenus.concat(routes))),
      )
      // 过滤 prod环境 异常页面菜单
      if (import.meta.env.PROD) {
        this.wholeMenus = menus.filter(
          (item: any) => item.path !== '/error',
        )
      }
      else {
        this.wholeMenus = menus
      }

      // 整体路由（一维数组格式）生成
      this.flatteningRoutes = formatFlatteningRoutes(
        this.constantMenus.concat(routes) as any,
      )
    },
    /** 监听缓存页面是否存在于标签页，不存在则删除 */
    clearCache() {
      let cacheLength = this.cachePageList.length
      const nameList = getKeyList(useMultiTagsStoreHook().multiTags, 'name')
      while (cacheLength > 0) {
        nameList.findIndex(v => v === this.cachePageList[cacheLength - 1])
        === -1
        && this.cachePageList.splice(
          this.cachePageList.indexOf(this.cachePageList[cacheLength - 1]),
          1,
        )
        cacheLength--
      }
    },
    cacheOperate({ mode, name }: cacheType) {
      const delIndex = this.cachePageList.findIndex(v => v === name)
      switch (mode) {
        case 'refresh':
          this.cachePageList = this.cachePageList.filter(v => v !== name)
          this.clearCache()
          break
        case 'add':
          delIndex === -1 && this.cachePageList.push(name)
          break
        case 'delete':
          delIndex !== -1 && this.cachePageList.splice(delIndex, 1)
          this.clearCache()
          break
      }
    },
    /** 清空缓存页面 */
    clearAllCachePage() {
      this.wholeMenus = []
      this.cachePageList = []
    },
  },
})

export function usePermissionStoreHook() {
  return usePermissionStore(store)
}
