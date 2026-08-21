import type { PageQueryResult, SystemResponse } from '../types'

/* ============================================================
 * CRUD 示例 Mock API
 *
 * 模板自带的基础 CRUD 演示接口：分页查询 / 新增 / 编辑 / 删除。
 * 数据保存在内存中（刷新后重置），无需后端即可体验完整流程。
 *
 * 接入真实后端时，替换为 http 调用即可（参照各函数注释）。
 * ============================================================ */

/** 示例实体（用户） */
export interface ExampleItem {
  id: string
  /** 用户名 */
  name: string
  /** 邮箱 */
  email: string
  /** 手机号 */
  phone: string
  /** 部门 */
  dept: string
  /** 状态：1-启用 0-禁用 */
  status: number
  /** 创建时间 */
  createTime: string
}

/** 分页查询参数 */
export interface ExamplePageParams {
  currentPage: number
  pageNum: number
  /** 关键字（用户名/邮箱模糊匹配） */
  search?: string
  /** 状态筛选 */
  status?: number
}

/** 新增/编辑参数 */
export type ExampleSaveParams = Omit<ExampleItem, 'id' | 'createTime'> & {
  id?: string
}

/** 模拟网络延迟 */
const delay = (ms = 300) => new Promise(resolve => setTimeout(resolve, ms))

/** 内存数据库（刷新页面后重置） */
let mockDB: ExampleItem[] = []

/** 初始化 mock 数据 */
function initMockData(): ExampleItem[] {
  const depts = ['技术部', '产品部', '运营部', '市场部', '财务部']
  const names = ['张伟', '李娜', '王芳', '刘洋', '陈静', '杨明', '赵雪', '黄磊', '周婷', '吴强']
  return Array.from({ length: 35 }, (_, i) => {
    const dept = depts[i % depts.length]
    const name = names[i % names.length]
    return {
      id: String(i + 1),
      name: i < names.length ? name : `${name}${Math.floor(i / names.length) + 1}`,
      email: `user${i + 1}@example.com`,
      phone: `138${String(10000000 + i * 137).slice(-8)}`,
      dept,
      status: i % 5 === 0 ? 0 : 1,
      createTime: new Date(2024, 0, (i % 28) + 1).toLocaleDateString('zh-CN'),
    }
  })
}

/**
 * 分页查询示例列表
 * @param params 分页 + 关键字 + 状态筛选
 */
export async function getExamplePage(params: ExamplePageParams): Promise<SystemResponse<PageQueryResult<ExampleItem>>> {
  await delay()
  if (mockDB.length === 0)
    mockDB = initMockData()

  let filtered = [...mockDB]
  if (params.search) {
    const keyword = params.search.toLowerCase()
    filtered = filtered.filter(
      item =>
        item.name.toLowerCase().includes(keyword)
        || item.email.toLowerCase().includes(keyword),
    )
  }
  if (params.status !== undefined && params.status !== null) {
    filtered = filtered.filter(item => item.status === params.status)
  }

  const totalRecordsNum = filtered.length
  const start = (params.currentPage - 1) * params.pageNum
  const records = filtered.slice(start, start + params.pageNum)

  return {
    retCode: 0,
    msg: '查询成功',
    data: {
      totalRecordsNum,
      currentPage: params.currentPage,
      pageNum: params.pageNum,
      totalPage: Math.ceil(totalRecordsNum / params.pageNum),
      records,
    },
  }
}

/** 新增示例数据 */
export async function createExample(data: ExampleSaveParams): Promise<SystemResponse<ExampleItem>> {
  await delay(200)
  if (mockDB.length === 0)
    mockDB = initMockData()
  const item: ExampleItem = {
    id: String(Date.now()),
    ...data,
    createTime: new Date().toLocaleDateString('zh-CN'),
  }
  mockDB.unshift(item)
  return { retCode: 0, msg: '新增成功', data: item }
}

/** 编辑示例数据 */
export async function updateExample(data: ExampleSaveParams): Promise<SystemResponse<ExampleItem>> {
  await delay(200)
  if (!data.id)
    return { retCode: 1, msg: '缺少 id', data: null as any }
  const index = mockDB.findIndex(item => item.id === data.id)
  if (index === -1)
    return { retCode: 1, msg: '数据不存在', data: null as any }
  const updated: ExampleItem = { ...mockDB[index], ...data, id: data.id }
  mockDB[index] = updated
  return { retCode: 0, msg: '更新成功', data: updated }
}

/** 删除示例数据 */
export async function deleteExample(id: string): Promise<SystemResponse<boolean>> {
  await delay(200)
  mockDB = mockDB.filter(item => item.id !== id)
  return { retCode: 0, msg: '删除成功', data: true }
}
