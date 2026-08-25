<script setup lang="ts">
import type { CardEmits, CardProps } from './types'

import { useCard } from './use-card'

defineOptions({ name: 'EasyCard' })

const props = withDefaults(defineProps<CardProps>(), {
  title: '',
  icon: '',
  rounded: true,
  bordered: true,
  shadow: 'always',
  disabled: false,
  hoverable: false,
  fill: false,
  resizable: false,
  height: undefined,
  minHeight: 120,
  maxHeight: undefined,
})

const emit = defineEmits<CardEmits>()

// 将原来内联的头部判定 / 高度合并 / 类名样式 / 拖拽改高逻辑抽离到 composable
const {
  cardEl,
  hasHeader,
  cardClass,
  cardStyle,
  onResizeStart,
} = useCard(props, emit)

// 保持对外类型导出兼容（原定义在 card.vue，现统一维护在 ./types）
export type { CardEmits, CardProps } from './types'
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

    <div v-if="resizable" class="easy-card__resizer" title="拖动调整高度" @mousedown="onResizeStart">
      <span class="easy-card__resizer-line" />
    </div>
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 card-style.scss） -->
<style scoped src="./card-style.scss" lang="scss"></style>
