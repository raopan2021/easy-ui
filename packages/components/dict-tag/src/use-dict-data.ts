import type { DictItem, DictTagProps } from './types'

import { onMounted, ref, watch } from 'vue'

/**
 * DictTag 字典数据获取（含加载态与生命周期）。
 *
 * 将原 dict-tag.vue 中的 `fetchDictList`（mock 请求）/ `loadDict` /
 * `dictList` / `loading` / `onMounted` + `watch(dictType)` 抽离为独立 composable。
 *
 * ⚙️ 二开指南：将 `fetchDictList` 替换为真实接口请求即可，
 * 返回数组需至少包含 `valueField`（默认 id）与 `labelField`（默认 labelValue）。
 *
 * @param props 字典标签 props（需响应式，用于读取 dictType）
 */
export function useDictData(props: DictTagProps) {
  /** 已加载的字典列表 */
  const dictList = ref<DictItem[]>([])
  /** 加载中状态（loading 占位动画用） */
  const loading = ref(false)

  /**
   * 根据 dictType 请求字典数据（当前为 mock 实现，保留 300ms 模拟延迟）。
   * 真实项目可替换为接口请求，返回结构需满足 DictItem。
   */
  async function fetchDictList(dictType: string): Promise<DictItem[]> {
    // 模拟网络延迟
    await new Promise(r => setTimeout(r, 300))

    const mockData: Record<string, DictItem[]> = {
      // 用户状态
      user_status: [
        { id: '1', labelValue: '正常', type: 'success' },
        { id: '2', labelValue: '禁用', type: 'danger' },
        { id: '3', labelValue: '待激活', type: 'warning' },
        { id: '4', labelValue: '已注销', type: 'info' },
      ],
      // 审批状态
      approve_status: [
        { id: '0', labelValue: '待审批', type: 'warning' },
        { id: '1', labelValue: '审批中', type: 'primary' },
        { id: '2', labelValue: '已通过', type: 'success' },
        { id: '3', labelValue: '已拒绝', type: 'danger' },
        { id: '4', labelValue: '已撤回', type: 'info' },
      ],
      // 性别（el: 前缀 = Element Plus 图标）
      gender: [
        { id: '1', labelValue: '男', type: 'primary', icon: 'el:Male' },
        { id: '2', labelValue: '女', type: 'danger', icon: 'el:Female' },
        { id: '0', labelValue: '未知', type: 'info' },
      ],
      // 优先级
      priority: [
        { id: 'low', labelValue: '低', color: '#34c759' },
        { id: 'medium', labelValue: '中', color: '#f5a623' },
        { id: 'high', labelValue: '高', color: '#ff3b30' },
        { id: 'urgent', labelValue: '紧急', color: '#af52de' },
      ],
      // 订单状态
      order_status: [
        { id: '1', labelValue: '待付款', type: 'warning' },
        { id: '2', labelValue: '待发货', type: 'primary' },
        { id: '3', labelValue: '已发货', type: 'primary' },
        { id: '4', labelValue: '已完成', type: 'success' },
        { id: '5', labelValue: '已取消', type: 'info' },
        { id: '6', labelValue: '退款中', type: 'danger' },
      ],
      // 角色类型
      role_type: [
        { id: 'admin', labelValue: '超级管理员', type: 'danger' },
        { id: 'manager', labelValue: '管理员', type: 'warning' },
        { id: 'editor', labelValue: '编辑者', type: 'primary' },
        { id: 'viewer', labelValue: '查看者', type: 'info' },
      ],
      // 自定义字段演示（code → name）
      custom_field_demo: [
        { code: 'active', name: '启用中', type: 'success' },
        { code: 'inactive', name: '已停用', type: 'danger' },
        { code: 'pending', name: '待审核', type: 'warning' },
      ],
    }

    return mockData[dictType] ?? []
  }

  /** 加载字典数据（dictType 为空时直接跳过） */
  async function loadDict() {
    if (!props.dictType)
      return
    loading.value = true
    try {
      dictList.value = await fetchDictList(props.dictType)
    }
    finally {
      loading.value = false
    }
  }

  // 首次挂载加载，后续 dictType 变化重新加载
  onMounted(loadDict)
  watch(() => props.dictType, loadDict)

  return {
    dictList,
    loading,
  }
}
