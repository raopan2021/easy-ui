<script setup lang="ts">
import type { StatisticEmits, StatisticProps } from './types'

import { ref } from 'vue'
import EasyIcon from '../../icon'
import { useStatistic } from './use-statistic'

// 保持对外类型导出兼容（原内联定义在 statistic.vue）
export type { Props, StatisticEmits, StatisticProps, StatisticSize, StatisticTrend, StatisticVariant } from './types'

defineOptions({ name: 'EasyStatistic' })

const props = withDefaults(defineProps<StatisticProps>(), {
  precision: 0,
  variant: 'default',
  size: 'md',
  bordered: false,
  hoverable: false,
  animated: false,
  animationDuration: 1000,
})

const emit = defineEmits<StatisticEmits>()

/** 主数值节点 ref（模板引用，供后续扩展定位数值 DOM 使用） */
const valueRef = ref<HTMLElement>()

// ──── 数值格式化 + 增长动画（含 onMounted 首播与 value 变化重播）────
const { formattedValue } = useStatistic(props, emit)
</script>

<template>
  <div
    class="easy-statistic"
    :class="[
      `easy-statistic--${size}`,
      `easy-statistic--${variant}`,
      { 'easy-statistic--bordered': bordered },
      { 'easy-statistic--hoverable': hoverable },
    ]"
  >
    <!-- 标题区域 -->
    <div v-if="title || $slots.title || icon" class="easy-statistic-header">
      <div v-if="icon" class="easy-statistic-icon">
        <EasyIcon :name="icon" />
      </div>
      <div class="easy-statistic-title">
        <slot name="title">
          {{ title }}
        </slot>
      </div>
    </div>

    <!-- 数值区域 -->
    <div class="easy-statistic-value">
      <!-- 前缀 -->
      <div v-if="prefix || $slots.prefix" class="easy-statistic-prefix">
        <slot name="prefix">
          {{ prefix }}
        </slot>
      </div>

      <!-- 主数值 -->
      <div ref="valueRef" class="easy-statistic-number" :class="{ 'easy-statistic-number--animated': animated }">
        {{ formattedValue }}
      </div>

      <!-- 后缀 -->
      <div v-if="suffix || $slots.suffix" class="easy-statistic-suffix">
        <slot name="suffix">
          {{ suffix }}
        </slot>
      </div>
    </div>

    <!-- 趋势 -->
    <div v-if="trend" class="easy-statistic-trend">
      <div class="easy-statistic-trend-icon" :class="`easy-statistic-trend--${trend}`">
        <EasyIcon :name="trend === 'up' ? 'el:Top' : 'el:Bottom'" />
      </div>
      <div class="easy-statistic-trend-text">
        <slot name="trendLabel">
          {{ trendLabel }}
        </slot>
      </div>
    </div>

    <!-- 说明 -->
    <div v-if="extra || $slots.extra" class="easy-statistic-extra">
      <slot name="extra">
        {{ extra }}
      </slot>
    </div>
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 statistic-style.scss） -->
<style scoped src="./statistic-style.scss" lang="scss"></style>
