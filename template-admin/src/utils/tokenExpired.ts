/** 防止 token 过期弹窗重复弹出（登录成功后由 resetTokenExpiredDialog 放开） */
let tokenExpiredDialogShowing = false

/** 登录成功后重置过期弹窗标志，放开再次提示能力 */
export function resetTokenExpiredDialog() {
  tokenExpiredDialogShowing = false
}

/** 处理 token 过期：弹窗提示一次，确认后执行登出 */
export function handleTokenExpired() {
  if (tokenExpiredDialogShowing)
    return
  tokenExpiredDialogShowing = true

  ElMessageBox({
    title: '登录已过期',
    message: '登录状态已过期，请重新登录',
    type: 'warning',
    showCancelButton: true,
    confirmButtonText: '重新登录',
    cancelButtonText: '取消',
    distinguishCancelAndClose: true,
  }).then(async () => {
    // 复用 user store 的统一前端登出逻辑（清理登录态 + 跳转 /login）
    const { useUserStoreHook } = await import('@/store/modules/user')
    useUserStoreHook().logOut()
  })
}
