<script setup lang="ts">
import type { DeptNodeEmits, DeptNodeProps } from './types'

import { useDeptNode } from './use-dept-node'

const props = withDefaults(defineProps<DeptNodeProps>(), {
  nodeStyle: () => ({}),
  highlightCurrent: false,
  expandAll: false,
  defaultExpandLevel: 1,
  selectedId: null,
  depth: 0,
})

const emit = defineEmits<DeptNodeEmits>()

// ──── 节点字段取值 / 选中态 / 展开态 / 交互（抽离到 composable）────
const {
  nodeLabel,
  nodeChildren,
  hasChildren,
  isSelected,
  isExpanded,
  handleClick,
  handleToggle,
} = useDeptNode(props, emit)
</script>

<template>
  <div class="dept-node" :class="{ 'dept-node--selected': isSelected, 'dept-node--leaf': !hasChildren }">
    <div class="dept-node__row" :style="{ ...nodeStyle, paddingLeft: `${depth * 24 + 20}px` }" @click="handleClick">
      <!-- 展开/折叠图标 -->
      <span v-if="hasChildren" class="dept-node__toggle" :class="{ 'dept-node__toggle--expanded': isExpanded }"
        @click.stop="handleToggle">
        <EasyIcon name="el:ArrowRight" />
      </span>
      <span v-else class="dept-node__toggle-placeholder" />

      <!-- 节点图标 -->
      <span class="dept-node__icon">
        <EasyIcon :name="hasChildren ? 'el:OfficeBuilding' : 'el:UserFilled'" />
      </span>

      <!-- 节点标签 -->
      <span class="dept-node__label">{{ nodeLabel }}</span>
    </div>

    <!-- 子节点 -->
    <div v-if="hasChildren && isExpanded" class="dept-node__children">
      <DeptNode v-for="child in nodeChildren" :key="String(child[nodeKey.id])" :node="child" :node-key="nodeKey"
        :node-style="nodeStyle" :highlight-current="highlightCurrent" :expand-all="expandAll"
        :default-expand-level="defaultExpandLevel" :selected-id="selectedId" :expanded-set="expandedSet"
        :depth="depth + 1" @select="$emit('select', $event)" @toggle="(node, expanded) => $emit('toggle', node, expanded)" />
    </div>
  </div>
</template>

<!-- 组件样式（非 scoped，与 dept-tree 共享同一份类名作用域，保持内联） -->
<style lang="scss">
@use './index.scss';
</style>
