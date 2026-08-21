import type { userType } from '../utils'
import type { UserResult } from '@/api/login'
import type { DataInfo } from '@/utils/auth'
import Cookies from 'js-cookie'
import { defineStore } from 'pinia'
import {
  getLogin,

} from '@/api/login'
import { multipleTabsKey, removeToken, userKey } from '@/utils/auth'
import { resetTokenExpiredDialog } from '@/utils/tokenExpired'
import {
  resetRouter,
  router,
  routerArrays,
  storageLocal,
  store,

} from '../utils'
import { useMultiTagsStoreHook } from './multiTags'

export const useUserStore = defineStore('pure-user', {
  state: (): userType => ({
    // 头像
    avatar: storageLocal().getItem<DataInfo<number>>(userKey)?.avatar ?? '',
    // 用户名
    username: storageLocal().getItem<DataInfo<number>>(userKey)?.username ?? '',
    // 用户ID
    userId: storageLocal().getItem<DataInfo<number>>(userKey)?.userId ?? '',
    // 昵称
    nickname: storageLocal().getItem<DataInfo<number>>(userKey)?.nickname ?? '',
    // 页面级别权限
    roles: storageLocal().getItem<DataInfo<number>>(userKey)?.roles ?? [],
    // 按钮级别权限
    permissions: storageLocal().getItem<DataInfo<number>>(userKey)?.permissions ?? [],
    // 是否勾选了登录页的免登录
    isRemembered: false,
    // 登录页的免登录存储几天，默认7天
    loginDay: 7,
  }),
  actions: {
    /** 存储头像 */
    SET_AVATAR(avatar: string) {
      this.avatar = avatar
    },
    /** 存储用户名 */
    SET_USERNAME(username: string) {
      this.username = username
    },
    /** 存储昵称 */
    SET_NICKNAME(nickname: string) {
      this.nickname = nickname
    },
    /** 存储用户ID */
    SET_USERID(userId: string) {
      this.userId = userId
    },
    /** 存储角色 */
    SET_ROLES(roles: Array<string>) {
      this.roles = roles
    },
    /** 存储按钮级别权限 */
    SET_PERMS(permissions: Array<string>) {
      this.permissions = permissions
    },
    /** 存储是否勾选了登录页的免登录 */
    SET_ISREMEMBERED(bool: boolean) {
      this.isRemembered = bool
    },
    /** 设置登录页的免登录存储几天 */
    SET_LOGINDAY(value: number) {
      this.loginDay = Number(value)
    },
    /** 登入 */
    async loginByUsername(data) {
      return new Promise<UserResult>((resolve, reject) => {
        getLogin(data)
          .then((res) => {
            if (res.retCode === 0) {
              const user = res.data
              // 登录成功后放开 token 过期弹窗提示
              resetTokenExpiredDialog()
              // 保存登录信息，供请求时携带后端下发的 JWT 令牌
              localStorage.setItem(
                'loginInfo',
                JSON.stringify({
                  username: user.username,
                  jwt: user.jwt,
                  myCmpys: user.myCmpys,
                }),
              )

              const roles = [user.isAdmin === 1 ? 'admin' : 'user']

              // 保存用户信息
              this.SET_AVATAR('')
              this.SET_USERNAME(user.username)
              this.SET_NICKNAME(user.name)
              this.SET_USERID(user.id)
              this.SET_ROLES(roles)
              this.SET_PERMS([])
              storageLocal().setItem(userKey, {
                refreshToken: '',
                expires: Date.now() + 86400000,
                avatar: '',
                username: user.username,
                nickname: user.name,
                userId: user.id,
                roles,
                permissions: [],
              })
              Cookies.set(multipleTabsKey, 'true')
            }
            resolve(res)
          })
          .catch((error) => {
            reject(error)
          })
      })
    },
    /** 前端登出（不调用接口） */
    logOut() {
      // 清空内存中的用户状态（避免 SPA 内不刷新时残留）
      this.username = ''
      this.userId = ''
      this.nickname = ''
      this.avatar = ''
      this.roles = []
      this.permissions = []
      // removeToken 内部已清理 loginInfo / authorized-token / multiple-tabs / user-info
      removeToken()
      useMultiTagsStoreHook().handleTags('equal', [...routerArrays])
      resetRouter()
      router.push('/login')
    },
  },
})

export function useUserStoreHook() {
  return useUserStore(store)
}
