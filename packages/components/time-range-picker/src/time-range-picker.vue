<script setup lang="ts">
import type { TimeRangePickerEmits, TimeRangePickerProps } from './time-range-picker'

import EasyTimePicker from '../../time-picker'
import { useTimeRangePicker } from './use-time-range-picker'

defineOptions({
  name: 'EasyTimeRangePicker',
})

const props = withDefaults(defineProps<TimeRangePickerProps>(), {
  start: '',
  end: '',
  startPlaceholder: '开始时间',
  endPlaceholder: '结束时间',
  disabled: false,
  readonly: false,
  clearable: true,
  format: '',
  separator: '至',
  size: 'default',
})

const emit = defineEmits<TimeRangePickerEmits>()

// 开始 / 结束时间变化逻辑抽离到 composable
const { handleStartChange, handleEndChange } = useTimeRangePicker(props, emit)

// 保持对外类型导出兼容（原定义在 time-range-picker.ts）
export type { TimeRangePickerEmits, TimeRangePickerProps } from './time-range-picker'
</script>

<template>
  <div class="easy-time-range-picker" :class="[`easy-time-range-picker--${size}`, { 'is-disabled': disabled }]">
    <!-- 开始时间选择器 -->
    <div class="easy-time-range-picker__start">
      <EasyTimePicker :model-value="start" :placeholder="startPlaceholder || '开始时间'" :disabled="disabled"
        :readonly="readonly" :clearable="clearable" :format="format" :size="size" @update:model-value="handleStartChange" />
    </div>

    <!-- 分隔符 -->
    <span class="easy-time-range-picker__separator">{{ separator }}</span>

    <!-- 结束时间选择器 -->
    <div class="easy-time-range-picker__end">
      <EasyTimePicker :model-value="end" :placeholder="endPlaceholder || '结束时间'" :disabled="disabled"
        :readonly="readonly" :clearable="clearable" :format="format" :size="size" @update:model-value="handleEndChange" />
    </div>
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 time-range-picker-style.scss） -->
<style scoped src="./time-range-picker-style.scss" lang="scss"></style>
