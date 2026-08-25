import type { DateTimePickerEmits, DateTimePickerProps } from './types'

import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

/** 滚动列表项高度（px） */
const ITEM_HEIGHT = 32
/** 可见项数量（奇数，用于计算滚动偏移） */
const VISIBLE_ITEMS = 7
/** 列表初始滚动偏移（使选中项居中） */
const SCROLL_OFFSET = Math.floor(VISIBLE_ITEMS / 2)

/**
 * EasyDateTimePicker 核心逻辑 composable
 *
 * 将原本内联在 date-time-picker.vue 中的日历计算、时间滚动、分段输入、
 * 面板操作、外部事件与生命周期等逻辑抽离为独立 composable，
 * 让 .vue 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 *
 * @param props 日期时间选择器 props（需传入响应式对象）
 * @param emit  日期时间选择器事件触发函数（callable 形式，见 DateTimePickerEmits）
 */
export function useDateTimePicker(props: DateTimePickerProps, emit: DateTimePickerEmits) {
  // ========== DOM 引用 ==========
  const inputRef = ref<HTMLInputElement | null>(null)
  const wrapperRef = ref<HTMLElement | null>(null)
  const panelRef = ref<HTMLElement | null>(null)
  const hoursListRef = ref<HTMLElement | null>(null)
  const minutesListRef = ref<HTMLElement | null>(null)
  const secondsListRef = ref<HTMLElement | null>(null)
  const hoursInputRef = ref<HTMLInputElement | null>(null)
  const minutesInputRef = ref<HTMLInputElement | null>(null)
  const secondsInputRef = ref<HTMLInputElement | null>(null)
  const focusing = ref(false)
  const hovering = ref(false)
  const panelVisible = ref(false)
  const yearMode = ref(false)
  const tick = ref(0)
  // 用户正在手动输入时间时，阻止 scroll 回调覆盖输入框内容
  const isManualInputting = ref(false)

  // ========== 日历相关 ==========
  const now = new Date()
  const panelYear = ref(now.getFullYear())
  const panelMonth = ref(now.getMonth())
  const currentYear = now.getFullYear()

  const weekdays = ['日', '一', '二', '三', '四', '五', '六']

  const yearRangeStart = computed(() => Math.floor(panelYear.value / 10) * 10)
  const yearRange = computed(() => {
    const start = yearRangeStart.value
    return Array.from({ length: 12 }, (_, i) => start + i)
  })

  const panelTitle = computed(() => {
    if (yearMode.value)
      return `${yearRangeStart.value} - ${yearRangeStart.value + 11}`
    return `${panelYear.value} 年 ${panelMonth.value + 1} 月`
  })

  const calendarDays = computed(() => {
    const year = panelYear.value
    const month = panelMonth.value
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startWeekday = firstDay.getDay()
    const daysInMonth = lastDay.getDate()
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

    const remaining = 42 - days.length
    for (let i = 1; i <= remaining; i++) {
      days.push({ date: i, isCurrentMonth: false, isToday: false, fullDate: '' })
    }

    return days
  })

  // ========== 时间相关 ==========
  const panelHours = ref(0)
  const panelMinutes = ref(0)
  const panelSeconds = ref(0)

  // ========== 面板日期字符串 ==========
  const panelDay = ref(1)
  const panelDateStr = computed(() => {
    return `${panelYear.value}-${String(panelMonth.value + 1).padStart(2, '0')}-${String(panelDay.value).padStart(2, '0')}`
  })

  // ========== 解析 modelValue ==========
  function parseModelValue(val: string) {
    if (!val)
      return null
    // 尝试多种格式
    const date = new Date(val.replace(/-/g, '/'))
    if (Number.isNaN(date.getTime()))
      return null
    return date
  }

  const displayValue = computed(() => {
    if (!props.modelValue)
      return ''
    return props.modelValue
  })

  // ========== 面板定位 ==========
  const panelStyle = computed(() => {
    // eslint-disable-next-line ts/no-unused-expressions
    tick.value
    if (!wrapperRef.value)
      return {}
    const rect = wrapperRef.value.getBoundingClientRect()
    const spaceBelow = window.innerHeight - rect.bottom
    if (spaceBelow < 400) {
      return {
        top: `${rect.top - 400 - 4}px`,
        left: `${rect.left}px`,
      }
    }
    return {
      top: `${rect.bottom + 4}px`,
      left: `${rect.left}px`,
    }
  })

  // ========== 时间滚动 ==========
  function scrollToValue(listEl: HTMLElement | null, value: number) {
    if (!listEl)
      return
    listEl.scrollTop = (value - SCROLL_OFFSET) * ITEM_HEIGHT
  }

  function scrollToAllTimeLists() {
    scrollToValue(hoursListRef.value, panelHours.value)
    scrollToValue(minutesListRef.value, panelMinutes.value)
    scrollToValue(secondsListRef.value, panelSeconds.value)
  }

  function onScroll(e: Event, unit: 'hours' | 'minutes' | 'seconds') {
    const el = e.target as HTMLElement
    const value = Math.round(el.scrollTop / ITEM_HEIGHT) + SCROLL_OFFSET
    if (unit === 'hours')
      panelHours.value = Math.max(0, Math.min(23, value))
    else if (unit === 'minutes')
      panelMinutes.value = Math.max(0, Math.min(59, value))
    else panelSeconds.value = Math.max(0, Math.min(59, value))
    syncInputsFromValues()
  }

  function selectTimeUnit(unit: 'hours' | 'minutes' | 'seconds', val: number) {
    if (unit === 'hours') {
      panelHours.value = val
      scrollToValue(hoursListRef.value, val)
    }
    else if (unit === 'minutes') {
      panelMinutes.value = val
      scrollToValue(minutesListRef.value, val)
    }
    else {
      panelSeconds.value = val
      scrollToValue(secondsListRef.value, val)
    }
    syncInputsFromValues()
  }

  // ========== 面板内分段输入框 ==========
  function getInputRef(unit: 'hours' | 'minutes' | 'seconds') {
    if (unit === 'hours')
      return hoursInputRef
    if (unit === 'minutes')
      return minutesInputRef
    return secondsInputRef
  }

  function getUnitMax(unit: 'hours' | 'minutes' | 'seconds') {
    return unit === 'hours' ? 23 : 59
  }

  /** 将面板值同步到所有输入框 DOM（输入中时跳过，避免覆盖用户正在输入的内容） */
  function syncInputsFromValues() {
    if (isManualInputting.value)
      return
    const hh = hoursInputRef.value
    const mm = minutesInputRef.value
    const ss = secondsInputRef.value
    if (hh)
      hh.value = String(panelHours.value).padStart(2, '0')
    if (mm)
      mm.value = String(panelMinutes.value).padStart(2, '0')
    if (ss)
      ss.value = String(panelSeconds.value).padStart(2, '0')
  }

  /** 滚动到指定单元的列表位置（不触发 onScroll 的同步） */
  function scrollToUnit(unit: 'hours' | 'minutes' | 'seconds', value: number) {
    const listEl
      = unit === 'hours' ? hoursListRef.value : unit === 'minutes' ? minutesListRef.value : secondsListRef.value
    if (!listEl)
      return
    listEl.scrollTop = (value - SCROLL_OFFSET) * ITEM_HEIGHT
  }

  /** 输入事件：只过滤非数字、限制2位，不同步回输入框 */
  function onTimeInput(e: Event, unit: 'hours' | 'minutes' | 'seconds') {
    isManualInputting.value = true
    const el = e.target as HTMLInputElement
    const raw = el.value.replace(/\D/g, '').slice(0, 2)
    if (raw !== el.value) {
      el.value = raw
    }
    const max = getUnitMax(unit)
    const num = raw.length > 0 ? parseInt(raw, 10) : 0
    const val = Number.isNaN(num) ? 0 : Math.max(0, Math.min(max, num))
    if (unit === 'hours')
      panelHours.value = val
    else if (unit === 'minutes')
      panelMinutes.value = val
    else panelSeconds.value = val
    // 只滚动当前列，避免多列同时滚动引发多余的 onScroll
    scrollToUnit(unit, val)
  }

  /** blur 时格式化（补零、限制范围），延迟重置输入标志以防 passive scroll 异步触发 */
  function onTimeBlur(e: Event, unit: 'hours' | 'minutes' | 'seconds') {
    const el = e.target as HTMLInputElement
    const max = getUnitMax(unit)
    const num = parseInt(el.value, 10)
    if (Number.isNaN(num) || el.value.trim() === '') {
      el.value = '00'
    }
    else {
      el.value = String(Math.max(0, Math.min(max, num))).padStart(2, '0')
    }
    const val = parseInt(el.value, 10)
    if (unit === 'hours')
      panelHours.value = val
    else if (unit === 'minutes')
      panelMinutes.value = val
    else panelSeconds.value = val
    // 延迟重置，确保 passive scroll 事件不会再覆盖输入框
    setTimeout(() => {
      isManualInputting.value = false
    }, 100)
  }

  /** 上下键调整数值 */
  function adjustInput(unit: 'hours' | 'minutes' | 'seconds', delta: number) {
    const max = getUnitMax(unit) + 1
    if (unit === 'hours')
      panelHours.value = (panelHours.value + delta + max) % max
    else if (unit === 'minutes')
      panelMinutes.value = (panelMinutes.value + delta + max) % max
    else panelSeconds.value = (panelSeconds.value + delta + max) % max
    syncInputsFromValues()
    scrollToAllTimeLists()
  }

  /** Enter 键跳转到下一个输入框 */
  function focusNextInput(unit: 'hours' | 'minutes' | 'seconds') {
    const targetRef = getInputRef(unit)
    nextTick(() => {
      if (targetRef.value)
        targetRef.value.focus()
    })
  }

  // ========== 日历操作 ==========
  function prevMonth() {
    if (yearMode.value) {
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
    if (yearMode.value) {
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

  function selectYear(year: number) {
    panelYear.value = year
    yearMode.value = false
  }

  function selectDay(day: { date: number, isCurrentMonth: boolean, fullDate: string }) {
    if (!day.isCurrentMonth)
      return
    panelDay.value = day.date
  }

  // ========== 面板操作 ==========
  function openPicker() {
    if (props.disabled || props.readonly)
      return

    // 解析当前值
    const parsed = parseModelValue(props.modelValue ?? '')
    if (parsed) {
      panelYear.value = parsed.getFullYear()
      panelMonth.value = parsed.getMonth()
      panelDay.value = parsed.getDate()
      panelHours.value = parsed.getHours()
      panelMinutes.value = parsed.getMinutes()
      panelSeconds.value = parsed.getSeconds()
    }
    else {
      const n = new Date()
      panelYear.value = n.getFullYear()
      panelMonth.value = n.getMonth()
      panelDay.value = n.getDate()
      panelHours.value = 0
      panelMinutes.value = 0
      panelSeconds.value = 0
    }

    tick.value++
    panelVisible.value = true
    nextTick(() => {
      syncInputsFromValues()
      scrollToAllTimeLists()
    })
  }

  function closePicker() {
    panelVisible.value = false
    yearMode.value = false
  }

  function setNow() {
    const n = new Date()
    panelYear.value = n.getFullYear()
    panelMonth.value = n.getMonth()
    panelDay.value = n.getDate()
    panelHours.value = n.getHours()
    panelMinutes.value = n.getMinutes()
    panelSeconds.value = n.getSeconds()
    nextTick(() => {
      syncInputsFromValues()
      scrollToAllTimeLists()
    })
  }

  function formatOutput(): string {
    const y = panelYear.value
    const mo = String(panelMonth.value + 1).padStart(2, '0')
    const d = String(panelDay.value).padStart(2, '0')
    const hh = String(panelHours.value).padStart(2, '0')
    const mi = String(panelMinutes.value).padStart(2, '0')
    const ss = String(panelSeconds.value).padStart(2, '0')

    if (props.format) {
      return props.format
        .replace('YYYY', String(y))
        .replace('MM', mo)
        .replace('DD', d)
        .replace('HH', hh)
        .replace('mm', mi)
        .replace('ss', ss)
    }

    if (props.showSeconds)
      return `${y}-${mo}-${d} ${hh}:${mi}:${ss}`
    return `${y}-${mo}-${d} ${hh}:${mi}`
  }

  function confirm() {
    const val = formatOutput()
    emit('update:modelValue', val)
    emit('change', val)
    closePicker()
  }

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
  function handlePanelMouseDown(e: MouseEvent) {
    const target = e.target as HTMLElement
    const isInput = target.closest('.easy-dtp-time__input-area')
    if (!isInput) {
      e.preventDefault()
    }
  }

  function handleClickOutside(e: MouseEvent) {
    if (!panelVisible.value)
      return
    const active = document.activeElement as HTMLElement | null
    if (active && panelRef.value?.contains(active))
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
    hoursListRef,
    minutesListRef,
    secondsListRef,
    hoursInputRef,
    minutesInputRef,
    secondsInputRef,
    // 状态
    focusing,
    hovering,
    panelVisible,
    yearMode,
    tick,
    isManualInputting,
    panelYear,
    panelMonth,
    currentYear,
    weekdays,
    yearRangeStart,
    yearRange,
    panelTitle,
    calendarDays,
    panelHours,
    panelMinutes,
    panelSeconds,
    panelDay,
    panelDateStr,
    displayValue,
    panelStyle,
    // 日历操作
    prevMonth,
    nextMonth,
    toggleYearMode,
    selectYear,
    selectDay,
    // 时间操作
    onTimeInput,
    onTimeBlur,
    adjustInput,
    focusNextInput,
    onScroll,
    selectTimeUnit,
    // 面板操作
    openPicker,
    closePicker,
    setNow,
    confirm,
    clear,
    // 事件
    handleFocus,
    handleBlur,
    handlePanelMouseDown,
  }
}
