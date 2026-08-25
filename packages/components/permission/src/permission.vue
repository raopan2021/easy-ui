<script setup lang="ts">
import type { CheckboxValueType } from 'element-plus'
import type { PermissionEmits, PermissionProps } from './types'

import { usePermissionSelection } from './use-permission-selection'
import { usePermissionTable } from './use-permission-table'
import { usePermissionTree } from './use-permission-tree'

// 保持对外类型导出兼容（原定义在 permission.vue）
export type { Permission, PermissionProps } from './types'

defineOptions({ name: 'EasyPermission' })

const props = withDefaults(defineProps<PermissionProps>(), {
  modelValue: () => [],
  data: () => [],
  maxLevel: 3,
  disabled: false,
  showSelectAll: true,
  selectAllText: '全选',
  bordered: true,
  showSelected: true,
  idKey: 'id',
  labelKey: 'label',
  childrenKey: 'children',
  disabledKey: 'disabled',
  headers: () => ['功能模块', '页面权限', '操作权限', '功能权限', '数据权限'],
})

const emit = defineEmits<PermissionEmits>()

// ──── 树结构解析（nodeMap / 叶子集合 / label 映射 / 节点状态）────
const tree = usePermissionTree(props)
const { labelMap, getItemDisabled, getNodeState } = tree

// ──── 勾选逻辑（节点 / 全选 / 移除标签）────
const { rootState, onNodeToggle, onRootToggle, onRemoveTag } = usePermissionSelection(props, emit, tree)

// ──── 表格结构（表头 + 行构建）────
const { displayHeaders, tableRows } = usePermissionTable(props, getItemDisabled)
</script>

<template>
  <div class="easy-permission">
    <!-- 全选 -->
    <div v-if="showSelectAll" class="permission-header">
      <el-checkbox
        :model-value="rootState === 'checked'" :indeterminate="rootState === 'half'" :disabled="disabled"
        @change="(val: CheckboxValueType) => onRootToggle(val)"
      >
        {{ selectAllText }}
      </el-checkbox>
    </div>

    <!-- 表格 -->
    <table class="permission-table is-bordered" :class="[`max-level-${maxLevel}`]">
      <!-- 表头 -->
      <thead>
        <tr>
          <th v-if="maxLevel >= 1" class="cell-module">
            {{ displayHeaders[0] }}
          </th>
          <th v-if="maxLevel >= 2" class="cell-page">
            {{ displayHeaders[1] }}
          </th>
          <th v-if="maxLevel >= 3" :class="maxLevel >= 4 ? 'cell-l3' : 'cell-action'">
            {{ displayHeaders[2] }}
          </th>
          <th v-if="maxLevel >= 4" class="cell-l4">
            {{ displayHeaders[3] }}
          </th>
          <th v-if="maxLevel >= 5" class="cell-l5">
            {{ displayHeaders[4] }}
          </th>
        </tr>
      </thead>
      <!-- 表格内容 -->
      <tbody>
        <tr v-for="row in tableRows" :key="row.key">
          <!-- 模块列（一级及以上显示） -->
          <td v-if="maxLevel >= 1 && row.isModuleFirst" :rowspan="row.moduleRowspan" class="cell-module">
            <el-checkbox
              :model-value="getNodeState(row.moduleId) === 'checked'"
              :indeterminate="getNodeState(row.moduleId) === 'half'" :disabled="disabled || row.moduleDisabled"
              @change="(val: CheckboxValueType) => onNodeToggle(row.moduleId, val)"
            >
              {{ row.moduleLabel }}
            </el-checkbox>
          </td>
          <!-- 页面列（二级及以上显示） -->
          <td v-if="maxLevel >= 2 && row.isPageFirst && row.pageId" :rowspan="row.pageRowspan || 1" class="cell-page">
            <el-checkbox
              :model-value="getNodeState(row.pageId) === 'checked'"
              :indeterminate="getNodeState(row.pageId) === 'half'" :disabled="disabled || row.pageDisabled"
              @change="(val: boolean) => onNodeToggle(row.pageId, val)"
            >
              {{ row.pageLabel }}
            </el-checkbox>
          </td>
          <!-- 操作列（三级用actions数组横向排列，四五级用单个action） -->
          <td
            v-if="maxLevel >= 3"
            :class="[maxLevel >= 4 ? 'cell-l3' : 'cell-action', maxLevel === 3 ? 'cell-last' : '']"
          >
            <div class="item-list">
              <template v-if="row.actions.length > 0">
                <!-- 三级：多个操作横向排列 -->
                <el-checkbox
                  v-for="item in row.actions" :key="item._id"
                  :model-value="getNodeState(item._id) === 'checked'" :indeterminate="getNodeState(item._id) === 'half'"
                  :disabled="disabled || item._disabled" @change="(val: CheckboxValueType) => onNodeToggle(item._id, val)"
                >
                  {{ item._label }}
                </el-checkbox>
              </template>
              <template v-else-if="row.action">
                <!-- 四五级：单个操作 -->
                <el-checkbox
                  :model-value="getNodeState(row.action._id) === 'checked'"
                  :indeterminate="getNodeState(row.action._id) === 'half'" :disabled="disabled || row.action._disabled"
                  @change="(val: CheckboxValueType) => onNodeToggle(row.action!._id, val)"
                >
                  {{ row.action._label }}
                </el-checkbox>
              </template>
            </div>
          </td>
          <!-- 功能列（四级） -->
          <td v-if="maxLevel >= 4" class="cell-l4" :class="[maxLevel === 4 ? 'cell-last' : '']">
            <div class="item-list">
              <el-checkbox
                v-for="item in row.features" :key="item._id"
                :model-value="getNodeState(item._id) === 'checked'" :indeterminate="getNodeState(item._id) === 'half'"
                :disabled="disabled || item._disabled" @change="(val: CheckboxValueType) => onNodeToggle(item._id, val)"
              >
                {{ item._label }}
              </el-checkbox>
            </div>
          </td>
          <!-- 数据列（五级） -->
          <td v-if="maxLevel >= 5" class="cell-l5 cell-last">
            <div class="item-list">
              <el-checkbox
                v-for="item in row.dataItems" :key="item._id"
                :model-value="getNodeState(item._id) === 'checked'" :indeterminate="getNodeState(item._id) === 'half'"
                :disabled="disabled || item._disabled" @change="(val: CheckboxValueType) => onNodeToggle(item._id, val)"
              >
                {{ item._label }}
              </el-checkbox>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 已选展示 -->
    <div v-if="showSelected && modelValue.length > 0" class="selected-info">
      <div class="selected-header">
        <span class="selected-title">已选权限</span>
        <span class="selected-count">{{ modelValue.length }} 个</span>
      </div>
      <div class="selected-tags">
        <el-tag v-for="id in modelValue" :key="id" size="small" closable @close="onRemoveTag(id)">
          {{ labelMap[id] || id }}
        </el-tag>
      </div>
    </div>
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 permission-style.scss） -->
<style scoped src="./permission-style.scss" lang="scss"></style>

<style lang="scss">
/* ========== Dark Mode ========== */
html.dark .permission-table th {
  background: var(--el-fill-color);
  color: var(--el-text-color-regular);
}
html.dark .permission-table tbody tr:hover {
  background: var(--el-fill-color-light);
}
html.dark .cell-module {
  background: var(--el-fill-color);
}
html.dark .permission-table.is-bordered {
  border-color: var(--el-border-color);
}
html.dark .permission-table th,
html.dark .permission-table td {
  border-color: var(--el-border-color);
}
html.dark .permission-table {
  background: var(--el-bg-color);
}
html.dark .selected-info {
  background: var(--el-fill-color);
}
html.dark :deep(.el-checkbox__label) {
  color: var(--el-text-color-regular);
}
html.dark .selected-title {
  color: var(--el-text-color-primary);
}
html.dark .selected-count {
  color: var(--el-text-color-secondary);
}
</style>
