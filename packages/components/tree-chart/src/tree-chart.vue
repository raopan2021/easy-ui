<script setup lang="ts">
import type { TreeChartEmits, TreeChartProps } from './types'

import TreeNode from './tree-node.vue'
import { useTreeChart } from './use-tree-chart'

// 保持对外类型导出兼容（原定义在 tree-chart.vue 内联）
export type { TreeChartEmits, TreeChartProps, TreeChatNode } from './types'

defineOptions({ name: 'EasyTreeChart' })

const props = withDefaults(defineProps<TreeChartProps>(), {
  data: () => [],
  trees: () => [],
  nodeConfig: () => ({}),
  layout: 'horizontal',
  defaultExpandAll: true,
  expandedKeys: () => [],
  showToolbar: true,
  colors: () => ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'],
  minScale: 0.3,
  maxScale: 3,
  expandable: true,
  backgroundColor: 'var(--el-bg-color)',
  showGrid: true,
  gridColor: 'var(--el-border-color-lighter)',
  width: '100%',
  height: '100%',
})

const emit = defineEmits<TreeChartEmits>()

const {
  containerRef,
  canvasWrapperRef,
  canvasRef,
  linesSvgRef,
  scale,
  canvasWidth,
  canvasHeight,
  internalLayout,
  isPanning,
  connectionLines,
  hasMultipleTrees,
  isEmpty,
  canvasStyle,
  canvasWrapperStyle,
  mergedNodeConfig,
  currentExpandedKeys,
  getNodeKey,
  setLayout,
  zoomIn,
  zoomOut,
  resetView,
  onWheel,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  handleNodeClick,
  handleToggleExpand,
} = useTreeChart(props, emit)

// ========== 暴露方法 ==========
defineExpose({
  zoomIn,
  zoomOut,
  resetView,
  setLayout,
})
</script>

<template>
  <div ref="containerRef" class="easy-tree-Chart">
    <!-- 控制栏 -->
    <div v-if="showToolbar" class="easy-tree-Chart__toolbar">
      <div class="easy-tree-Chart__toolbar-left">
        <slot name="toolbar" />
      </div>
      <div class="easy-tree-Chart__toolbar-right">
        <!-- 布局切换 -->
        <button
          class="easy-tree-Chart__btn" :class="{ 'is-active': internalLayout === 'horizontal' }" title="横向布局"
          @click="setLayout('horizontal')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="6" width="18" height="4" rx="1" />
            <rect x="3" y="14" width="12" height="4" rx="1" />
          </svg>
        </button>
        <button
          class="easy-tree-Chart__btn" :class="{ 'is-active': internalLayout === 'vertical' }" title="竖向布局"
          @click="setLayout('vertical')"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="6" y="3" width="4" height="18" rx="1" />
            <rect x="14" y="3" width="4" height="12" rx="1" />
          </svg>
        </button>
        <div class="easy-tree-Chart__divider" />
        <!-- 缩放控制 -->
        <button class="easy-tree-Chart__btn" title="缩小" @click="zoomOut">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>
        <span class="easy-tree-Chart__zoom-text">{{ Math.round(scale * 100) }}%</span>
        <button class="easy-tree-Chart__btn" title="放大" @click="zoomIn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>
        <button class="easy-tree-Chart__btn" title="重置视图" @click="resetView">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
      </div>
    </div>

    <!-- 画布容器 -->
    <div
      ref="canvasWrapperRef" class="easy-tree-Chart__canvas-wrapper" :class="{ 'is-panning': isPanning }"
      :style="canvasWrapperStyle" @mousedown="onMouseDown" @mousemove="onMouseMove" @mouseup="onMouseUp"
      @mouseleave="onMouseUp" @wheel.prevent="onWheel" @contextmenu.prevent
    >
      <!-- 画布内容 -->
      <div ref="canvasRef" class="easy-tree-Chart__canvas" :style="canvasStyle">
        <!-- SVG 连接线层 -->
        <svg
          ref="linesSvgRef" class="easy-tree-Chart__lines" :width="canvasWidth" :height="canvasHeight"
          :viewBox="`0 0 ${canvasWidth} ${canvasHeight}`"
        >
          <g v-for="link in connectionLines" :key="link.id">
            <path :d="link.path" :stroke="link.color" stroke-width="1.5" fill="none" stroke-linecap="square" />
          </g>
        </svg>

        <!-- 递归渲染树节点 -->
        <div class="easy-tree-Chart__root" :class="`easy-tree-Chart__root--${internalLayout}`">
          <!-- 多棵树模式 -->
          <template v-if="hasMultipleTrees">
            <div
              v-for="(treeData, treeIndex) in props.trees" :key="`tree-${treeIndex}`"
              class="easy-tree-Chart__tree-wrapper" :class="`easy-tree-Chart__tree-wrapper--${internalLayout}`"
            >
              <TreeNode
                v-for="(node, index) in treeData" :key="getNodeKey(node, index, `tree-${treeIndex}`)"
                :node="node" :node-config="mergedNodeConfig" :layout="internalLayout" :level="0" :colors="colors"
                :default-expand-all="defaultExpandAll" :expanded-keys="currentExpandedKeys" :expandable="expandable"
                @node-click="handleNodeClick" @toggle-expand="handleToggleExpand"
              />
            </div>
          </template>
          <!-- 单棵树模式 -->
          <template v-else>
            <TreeNode
              v-for="(node, index) in data" :key="getNodeKey(node, index)" :node="node"
              :node-config="mergedNodeConfig" :layout="internalLayout" :level="0" :colors="colors"
              :default-expand-all="defaultExpandAll" :expanded-keys="currentExpandedKeys" :expandable="expandable"
              @node-click="handleNodeClick" @toggle-expand="handleToggleExpand"
            />
          </template>
        </div>
      </div>

      <!-- 空状态 -->
      <div v-if="isEmpty" class="easy-tree-Chart__empty">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
        <p>暂无数据</p>
      </div>
    </div>
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 tree-chart-style.scss） -->
<style scoped src="./tree-chart-style.scss" lang="scss"></style>
