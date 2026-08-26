<script setup lang="ts">
import type { TableColumn } from '../../../table'

import type { CompressResult } from '../types'
import { formatFileSize } from '../../../../easy-ui/src/utils/file'
import EasyTable from '../../../table'

defineProps<{
  /** 压缩结果列表 */
  results: CompressResult[]
}>()

const emit = defineEmits<{
  (e: 'selectRow', index: number): void
}>()

/** 表格列配置（名称列与格式化列通过 col-* 插槽自定义渲染） */
const columns: TableColumn[] = [
  { prop: 'name', name: '名称', minWidth: 200 },
  { prop: 'originalSize', name: '原始大小', width: 100, align: 'right' },
  { prop: 'compressedSize', name: '压缩后大小', width: 110, align: 'right' },
  { prop: 'originalWidth', name: '原始分辨率', width: 120, align: 'right' },
  { prop: 'compressedWidth', name: '压缩后分辨率', width: 130, align: 'right' },
  { prop: 'savedPercent', name: '已节省', width: 90, align: 'right' },
  { prop: 'info', name: '信息', minWidth: 140 },
]
</script>

<template>
  <div class="ic-results">
    <div class="ic-results__title">
      压缩结果
      <span class="ic-results__count">共 {{ results.length }} 张，点击行查看对比预览</span>
    </div>
    <EasyTable
      :data="results"
      :columns="columns"
      :show-index="false"
      row-clickable
      compact
      @row-click="(_row: Record<string, any>, index: number) => emit('selectRow', index)"
    >
      <!-- 名称：缩略图 + 文件名 -->
      <template #col-name="{ row }">
        <div class="ic-results__name">
          <img :src="row.compressedUrl" class="ic-results__thumb">
          <span class="ic-results__text">{{ row.name }}</span>
        </div>
      </template>

      <!-- 原始大小 -->
      <template #col-originalSize="{ row }">
        {{ formatFileSize(row.originalSize) }}
      </template>

      <!-- 压缩后大小 -->
      <template #col-compressedSize="{ row }">
        <span :class="row.savedPercent >= 0 ? 'ic-results__save' : 'ic-results__grow'">
          {{ formatFileSize(row.compressedSize) }}
        </span>
      </template>

      <!-- 原始分辨率 -->
      <template #col-originalWidth="{ row }">
        {{ row.originalWidth }} × {{ row.originalHeight }}
      </template>

      <!-- 压缩后分辨率 -->
      <template #col-compressedWidth="{ row }">
        {{ row.compressedWidth }} × {{ row.compressedHeight }}
      </template>

      <!-- 已节省 -->
      <template #col-savedPercent="{ row }">
        <span :class="row.savedPercent >= 0 ? 'ic-results__save' : 'ic-results__grow'">
          {{ row.savedPercent >= 0 ? `${row.savedPercent}%` : `${-row.savedPercent}%` }}
        </span>
      </template>

      <!-- 信息 -->
      <template #col-info="{ row }">
        <span class="ic-results__info">{{ row.info }}</span>
      </template>
    </EasyTable>
  </div>
</template>

<style scoped lang="scss">
.ic-results {
  &__title {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 8px;
  }

  &__count {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
    font-weight: 400;
    margin-left: 8px;
  }

  :deep(.easy-table__row) {
    cursor: pointer;
  }

  &__name {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__thumb {
    width: 32px;
    height: 32px;
    object-fit: cover;
    border-radius: 4px;
    flex-shrink: 0;
  }

  &__text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__save {
    color: var(--el-color-success);
    font-weight: 500;
  }

  &__grow {
    color: var(--el-color-danger);
    font-weight: 500;
  }

  &__info {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}
</style>
