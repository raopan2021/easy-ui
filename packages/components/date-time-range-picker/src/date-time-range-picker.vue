<script setup lang="ts">
import type { DateTimeRangePickerEmits, DateTimeRangePickerProps } from './date-time-range-picker'

import EasyDateTimePicker from '../../date-time-picker'
import { useDateTimeRangePicker } from './use-date-time-range-picker'

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

const emit = defineEmits<DateTimeRangePickerEmits>()

// 开始 / 结束时间变化逻辑抽离到 composable
const { handleStartChange, handleEndChange } = useDateTimeRangePicker(props, emit)

// 保持对外类型导出兼容（原定义在 date-time-range-picker.ts）
export type { DateTimeRangePickerEmits, DateTimeRangePickerProps } from './date-time-range-picker'
</script>

<template>
  <div class="easy-date-time-range-picker" :class="[`easy-date-time-range-picker--${size}`, { 'is-disabled': disabled }]">
    <!-- 开始日期时间选择器 -->
    <div class="easy-date-time-range-picker__start">
      <EasyDateTimePicker :model-value="start" :placeholder="startPlaceholder || '开始时间'" :disabled="disabled"
        :readonly="readonly" :clearable="clearable" :format="format" :show-seconds="showSeconds" :size="size"
        @update:model-value="handleStartChange" />
    </div>

    <!-- 分隔符 -->
    <span class="easy-date-time-range-picker__separator">{{ separator }}</span>

    <!-- 结束日期时间选择器 -->
    <div class="easy-date-time-range-picker__end">
      <EasyDateTimePicker :model-value="end" :placeholder="endPlaceholder || '结束时间'" :disabled="disabled"
        :readonly="readonly" :clearable="clearable" :format="format" :show-seconds="showSeconds" :size="size"
        @update:model-value="handleEndChange" />
    </div>
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 date-time-range-picker-style.scss） -->
<style scoped src="./date-time-range-picker-style.scss" lang="scss"></style>
