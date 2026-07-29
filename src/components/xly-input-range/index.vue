<template>
  <div class="xly-input-range" :class="[`xly-input-range--${size}`, { 'is-disabled': disabled }]">
    <!-- 开始输入框 -->
    <div class="xly-input-range__start">
      <XlyInput
        :model-value="start"
        :type="inputType"
        :placeholder="startPlaceholder || '最小值'"
        :disabled="disabled"
        :readonly="readonly"
        :clearable="clearable"
        :maxlength="maxlength"
        :size="size"
        @update:model-value="handleStartChange"
        @keyup.enter="handleEnter"
      />
    </div>

    <!-- 分隔符 -->
    <span class="xly-input-range__separator">{{ separator }}</span>

    <!-- 结束输入框 -->
    <div class="xly-input-range__end">
      <XlyInput
        :model-value="end"
        :type="inputType"
        :placeholder="endPlaceholder || '最大值'"
        :disabled="disabled"
        :readonly="readonly"
        :clearable="clearable"
        :maxlength="maxlength"
        :size="size"
        @update:model-value="handleEndChange"
        @keyup.enter="handleEnter"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import XlyInput from '../xly-input/index.vue'

export interface InputRangeProps {
  /** 开始值 */
  start?: string | number
  /** 结束值 */
  end?: string | number
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
  /** 最大长度 */
  maxlength?: number
  /** 分隔符 */
  separator?: string
  /** 组件尺寸 */
  size?: 'large' | 'default' | 'small'
  /** 输入框类型 */
  inputType?: 'text' | 'password' | 'number' | 'integer' | 'positiveInteger' | 'decimal' | `decimal${number}` | 'tel' | 'email' | 'url'
}

defineOptions({
  name: 'XlyInputRange'
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
  inputType: 'text'
})

const emit = defineEmits<{
  (e: 'update:start', value: string | number): void
  (e: 'update:end', value: string | number): void
  (e: 'change', value: { start: string | number; end: string | number }): void
  (e: 'keyup:enter'): void
}>()

// 处理开始值变化
const handleStartChange = (value: string | number) => {
  emit('update:start', value)
  emit('change', { start: value, end: props.end })
}

// 处理结束值变化
const handleEndChange = (value: string | number) => {
  emit('update:end', value)
  emit('change', { start: props.start, end: value })
}

// 回车触发搜索
const handleEnter = () => {
  emit('keyup:enter')
}
</script>

<style scoped lang="scss">
.xly-input-range {
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;

  &.is-disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &__separator {
    color: var(--el-text-color-placeholder);
    font-size: 14px;
    flex-shrink: 0;
    user-select: none;
  }

  &__start,
  &__end {
    flex: 1;
    min-width: 0;
  }
}
</style>
