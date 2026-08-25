import type { SelectOption, SelectProps } from './select'

import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

/** 可调用形式的 emits（composable 内部直接调用 emit） */
interface SelectCoreEmits {
  (e: 'update:modelValue', value: any): void
  (e: 'change', value: any): void
  (e: 'clear'): void
  (e: 'remove-tag', value: any, index: number): void
  (e: 'search', query: string): void
  (e: 'create', value: any): void
}

/**
 * EasySelect 核心逻辑 composable
 *
 * 将原本内联在 select.vue 中的选项规范化、选中态计算、过滤搜索、
 * 下拉交互、创建选项、标签数量计算与外部事件等逻辑抽离为独立 composable，
 * 让 .vue 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 *
 * @param props 选择器 props（需传入响应式对象）
 * @param emit  选择器事件触发函数（callable 形式，见 SelectEmits）
 */
export function useSelectCore(props: SelectProps, emit: SelectCoreEmits) {
  // 字段名默认值（props 可选，composable 内统一兜底）
  const valueKey = props.valueKey ?? 'value'
  const labelKey = props.labelKey ?? 'label'
  const disabledKey = props.disabledKey ?? 'disabled'
  const separator = props.separator ?? ','
  const debounce = props.debounce ?? 300

  // ========== DOM 引用 / 状态 ==========
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

  // ========== 选项规范化 ==========
  /** 判断是否为基础数组（非对象数组） */
  const isSimpleArray = computed(() => {
    const opts = props.options
    if (!Array.isArray(opts) || opts.length === 0)
      return false
    // 检查第一个元素是否为非对象
    const firstItem = opts[0]
    return typeof firstItem !== 'object' || firstItem === null
  })

  /** 将基础数组转换为标准选项格式 */
  const normalizedOptions = computed<SelectOption[]>(() => {
    if (!isSimpleArray.value) {
      return props.options as SelectOption[]
    }
    // 基础数组转换为 { label, value } 格式
    return (props.options as string[]).map(item => ({
      [labelKey]: item,
      [valueKey]: item,
    }))
  })

  /** 有效的 filterable：用户未显式设置时，选项 ≥5 自动开启搜索 */
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

  /** 将 modelValue 转换为数组（内部统一使用数组处理） */
  const internalValue = computed<(string | number | boolean)[]>(() => {
    if (!props.multiple) {
      return props.modelValue !== undefined && props.modelValue !== null
        ? [props.modelValue as string | number | boolean]
        : []
    }

    const val = props.modelValue
    if (Array.isArray(val))
      return val
    if (typeof val === 'string' && val.trim() !== '') {
      return val.split(separator).map(v => v.trim())
    }
    return []
  })

  /** 将内部数组转换为 modelValue（根据 valueType） */
  function formatModelValue(arr: (string | number | boolean)[]): any {
    if (!props.multiple) {
      return arr[0] || undefined
    }

    if (props.valueType === 'string') {
      return arr.map(String).join(separator)
    }
    return arr
  }

  // ========== 选项合并 ==========
  /** 合并静态选项、远程选项和手动创建的选项 */
  const allOptions = computed(() => {
    if (props.remote && effectiveFilterable.value) {
      return [...remoteOptions.value, ...createdOptions.value]
    }
    return [...normalizedOptions.value, ...createdOptions.value]
  })

  const selectedLabels = computed(() => {
    if (props.multiple) {
      return internalValue.value.map((v) => {
        const opt = allOptions.value.find(o => o[valueKey] === v)
        return opt?.[labelKey] || String(v)
      })
    }
    const opt = allOptions.value.find(o => o[valueKey] === props.modelValue)
    // 如果找不到对应选项，显示传入的值本身
    if (opt)
      return [opt[labelKey]]
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
      return opts.filter(o => String(o[labelKey]).toLowerCase().includes(q))
    }
    return []
  })

  /** 判断搜索内容是否已存在于选项中 */
  const isQueryExisting = computed(() => {
    if (!searchQuery.value)
      return true
    const q = searchQuery.value
    return allOptions.value.some(o => o[labelKey] === q || o[valueKey] === q)
  })

  // ========== 下拉定位 ==========
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

  // ========== 选中态 / 禁用判断 ==========
  function isSelected(value: any) {
    if (props.multiple)
      return internalValue.value.includes(value)
    return props.modelValue === value
  }

  /** 判断选项是否禁用 */
  function isDisabled(option: SelectOption): boolean {
    if (typeof disabledKey === 'function') {
      return disabledKey(option)
    }
    return !!option[disabledKey as string]
  }

  // ========== 标签计算 ==========
  function setTagRef(el: any, index: number) {
    if (el) {
      tagRefs.value[index] = el
    }
  }

  /** 计算可见标签数量（根据容器宽度动态截断，超出显示 +N） */
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
      const paddingLeft = Number.parseFloat(getComputedStyle(container).paddingLeft)
      const paddingRight = Number.parseFloat(getComputedStyle(container).paddingRight)
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

  // ========== 下拉交互 ==========
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
    const optionValue = option[valueKey]

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

  // ========== 创建选项 ==========
  /** 处理点击添加按钮，创建新选项 */
  function handleCreateOption() {
    if (!props.allowCreate || !searchQuery.value.trim())
      return

    const query = searchQuery.value.trim()

    // 如果选项已存在，不创建，直接选中
    if (isQueryExisting.value) {
      const existingOption = allOptions.value.find(o => o[labelKey] === query || o[valueKey] === query)
      if (existingOption) {
        selectOption(existingOption)
      }
      return
    }

    // 创建新选项并加入 createdOptions
    const newOption: SelectOption = {
      [valueKey]: query,
      [labelKey]: query,
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

  // ========== 移除标签 / 清空 ==========
  function removeTag(visibleIndex: number) {
    if (visibleIndex < 0 || visibleIndex >= visibleLabels.value.length)
      return

    const current = [...internalValue.value]
    const visibleLabelValue = visibleLabels.value[visibleIndex]

    if (!visibleLabelValue)
      return

    // 使用 visibleLabelValue 来查找对应的值
    const originalIndex = current.findIndex((v) => {
      const opt = allOptions.value.find(o => o && o[valueKey] === v)
      return opt && opt[labelKey] === visibleLabelValue
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

  // ========== 外部事件 ==========
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

  // ========== 搜索 watch ==========
  watch(searchQuery, (val) => {
    hoverIndex.value = -1
    if (props.remote && props.remoteMethod) {
      if (debounceTimer)
        clearTimeout(debounceTimer)
      debounceTimer = setTimeout(async () => {
        emit('search', val)
        // 如果 remoteMethod 返回 Promise，自动等待并更新 remoteOptions
        const result = props.remoteMethod?.(val)
        if (result instanceof Promise) {
          const data = await result
          remoteOptions.value = data || []
        }
      }, debounce)
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

  // ========== 生命周期 ==========
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

  return {
    // 字段名
    valueKey,
    labelKey,
    // DOM 引用
    triggerRef,
    dropdownRef,
    searchRef,
    tagsContainerRef,
    // 状态
    visible,
    hovering,
    hoverIndex,
    searchQuery,
    remoteOptions,
    visibleLabelCount,
    // 计算
    effectiveFilterable,
    hasValue,
    allOptions,
    selectedLabels,
    hiddenCount,
    displayLabel,
    visibleLabels,
    filteredOptions,
    isQueryExisting,
    dropdownStyle,
    // 判断
    isSelected,
    isDisabled,
    // 标签
    setTagRef,
    calculateVisibleLabels,
    // 交互
    toggleDropdown,
    selectOption,
    handleCreateOption,
    removeTag,
    clear,
  }
}
