<script setup lang="ts">
import { computed, useSlots } from 'vue'

import { cardProps } from './card'

defineOptions({ name: 'EasyCard' })

const props = defineProps(cardProps)

const slots = useSlots()
const hasHeader = computed(() => props.title || slots.header || slots.icon)

const cardClass = computed(() => [
  {
    'is-rounded': props.rounded,
    'is-bordered': props.bordered,
    'is-disabled': props.disabled,
    'is-hoverable': props.hoverable,
  },
  `easy-card--shadow-${props.shadow}`,
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

<template>
  <div class="easy-card" :class="cardClass" :style="cardStyle">
    <div v-if="hasHeader" class="easy-card__header">
      <slot name="header">
        <div class="easy-card__title">
          <slot name="icon">
            <span v-if="icon" class="easy-card__icon">{{ icon }}</span>
          </slot>
          <span>{{ title }}</span>
        </div>
      </slot>
      <div v-if="$slots.extra" class="easy-card__extra">
        <slot name="extra" />
      </div>
    </div>

    <div class="easy-card__body">
      <slot />
    </div>

    <div v-if="$slots.footer" class="easy-card__footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<style scoped lang="scss">
$radius: 10px;
$shadow-md:
  0 4px 6px -1px rgba(0, 0, 0, 0.06),
  0 2px 4px -1px rgba(0, 0, 0, 0.04);
$shadow-hover:
  0 8px 16px -4px rgba(0, 0, 0, 0.1),
  0 4px 8px -2px rgba(0, 0, 0, 0.06);

.easy-card {
  position: relative;
  background: var(--el-bg-color);
  color: var(--el-text-color-regular);
  box-sizing: border-box;
  overflow: hidden;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  html.dark & {
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  }
  html.dark &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }

  &.is-rounded {
    border-radius: $radius;
  }
  &.is-bordered {
    border: 1px solid var(--el-border-color-light);
  }
  &.is-hoverable {
    cursor: pointer;
  }
  &.is-hoverable:hover {
    transform: translateY(-3px);
    box-shadow: $shadow-hover;
    border-color: var(--el-border-color);
  }
  &.is-disabled {
    pointer-events: none;
  }
}

.easy-card--shadow-always {
  box-shadow: $shadow-md;
}
.easy-card--shadow-hover:hover {
  box-shadow: $shadow-hover;
}
.easy-card--shadow-never {
  box-shadow: none;
}

.easy-card__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 18px;
  border-bottom: 1px solid var(--el-border-color-light);
}
.easy-card__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1.4;
}
.easy-card__icon {
  color: var(--el-color-primary);
  flex-shrink: 0;
}
.easy-card__extra {
  flex-shrink: 0;
  margin-left: 12px;
  font-size: 13px;
}
.easy-card__body {
  padding: 18px;
  font-size: 14px;
  line-height: 1.6;
  color: var(--el-text-color-regular);
}
.easy-card__footer {
  padding: 14px 18px;
  border-top: 1px solid var(--el-border-color-light);
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
.easy-card__footer:empty {
  display: none;
}
</style>
