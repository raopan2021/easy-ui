import type { DictOption } from './types'

// ============================================================
// ⚙️ 字典请求函数 — 二开指南
// ============================================================
// 替换此函数为您自己的接口请求，示例：
//
//   import { getDictList } from '../../../easy-ui/src/api/system/dict'
//
//   async function fetchDictList(dictType: string): Promise<DictOption[]> {
//     const res = await getDictList({ dictType })
//     // 如果接口返回的字段名与 valueField/labelField 不一致，
//     // 可以在这里做字段映射，或直接使用组件的 value-field / label-field 属性
//     return res.data
//   }
//
// 注意：
//   1. 返回的数组中每条数据至少包含 valueField（默认 id）和 labelField（默认 labelName，显示文本）
//   2. 可携带 disabled 字段控制禁用状态
//   3. 如需全局缓存字典数据，可在外部实现缓存 Map，在此函数内先查缓存再请求接口
// ============================================================

/**
 * 按字典类型标识拉取字典数据（内置 mock 实现，二开时替换为真实接口）。
 *
 * @param dictType 字典类型标识
 * @returns 字典项列表；未匹配到类型时返回空数组
 */
export async function fetchDictList(dictType: string): Promise<DictOption[]> {
  // 模拟网络延迟
  await new Promise(r => setTimeout(r, 300))

  const mockData: Record<string, DictOption[]> = {
    // 用户状态
    user_status: [
      { id: '1', labelValue: 'NORMAL', labelName: '正常' },
      { id: '2', labelValue: 'DISABLED', labelName: '禁用' },
      { id: '3', labelValue: 'PENDING', labelName: '待激活' },
      { id: '4', labelValue: 'DELETED', labelName: '已注销' },
    ],
    // 审批状态
    approve_status: [
      { id: '0', labelValue: 'WAITING', labelName: '待审批' },
      { id: '1', labelValue: 'PROCESSING', labelName: '审批中' },
      { id: '2', labelValue: 'APPROVED', labelName: '已通过' },
      { id: '3', labelValue: 'REJECTED', labelName: '已拒绝' },
      { id: '4', labelValue: 'WITHDRAWN', labelName: '已撤回' },
    ],
    // 性别
    gender: [
      { id: '1', labelValue: 'MALE', labelName: '男' },
      { id: '2', labelValue: 'FEMALE', labelName: '女' },
      { id: '0', labelValue: 'UNKNOWN', labelName: '未知' },
    ],
    // 优先级
    priority: [
      { id: 'low', labelValue: 'LOW', labelName: '低' },
      { id: 'medium', labelValue: 'MEDIUM', labelName: '中' },
      { id: 'high', labelValue: 'HIGH', labelName: '高' },
      { id: 'urgent', labelValue: 'URGENT', labelName: '紧急' },
    ],
    // 订单状态
    order_status: [
      { id: '1', labelValue: 'UNPAID', labelName: '待付款' },
      { id: '2', labelValue: 'UNSHIPPED', labelName: '待发货' },
      { id: '3', labelValue: 'SHIPPED', labelName: '已发货' },
      { id: '4', labelValue: 'COMPLETED', labelName: '已完成' },
      { id: '5', labelValue: 'CANCELLED', labelName: '已取消' },
      { id: '6', labelValue: 'REFUNDING', labelName: '退款中', disabled: true },
    ],
    // 角色类型
    role_type: [
      { id: 'admin', labelValue: 'SUPER_ADMIN', labelName: '超级管理员' },
      { id: 'manager', labelValue: 'ADMIN', labelName: '管理员' },
      { id: 'editor', labelValue: 'EDITOR', labelName: '编辑者' },
      { id: 'viewer', labelValue: 'VIEWER', labelName: '查看者' },
    ],
    // 自定义字段演示
    custom_field_demo: [
      { id: 'active', labelValue: 'ACTIVE', labelName: '启用中' },
      { id: 'inactive', labelValue: 'INACTIVE', labelName: '已停用' },
      { id: 'pending', labelValue: 'PENDING', labelName: '待审核' },
    ],
  }

  return mockData[dictType] ?? []
}
