/**
 * 从 localStorage 获取并解析登录信息
 */
function getLoginInfo() {
  const raw = localStorage.getItem('loginInfo')
  if (!raw)
    return null
  try {
    return JSON.parse(raw)
  }
  catch {
    return null
  }
}

/**
 * 获取请求鉴权 token
 *
 * 流程:
 * 1. 从 localStorage 读取用户登录信息
 * 2. 直接返回后端登录接口下发的 JWT 令牌（loginInfo.jwt）
 *
 * 特点:
 * - 不再由前端自行签名，token 由后端生成并下发
 * - 未登录时返回空字符串
 *
 * @returns {string} JWT 字符串，未登录时返回空字符串
 */
function getToken() {
  const loginInfo = getLoginInfo()
  if (!loginInfo)
    return ''
  return loginInfo.jwt ?? ''
}

export default getToken
