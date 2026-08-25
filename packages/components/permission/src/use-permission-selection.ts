import type { CheckboxValueType } from 'element-plus'
import type { CheckState, PermissionEmits, PermissionProps } from './types'
import type { PermissionTree } from './use-permission-tree'

import { computed } from 'vue'

/**
 * 权限勾选逻辑：节点勾选 / 全选 / 移除标签。
 *
 * 勾选规则与原实现完全一致：
 * - 勾选节点：选中其下所有未禁用叶子，并补全祖先 id；
 * - 取消勾选：移除其下未禁用叶子与自身，并清理不再被任何叶子需要的祖先；
 * - 全选：选中全部未禁用叶子并补全祖先；取消全选清空。
 *
 * emit 以 PermissionEmits 可调用接口直接标注（不使用 EmitFn<>）。
 *
 * @param props 权限组件 props（响应式对象）
 * @param emit 组件事件（update:modelValue / change）
 * @param tree 权限树上下文（usePermissionTree 返回值）
 */
export function usePermissionSelection(props: PermissionProps, emit: PermissionEmits, tree: PermissionTree) {
  const { nodeMap, leafIds, enabledLeafIds, getLeafDescendants, getAncestors, fillAncestors } = tree

  /** 派发选中值变化（v-model + change） */
  function emitUpdate(value: (string | number)[]) {
    emit('update:modelValue', value)
    emit('change', value)
  }

  /** 根（全选框）状态：按未禁用叶子的选中比例判定 */
  const rootState = computed<CheckState>(() => {
    const enabled = enabledLeafIds.value
    if (enabled.length === 0)
      return 'none'
    const selected = props.modelValue ?? []
    const checkedCount = enabled.filter(id => selected.includes(id)).length
    if (checkedCount === 0)
      return 'none'
    if (checkedCount === enabled.length)
      return 'checked'
    return 'half'
  })

  /** 清理不再被任何选中叶子需要的祖先节点 */
  function pruneUnusedAncestors(currentSet: Set<string | number>) {
    const remainingLeaves = leafIds.value.filter(id => currentSet.has(id))
    const neededAncestors = new Set<string | number>()
    remainingLeaves.forEach((leaf) => {
      getAncestors(leaf).forEach(a => neededAncestors.add(a))
    })
    for (const id of currentSet) {
      const node = nodeMap.value[id]
      if (node && node.children.length > 0 && !neededAncestors.has(id)) {
        currentSet.delete(id)
      }
    }
  }

  /** 勾选 / 取消勾选某个节点（联动其后代叶子与祖先） */
  function onNodeToggle(nodeId: string | number, checked: CheckboxValueType) {
    const currentSet = new Set(props.modelValue ?? [])

    if (checked) {
      getLeafDescendants(nodeId).forEach((leaf) => {
        if (!nodeMap.value[leaf].disabled) {
          currentSet.add(leaf)
        }
      })
    }
    else {
      getLeafDescendants(nodeId).forEach((leaf) => {
        if (!nodeMap.value[leaf].disabled) {
          currentSet.delete(leaf)
        }
      })
      currentSet.delete(nodeId)
      // 清理不再需要的祖先
      pruneUnusedAncestors(currentSet)
    }

    emitUpdate([...fillAncestors(currentSet)])
  }

  /** 全选 / 取消全选 */
  function onRootToggle(checked: CheckboxValueType) {
    if (checked) {
      const result = fillAncestors(new Set(enabledLeafIds.value))
      emitUpdate([...result])
    }
    else {
      emitUpdate([])
    }
  }

  /** 移除已选标签（同时移除其后代叶子与无用祖先） */
  function onRemoveTag(id: string | number) {
    const currentSet = new Set(props.modelValue ?? [])
    getLeafDescendants(id).forEach(leaf => currentSet.delete(leaf))
    currentSet.delete(id)
    pruneUnusedAncestors(currentSet)
    emitUpdate([...currentSet])
  }

  return {
    rootState,
    onNodeToggle,
    onRootToggle,
    onRemoveTag,
  }
}
