import type { CheckState, Permission, PermissionProps, TreeNode } from './types'

import { computed } from 'vue'

/**
 * 权限树解析与节点状态查询。
 *
 * 职责：
 * - 将 props.data 递归展开为扁平 nodeMap（记录 parent / children / disabled）；
 * - 派生叶子节点集合、可用叶子集合与 id → label 映射；
 * - 提供祖先 / 后代叶子查询与节点勾选状态计算。
 *
 * 将原本内联在 permission.vue 中的树解析逻辑抽离为独立 composable，
 * 让 .vue 仅承担「组合 + 模板」职责（对齐 markdown / progress 拆分规范）。
 *
 * @param props 权限组件 props（响应式对象）
 */
export function usePermissionTree(props: PermissionProps) {
  /**
   * 统一的禁用判断函数。
   *
   * 优先级：isDisabled 函数 > disabledField + disabledValue > disabledKey 布尔字段。
   *
   * @param item 权限节点
   * @param level 节点层级（从 1 开始）
   */
  function getItemDisabled(item: Permission, level: number): boolean {
    // 优先级1：isDisabled 函数（用于复杂逻辑）
    if (props.isDisabled) {
      return props.isDisabled(item, level)
    }
    // 优先级2：disabledField + disabledValue（简单配置）
    if (props.disabledField && props.disabledValue !== undefined) {
      const fieldVal = item[props.disabledField]
      const disabledValues = Array.isArray(props.disabledValue) ? props.disabledValue : [props.disabledValue]
      return disabledValues.includes(fieldVal)
    }
    // 优先级3：disabledKey 布尔字段（原有方式）
    return !!item[props.disabledKey!]
  }

  /** 扁平化后的节点表（id → 节点信息） */
  const nodeMap = computed<Record<string | number, TreeNode>>(() => {
    const map: Record<string | number, TreeNode> = {}

    const parse = (items: Permission[], parentId: string | number | null, level = 1) => {
      for (const item of items) {
        const id = item[props.idKey!]
        const children = item[props.childrenKey!] || []
        const isItemDisabled = getItemDisabled(item, level)
        map[id] = {
          id,
          label: item[props.labelKey!] || String(id),
          disabled: isItemDisabled,
          parent: parentId,
          children: children.map((c: Permission) => c[props.idKey!]),
        }
        if (children.length > 0)
          parse(children, id, level + 1)
      }
    }

    parse(props.data ?? [], null, 1)
    return map
  })

  /** 所有叶子节点 id */
  const leafIds = computed(() => {
    const result: (string | number)[] = []
    for (const id in nodeMap.value) {
      if (nodeMap.value[id].children.length === 0) {
        result.push(nodeMap.value[id].id)
      }
    }
    return result
  })

  /** id → label 映射（已选标签展示用） */
  const labelMap = computed<Record<string | number, string>>(() => {
    const map: Record<string | number, string> = {}
    for (const id in nodeMap.value) {
      map[nodeMap.value[id].id] = nodeMap.value[id].label
    }
    return map
  })

  /** 未被禁用的叶子节点 id（全选 / 根状态计算用） */
  const enabledLeafIds = computed(() => {
    return leafIds.value.filter(id => !nodeMap.value[id].disabled)
  })

  /** 获取某节点下的全部叶子节点（自身为叶子时返回自身） */
  function getLeafDescendants(nodeId: string | number): (string | number)[] {
    const node = nodeMap.value[nodeId]
    if (!node)
      return []
    if (node.children.length === 0)
      return [nodeId]

    const leaves: (string | number)[] = []
    const walk = (id: string | number) => {
      const n = nodeMap.value[id]
      if (!n)
        return
      if (n.children.length === 0) {
        leaves.push(id)
      }
      else {
        n.children.forEach(walk)
      }
    }
    walk(nodeId)
    return leaves
  }

  /** 计算节点勾选状态（按后代叶子的选中比例判定） */
  function getNodeState(nodeId: string | number): CheckState {
    const leaves = getLeafDescendants(nodeId)
    if (leaves.length === 0)
      return 'none'
    const selected = props.modelValue ?? []
    const checkedCount = leaves.filter(id => selected.includes(id)).length
    if (checkedCount === 0)
      return 'none'
    if (checkedCount === leaves.length)
      return 'checked'
    return 'half'
  }

  /** 获取某节点的全部祖先 id（由近到远） */
  function getAncestors(nodeId: string | number): (string | number)[] {
    const ancestors: (string | number)[] = []
    let current = nodeMap.value[nodeId]
    while (current && current.parent != null) {
      ancestors.push(current.parent)
      current = nodeMap.value[current.parent]
    }
    return ancestors
  }

  /** 为集合补全所有祖先 id（保证父级随子级一并选中） */
  function fillAncestors(ids: Set<string | number>): Set<string | number> {
    const result = new Set(ids)
    for (const id of ids) {
      getAncestors(id).forEach(a => result.add(a))
    }
    return result
  }

  return {
    nodeMap,
    leafIds,
    labelMap,
    enabledLeafIds,
    getItemDisabled,
    getLeafDescendants,
    getNodeState,
    getAncestors,
    fillAncestors,
  }
}

/** 权限树上下文（供勾选 / 表格 composable 复用） */
export type PermissionTree = ReturnType<typeof usePermissionTree>
