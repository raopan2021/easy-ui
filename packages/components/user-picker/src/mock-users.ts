import type { UserItem } from './types'

/**
 * 模拟用户数据（用于演示，二开时请修改 getMockUsers 函数）
 */
export const mockUsers: UserItem[] = [
  { id: 1, name: '张三', department: '技术部', avatar: '' },
  { id: 2, name: '李四', department: '产品部', avatar: '' },
  { id: 3, name: '王五', department: '设计部', avatar: '' },
  { id: 4, name: '赵六', department: '市场部', avatar: '' },
  { id: 5, name: '钱七', department: '运营部', avatar: '' },
  { id: 6, name: '孙八', department: '技术部', avatar: '' },
  { id: 7, name: '周九', department: '产品部', avatar: '' },
  { id: 8, name: '吴十', department: '设计部', avatar: '' },
]

/**
 * 获取用户数据（默认使用模拟数据）
 * 二开时请将此函数替换为你的真实接口调用
 * @param keyword 搜索关键词
 * @returns 用户列表
 */
export async function getMockUsers(keyword?: string): Promise<UserItem[]> {
  // 模拟延迟
  await new Promise(resolve => setTimeout(resolve, 300))

  // 默认过滤逻辑
  if (keyword) {
    const kw = keyword.toLowerCase()
    return mockUsers.filter(u => u.name.toLowerCase().includes(kw) || u.department.toLowerCase().includes(kw))
  }
  return [...mockUsers]
}
