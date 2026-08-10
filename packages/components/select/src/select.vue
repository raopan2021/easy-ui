<script setup lang="ts">
import type { SelectEmits, SelectOption } from './select'

import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import EasyIcon from '../../icon'

import { selectProps } from './select'

defineOptions({ name: 'EasySelect' })

const props = defineProps(selectProps)
const emit = defineEmits<SelectEmits>()

const slots = defineSlots()

const triggerRef = ref<HTMLElement | null>(null)
const dropdownRef = ref<HTMLElement | null>(null)
const searchRef = ref<HTMLInputElement | null>(null)
const tagsContainerRef = ref<HTMLElement | null>(null)
const tagRefs = ref<(HTMLElement | null)[]>([])

const visible = ref(false)
const hovering = ref(false)
const hoverIndex = ref(-1)
const searchQuery = ref('')
const tick = ref(0)
const dropHeight = ref(280)
const remoteOptions = ref<SelectOption[]>([])
const visibleLabelCount = ref(0)
// 手动创建的选项，用于 allow-create 模式
const createdOptions = ref<SelectOption[]>([])
let debounceTimer: ReturnType<typeof setTimeout> | null = null
let calcTimeout: ReturnType<typeof setTimeout> | null = null

// 判断是否为基础数组（非对象数组）
const isSimpleArray = computed(() => {
  const opts = props.options
  if (!Array.isArray(opts) || opts.length === 0)
    return false
  // 检查第一个元素是否为非对象
  const firstItem = opts[0]
  return typeof firstItem !== 'object' || firstItem === null
})

// 将基础数组转换为标准选项格式
const normalizedOptions = computed<SelectOption[]>(() => {
  if (!isSimpleArray.value) {
    return props.options as SelectOption[]
  }
  // 基础数组转换为 { label, value } 格式
  return (props.options as string[]).map(item => ({
    [props.labelKey]: item,
    [props.valueKey]: item,
  }))
})

// 有效的 filterable：用户未显式设置时，选项 ≥5 自动开启搜索
const effectiveFilterable = computed(() => {
  if (props.filterable !== undefined)
    return props.filterable
  return normalizedOptions.value.length >= 5
})

const hasValue = computed(() => {
  if (props.multiple) {
    const val = props.modelValue
    if (Array.isArray(val))
      return val.length > 0
    if (typeof val === 'string')
      return val.trim() !== ''
    return false
  }
  return props.modelValue !== undefined && props.modelValue !== null && props.modelValue !== ''
})

// 将 modelValue 转换为数组（内部统一使用数组处理）
const internalValue = computed<(string | number | boolean)[]>(() => {
  if (!props.multiple) {
    return props.modelValue !== undefined && props.modelValue !== null ? [props.modelValue] : []
  }

  const val = props.modelValue
  if (Array.isArray(val))
    return val
  if (typeof val === 'string' && val.trim() !== '') {
    return val.split(props.separator).map(v => v.trim())
  }
  return []
})

// 将内部数组转换为 modelValue（根据 valueType）
function formatModelValue(arr: (string | number | boolean)[]): any {
  if (!props.multiple) {
    return arr[0] || undefined
  }

  if (props.valueType === 'string') {
    return arr.map(String).join(props.separator)
  }
  return arr
}

// 合并静态选项、远程选项和手动创建的选项
const allOptions = computed(() => {
  if (props.remote && effectiveFilterable.value) {
    return [...remoteOptions.value, ...createdOptions.value]
  }
  return [...normalizedOptions.value, ...createdOptions.value]
})

const selectedLabels = computed(() => {
  if (props.multiple) {
    return internalValue.value.map((v) => {
      const opt = allOptions.value.find(o => o[props.valueKey] === v)
      return opt?.[props.labelKey] || String(v)
    })
  }
  const opt = allOptions.value.find(o => o[props.valueKey] === props.modelValue)
  // 如果找不到对应选项，显示传入的值本身
  if (opt)
    return [opt[props.labelKey]]
  if (props.modelValue !== undefined && props.modelValue !== null && props.modelValue !== '') {
    return [String(props.modelValue)]
  }
  return []
})

const hiddenCount = computed(() => Math.max(0, selectedLabels.value.length - visibleLabelCount.value))

const displayLabel = computed(() => {
  if (selectedLabels.value.length > 0)
    return selectedLabels.value.join(', ')
  return ''
})

const visibleLabels = computed(() => {
  return selectedLabels.value.slice(0, visibleLabelCount.value)
})

const filteredOptions = computed(() => {
  const opts = allOptions.value
  if (opts.length > 0) {
    if (!effectiveFilterable.value || !searchQuery.value)
      return opts
    const q = searchQuery.value.toLowerCase()
    return opts.filter(o => String(o[props.labelKey]).toLowerCase().includes(q))
  }
  return []
})

// 判断搜索内容是否已存在于选项中
const isQueryExisting = computed(() => {
  if (!searchQuery.value)
    return true
  const q = searchQuery.value
  return allOptions.value.some(o => o[props.labelKey] === q || o[props.valueKey] === q)
})

const dropdownStyle = computed(() => {
  // 依赖 tick，确保每次打开面板时重新计算位置
  // eslint-disable-next-line ts/no-unused-expressions
  tick.value
  if (!triggerRef.value)
    return {}
  const rect = triggerRef.value.getBoundingClientRect()
  const spaceBelow = window.innerHeight - rect.bottom
  const dh = dropHeight.value

  if (spaceBelow < dh) {
    return {
      top: `${Math.max(4, rect.top - dh - 4)}px`,
      left: `${rect.left}px`,
      minWidth: `${rect.width}px`,
    }
  }
  return {
    top: `${rect.bottom + 4}px`,
    left: `${rect.left}px`,
    minWidth: `${rect.width}px`,
  }
})

function isSelected(value: any) {
  if (props.multiple)
    return internalValue.value.includes(value)
  return props.modelValue === value
}

// 判断选项是否禁用
function isDisabled(option: SelectOption): boolean {
  if (typeof props.disabledKey === 'function') {
    return props.disabledKey(option)
  }
  return !!option[props.disabledKey as string]
}

// 设置标签引用
function setTagRef(el: any, index: number) {
  if (el) {
    tagRefs.value[index] = el
  }
}

// 计算可见标签数量
function calculateVisibleLabels() {
  if (calcTimeout) {
    clearTimeout(calcTimeout)
  }

  calcTimeout = setTimeout(() => {
    if (!tagsContainerRef.value || selectedLabels.value.length === 0) {
      visibleLabelCount.value = selectedLabels.value.length
      return
    }

    const container = tagsContainerRef.value
    const containerWidth = container.clientWidth
    const paddingLeft = parseFloat(getComputedStyle(container).paddingLeft)
    const paddingRight = parseFloat(getComputedStyle(container).paddingRight)
    const availableWidth = containerWidth - paddingLeft - paddingRight - 20 // 20px for suffix space

    let totalWidth = 0
    let count = 0
    let hasUnrenderedTag = false

    for (let i = 0; i < selectedLabels.value.length; i++) {
      const tag = tagRefs.value[i]
      if (!tag) {
        // 标签未渲染，暂时显示全部
        hasUnrenderedTag = true
        break
      }

      const tagWidth = tag.offsetWidth

      // 计算是否需要显示 +N 标签
      const remaining = selectedLabels.value.length - i - 1
      const needsCountTag = remaining > 0
      const countTagWidth = needsCountTag ? 30 : 0 // 估算 +N 标签宽度

      if (totalWidth + tagWidth + countTagWidth > availableWidth) {
        break
      }

      totalWidth += tagWidth + 4 // 4px 是 gap
      count++
    }

    if (hasUnrenderedTag) {
      visibleLabelCount.value = selectedLabels.value.length
    }
    else {
      // 确保至少显示一个标签
      visibleLabelCount.value = Math.max(1, count)
    }
  }, 0)
}

function toggleDropdown() {
  if (props.disabled)
    return
  visible.value = !visible.value
  if (visible.value) {
    tick.value++
    nextTick(() => {
      if (dropdownRef.value) {
        dropHeight.value = dropdownRef.value.offsetHeight
        tick.value++
      }
      if (effectiveFilterable.value)
        searchRef.value?.focus()
    })
  }
  else {
    searchQuery.value = ''
  }
}

function selectOption(option: SelectOption) {
  if (isDisabled(option))
    return
  const optionValue = option[props.valueKey]

  if (props.multiple) {
    const current = [...internalValue.value]
    const idx = current.indexOf(optionValue)
    if (idx > -1) {
      current.splice(idx, 1)
    }
    else {
      current.push(optionValue)
    }
    emit('update:modelValue', formatModelValue(current))
    emit('change', formatModelValue(current))
  }
  else {
    emit('update:modelValue', optionValue)
    emit('change', optionValue)
    visible.value = false
  }
}

// 处理点击添加按钮，创建新选项
function handleCreateOption() {
  if (!props.allowCreate || !searchQuery.value.trim())
    return

  const query = searchQuery.value.trim()

  // 如果选项已存在，不创建，直接选中
  if (isQueryExisting.value) {
    const existingOption = allOptions.value.find(o => o[props.labelKey] === query || o[props.valueKey] === query)
    if (existingOption) {
      selectOption(existingOption)
    }
    return
  }

  // 创建新选项并加入 createdOptions
  const newOption: SelectOption = {
    [props.valueKey]: query,
    [props.labelKey]: query,
  }
  createdOptions.value.push(newOption)

  if (props.multiple) {
    const current = [...internalValue.value]
    if (!current.includes(query)) {
      current.push(query)
      emit('update:modelValue', formatModelValue(current))
      emit('change', formatModelValue(current))
      emit('create', query)
    }
  }
  else {
    emit('update:modelValue', query)
    emit('change', query)
    emit('create', query)
    visible.value = false
  }

  searchQuery.value = ''
}

function removeTag(visibleIndex: number) {
  if (visibleIndex < 0 || visibleIndex >= visibleLabels.value.length)
    return

  const current = [...internalValue.value]
  const visibleLabelValue = visibleLabels.value[visibleIndex]

  if (!visibleLabelValue)
    return

  // 使用 visibleLabelValue 来查找对应的值
  const originalIndex = current.findIndex((v) => {
    const opt = allOptions.value.find(o => o && o[props.valueKey] === v)
    return opt && opt[props.labelKey] === visibleLabelValue
  })

  if (originalIndex > -1) {
    const removed = current.splice(originalIndex, 1)
    emit('update:modelValue', formatModelValue(current))
    emit('change', formatModelValue(current))
    emit('remove-tag', removed[0], originalIndex)
  }
}

function clear() {
  const val = props.multiple ? formatModelValue([]) : undefined
  emit('update:modelValue', val)
  emit('change', val)
  emit('clear')
}

function handleClickOutside(e: MouseEvent) {
  if (!visible.value)
    return
  const target = e.target as HTMLElement
  if (triggerRef.value?.contains(target))
    return
  if (dropdownRef.value?.contains(target))
    return
  visible.value = false
  searchQuery.value = ''
}

function handleScrollClose(e: Event) {
  if (!visible.value)
    return
  // 排除下拉面板内部的滚动
  const target = e.target as HTMLElement
  if (dropdownRef.value?.contains(target))
    return
  visible.value = false
  searchQuery.value = ''
}

watch(searchQuery, (val) => {
  hoverIndex.value = -1
  if (props.remote && props.remoteMethod) {
    if (debounceTimer)
      clearTimeout(debounceTimer)
    debounceTimer = setTimeout(async () => {
      emit('search', val)
      // 如果 remoteMethod 返回 Promise，自动等待并更新 remoteOptions
      const result = props.remoteMethod(val)
      if (result instanceof Promise) {
        const data = await result
        remoteOptions.value = data || []
      }
    }, props.debounce)
  }
  else {
    // 非远程模式：触发 search 事件让外部自行处理
    emit('search', val)
  }
})

watch(
  () => [selectedLabels.value, visible.value],
  () => {
    nextTick(() => {
      calculateVisibleLabels()
    })
  },
  { deep: true },
)

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside)
  window.addEventListener('scroll', handleScrollClose, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside)
  window.removeEventListener('scroll', handleScrollClose, true)
  if (calcTimeout) {
    clearTimeout(calcTimeout)
  }
})

// 暴露 remoteOptions 供外部更新远程搜索结果
defineExpose({
  blur: () => {
    visible.value = false
  },
  remoteOptions,
})
</script>

<template>
  <div class="easy-select" :class="[`easy-select--${size}`, { 'is-disabled': disabled, 'is-focus': visible }]">
    <!-- 触发器 -->
    <div
      ref="triggerRef"
      class="easy-select__wrapper"
      :class="{ 'is-hover': hovering && !disabled }"
      @click="toggleDropdown"
      @mouseenter="hovering = true"
      @mouseleave="hovering = false"
    >
      <!-- 前缀 -->
      <span v-if="$slots.prefix || prefixIcon" class="easy-select__prefix">
        <slot name="prefix" />
        <EasyIcon v-if="!$slots.prefix && prefixIcon" :name="prefixIcon" />
      </span>

      <!-- 多选标签 -->
      <div v-if="multiple && selectedLabels.length" ref="tagsContainerRef" class="easy-select__tags">
        <span v-for="(label, i) in visibleLabels" :key="i" :ref="(el) => setTagRef(el, i)" class="easy-select__tag">
          {{ label }}
          <span class="easy-select__tag-close" @click.stop="removeTag(i)">
            <EasyIcon name="el:Close" :size="12" />
          </span>
        </span>
        <span v-if="hiddenCount > 0" class="easy-select__tag easy-select__tag--count">+{{ hiddenCount }}</span>
      </div>

      <!-- 选中值显示 -->
      <span v-else class="easy-select__value" :class="{ 'is-placeholder': !selectedLabels.length }">
        {{ selectedLabels.length ? displayLabel : placeholder }}
      </span>

      <!-- 后缀 -->
      <span class="easy-select__suffix">
        <!-- 清除 -->
        <span v-if="clearable && hasValue && !disabled" class="easy-select__clear" @click.stop="clear">
          <EasyIcon name="el:Close" />
        </span>
        <!-- 自定义后缀 -->
        <slot name="suffix" />
        <EasyIcon v-if="!$slots.suffix && suffixIcon" :name="suffixIcon" />
        <!-- 箭头 -->
        <EasyIcon name="el:ArrowDown" class="easy-select__arrow" :class="{ 'is-reverse': visible }" />
      </span>
    </div>

    <!-- 下拉面板 -->
    <Teleport to="body">
      <Transition name="easy-select-zoom">
        <div v-if="visible" ref="dropdownRef" class="easy-select__dropdown" :style="dropdownStyle">
          <!-- 搜索框 -->
          <div v-if="effectiveFilterable" class="easy-select__search">
            <input
              ref="searchRef"
              v-model="searchQuery"
              class="easy-select__search-input"
              placeholder="搜索..."
              @keydown.stop
            >
            <button
              v-if="allowCreate"
              class="easy-select__search-btn"
              :disabled="!searchQuery.trim() || isQueryExisting"
              @click="handleCreateOption"
            >
              添加
            </button>
          </div>

          <!-- 选项列表 -->
          <div class="easy-select__list" :style="{ maxHeight: listMaxHeight }">
            <div
              v-for="(option, idx) in filteredOptions"
              :key="option[valueKey]"
              class="easy-select__option"
              :class="{
                'is-selected': isSelected(option[valueKey]),
                'is-disabled': isDisabled(option),
                'is-hover': hoverIndex === idx,
              }"
              @click="selectOption(option)"
              @mouseenter="hoverIndex = idx"
            >
              <!-- 多选复选框 -->
              <span v-if="multiple" class="easy-select__option-check">
                <EasyIcon v-if="isSelected(option[valueKey])" name="el:Check" />
              </span>
              <!-- 默认选项内容 -->
              <span v-if="!slots.option" class="easy-select__option-label">{{ option[labelKey] }}</span>
              <!-- 自定义选项插槽 -->
              <slot v-else name="option" :option="option" :index="idx" :selected="isSelected(option[valueKey])" />
            </div>
            <div v-if="filteredOptions.length === 0" class="easy-select__empty">
              {{ loading ? '加载中...' : '暂无数据' }}
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped lang="scss">
@use '../../../easy-ui/src/styles/tokens' as *;

$radius: 8px;
$transition: all 0.2s ease;

.easy-select {
  display: inline-flex;
  width: 100%;
  position: relative;

  &.easy-select--large .easy-select__wrapper {
    height: 44px;
  }
  &.easy-select--large .easy-select__value {
    font-size: 15px;
  }
  &.easy-select--default .easy-select__wrapper {
    height: 36px;
  }
  &.easy-select--default .easy-select__value {
    font-size: 14px;
  }
  &.easy-select--small .easy-select__wrapper {
    height: 30px;
  }
  &.easy-select--small .easy-select__value {
    font-size: 13px;
  }

  .easy-select__wrapper {
    width: 100%;
    display: inline-flex;
    align-items: center;
    padding: 0 12px;
    background-color: var(--el-bg-color);
    border: 1px solid var(--el-border-color);
    border-radius: $radius;
    cursor: pointer;
    transition: $transition;
    user-select: none;
    box-sizing: border-box;

    &.is-hover:not(.is-disabled) {
      border-color: var(--el-border-color-hover);
    }
  }

  &.is-focus .easy-select__wrapper {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 2px $primary-bg;
  }

  &.is-disabled .easy-select__wrapper {
    background-color: var(--el-fill-color-light);
    cursor: not-allowed;
  }

  .easy-select__prefix {
    display: inline-flex;
    align-items: center;
    margin-right: 6px;
    color: var(--el-text-color-placeholder);
    flex-shrink: 0;
  }

  .easy-select__value {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--el-text-color-regular);

    &.is-placeholder {
      color: var(--el-text-color-placeholder);
    }
  }

  .easy-select__tags {
    flex: 1;
    display: flex;
    flex-wrap: nowrap;
    gap: 4px;
    overflow: hidden;
    align-items: center;
    min-width: 0;
  }

  .easy-select__tag {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 1px 6px;
    background: $primary-bg;
    color: var(--el-color-primary);
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    flex-shrink: 0;
    max-width: 100%;

    &.easy-select--count {
      background: rgba(79, 110, 247, 0.12);
    }
  }

  .easy-select__tag-close {
    display: inline-flex;
    cursor: pointer;
    border-radius: 50%;
    transition: background 0.15s;

    &:hover {
      background: rgba(79, 110, 247, 0.15);
    }
  }

  .easy-select__suffix {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-left: 6px;
    color: var(--el-text-color-placeholder);
    flex-shrink: 0;
  }

  .easy-select__clear {
    display: inline-flex;
    cursor: pointer;
    border-radius: 50%;
    transition: color 0.15s;
    &:hover {
      color: var(--el-text-color-regular);
    }
  }

  .easy-select__arrow {
    transition: transform 0.2s ease;
    &.is-reverse {
      transform: rotate(180deg);
    }
  }
}

// ========== 过渡动画（Teleport 到 body，不能 scoped）==========
</style>
