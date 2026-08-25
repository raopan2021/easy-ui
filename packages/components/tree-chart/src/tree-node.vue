<script setup lang="ts">
import type { TreeNodeEmits, TreeNodeProps } from './types'
import { useTreeNode } from './use-tree-node'

// 保持对外类型导出兼容（NodeConfig / TreeNodeData 为树图包共享类型）
export type { NodeConfig, TreeNodeData, TreeNodeEmits, TreeNodeProps } from './types'

defineOptions({ name: 'TreeNode' })

const props = withDefaults(defineProps<TreeNodeProps>(), {
  expandable: true,
  loadingKeys: () => new Set(),
})

const emit = defineEmits<TreeNodeEmits>()

const {
  nodeColor,
  isExpanded,
  hasChildren,
  children,
  isLoading,
  hasRemoteChildren,
  nodeVars,
  toggleExpand,
  handleNodeClick,
  nodeType,
} = useTreeNode(props, emit)
</script>

<template>
  <div class="tree-node-wrapper" :class="`layout-${layout}`">
    <!-- 节点 -->
    <div
      class="tree-node"
      :class="[
        `tree-node--${nodeType}`,
        { 'is-expanded': isExpanded, 'has-children': (hasChildren || hasRemoteChildren) && expandable },
      ]"
      :style="{ '--node-color': nodeColor, ...nodeVars }"
      @click="handleNodeClick"
    >
      <span class="tree-node__title">{{ node[nodeConfig.titleField as string] }}</span>
      <span v-if="node[nodeConfig.descField as string]" class="tree-node__desc">{{ node[nodeConfig.descField as string] }}</span>
      <!-- 加载中状态 -->
      <span v-if="isLoading" class="tree-node__loading">
        <svg class="tree-node__loading-icon" width="16" height="16" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" fill="none" stroke-dasharray="32"
            stroke-dashoffset="32">
            <animate attributeName="stroke-dashoffset" values="32;0;32" dur="1s" repeatCount="indefinite" />
          </circle>
        </svg>
      </span>
      <!-- 展开收起按钮 -->
      <button v-else-if="(hasChildren || hasRemoteChildren) && expandable" class="tree-node__arrow"
        :class="{ 'is-expanded': isExpanded }" @click.stop="toggleExpand">
        <!-- 竖向布局：v^ -->
        <svg v-if="layout === 'vertical' && !isExpanded" viewBox="0 0 24 24" width="16" height="16">
          <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
            fill="none" />
        </svg>
        <svg v-else-if="layout === 'vertical' && isExpanded" viewBox="0 0 24 24" width="16" height="16">
          <path d="M18 15l-6-6-6 6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
            stroke-linejoin="round" fill="none" />
        </svg>
        <!-- 横向布局：<> -->
        <svg v-else-if="layout === 'horizontal' && !isExpanded" viewBox="0 0 24 24" width="16" height="16">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
            stroke-linejoin="round" fill="none" />
        </svg>
        <svg v-else viewBox="0 0 24 24" width="16" height="16">
          <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"
            stroke-linejoin="round" fill="none" />
        </svg>
      </button>
    </div>

    <!-- 子节点 -->
    <div v-if="hasChildren && isExpanded" class="tree-children">
      <TreeNode v-for="(child, index) in children" :key="child[nodeConfig.keyField as string] ?? index" :node="child"
        :node-config="nodeConfig" :layout="layout" :level="level + 1" :colors="colors"
        :default-expand-all="defaultExpandAll" :expanded-keys="expandedKeys" :expandable="expandable"
        @node-click="(n) => emit('node-click', n)" @toggle-expand="(n, e) => emit('toggle-expand', n, e)" />
    </div>
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 tree-node-style.scss） -->
<style scoped src="./tree-node-style.scss" lang="scss"></style>
