<template>
  <div class="xly-card" :class="cardClass" :style="cardStyle">
    <!-- 头部 -->
    <div v-if="hasHeader" class="xly-card__header">
      <slot name="header">
        <div class="xly-card__title">
          <slot name="icon">
            <XlyIcon v-if="icon" :name="icon" :size="16" />
          </slot>
          <span>{{ title }}</span>
        </div>
      </slot>
      <div v-if="$slots.extra" class="xly-card__extra">
        <slot name="extra" />
      </div>
    </div>

    <!-- 内容区 -->
    <div class="xly-card__body">
      <slot />
    </div>

    <!-- 底部 -->
    <div v-if="$slots.footer" class="xly-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import XlyIcon from '@/components/xly-icon/index.vue'

type ShadowType = 'always' | 'hover' | 'never'

const props = withDefaults(defineProps<{
  /** 卡片标题 */
  title?: string
  /** 标题图标 */
  icon?: string
  /** 是否有圆角 */
  rounded?: boolean
  /** 边框 */
  bordered?: boolean
  /** 阴影类型 */
  shadow?: ShadowType
  /** 是否禁用 */
  disabled?: boolean
  /** 是否悬浮时上浮 */
  hoverable?: boolean
}>(), {
  title: '',
  icon: '',
  rounded: true,
  bordered: true,
  shadow: 'always',
  disabled: false,
  hoverable: false,
})

defineOptions({
  name: 'XlyCard',
})

const slots = useSlots()
const hasHeader = computed(() => props.title || slots.header || slots.icon)

const cardClass = computed(() => [
  {
    'is-rounded': props.rounded,
    'is-bordered': props.bordered,
    'is-disabled': props.disabled,
    'is-hoverable': props.hoverable,
  },
  `xly-card--shadow-${props.shadow}`,
])

const cardStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.disabled) {
    style.opacity = '0.5'
    style.cursor = 'not-allowed'
  }
  return style
})
</script>

<style scoped lang="scss">
/* ========== 现代设计系统 ========== */
/* 颜色通过 var(--el-*) 统一，自动兼容 dark 模式 */
/* 圆角 */
$radius: 10px;
$radius-sm: 6px;

/* 阴影 - 柔和现代（rgba(0,0,0,x) 在 dark 下自然淡化，符合预期） */
$shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.06), 0 2px 4px -1px rgba(0, 0, 0, 0.04);
$shadow-hover: 0 8px 16px -4px rgba(0, 0, 0, 0.1), 0 4px 8px -2px rgba(0, 0, 0, 0.06);

/* ========== 卡片主体 ========== */
.xly-card {
  position: relative;
  background: var(--el-bg-color);
  color: var(--el-text-color-regular);
  box-sizing: border-box;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  /* 圆角 */
  &.is-rounded {
    border-radius: $radius;
  }

  /* 边框 */
  &.is-bordered {
    border: 1px solid var(--el-border-color-light);
  }

  /* 悬浮效果 */
  &.is-hoverable {
    cursor: pointer;

    &:hover {
      transform: translateY(-3px);
      box-shadow: $shadow-hover;
      border-color: var(--el-border-color);
    }
  }

  /* 阴影类型 */
  &--shadow-always {
    box-shadow: $shadow-md;
  }

  &--shadow-hover:hover {
    box-shadow: $shadow-hover;
  }

  &--shadow-never {
    box-shadow: none;
  }

  /* 禁用状态 */
  &.is-disabled {
    pointer-events: none;
  }
}

/* ========== 卡片头部 ========== */
.xly-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid var(--el-border-color-light);
}

.xly-card__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1.4;

  > .xly-icon {
    color: var(--el-color-primary);
    flex-shrink: 0;
  }
}

.xly-card__extra {
  flex-shrink: 0;
  margin-left: 12px;
  font-size: 13px;
}

/* ========== 卡片内容区 ========== */
.xly-card__body {
  padding: 18px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--el-text-color-regular);
}

/* ========== 卡片底部 ========== */
.xly-card__footer {
  padding: 14px 18px;
  border-top: 1px solid var(--el-border-color-light);
  font-size: 13px;
  color: var(--el-text-color-secondary);

  &:empty {
    display: none;
  }
}
</style>
