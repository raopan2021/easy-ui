<script setup lang="ts">
import EasyDateTimePicker from '../../date-time-picker'

export interface DateTimeRangePickerProps {
  /** 开始时间值 */
  start?: string
  /** 结束时间值 */
  end?: string
  /** 占位符 */
  startPlaceholder?: string
  /** 结束占位符 */
  endPlaceholder?: string
  /** 是否禁用 */
  disabled?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 是否可清空 */
  clearable?: boolean
  /** 日期格式 */
  format?: string
  /** 是否显示秒 */
  showSeconds?: boolean
  /** 分隔符 */
  separator?: string
  /** 组件尺寸 */
  size?: 'large' | 'default' | 'small'
}

defineOptions({
  name: 'EasyDateTimeRangePicker',
})

const props = withDefaults(defineProps<DateTimeRangePickerProps>(), {
  start: '',
  end: '',
  startPlaceholder: '开始时间',
  endPlaceholder: '结束时间',
  disabled: false,
  readonly: false,
  clearable: true,
  format: '',
  showSeconds: false,
  separator: '至',
  size: 'default',
})

const emit = defineEmits<{
  (e: 'update:start', value: string): void
  (e: 'update:end', value: string): void
  (e: 'change', value: { start: string, end: string }): void
}>()

// 处理开始时间变化
function handleStartChange(value: string) {
  emit('update:start', value)
  emit('change', { start: value, end: props.end })
}

// 处理结束时间变化
function handleEndChange(value: string) {
  emit('update:end', value)
  emit('change', { start: props.start, end: value })
}
</script>

<template>
  <div class="easy-date-time-range-picker" :class="[`easy-date-time-range-picker--${size}`, { 'is-disabled': disabled }]">
    <!-- 开始日期时间选择器 -->
    <div class="easy-date-time-range-picker__start">
      <EasyDateTimePicker
        :model-value="start"
        :placeholder="startPlaceholder || '开始时间'"
        :disabled="disabled"
        :readonly="readonly"
        :clearable="clearable"
        :format="format"
        :show-seconds="showSeconds"
        :size="size"
        @update:model-value="handleStartChange"
      />
    </div>

    <!-- 分隔符 -->
    <span class="easy-date-time-range-picker__separator">{{ separator }}</span>

    <!-- 结束日期时间选择器 -->
    <div class="easy-date-time-range-picker__end">
      <EasyDateTimePicker
        :model-value="end"
        :placeholder="endPlaceholder || '结束时间'"
        :disabled="disabled"
        :readonly="readonly"
        :clearable="clearable"
        :format="format"
        :show-seconds="showSeconds"
        :size="size"
        @update:model-value="handleEndChange"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.easy-date-time-range-picker {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;

  &.is-disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .easy-date-time-range-picker__separator {
    color: var(--el-text-color-placeholder);
    font-size: 14px;
    flex-shrink: 0;
    user-select: none;
  }

  .easy-date-time-range-picker__start,
  .easy-date-time-range-picker__end {
    flex: 1;
    min-width: 0;
  }

  // 尺寸变体
  &.easy-date-time-range-picker--large {
    :deep(.easy-date-time-picker) {
      .easy-date-time-picker__wrapper {
        height: 40px;
        padding: 0 15px;
      }
      .easy-date-time-picker__input {
        font-size: 14px;
      }
    }
  }

  &.easy-date-time-range-picker--default {
    :deep(.easy-date-time-picker) {
      .easy-date-time-picker__wrapper {
        height: 32px;
        padding: 0 12px;
      }
      .easy-date-time-picker__input {
        font-size: 14px;
      }
    }
  }

  &.easy-date-time-range-picker--small {
    :deep(.easy-date-time-picker) {
      .easy-date-time-picker__wrapper {
        height: 28px;
        padding: 0 10px;
      }
      .easy-date-time-picker__input {
        font-size: 13px;
      }
    }
  }
}
</style>
