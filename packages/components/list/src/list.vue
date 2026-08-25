<script setup lang="ts">
import type { ListEmits, ListProps } from './types'
import EasyEmpty from '../../empty'

import EasyLoading from '../../loading'
import { useList } from './use-list'

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

const emit = defineEmits<ListEmits>()

// 将原来内联的 key 解析 / 字段取值 / 点击上报 / 图片判定逻辑抽离到 composable
const {
  getKey,
  getFieldValue,
  handleItemClick,
  isImageUrl,
} = useList(props, emit)

// 保持对外类型导出兼容（原定义在 list.vue，现统一维护在 ./types）
export type { ListEmits, ListProps } from './types'
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
        <EasyLoading :size="20" />
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

<!-- 组件核心样式（scoped，独立维护在 list-style.scss） -->
<style scoped src="./list-style.scss" lang="scss"></style>
