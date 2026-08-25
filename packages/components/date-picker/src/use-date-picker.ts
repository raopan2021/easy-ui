/* eslint-disable ts/no-use-before-define */
import type { DatePickerEmits, DatePickerProps } from './types'

import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

/**
 * EasyDatePicker 核心逻辑 composable
 *
 * 将原本内联在 date-picker.vue 中的选中态解析、日历/年/月面板计算、
 * 面板操作、外部事件与生命周期等逻辑抽离为独立 composable，
 * 让 .vue 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 *
 * @param props 日期选择器 props（需传入响应式对象）
 * @param emit  日期选择器事件触发函数（callable 形式，见 DatePickerEmits）
 */
export function useDatePicker(props: DatePickerProps, emit: DatePickerEmits) {
  // ========== DOM 引用 ==========
  const inputRef = ref<HTMLInputElement | null>(null)
  const wrapperRef = ref<HTMLElement | null>(null)
  const panelRef = ref<HTMLElement | null>(null)
  const focusing = ref(false)
  const hovering = ref(false)
  const panelVisible = ref(false)
  const yearMode = ref(false)
  const tick = ref(0)

  // 面板当前显示的年月
  const now = new Date()
  const panelYear = ref(now.getFullYear())
  const panelMonth = ref(now.getMonth())
  const currentYear = now.getFullYear()
  const currentMonth = now.getMonth()

  const weekdays = ['日', '一', '二', '三', '四', '五', '六']
  const months = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月']

  // ========== 选中态解析 ==========
  /** 从 modelValue 解析选中日期 */
  const selectedDate = computed(() => {
    if (!props.modelValue)
      return null
    const d = new Date(props.modelValue)
    return Number.isNaN(d.getTime()) ? null : d
  })

  const displayValue = computed(() => {
    if (!selectedDate.value)
      return ''
    return formatDate(selectedDate.value)
  })

  const panelTitle = computed(() => {
    if (yearMode.value)
      return `${yearRangeStart.value} - ${yearRangeStart.value + 11}`
    if (props.type === 'month')
      return `${panelYear.value}`
    return `${panelYear.value} 年 ${panelMonth.value + 1} 月`
  })

  // ========== 年份范围 ==========
  const yearRangeStart = computed(() => Math.floor(panelYear.value / 10) * 10)

  const yearRange = computed(() => {
    const start = yearRangeStart.value
    return Array.from({ length: 12 }, (_, i) => start + i)
  })

  // ========== 日历生成 ==========
  const calendarDays = computed(() => {
    const year = panelYear.value
    const month = panelMonth.value
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startWeekday = firstDay.getDay()
    const daysInMonth = lastDay.getDate()

    // 上月补齐
    const prevLastDay = new Date(year, month, 0).getDate()
    const days: Array<{ date: number, isCurrentMonth: boolean, isToday: boolean, fullDate: string }> = []

    for (let i = startWeekday - 1; i >= 0; i--) {
      days.push({ date: prevLastDay - i, isCurrentMonth: false, isToday: false, fullDate: '' })
    }

    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i)
      days.push({
        date: i,
        isCurrentMonth: true,
        isToday: d.toDateString() === now.toDateString(),
        fullDate: `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`,
      })
    }

    // 下月补齐到 6 行
    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: i, isCurrentMonth: false, isToday: false, fullDate: '' })
    }

    return days
  })

  // ========== 面板定位 ==========
  const panelStyle = computed(() => {
    // 依赖 tick，确保每次打开面板时重新计算位置
    // eslint-disable-next-line ts/no-unused-expressions
    tick.value
    if (!wrapperRef.value)
      return {}
    const rect = wrapperRef.value.getBoundingClientRect()
    return {
      top: `${rect.bottom + 4}px`,
      left: `${rect.left}px`,
    }
  })

  // ========== 格式化 ==========
  function formatDate(date: Date): string {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return props.format?.replace('YYYY', String(y)).replace('MM', m).replace('DD', d) ?? `${y}-${m}-${d}`
  }

  // ========== 面板操作 ==========
  function openPicker() {
    if (props.disabled || props.readonly)
      return
    if (selectedDate.value) {
      panelYear.value = selectedDate.value.getFullYear()
      panelMonth.value = selectedDate.value.getMonth()
    }
    if (props.type === 'year') {
      yearMode.value = true
    }
    tick.value++
    panelVisible.value = true
  }

  function closePicker() {
    panelVisible.value = false
    yearMode.value = false
  }

  function prevMonth() {
    if (props.type === 'year' || yearMode.value) {
      panelYear.value -= 10
    }
    else {
      panelMonth.value--
      if (panelMonth.value < 0) {
        panelMonth.value = 11
        panelYear.value--
      }
    }
  }

  function nextMonth() {
    if (props.type === 'year' || yearMode.value) {
      panelYear.value += 10
    }
    else {
      panelMonth.value++
      if (panelMonth.value > 11) {
        panelMonth.value = 0
        panelYear.value++
      }
    }
  }

  function toggleYearMode() {
    yearMode.value = !yearMode.value
  }

  // ========== 选择回调 ==========
  function selectYear(year: number) {
    panelYear.value = year
    if (props.type === 'year') {
      emit('update:modelValue', String(year))
      emit('change', String(year))
      closePicker()
    }
    else {
      yearMode.value = false
    }
  }

  function selectMonth(month: number) {
    panelMonth.value = month
    if (props.type?.startsWith('month')) {
      const val = `${panelYear.value}-${String(month + 1).padStart(2, '0')}`
      emit('update:modelValue', val)
      emit('change', val)
      closePicker()
    }
  }

  function selectDay(day: { date: number, isCurrentMonth: boolean, fullDate: string }) {
    if (!day.isCurrentMonth)
      return
    emit('update:modelValue', day.fullDate)
    emit('change', day.fullDate)
    closePicker()
  }

  // ========== 选中态判断 ==========
  function isSelectedDate(day: { fullDate: string }) {
    if (!day.fullDate || !props.modelValue)
      return false
    return day.fullDate === props.modelValue
  }

  function isYearSelected(year: number) {
    return props.modelValue === String(year)
  }

  function isMonthSelected(month: number) {
    return props.modelValue === `${panelYear.value}-${String(month + 1).padStart(2, '0')}`
  }

  // 范围模式占位（当前组件不支持范围选择，保持 API 兼容）
  function isRangeStart(_day: unknown) {
    return false
  }
  function isRangeEnd(_day: unknown) {
    return false
  }
  function isInRange(_day: unknown) {
    return false
  }

  // ========== 清空 / 焦点 ==========
  function clear() {
    emit('update:modelValue', '')
    emit('change', '')
  }

  function handleFocus() {
    focusing.value = true
  }
  function handleBlur() {
    focusing.value = false
  }

  // ========== 外部事件 ==========
  function handleClickOutside(e: MouseEvent) {
    if (!panelVisible.value)
      return
    const target = e.target as HTMLElement
    if (wrapperRef.value?.contains(target))
      return
    if (panelRef.value?.contains(target))
      return
    closePicker()
  }

  function handleScrollClose(e: Event) {
    if (!panelVisible.value)
      return
    // 排除面板内部的滚动（如年份列表滚动不应关闭面板）
    const target = e.target as HTMLElement
    if (panelRef.value?.contains(target))
      return
    closePicker()
  }

  onMounted(() => {
    document.addEventListener('mousedown', handleClickOutside)
    window.addEventListener('scroll', handleScrollClose, true)
  })
  onBeforeUnmount(() => {
    document.removeEventListener('mousedown', handleClickOutside)
    window.removeEventListener('scroll', handleScrollClose, true)
  })

  return {
    // DOM 引用
    inputRef,
    wrapperRef,
    panelRef,
    // 状态
    focusing,
    hovering,
    panelVisible,
    yearMode,
    tick,
    panelYear,
    panelMonth,
    currentYear,
    currentMonth,
    weekdays,
    months,
    selectedDate,
    displayValue,
    panelTitle,
    yearRangeStart,
    yearRange,
    calendarDays,
    panelStyle,
    // 面板操作
    openPicker,
    closePicker,
    prevMonth,
    nextMonth,
    toggleYearMode,
    // 选择回调
    selectYear,
    selectMonth,
    selectDay,
    // 选中态判断
    isSelectedDate,
    isYearSelected,
    isMonthSelected,
    isRangeStart,
    isRangeEnd,
    isInRange,
    // 清空 / 焦点
    clear,
    handleFocus,
    handleBlur,
  }
}
