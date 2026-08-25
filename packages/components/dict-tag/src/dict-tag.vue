<script setup lang="ts">
import type { DictTagProps } from './types'

import { useDictData } from './use-dict-data'
import { useDictTag } from './use-dict-tag'

// 保持对外类型导出兼容（原定义在 dict-tag.vue 内联）
export type { DictItem, DictTagProps } from './types'

defineOptions({ name: 'EasyDictTag' })

const props = withDefaults(defineProps<DictTagProps>(), {
  multiple: false,
  size: 'default',
  effect: 'light',
  round: false,
  labelField: 'labelValue',
  valueField: 'id',
})

// ──── 字典数据（mock 请求 + 加载态）────
const { dictList, loading } = useDictData(props)

// ──── 值解析 + 颜色样式（纯 props + dictList 派生）────
const { hasValue, singleItem, multipleItems, buildColorStyle } = useDictTag(props, dictList)
</script>

<template>
  <span v-if="!multiple" class="easy-dict-tag__single">
    <span v-if="loading" class="easy-dict-tag__loading">
      <span class="easy-dict-tag__dot" />
    </span>
    <template v-else-if="singleItem">
      <span
        class="easy-tag"
        :class="[
          `easy-tag--${singleItem.type || 'default'}`,
          `easy-tag--${size}`,
          `easy-tag--${effect}`,
          { 'is-round': round },
        ]"
        :style="singleItem.color ? buildColorStyle(singleItem.color) : {}"
      >
        <!-- 🔌 图标：如不需要图标，删除以下一行 -->
        <easy-icon v-if="singleItem.icon" :name="singleItem.icon" />
        <span class="easy-tag__text">{{ singleItem[labelField] }}</span>
      </span>
    </template>
    <span v-else-if="value !== undefined && value !== null && value !== ''" class="easy-dict-tag__fallback">
      {{ value }}
    </span>
  </span>

  <!-- 多选模式 -->
  <span v-else class="easy-dict-tag__multiple">
    <span v-if="loading" class="easy-dict-tag__loading">
      <span class="easy-dict-tag__dot" />
    </span>
    <template v-else>
      <template v-if="multipleItems.length > 0">
        <span
          v-for="item in multipleItems"
          :key="item[valueField]"
          class="easy-tag"
          :class="[
            `easy-tag--${item.type || 'default'}`,
            `easy-tag--${size}`,
            `easy-tag--${effect}`,
            { 'is-round': round },
          ]"
          :style="item.color ? buildColorStyle(item.color) : {}"
        >
          <!-- 🔌 图标：如不需要图标，删除以下一行 -->
          <easy-icon v-if="item.icon" :name="item.icon" />
          <span class="easy-tag__text">{{ item[labelField] }}</span>
        </span>
      </template>
      <span v-else-if="hasValue" class="easy-dict-tag__fallback">
        {{ Array.isArray(value) ? (value as string[]).join('，') : value }}
      </span>
    </template>
  </span>
</template>

<!-- 组件核心样式（scoped，独立维护在 dict-tag-style.scss） -->
<style scoped src="./dict-tag-style.scss" lang="scss"></style>

<style lang="scss">
/* ========== Dark Mode ========== */
html.dark .easy-dict-tag__fallback {
  color: var(--el-text-color-regular);
}
html.dark .easy-tag--default.easy-tag--light {
  color: var(--el-text-color-secondary);
  background-color: var(--el-fill-color);
  border-color: var(--el-border-color);
}
html.dark .easy-tag--default.easy-tag--dark {
  background-color: #666;
  border-color: #666;
}
html.dark .easy-tag--default.easy-tag--plain {
  color: var(--el-text-color-secondary);
  border-color: var(--el-border-color);
}
</style>
