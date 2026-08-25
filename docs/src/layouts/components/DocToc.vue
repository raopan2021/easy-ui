<script setup lang="ts">
import type { TocItem } from '../composables/useDocToc'

defineProps<{
  items: TocItem[]
  activeId: string
  /** 是否已滚动到非顶部区域，用于控制回到顶部按钮显隐 */
  scrolled: boolean
}>()

const emit = defineEmits<{
  (e: 'select', id: string): void
  (e: 'back-top'): void
}>()

// 根据层级计算缩进（h2=1，h3=2，依此类推）
function indentClass(level: number): string {
  return `doc-toc__item--l${Math.min(level, 5)}`
}
</script>

<template>
  <aside class="doc-toc">
    <div class="doc-toc__title">
      目录
    </div>
    <ul class="doc-toc__list">
      <li
        v-for="item in items" :key="item.id" class="doc-toc__item"
        :class="[indentClass(item.level), { 'is-active': item.id === activeId }]"
      >
        <a href="javascript:;" class="doc-toc__link" @click.prevent="emit('select', item.id)">
          {{ item.label }}
        </a>
      </li>
    </ul>

    <!-- 回到顶部 -->
    <button class="doc-toc__back-top" :class="{ 'is-visible': scrolled }" @click="emit('back-top')">
      <EasyIcon class="doc-toc__back-top-icon" name="el:Top" />
      <span>回到顶部</span>
    </button>
  </aside>
</template>

<style scoped lang="scss">
.doc-toc {
  width: 200px;
  flex-shrink: 0;
  padding: 16px 0 0 24px;
  border-left: 1px solid var(--el-border-color-lighter);

  &__title {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 12px;
    letter-spacing: 0.5px;
  }

  &__list {
    list-style: none;
    margin: 0;
    padding: 0;
  }

  &__item {
    position: relative;
    margin-bottom: 2px;
    transition: all 0.2s;

    // 层级缩进：h2=1 级 → 0，每级递增
    &--l1 {
      padding-left: 8px;
    }

    &--l2 {
      padding-left: 20px;
    }

    &--l3 {
      padding-left: 32px;
    }

    &--l4 {
      padding-left: 44px;
    }

    &--l5 {
      padding-left: 56px;
    }
  }

  &__link {
    display: block;
    padding: 5px 8px;
    font-size: 13px;
    line-height: 1.5;
    color: var(--el-text-color-regular);
    border-radius: 6px;
    text-decoration: none;
    cursor: pointer;
    transition:
      color 0.2s,
      background-color 0.2s;

    &:hover {
      color: var(--el-color-primary);
    }
  }

  &__item.is-active &__link {
    color: var(--el-color-primary);
    font-weight: 600;
    background-color: var(--el-color-primary-light-9);
  }

  /* 激活项左侧竖线指示 */
  &__item.is-active::before {
    content: '';
    position: absolute;
    left: 0;
    top: 6px;
    bottom: 6px;
    width: 3px;
    border-radius: 2px;
    background-color: var(--el-color-primary);
  }

  /* 回到顶部按钮 */
  &__back-top {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-top: 16px;
    padding: 6px 8px;
    width: 100%;
    border: none;
    border-radius: 6px;
    background: transparent;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    cursor: pointer;
    opacity: 0;
    transform: translateY(6px);
    pointer-events: none;
    transition:
      opacity 0.2s,
      transform 0.2s,
      color 0.2s,
      background-color 0.2s;

    &.is-visible {
      opacity: 1;
      transform: translateY(0);
      pointer-events: auto;
    }

    &:hover {
      color: var(--el-color-primary);
      background-color: var(--el-color-primary-light-9);
    }

    &-icon {
      font-size: 14px;
    }
  }
}
</style>
