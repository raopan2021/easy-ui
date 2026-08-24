<script setup lang="ts">
import { computed, onBeforeUnmount, ref, useSlots, watch } from 'vue'

import { cardProps } from './card'

defineOptions({ name: 'EasyCard' })

const props = defineProps(cardProps)

const emit = defineEmits<{
  (e: 'update:height', value: number): void
  (e: 'resize', value: number): void
}>()

const slots = useSlots()
const hasHeader = computed(() => props.title || slots.header || slots.icon)

const cardEl = ref<HTMLElement>()

/** 拖拽产生的内部高度（外部 v-model:height 未绑定时使用） */
const dragHeight = ref<number | null>(null)
/** 实际生效高度：外部受控 height 优先，否则使用内部拖拽值 */
const currentHeight = computed(() => props.height ?? dragHeight.value)

watch(() => props.height, (value) => {
  // 外部受控后清除内部拖拽值，避免残留旧高度
  if (value !== undefined)
    dragHeight.value = null
})

const cardClass = computed(() => [
  {
    'is-rounded': props.rounded,
    'is-bordered': props.bordered,
    'is-disabled': props.disabled,
    'is-hoverable': props.hoverable,
    'is-fill': props.fill,
    'is-resizable': props.resizable,
  },
  `easy-card--shadow-${props.shadow}`,
])

const cardStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.disabled) {
    style.opacity = '0.5'
    style.cursor = 'not-allowed'
  }
  if (currentHeight.value != null) {
    style.height = `${currentHeight.value}px`
    // 与 fill 组合时显式高度优先，避免 flex 拉伸覆盖拖拽结果
    style.flexGrow = '0'
    style.flexShrink = '0'
  }
  return style
})

// ──── 高度拖拽 ────
let dragging = false
let startY = 0
let startHeight = 0

function onResizeStart(e: MouseEvent) {
  if (props.disabled)
    return
  e.preventDefault()
  dragging = true
  startY = e.clientY
  startHeight = currentHeight.value ?? cardEl.value?.offsetHeight ?? 0
  document.body.style.userSelect = 'none'
  document.addEventListener('mousemove', onResizeMove)
  document.addEventListener('mouseup', onResizeEnd)
}

function onResizeMove(e: MouseEvent) {
  if (!dragging)
    return
  let h = startHeight + e.clientY - startY
  if (props.minHeight != null)
    h = Math.max(h, props.minHeight)
  if (props.maxHeight != null)
    h = Math.min(h, props.maxHeight)
  dragHeight.value = h
  emit('update:height', h)
  emit('resize', h)
}

function onResizeEnd() {
  if (!dragging)
    return
  dragging = false
  document.body.style.userSelect = ''
  document.removeEventListener('mousemove', onResizeMove)
  document.removeEventListener('mouseup', onResizeEnd)
}

onBeforeUnmount(() => {
  if (dragging) {
    document.body.style.userSelect = ''
    document.removeEventListener('mousemove', onResizeMove)
    document.removeEventListener('mouseup', onResizeEnd)
  }
})
</script>

<template>
  <div ref="cardEl" class="easy-card" :class="cardClass" :style="cardStyle">
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

    <div
      v-if="resizable"
      class="easy-card__resizer"
      title="拖动调整高度"
      @mousedown="onResizeStart"
    >
      <span class="easy-card__resizer-line" />
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
  display: flex;
  flex-direction: column;
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

  // 占满父容器剩余空间（父容器为 flex 时 flex:1 生效，块级定高时 height:100% 生效）
  &.is-fill {
    flex: 1 1 0%;
    height: 100%;
    min-height: 0;

    .easy-card__body {
      flex: 1;
      min-height: 0;
      overflow: auto;
    }
  }

  // 拖拽调整高度时，body 区域可滚动，避免内容被撑破
  &.is-resizable {
    .easy-card__body {
      min-height: 0;
      overflow: auto;
    }
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
  flex-shrink: 0;
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
  flex: 1;
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
  flex-shrink: 0;
}
.easy-card__footer:empty {
  display: none;
}

// 底部拖拽手柄
.easy-card__resizer {
  position: absolute;
  left: 50%;
  bottom: 0;
  transform: translateX(-50%);
  z-index: 2;
  height: 14px;
  width: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: ns-resize;
  opacity: 0;
  transition: opacity 0.2s;

  .easy-card__resizer-line {
    display: block;
    width: 40px;
    height: 4px;
    border-radius: 2px;
    background: var(--el-border-color);
    transition: background 0.2s;
  }

  &:hover,
  &:active {
    opacity: 1;

    .easy-card__resizer-line {
      background: var(--el-color-primary);
    }
  }
}

.easy-card.is-resizable:hover .easy-card__resizer {
  opacity: 0.8;
}
</style>
