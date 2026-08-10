<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import EasyIcon from '../../icon'

defineOptions({ name: 'EasyStatistic' })

const props = withDefaults(defineProps<Props>(), {
  precision: 0,
  variant: 'default',
  size: 'md',
  bordered: false,
  hoverable: false,
  animated: false,
  animationDuration: 1000,
})

const emit = defineEmits<{
  animationComplete: []
}>()

// 千分位格式化
function formatNumber(num: number, precision: number = 0): string {
  if (isNaN(num))
    return '0'

  const factor = 10 ** precision
  const rounded = Math.round(num * factor) / factor
  const [integerPart, decimalPart] = rounded.toString().split('.')

  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  if (decimalPart) {
    const paddedDecimal = decimalPart.padEnd(precision, '0')
    return `${formattedInteger}.${paddedDecimal}`
  }

  return formattedInteger
}

interface Props {
  // 基础
  title?: string
  value: number | string
  precision?: number

  // 前后缀
  prefix?: string
  suffix?: string

  // 样式
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  size?: 'sm' | 'md' | 'lg'

  // 趋势
  trend?: 'up' | 'down'
  trendLabel?: string

  // 图标
  icon?: string

  // 说明
  extra?: string

  // 选项
  bordered?: boolean
  hoverable?: boolean
  animated?: boolean
  animationDuration?: number
}

const valueRef = ref<HTMLElement>()
const animatedValue = ref(0)

// 格式化数值
const formattedValue = computed(() => {
  if (typeof props.value === 'string') {
    return props.value
  }

  if (props.animated) {
    return formatNumber(animatedValue.value, props.precision)
  }

  return formatNumber(props.value, props.precision)
})

// 数值增长动画
onMounted(() => {
  if (props.animated && typeof props.value === 'number') {
    const startTime = Date.now()
    const startValue = 0
    const endValue = props.value

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / props.animationDuration!, 1)

      // 缓动函数
      const easeProgress = progress === 1 ? 1 : 1 - 2 ** (-10 * progress)
      animatedValue.value = startValue + (endValue - startValue) * easeProgress

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
      else {
        emit('animationComplete')
      }
    }

    requestAnimationFrame(animate)
  }
})

// 监听数值变化
watch(
  () => props.value,
  (newVal) => {
    if (props.animated && typeof newVal === 'number') {
      animatedValue.value = 0
      onMounted()
    }
  },
)
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

<style scoped lang="scss">
.easy-statistic {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 24px;
  background: white;
  border-radius: 16px;
  transition: all 0.2s ease;

  // 边框模式
  &.easy-statistic--bordered {
    border: 1px solid #e5e7eb;
  }

  // 悬浮效果
  &.easy-statistic--hoverable:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
    transform: translateY(-2px);
  }

  // 尺寸
  &.easy-statistic--sm {
    padding: 16px;
    gap: 8px;
    border-radius: 12px;

    .easy-statistic-number {
      font-size: 28px;
    }

    .easy-statistic-title {
      font-size: 12px;
    }

    .easy-statistic-icon {
      width: 28px;
      height: 28px;
      font-size: 14px;
    }
  }

  &.easy-statistic--md {
    .easy-statistic-number {
      font-size: 36px;
    }

    .easy-statistic-title {
      font-size: 14px;
    }

    .easy-statistic-icon {
      width: 36px;
      height: 36px;
      font-size: 16px;
    }
  }

  &.easy-statistic--lg {
    padding: 28px;
    gap: 16px;
    border-radius: 20px;

    .easy-statistic-number {
      font-size: 48px;
    }

    .easy-statistic-title {
      font-size: 16px;
    }

    .easy-statistic-icon {
      width: 44px;
      height: 44px;
      font-size: 20px;
    }
  }

  // 变体颜色
  &.easy-statistic--default {
    .easy-statistic-number {
      color: var(--el-text-color-primary);
    }

    .easy-statistic-icon {
      background: #f3f4f6;
      color: var(--el-text-color-regular);
    }
  }

  &.easy-statistic--primary {
    .easy-statistic-number {
      color: #3b82f6;
    }

    .easy-statistic-icon {
      background: #eff6ff;
      color: #3b82f6;
    }
  }

  &.easy-statistic--success {
    .easy-statistic-number {
      color: #10b981;
    }

    .easy-statistic-icon {
      background: #ecfdf5;
      color: #10b981;
    }
  }

  &.easy-statistic--warning {
    .easy-statistic-number {
      color: #f59e0b;
    }

    .easy-statistic-icon {
      background: #fffbeb;
      color: #f59e0b;
    }
  }

  &.easy-statistic--danger {
    .easy-statistic-number {
      color: #ef4444;
    }

    .easy-statistic-icon {
      background: #fef2f2;
      color: #ef4444;
    }
  }
}

// 标题区域
.easy-statistic-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.easy-statistic-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  transition: transform 0.2s ease;

  .easy-statistic--hoverable:hover & {
    transform: scale(1.05);
  }
}

.easy-statistic-title {
  color: var(--el-text-color-regular);
  font-weight: 500;
  letter-spacing: 0.01em;

  html.dark & {
    color: var(--el-text-color-regular);
  }
}

// 数值区域
.easy-statistic-value {
  display: flex;
  align-items: baseline;
  gap: 6px;
  margin-top: 4px;
}

.easy-statistic-number {
  font-weight: 700;
  line-height: 1;
  font-feature-settings: 'tnum';
  font-variant-numeric: tabular-nums;
  transition: color 0.2s ease;

  &.easy-statistic-number--animated {
    animation: number-pulse 1.5s ease-in-out infinite;
  }
}

.easy-statistic-prefix,
.easy-statistic-suffix {
  color: var(--el-text-color-placeholder);
  font-size: 0.75em;
  font-weight: 500;
}

// 趋势
.easy-statistic-trend {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  width: fit-content;
  margin-top: 4px;

  &.easy-statistic-trend--up {
    background: rgba(16, 185, 129, 0.1);
    color: #10b981;

    .easy-statistic-trend-icon {
      color: #10b981;
    }

    html.dark & {
      background: rgba(16, 185, 129, 0.15);
    }
  }

  &.easy-statistic-trend--down {
    background: rgba(239, 68, 68, 0.1);
    color: #ef4444;

    .easy-statistic-trend-icon {
      color: #ef4444;
    }

    html.dark & {
      background: rgba(239, 68, 68, 0.15);
    }
  }

  &-icon {
    font-size: 14px;
  }

  &-text {
    font-weight: 600;
  }
}

// 说明
.easy-statistic-extra {
  margin-top: 8px;
  color: var(--el-text-color-placeholder);
  font-size: 13px;

  html.dark & {
    color: var(--el-text-color-placeholder);
  }
  line-height: 1.5;
}

// 动画
@keyframes number-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.85;
  }
}

// 响应式
@media (max-width: 768px) {
  .easy-statistic--lg .easy-statistic-number {
    font-size: 40px;
  }

  .easy-statistic {
    padding: 20px;
  }
}

html.dark .easy-statistic {
  background: var(--el-bg-color-overlay);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
  &.easy-statistic--bordered {
    border-color: var(--el-border-color);
  }
  &.easy-statistic--hoverable:hover {
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }
  &.easy-statistic--default {
    .easy-statistic-number {
      color: var(--el-text-color-primary);
    }
    .easy-statistic-icon {
      background: var(--el-fill-color-light);
      color: var(--el-text-color-secondary);
    }
  }
  &.easy-statistic--primary .easy-statistic-icon {
    background: rgba(59, 130, 246, 0.15);
  }
  &.easy-statistic--success .easy-statistic-icon {
    background: rgba(16, 185, 129, 0.15);
  }
  &.easy-statistic--warning .easy-statistic-icon {
    background: rgba(245, 158, 11, 0.15);
  }
  &.easy-statistic--danger .easy-statistic-icon {
    background: rgba(239, 68, 68, 0.15);
  }
}
</style>
