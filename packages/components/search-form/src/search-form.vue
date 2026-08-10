<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import XlyButton from '../../button'
import XlyCascader from '../../cascader'
import XlyDatePicker from '../../date-picker'
import XlyDateRangePicker from '../../date-range-picker'
import XlyDateTimePicker from '../../date-time-picker'
import XlyDateTimeRangePicker from '../../date-time-range-picker'
import { EasyForm as XlyForm, EasyFormItem as XlyFormItem } from '../../form'
import XlyIcon from '../../icon'
import XlyInput from '../../input'
import XlyInputRange from '../../input-range'
import XlySelect from '../../select'
import XlyTimePicker from '../../time-picker'
import XlyTimeRangePicker from '../../time-range-picker'

defineOptions({
  name: 'XlySearchForm',
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

const emit = defineEmits<{
  (e: 'search', data: Record<string, any>): void
  (e: 'reset'): void
  (e: 'update:modelValue', value: Record<string, any>): void
}>()

export interface SearchItem {
  /** 字段名 */
  prop: string
  /** 标签文本 */
  label: string
  /** 栅格占据的列数 */
  span?: number
  /** 组件类型 */
  type?:
    | 'input'
    | 'textarea'
    | 'select'
    | 'date'
    | 'daterange'
    | 'datetime'
    | 'datetimerange'
    | 'time'
    | 'timerange'
    | 'cascader'
    | 'range'
    | 'custom'
  /** range 类型底层输入框类型（如 'number'、'decimal'、'positiveInteger'），默认 'text' */
  inputType?:
    | 'text'
    | 'password'
    | 'number'
    | 'integer'
    | 'positiveInteger'
    | 'decimal'
    | `decimal${number}`
    | 'tel'
    | 'email'
    | 'url'
  /** 占位符 */
  placeholder?: string
  /** 是否可清空 */
  clearable?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 是否隐藏 */
  hide?: boolean
  /** 是否只读 */
  readonly?: boolean
  /** 最大长度 */
  maxlength?: number
  /** 是否显示字数统计 */
  showWordLimit?: boolean
  /** 前缀图标 */
  prefixIcon?: string
  /** 后缀图标 */
  suffixIcon?: string
  /** textarea 行数 */
  rows?: number
  /** 选项列表（select 用） */
  options?: Array<{ label: string, value: any, disabled?: boolean }>
  /** 是否多选（select 用） */
  multiple?: boolean
  /** 是否可搜索（select 用） */
  filterable?: boolean
  /** 多选时返回值的类型（select、cascader 用） */
  valueType?: 'array' | 'string'
  /** 多选且 valueType='string' 时的分隔符（select、cascader 用） */
  separator?: string
  /** 级联选择器选项（cascader 用） */
  cascaderOptions?: Array<{ label: string, value: any, children?: any[] }>
  /** 日期格式 */
  format?: string
  /** 日期值格式 */
  valueFormat?: string
  /** 是否显示秒（datetime 用） */
  showSeconds?: boolean
  /** 范围选择结束属性名（daterange、datetimerange、timerange 用） */
  endProp?: string
  /** 范围分隔符 */
  rangeSeparator?: string
  /** 开始日期占位符 */
  startPlaceholder?: string
  /** 结束日期占位符 */
  endPlaceholder?: string
  /** 是否必填 */
  required?: boolean
  /** 校验规则 */
  rules?: any[]
  /** 默认值 */
  defaultValue?: any
  /** 是否在收起时隐藏（用于展开/收起功能） */
  hiddenWhenCollapsed?: boolean
}

interface Props {
  /** 搜索项配置 */
  items?: SearchItem[]
  /** 初始数据 */
  modelValue?: Record<string, any>
  /** 是否内联布局 */
  inline?: boolean
  /** 组件尺寸 */
  size?: 'large' | 'default' | 'small'
  /** 加载状态 */
  loading?: boolean
  /** 搜索按钮文本 */
  searchButtonText?: string
  /** 重置按钮文本 */
  resetButtonText?: string
  /** 是否显示展开按钮 */
  showExpandButton?: boolean
  /** 是否禁用 */
  disabled?: boolean
  /** 表单验证规则 */
  rules?: Record<string, any[]>
}

// 表单引用
const formRef = ref()

// 表单数据
const formData = reactive<Record<string, any>>({})

// 可见的搜索项
const visibleItems = computed(() => {
  if (!props.showExpandButton) {
    return props.items
  }
  return props.items.filter(item => !item.hiddenWhenCollapsed)
})

// 初始化表单数据
function initFormData() {
  props.items.forEach((item) => {
    const value = props.modelValue?.[item.prop] ?? item.defaultValue ?? null
    formData[item.prop] = value
    // 初始化范围选择器的结束属性
    if (item.endProp) {
      const endValue = props.modelValue?.[item.endProp] ?? null
      formData[item.endProp] = endValue
    }
  })
}

// 处理搜索
async function handleSearch() {
  // 验证表单
  const isValid = await formRef.value?.validate().catch(() => false)
  if (!isValid)
    return

  const searchData = { ...formData }

  // 更新双向绑定
  emit('update:modelValue', searchData)
  emit('search', searchData)
}

// 处理重置
function handleReset() {
  formRef.value?.resetFields()

  // 重置为默认值
  props.items.forEach((item) => {
    formData[item.prop] = item.defaultValue ?? null
  })

  emit('update:modelValue', {})
  emit('reset')
}

// 监听 modelValue 变化
watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      Object.keys(val).forEach((key) => {
        if (key in formData) {
          formData[key] = val[key]
        }
      })
    }
  },
  { deep: true },
)

// 暴露方法
defineExpose({
  // 获取表单数据
  getData: () => ({ ...formData }),
  // 设置表单数据
  setData: (data: Record<string, any>) => {
    Object.keys(data).forEach((key) => {
      if (key in formData) {
        formData[key] = data[key]
      }
    })
    emit('update:modelValue', { ...formData })
  },
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

// 根据 item span 计算 grid-column，实现响应式栅格
function getGridItemStyle(item: SearchItem): Record<string, string> {
  const span = item.span
  // 范围选择器占 2 列
  if (
    item.type === 'daterange'
    || item.type === 'datetimerange'
    || item.type === 'timerange'
    || item.type === 'range'
  ) {
    return { gridColumn: 'span 2' }
  }
  if (!span || span <= 8)
    return {}
  if (span >= 18)
    return { gridColumn: '1 / -1' }
  return { gridColumn: 'span 2' }
}

// 按钮区自适应占 1~N 个单元格
const searchActionsRef = ref()
const spanColumns = ref(1)
let resizeObserver: ResizeObserver | null = null
const searchActionsStyle = computed<Record<string, string>>(() =>
  spanColumns.value > 1 ? { gridColumn: `span ${spanColumns.value}` } : {},
)
// 测量按钮区自然总宽，计算需要占据的单元格数
async function measureActions() {
  await nextTick()
  const actionsEl = searchActionsRef.value?.$el as HTMLElement | undefined
  const control = actionsEl?.querySelector('.xly-form-item__control') as HTMLElement | null
  const gridEl = actionsEl?.closest('.search-grid-form') as HTMLElement | null
  if (!control || !gridEl)
    return

  // 强制单行、不收缩，测出内容自然宽度
  control.classList.add('is-measuring')
  const children = Array.from(control.children) as HTMLElement[]
  const gap = parseFloat(getComputedStyle(control).columnGap) || 0
  const needWidth = children.reduce((sum, el) => sum + el.offsetWidth, 0) + gap * Math.max(children.length - 1, 0)
  control.classList.remove('is-measuring')

  // 单个单元格的实际宽度与 grid 列信息
  const gridStyle = getComputedStyle(gridEl)
  const columns = gridStyle.gridTemplateColumns.split(' ').filter(Boolean)
  const cellWidth = parseFloat(columns[0]) || 250
  const gridGap = parseFloat(gridStyle.columnGap) || 0
  const maxColumns = Math.max(columns.length, 1)

  // 占 N 列可用宽度 = N * cellWidth + (N - 1) * gridGap，求能容纳内容的最小 N
  const next = Math.min(Math.max(Math.ceil((needWidth + 1 + gridGap) / (cellWidth + gridGap)), 1), maxColumns)
  if (next !== spanColumns.value) {
    spanColumns.value = next
  }
}
// 展开/收起变化时重新测量按钮区
watch(visibleItems, () => measureActions())

// 初始化
onMounted(() => {
  initFormData()
  measureActions()

  // 容器尺寸变化时重新测量
  const actionsEl = searchActionsRef.value?.$el as HTMLElement | undefined
  const gridEl = actionsEl?.closest('.search-grid-form') as HTMLElement | null
  if (gridEl) {
    resizeObserver = new ResizeObserver(() => measureActions())
    resizeObserver.observe(gridEl)
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
})
</script>

<template>
  <div class="xly-search-form">
    <!-- 自定义插槽 top -->
    <slot name="top" />

    <div class="search-form-body">
      <!-- 搜索表单 -->
      <XlyForm
        ref="formRef"
        :model="formData"
        :rules="rules"
        :inline="inline"
        :size="size"
        :disabled="disabled"
        class="search-grid-form"
      >
        <template v-for="item in visibleItems" :key="item.prop">
          <XlyFormItem
            v-if="!item.hide"
            :label="item.label"
            :prop="item.prop"
            :required="item.required"
            :span="item.span"
            :style="getGridItemStyle(item)"
          >
            <!-- 输入框 -->
            <XlyInput
              v-if="item.type === 'input' || !item.type"
              v-model="formData[item.prop]"
              :placeholder="item.placeholder || `请输入${item.label}`"
              :clearable="item.clearable !== false"
              :disabled="item.disabled || disabled"
              :readonly="item.readonly"
              :maxlength="item.maxlength"
              :show-word-limit="item.showWordLimit"
              :prefix-icon="item.prefixIcon"
              :suffix-icon="item.suffixIcon"
              @keyup.enter="handleSearch"
            />

            <!-- 文本域 -->
            <XlyInput
              v-else-if="item.type === 'textarea'"
              v-model="formData[item.prop]"
              type="textarea"
              :placeholder="item.placeholder || `请输入${item.label}`"
              :clearable="item.clearable !== false"
              :disabled="item.disabled || disabled"
              :readonly="item.readonly"
              :maxlength="item.maxlength"
              :show-word-limit="item.showWordLimit"
              :rows="item.rows || 2"
            />

            <!-- 数值/文本范围输入（min ~ max） -->
            <XlyInputRange
              v-else-if="item.type === 'range'"
              v-model:start="formData[item.prop]"
              v-model:end="formData[item.endProp]"
              :start-placeholder="item.startPlaceholder"
              :end-placeholder="item.endPlaceholder"
              :clearable="item.clearable !== false"
              :disabled="item.disabled || disabled"
              :readonly="item.readonly"
              :maxlength="item.maxlength"
              :input-type="item.inputType"
              :separator="item.rangeSeparator"
              :size="size"
              @keyup:enter="handleSearch"
            />

            <!-- 选择器 -->
            <XlySelect
              v-else-if="item.type === 'select'"
              v-model="formData[item.prop]"
              :placeholder="item.placeholder || `请选择${item.label}`"
              :clearable="item.clearable !== false"
              :disabled="item.disabled || disabled"
              :multiple="item.multiple"
              :filterable="item.filterable"
              :options="item.options"
              :value-type="item.valueType"
              :separator="item.separator"
            />

            <!-- 级联选择器 -->
            <XlyCascader
              v-else-if="item.type === 'cascader'"
              v-model="formData[item.prop]"
              :placeholder="item.placeholder || `请选择${item.label}`"
              :clearable="item.clearable !== false"
              :disabled="item.disabled || disabled"
              :multiple="item.multiple"
              :filterable="item.filterable"
              :options="item.cascaderOptions"
              :value-type="item.valueType"
              :separator="item.separator"
            />

            <!-- 日期选择器 -->
            <XlyDatePicker
              v-else-if="item.type === 'date'"
              v-model="formData[item.prop]"
              :placeholder="item.placeholder || `请选择${item.label}`"
              :clearable="item.clearable !== false"
              :disabled="item.disabled || disabled"
              :format="item.format"
              :value-format="item.valueFormat"
            />

            <!-- 日期范围选择器 -->
            <XlyDateRangePicker
              v-else-if="item.type === 'daterange'"
              v-model:start="formData[item.prop]"
              v-model:end="formData[item.endProp]"
              :start-placeholder="item.startPlaceholder"
              :end-placeholder="item.endPlaceholder"
              :clearable="item.clearable !== false"
              :disabled="item.disabled || disabled"
              :format="item.format"
              :value-format="item.valueFormat"
              :separator="item.rangeSeparator"
              :size="size"
            />

            <!-- 日期时间选择器 -->
            <XlyDateTimePicker
              v-else-if="item.type === 'datetime'"
              v-model="formData[item.prop]"
              :placeholder="item.placeholder || `请选择${item.label}`"
              :clearable="item.clearable !== false"
              :disabled="item.disabled || disabled"
              :format="item.format"
              :show-seconds="item.showSeconds"
            />

            <!-- 日期时间范围选择器 -->
            <XlyDateTimeRangePicker
              v-else-if="item.type === 'datetimerange'"
              v-model:start="formData[item.prop]"
              v-model:end="formData[item.endProp]"
              :start-placeholder="item.startPlaceholder"
              :end-placeholder="item.endPlaceholder"
              :clearable="item.clearable !== false"
              :disabled="item.disabled || disabled"
              :format="item.format"
              :show-seconds="item.showSeconds"
              :separator="item.rangeSeparator"
              :size="size"
            />

            <!-- 时间选择器 -->
            <XlyTimePicker
              v-else-if="item.type === 'time'"
              v-model="formData[item.prop]"
              :placeholder="item.placeholder || `请选择${item.label}`"
              :clearable="item.clearable !== false"
              :disabled="item.disabled || disabled"
              :format="item.format"
            />

            <!-- 时间范围选择器 -->
            <XlyTimeRangePicker
              v-else-if="item.type === 'timerange'"
              v-model:start="formData[item.prop]"
              v-model:end="formData[item.endProp]"
              :start-placeholder="item.startPlaceholder"
              :end-placeholder="item.endPlaceholder"
              :clearable="item.clearable !== false"
              :disabled="item.disabled || disabled"
              :format="item.format"
              :separator="item.rangeSeparator"
              :size="size"
            />

            <!-- 自定义插槽 -->
            <slot
              v-else-if="item.type === 'custom'"
              :name="`field-${item.prop}`"
              :model-value="formData[item.prop]"
              :item="item"
              :form-data="formData"
              @update:model-value="(val: any) => (formData[item.prop] = val)"
            />
          </XlyFormItem>
        </template>

        <XlyFormItem ref="searchActionsRef" class="search-actions" :style="searchActionsStyle">
          <!-- 自定义插槽 -->
          <slot name="custom-button" />

          <XlyButton type="primary" :size="size" :loading="loading" @click="handleSearch">
            <template #icon>
              <XlyIcon name="el:Search" :size="16" />
            </template>
            {{ searchButtonText }}
          </XlyButton>
          <span class="action-divider" />
          <XlyButton type="ghost" :size="size" @click="handleReset">
            <template #icon>
              <XlyIcon name="el:Refresh" :size="16" />
            </template>
            {{ resetButtonText }}
          </XlyButton>
          <span v-if="showExpandButton" class="action-divider" />
        </XlyFormItem>
      </XlyForm>
    </div>
  </div>
</template>

<style scoped lang="scss">
.xly-search-form {
  width: 100%;
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid #e2e4ed;
  transition: all 0.3s ease;

  &:hover {
    border-color: var(--el-border-color);
  }
}

.search-form-body {
  padding: 16px 20px;

  :deep(.search-grid-form) {
    display: grid !important;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 16px;
    align-items: flex-end;

    .xly-form-item {
      width: auto !important;
      min-width: 250px !important;
      margin-right: 0 !important;
      margin-bottom: 0;
    }
  }

  .search-actions {
    width: auto;

    :deep(.xly-form-item__label) {
      display: none;
    }

    :deep(.xly-form-item__content) {
      .xly-form-item__control {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 12px;
      }

      // 测量时强制单行、不收缩，得到内容自然宽度
      .xly-form-item__control.is-measuring {
        flex-wrap: nowrap;

        > * {
          flex-shrink: 0;
        }
      }

      .action-divider {
        display: none;
      }
    }
  }
}
</style>

<style lang="scss">
/* ========== Dark Mode ========== */
html.dark .xly-search-form {
  background: var(--el-bg-color);
  border-color: var(--el-border-color);
}
html.dark .xly-search-form__title {
  color: var(--el-text-color-primary);
}
</style>
