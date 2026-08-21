import type { UserResult } from './types'

export type { UserResult }

/* ============================================================
 * Mock 实现（模板开箱即用，无需后端）
 *
 * 接入真实后端时，替换为：
 * ```ts
 * import { http } from "@/utils/http";
 * export const getLoginValidateCode = (params?: object) =>
 *   http.request<Blob>("get", "/validate/code", { params, responseType: "blob" });
 * export const getLogin = (params?: object) =>
 *   http.request<UserResult>("post", "/user/login", { data: params });
 * ```
 * ============================================================ */

/** 模拟验证码值（仅 mock 场景用于校验，实际登录忽略） */
let mockCode = ''

/** 生成 4 位随机验证码（去除易混淆字符） */
function generateMockCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
  mockCode = Array.from(
    { length: 4 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join('')
  return mockCode
}

/** 获取登录验证码图片（mock：canvas 绘制） */
export function getLoginValidateCode(params?: object) {
  void params
  return new Promise<Blob>((resolve, reject) => {
    try {
      generateMockCode()
      const canvas = document.createElement('canvas')
      canvas.width = 120
      canvas.height = 40
      const ctx = canvas.getContext('2d')!
      // 背景
      ctx.fillStyle = '#f0f2f5'
      ctx.fillRect(0, 0, 120, 40)
      // 干扰线
      for (let i = 0; i < 5; i++) {
        ctx.beginPath()
        ctx.moveTo(Math.random() * 120, Math.random() * 40)
        ctx.lineTo(Math.random() * 120, Math.random() * 40)
        ctx.strokeStyle = '#d0d3d8'
        ctx.stroke()
      }
      // 干扰点
      for (let i = 0; i < 20; i++) {
        ctx.fillStyle = '#c5c8ce'
        ctx.fillRect(Math.random() * 120, Math.random() * 40, 2, 2)
      }
      // 验证码字符
      ctx.font = 'bold 24px Arial'
      mockCode.split('').forEach((char, i) => {
        ctx.fillStyle = `hsl(${Math.floor(Math.random() * 360)}, 70%, 40%)`
        ctx.fillText(char, 14 + i * 26, 28 + Math.random() * 6)
      })
      canvas.toBlob((blob) => {
        if (blob)
          resolve(blob)
        else reject(new Error('验证码生成失败'))
      }, 'image/png')
    }
    catch (error) {
      reject(error)
    }
  })
}

/** 登录（mock：账号 admin / 密码 admin123 即可登录，验证码任意） */
export function getLogin(params?: object) {
  const { username, password } = (params ?? {}) as {
    username?: string
    password?: string
  }
  return new Promise<UserResult>((resolve, reject) => {
    setTimeout(() => {
      try {
        if (username === 'admin' && password === 'admin123') {
          resolve({
            retCode: 0,
            msg: '登录成功',
            data: {
              id: '1',
              username: 'admin',
              name: '管理员',
              showName: '管理员',
              isAdmin: 1,
              status: '1',
              email: 'admin@example.com',
              phone: '13800000000',
              gender: '',
              xtkj: 'mock-secret',
              jwt: `mock-token-${Date.now()}`,
              tokenExpiresIn: 86400000,
              myCmpys: [],
              currentCmpy: {
                id: '',
                code: '',
                name: '',
                simpleName: '',
                type: '',
                weight: 0,
                parentId: '',
              },
            },
          })
        }
        else {
          resolve({
            retCode: 1,
            msg: '账号或密码错误（模板默认账号 admin / admin123）',
            data: {
              id: '',
              username: '',
              name: '',
              showName: '',
              isAdmin: 0,
              status: '',
              email: '',
              phone: '',
              gender: '',
              xtkj: '',
              jwt: '',
              tokenExpiresIn: 0,
              myCmpys: [],
              currentCmpy: {
                id: '',
                code: '',
                name: '',
                simpleName: '',
                type: '',
                weight: 0,
                parentId: '',
              },
            },
          })
        }
      }
      catch (error) {
        reject(error)
      }
    }, 500)
  })
}

/** 修改当前登录用户密码（mock：始终成功） */
export function modifyMyPassword(oldPw: string, newPw: string) {
  void oldPw
  void newPw
  return new Promise<{ retCode: number, msg: string, data: boolean }>((resolve) => {
    setTimeout(() => {
      resolve({ retCode: 0, msg: '修改成功', data: true })
    }, 300)
  })
}
