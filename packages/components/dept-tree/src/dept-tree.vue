<script setup lang="ts">
import type { DeptTreeEmits, DeptTreeProps } from './types'

import DeptNode from './DeptNode.vue'
import { useDeptTree } from './use-dept-tree'

defineOptions({ name: 'EasyDeptTree' })

const props = withDefaults(defineProps<DeptTreeProps>(), {
  data: () => [],
  nodeKey: () => ({ id: 'id', pid: 'pid', label: 'label', children: 'children' }),
  nodeStyle: () => ({}),
  highlightCurrent: false,
  expandAll: false,
  defaultExpandLevel: 1,
  selectedId: null,
  emptyText: '暂无数据',
  loading: false,
})

const emit = defineEmits<DeptTreeEmits>()

// ──── 树结构归一化 + 选中 / 展开状态（抽离到 composable）────
const { treeData, selectedId, expandedSet, handleSelect, handleToggle } = useDeptTree(props, emit)

// 保持对外类型导出兼容（原定义在 dept-tree.vue）
export type { DeptTreeEmits, DeptTreeProps, NodeKey, Props, TreeNode } from './types'
</script>

<template>
  <div class="easy-dept-tree">
    <div v-if="loading" class="easy-dept-tree__loading">
      <EasyIcon name="el:Loading" class="easy-dept-tree__loading-icon" />
      <span>加载中...</span>
    </div>
    <div v-else-if="emptyText && treeData.length === 0" class="easy-dept-tree__empty">
      {{ emptyText }}
    </div>
    <div v-else class="easy-dept-tree__content">
      <DeptNode v-for="node in treeData" :key="String(node[nodeKey.id])" :node="node" :node-key="nodeKey"
        :node-style="nodeStyle" :highlight-current="highlightCurrent" :expand-all="expandAll"
        :default-expand-level="defaultExpandLevel" :selected-id="selectedId" :expanded-set="expandedSet"
        @select="handleSelect" @toggle="handleToggle" />
    </div>
  </div>
</template>

<!-- 组件样式（非 scoped，节点为递归子组件需共享同一份类名作用域，保持内联） -->
<style lang="scss">
@use './index.scss';
</style>
