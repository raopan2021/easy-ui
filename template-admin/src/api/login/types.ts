/** 组织信息 */
export interface CmpyInfo {
  id: string
  code: string
  name: string
  simpleName: string
  type: string
  weight: number
  parentId: string
}

/** 登录返回的用户信息 */
export interface UserInfo {
  id: string
  username: string
  name: string
  showName: string
  isAdmin: number
  status: string
  email: string
  phone: string
  gender: string
  /** 登录签名密钥（后端返回的 xtkj 字段，用于请求 token 的 HMAC 签名） */
  xtkj: string
  /** 后端生成并返回的 JWT 请求令牌（前端直接使用，不再自行签名） */
  jwt: string
  /** JWT 过期时间（毫秒） */
  tokenExpiresIn: number
  myCmpys: CmpyInfo[]
  currentCmpy: CmpyInfo
}

/** 登录接口返回值 */
export interface UserResult {
  retCode: number
  msg?: string
  data: UserInfo
}
