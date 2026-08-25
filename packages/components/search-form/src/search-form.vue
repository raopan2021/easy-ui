<script setup lang="ts">
import type { Props, SearchFormEmits } from './types'

import EasyButton from '../../button'
import EasyCascader from '../../cascader'
import EasyDatePicker from '../../date-picker'
import EasyDateRangePicker from '../../date-range-picker'
import EasyDateTimePicker from '../../date-time-picker'
import EasyDateTimeRangePicker from '../../date-time-range-picker'
import { EasyForm, EasyFormItem } from '../../form'
import EasyIcon from '../../icon'
import EasyInput from '../../input'
import EasyInputRange from '../../input-range'
import EasySelect from '../../select'
import EasyTimePicker from '../../time-picker'
import EasyTimeRangePicker from '../../time-range-picker'
import { useSearchFormData } from './use-search-form-data'
import { getGridItemStyle, useSearchFormLayout } from './use-search-form-layout'

// 保持对外类型导出兼容（原定义在 search-form.vue）
export type { Props, SearchItem } from './types'

defineOptions({
  name: 'EasySearchForm',
})

const props = withDefaults(defineProps<Props>(), {
  items: () => [],
  modelValue: () => ({}),
  inline: true,
  size: 'default',
  loading: false,
  searchButtonText: '查询',
  resetButtonText: '重置',
  showExpandButton: true,
  disabled: false,
  rules: () => ({}),
})

const emit = defineEmits<SearchFormEmits>()

// ──── 表单数据（初始化 / 可见项 / 查询 / 重置 / v-model 同步）────
const { formRef, formData, visibleItems, handleSearch, handleReset, setData } = useSearchFormData(props, emit)

// ──── 按钮区栅格自适应（宽度测量 + ResizeObserver）────
const { searchActionsRef, searchActionsStyle } = useSearchFormLayout(visibleItems)

// 暴露方法
defineExpose({
  // 获取表单数据
  getData: () => ({ ...formData }),
  // 设置表单数据
  setData,
  // 重置表单
  reset: handleReset,
  // 搜索
  search: handleSearch,
  // 验证表单
  validate: () => formRef.value?.validate(),
  // 清除验证
  clearValidate: () => formRef.value?.clearValidate(),
  // 获取表单引用
  getFormRef: () => formRef.value,
})
</script>

<template>
  <div class="easy-search-form">
    <!-- 自定义插槽 top -->
    <slot name="top" />

    <div class="search-form-body">
      <!-- 搜索表单 -->
      <EasyForm
        ref="formRef" :model="formData" :rules="rules" :inline="inline" :size="size" :disabled="disabled"
        class="search-grid-form"
      >
        <template v-for="item in visibleItems" :key="item.prop">
          <EasyFormItem
            v-if="!item.hide" :label="item.label" :prop="item.prop" :required="item.required"
            :span="item.span" :style="getGridItemStyle(item)"
          >
            <!-- 输入框 -->
            <EasyInput
              v-if="item.type === 'input' || !item.type" v-model="formData[item.prop]"
              :placeholder="item.placeholder || `请输入${item.label}`" :clearable="item.clearable !== false"
              :disabled="item.disabled || disabled" :readonly="item.readonly" :maxlength="item.maxlength"
              :show-word-limit="item.showWordLimit" :prefix-icon="item.prefixIcon" :suffix-icon="item.suffixIcon"
              @keyup.enter="handleSearch"
            />

            <!-- 文本域 -->
            <EasyInput
              v-else-if="item.type === 'textarea'" v-model="formData[item.prop]" type="textarea"
              :placeholder="item.placeholder || `请输入${item.label}`" :clearable="item.clearable !== false"
              :disabled="item.disabled || disabled" :readonly="item.readonly" :maxlength="item.maxlength"
              :show-word-limit="item.showWordLimit" :rows="item.rows || 2"
            />

            <!-- 数值/文本范围输入（min ~ max） -->
            <EasyInputRange
              v-else-if="item.type === 'range'" v-model:start="formData[item.prop]"
              v-model:end="formData[item.endProp!]" :start-placeholder="item.startPlaceholder"
              :end-placeholder="item.endPlaceholder" :clearable="item.clearable !== false"
              :disabled="item.disabled || disabled" :readonly="item.readonly" :maxlength="item.maxlength"
              :input-type="item.inputType" :separator="item.rangeSeparator" :size="size" @keyup:enter="handleSearch"
            />

            <!-- 选择器 -->
            <EasySelect
              v-else-if="item.type === 'select'" v-model="formData[item.prop]"
              :placeholder="item.placeholder || `请选择${item.label}`" :clearable="item.clearable !== false"
              :disabled="item.disabled || disabled" :multiple="item.multiple" :filterable="item.filterable"
              :options="item.options" :value-type="item.valueType" :separator="item.separator"
            />

            <!-- 级联选择器 -->
            <EasyCascader
              v-else-if="item.type === 'cascader'" v-model="formData[item.prop]"
              :placeholder="item.placeholder || `请选择${item.label}`" :clearable="item.clearable !== false"
              :disabled="item.disabled || disabled" :multiple="item.multiple" :filterable="item.filterable"
              :options="item.cascaderOptions" :value-type="item.valueType" :separator="item.separator"
            />

            <!-- 日期选择器 -->
            <EasyDatePicker
              v-else-if="item.type === 'date'" v-model="formData[item.prop]"
              :placeholder="item.placeholder || `请选择${item.label}`" :clearable="item.clearable !== false"
              :disabled="item.disabled || disabled" :format="item.format" :value-format="item.valueFormat"
            />

            <!-- 日期范围选择器 -->
            <EasyDateRangePicker
              v-else-if="item.type === 'daterange'" v-model:start="formData[item.prop]"
              v-model:end="formData[item.endProp!]" :start-placeholder="item.startPlaceholder"
              :end-placeholder="item.endPlaceholder" :clearable="item.clearable !== false"
              :disabled="item.disabled || disabled" :format="item.format" :value-format="item.valueFormat"
              :separator="item.rangeSeparator" :size="size"
            />

            <!-- 日期时间选择器 -->
            <EasyDateTimePicker
              v-else-if="item.type === 'datetime'" v-model="formData[item.prop]"
              :placeholder="item.placeholder || `请选择${item.label}`" :clearable="item.clearable !== false"
              :disabled="item.disabled || disabled" :format="item.format" :show-seconds="item.showSeconds"
            />

            <!-- 日期时间范围选择器 -->
            <EasyDateTimeRangePicker
              v-else-if="item.type === 'datetimerange'" v-model:start="formData[item.prop]"
              v-model:end="formData[item.endProp!]" :start-placeholder="item.startPlaceholder"
              :end-placeholder="item.endPlaceholder" :clearable="item.clearable !== false"
              :disabled="item.disabled || disabled" :format="item.format" :show-seconds="item.showSeconds"
              :separator="item.rangeSeparator" :size="size"
            />

            <!-- 时间选择器 -->
            <EasyTimePicker
              v-else-if="item.type === 'time'" v-model="formData[item.prop]"
              :placeholder="item.placeholder || `请选择${item.label}`" :clearable="item.clearable !== false"
              :disabled="item.disabled || disabled" :format="item.format"
            />

            <!-- 时间范围选择器 -->
            <EasyTimeRangePicker
              v-else-if="item.type === 'timerange'" v-model:start="formData[item.prop]"
              v-model:end="formData[item.endProp!]" :start-placeholder="item.startPlaceholder"
              :end-placeholder="item.endPlaceholder" :clearable="item.clearable !== false"
              :disabled="item.disabled || disabled" :format="item.format" :separator="item.rangeSeparator" :size="size"
            />

            <!-- 自定义插槽 -->
            <slot
              v-else-if="item.type === 'custom'" :name="`field-${item.prop}`" :model-value="formData[item.prop]"
              :item="item" :form-data="formData" @update:model-value="(val: any) => (formData[item.prop] = val)"
            />
          </EasyFormItem>
        </template>

        <EasyFormItem ref="searchActionsRef" class="search-actions" :style="searchActionsStyle">
          <!-- 自定义插槽 -->
          <slot name="custom-button" />

          <EasyButton type="primary" :size="size" :loading="loading" @click="handleSearch">
            <template #icon>
              <EasyIcon name="el:Search" :size="16" />
            </template>
            {{ searchButtonText }}
          </EasyButton>
          <span class="action-divider" />
          <EasyButton type="ghost" :size="size" @click="handleReset">
            <template #icon>
              <EasyIcon name="el:Refresh" :size="16" />
            </template>
            {{ resetButtonText }}
          </EasyButton>
          <span v-if="showExpandButton" class="action-divider" />
        </EasyFormItem>
      </EasyForm>
    </div>
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 search-form-style.scss） -->
<style scoped src="./search-form-style.scss" lang="scss"></style>

<style lang="scss">
/* ========== Dark Mode ========== */
html.dark .easy-search-form {
  background: var(--el-bg-color);
  border-color: var(--el-border-color);
}
html.dark .easy-search-form__title {
  color: var(--el-text-color-primary);
}
</style>
