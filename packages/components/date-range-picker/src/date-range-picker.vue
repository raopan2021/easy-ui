<script setup lang="ts">
import type { DateRangePickerEmits, DateRangePickerProps } from './date-range-picker'

import EasyDatePicker from '../../date-picker'
import { useDateRangePicker } from './use-date-range-picker'

defineOptions({
  name: 'EasyDateRangePicker',
})

const props = withDefaults(defineProps<DateRangePickerProps>(), {
  start: '',
  end: '',
  startPlaceholder: '开始日期',
  endPlaceholder: '结束日期',
  disabled: false,
  readonly: false,
  clearable: true,
  format: 'YYYY-MM-DD',
  valueFormat: '',
  separator: '至',
  size: 'default',
})

const emit = defineEmits<DateRangePickerEmits>()

// 开始 / 结束日期变化逻辑抽离到 composable
const { handleStartChange, handleEndChange } = useDateRangePicker(props, emit)

// 保持对外类型导出兼容（原定义在 date-range-picker.ts）
export type { DateRangePickerEmits, DateRangePickerProps } from './date-range-picker'
</script>

<template>
  <div class="easy-date-range-picker" :class="[`easy-date-range-picker--${size}`, { 'is-disabled': disabled }]">
    <!-- 开始日期选择器 -->
    <div class="easy-date-range-picker__start">
      <EasyDatePicker
        :model-value="start" :placeholder="startPlaceholder || '开始日期'" :disabled="disabled"
        :readonly="readonly" :clearable="clearable" :format="format" :value-format="valueFormat" :size="size"
        @update:model-value="handleStartChange"
      />
    </div>

    <!-- 分隔符 -->
    <span class="easy-date-range-picker__separator">{{ separator }}</span>

    <!-- 结束日期选择器 -->
    <div class="easy-date-range-picker__end">
      <EasyDatePicker
        :model-value="end" :placeholder="endPlaceholder || '结束日期'" :disabled="disabled"
        :readonly="readonly" :clearable="clearable" :format="format" :value-format="valueFormat" :size="size"
        @update:model-value="handleEndChange"
      />
    </div>
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 date-range-picker-style.scss） -->
<style scoped src="./date-range-picker-style.scss" lang="scss"></style>
