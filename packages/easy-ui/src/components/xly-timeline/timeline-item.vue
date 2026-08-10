<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import XlyIcon from '../xly-icon/index.vue'

type TimelineStatus = 'wait' | 'process' | 'finish' | 'error'

defineOptions({
  name: 'XlyTimelineItem',
})

const props = withDefaults(
  defineProps<{
    /** 节点状态 */
    status?: TimelineStatus
    /** 时间戳 */
    timestamp?: string
    /** 图标名称（如 el:Check, el:Clock） */
    icon?: string
  }>(),
  {
    status: 'finish',
    timestamp: '',
    icon: '',
  },
)

// 获取父组件上下文
const timeline = inject<{
  direction: { value: string }
  reverse: { value: boolean }
  itemCount: { value: number }
}>('timeline', {
  direction: { value: ref('vertical') },
  reverse: { value: ref(false) },
  itemCount: { value: ref(1) },
})

const computedDirection = computed(() => {
  return timeline?.direction?.value || 'vertical'
})

const isLastItem = computed(() => {
  return false
})

// 根据状态获取默认图标
const defaultIconByStatus = computed(() => {
  switch (props.status) {
    case 'finish':
      return 'el:Check'
    case 'error':
      return 'el:Close'
    case 'process':
      return 'el:Loading'
    case 'wait':
    default:
      return ''
  }
})

// 显示的图标：优先使用传入的 icon，否则使用状态默认图标
const displayIcon = computed(() => {
  return props.icon || defaultIconByStatus.value
})

// 节点图标尺寸
const nodeIconSize = computed(() => {
  return 12
})
</script>

<template>
  <div class="xly-timeline-item" :class="[`xly-timeline-item--${status}`, `xly-timeline-item--${computedDirection}`]">
    <!-- 连接线 -->
    <div v-if="!isLastItem" class="xly-timeline-item__line" />

    <!-- 时间线节点 -->
    <div class="xly-timeline-item__node" :class="[`xly-timeline-item__node--${status}`]">
      <!-- 自定义插槽（最高优先级） -->
      <slot v-if="$slots.dot" name="dot" />

      <!-- 图标（支持自定义或默认状态图标） -->
      <XlyIcon v-else-if="displayIcon" :name="displayIcon" :size="nodeIconSize" />
    </div>

    <!-- 内容区域 -->
    <div class="xly-timeline-item__content">
      <div v-if="$slots.timestamp || timestamp" class="xly-timeline-item__timestamp">
        <slot name="timestamp">
          {{ timestamp }}
        </slot>
      </div>
      <div class="xly-timeline-item__body">
        <slot />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
/* ========== 设计令牌 ========== */

/* ========== 时间线项 ========== */
.xly-timeline-item {
  position: relative;
  padding-bottom: 24px;

  &.xly-timeline-item--vertical {
    display: flex;
    flex-direction: row;

    .xly-timeline-item__content {
      flex: 1;
      margin-left: 16px;
      padding-top: 2px;
    }
  }

  &.xly-timeline-item--horizontal {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex: 1;

    .xly-timeline-item__content {
      margin-top: 12px;
      text-align: center;
    }
  }

  &.xly-timeline-item--wait {
    .xly-timeline-item__node--wait {
      background-color: var(--el-bg-color);
      border-color: var(--el-text-color-placeholder);
      color: var(--el-text-color-placeholder);
    }
  }

  &.xly-timeline-item--process {
    .xly-timeline-item__node--process {
      background-color: var(--el-color-primary);
      border-color: var(--el-color-primary);
      color: var(--el-color-white);
      box-shadow: 0 0 0 4px rgba(var(--el-color-primary), 0.2);
    }
  }

  &.xly-timeline-item--finish {
    .xly-timeline-item__node--finish {
      background-color: var(--el-color-success);
      border-color: var(--el-color-success);
      color: var(--el-color-white);
    }
  }

  &.xly-timeline-item--error {
    .xly-timeline-item__node--error {
      background-color: var(--el-color-danger);
      border-color: var(--el-color-danger);
      color: var(--el-color-white);
    }
  }
}

/* ========== 连接线 ========== */
.xly-timeline-item__line {
  position: absolute;
  background-color: var(--el-text-color-placeholder);

  .xly-timeline-item--vertical & {
    left: 11px;
    top: 24px;
    bottom: 0;
    width: 2px;
  }

  .xly-timeline-item--horizontal & {
    top: 11px;
    left: 24px;
    right: 0;
    height: 2px;
  }

  .xly-timeline-item--wait & {
    background-color: var(--el-text-color-placeholder);
  }

  .xly-timeline-item--process & {
    background: linear-gradient(to bottom, var(--el-color-primary), var(--el-text-color-placeholder));
  }

  .xly-timeline-item--finish & {
    background-color: var(--el-color-success);
  }

  .xly-timeline-item--error & {
    background-color: var(--el-color-danger);
  }
}

/* ========== 节点 ========== */
.xly-timeline-item__node {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid;
  background-color: var(--el-bg-color);
  flex-shrink: 0;
  z-index: 1;
  transition: all 0.3s ease;

  &.xly-timeline-item__node--wait {
    background-color: var(--el-bg-color);
    border-color: var(--el-text-color-placeholder);
    color: var(--el-text-color-placeholder);
  }

  &.xly-timeline-item__node--process {
    background-color: var(--el-color-primary);
    border-color: var(--el-color-primary);
    color: #fff;
  }

  &.xly-timeline-item__node--finish {
    background-color: var(--el-color-success);
    border-color: var(--el-color-success);
    color: #fff;
  }

  &.xly-timeline-item__node--error {
    background-color: var(--el-color-danger);
    border-color: var(--el-color-danger);
    color: #fff;
  }
}

/* ========== 内容区域 ========== */
.xly-timeline-item__content {
  min-width: 0;
}

.xly-timeline-item__timestamp {
  font-size: 13px;
  color: var(--el-text-color-placeholder);
  margin-bottom: 8px;
  line-height: 1.4;
}

.xly-timeline-item__body {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  line-height: 1.6;

  p {
    margin: 0;
  }
}
</style>
