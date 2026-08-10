<script setup lang="ts">
import EasyEmpty from '../../empty'
import EasyLoading from '../../loading'

defineOptions({ name: 'EasyList' })

const props = withDefaults(defineProps<ListProps>(), {
  list: () => [],
  title: 'title',
  description: '',
  avatar: '',
  extra: '',
  rowKey: 'id',
  bordered: false,
  showEmpty: true,
  emptyText: '暂无数据',
  loading: false,
  hoverable: false,
  clickable: false,
  maxHeight: '',
  header: '',
  footer: '',
})

const emit = defineEmits<{
  (e: 'item-click', item: any, index: number): void
}>()

export interface ListProps {
  /** 数据源 */
  list?: any[]
  /** 主字段名（默认 title） */
  title?: string
  /** 描述字段名 */
  description?: string
  /** 头像字段名或固定值 */
  avatar?: string
  /** 额外内容字段名 */
  extra?: string
  /** 唯一标识字段名（默认 id） */
  rowKey?: string
  /** 是否显示边框 */
  bordered?: boolean
  /** 是否显示空状态组件 */
  showEmpty?: boolean
  /** 空状态文字 */
  emptyText?: string
  /** 加载状态 */
  loading?: boolean
  /** 悬停效果 */
  hoverable?: boolean
  /** 指针样式（cursor: pointer） */
  clickable?: boolean
  /** 最大高度 */
  maxHeight?: string
  /** 头部内容 */
  header?: string
  /** 底部内容 */
  footer?: string
}

function getKey(item: any, index: number): string | number {
  return item[props.rowKey] ?? index
}

function getFieldValue(item: any, field: string): string {
  return item?.[field] ?? ''
}

function handleItemClick(item: any, index: number) {
  emit('item-click', item, index)
}

function isImageUrl(url: string): boolean {
  if (!url)
    return false
  return /\.(?:jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(url) || url.startsWith('http')
}
</script>

<template>
  <div class="easy-list" :class="{ 'easy-list--bordered': bordered }">
    <!-- 头部 -->
    <div v-if="header || $slots.header" class="easy-list__header">
      <slot name="header">
        {{ header }}
      </slot>
    </div>

    <!-- 内容区 -->
    <div class="easy-list__body" :style="{ maxHeight }">
      <!-- 加载中 -->
      <div v-if="loading" class="easy-list__loading">
        <EasyLoading size="20px" />
        <span>加载中...</span>
      </div>

      <!-- 空状态 -->
      <div v-else-if="!list || list.length === 0" class="easy-list__empty">
        <slot name="empty">
          <EasyEmpty v-if="showEmpty" :description="emptyText" />
          <span v-else>{{ emptyText }}</span>
        </slot>
      </div>

      <!-- 列表内容 -->
      <div v-else class="easy-list__content">
        <div
          v-for="(item, index) in list"
          :key="getKey(item, index)"
          class="easy-list__item"
          :class="{
            'easy-list__item--hoverable': hoverable,
            'easy-list__item--clickable': clickable,
          }"
          @click="handleItemClick(item, index)"
        >
          <!-- 自定义渲染 -->
          <slot v-if="$slots.default" :item="item" :index="index" />
          <!-- 默认渲染 -->
          <template v-else>
            <div v-if="avatar && avatar !== ''" class="easy-list__item-avatar">
              <img v-if="isImageUrl(item[avatar])" :src="item[avatar]" alt="">
              <span v-else>{{ getFieldValue(item, avatar) }}</span>
            </div>
            <div class="easy-list__item-content">
              <div class="easy-list__item-title">
                {{ getFieldValue(item, title) }}
              </div>
              <div v-if="description" class="easy-list__item-desc">
                {{ getFieldValue(item, description) }}
              </div>
            </div>
            <div v-if="$slots.extra || extra" class="easy-list__item-extra">
              <slot name="extra" :item="item" :index="index">
                {{ getFieldValue(item, extra!) }}
              </slot>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- 底部 -->
    <div v-if="footer || $slots.footer" class="easy-list__footer">
      <slot name="footer">
        {{ footer }}
      </slot>
    </div>
  </div>
</template>

<style scoped lang="scss">
.easy-list {
  width: 100%;

  &.easy-list--bordered {
    border: 1px solid #f2f3f7;
    border-radius: 8px;
    overflow: hidden;
  }
}

.easy-list__header {
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  background: var(--el-fill-color-light);
  border-bottom: 1px solid #f2f3f7;
}

.easy-list__body {
  overflow-y: auto;
}

.easy-list__loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.easy-list__empty {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

.easy-list__content {
  // 默认列表样式
}

.easy-list__item {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f2f3f7;
  transition: background-color 0.2s;

  &:last-child {
    border-bottom: none;
  }

  &.easy-list__item--hoverable:hover {
    background: var(--el-fill-color-light);
  }

  &.easy-list__item--clickable {
    cursor: pointer;
  }
}

.easy-list__item-avatar {
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 12px;
  background: var(--el-fill-color-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: var(--el-text-color-secondary);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.easy-list__item-content {
  flex: 1;
  min-width: 0;
}

.easy-list__item-title {
  font-size: 14px;
  color: var(--el-text-color-primary);
  line-height: 1.5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.easy-list__item-desc {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.easy-list__item-extra {
  flex-shrink: 0;
  margin-left: 12px;
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.easy-list__footer {
  padding: 12px 16px;
  font-size: 14px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  border-top: 1px solid #f2f3f7;
}
</style>
