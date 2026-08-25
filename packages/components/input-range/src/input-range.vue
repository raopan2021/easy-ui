<script setup lang="ts">
import type { InputRangeEmits, InputRangeProps } from './types'

import EasyInput from '../../input'
import { useInputRange } from './use-input-range'

// 保持对外类型导出兼容（原定义在 input-range.vue 内联）
export type { InputRangeEmits, InputRangeProps } from './types'

defineOptions({
  name: 'EasyInputRange',
})

const props = withDefaults(defineProps<InputRangeProps>(), {
  start: '',
  end: '',
  startPlaceholder: '最小值',
  endPlaceholder: '最大值',
  disabled: false,
  readonly: false,
  clearable: true,
  maxlength: undefined,
  separator: '~',
  size: 'default',
  inputType: 'text',
})

const emit = defineEmits<InputRangeEmits>()

const { handleStartChange, handleEndChange, handleEnter } = useInputRange(props, emit)
</script>

<template>
  <div class="easy-input-range" :class="[`easy-input-range--${size}`, { 'is-disabled': disabled }]">
    <!-- 开始输入框 -->
    <div class="easy-input-range__start">
      <EasyInput
        :model-value="start" :type="inputType" :placeholder="startPlaceholder || '最小值'" :disabled="disabled"
        :readonly="readonly" :clearable="clearable" :maxlength="maxlength" :size="size"
        @update:model-value="handleStartChange" @keyup.enter="handleEnter"
      />
    </div>

    <!-- 分隔符 -->
    <span class="easy-input-range__separator">{{ separator }}</span>

    <!-- 结束输入框 -->
    <div class="easy-input-range__end">
      <EasyInput
        :model-value="end" :type="inputType" :placeholder="endPlaceholder || '最大值'" :disabled="disabled"
        :readonly="readonly" :clearable="clearable" :maxlength="maxlength" :size="size"
        @update:model-value="handleEndChange" @keyup.enter="handleEnter"
      />
    </div>
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 input-range-style.scss） -->
<style scoped src="./input-range-style.scss" lang="scss"></style>
