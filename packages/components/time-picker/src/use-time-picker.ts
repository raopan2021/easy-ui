import type { TimePickerEmits, TimePickerProps } from './types'

import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'

/** 滚动列表项高度（px） */
const ITEM_HEIGHT = 32
/** 可见项数量（奇数，用于计算滚动偏移） */
const VISIBLE_ITEMS = 7
/** 列表初始滚动偏移（使选中项居中） */
const SCROLL_OFFSET = Math.floor(VISIBLE_ITEMS / 2)

/**
 * EasyTimePicker 核心逻辑 composable
 *
 * 将原本内联在 time-picker.vue 中的时间解析、滚动选择、分段输入、
 * 面板操作、外部事件与生命周期等逻辑抽离为独立 composable，
 * 让 .vue 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 *
 * @param props 时间选择器 props（需传入响应式对象）
 * @param emit  时间选择器事件触发函数（callable 形式，见 TimePickerEmits）
 */
export function useTimePicker(props: TimePickerProps, emit: TimePickerEmits) {
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
  const tick = ref(0)

  // 面板临时值
  const panelHours = ref(0)
  const panelMinutes = ref(0)
  const panelSeconds = ref(0)

  /** 解析 'HH:mm[:ss]' 字符串为时分秒 */
  function parseTime(val: string) {
    if (!val)
      return { h: 0, m: 0, s: 0 }
    const parts = val.split(':').map(Number)
    return {
      h: Number.isNaN(parts[0]) ? 0 : Math.max(0, Math.min(23, parts[0])),
      m: Number.isNaN(parts[1]) ? 0 : Math.max(0, Math.min(59, parts[1])),
      s: Number.isNaN(parts[2]) ? 0 : Math.max(0, Math.min(59, parts[2])),
    }
  }

  const displayValue = computed(() => props.modelValue)

  const panelStyle = computed(() => {
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

  // ========== 滚动定位 ==========
  function scrollToValue(listEl: HTMLElement | null, value: number) {
    if (!listEl)
      return
    listEl.scrollTop = (value - SCROLL_OFFSET) * ITEM_HEIGHT
  }

  function scrollToAllLists() {
    scrollToValue(hoursListRef.value, panelHours.value)
    scrollToValue(minutesListRef.value, panelMinutes.value)
    scrollToValue(secondsListRef.value, panelSeconds.value)
  }

  // ========== 面板操作 ==========
  function openPanel() {
    if (props.disabled || props.readonly)
      return
    const parsed = parseTime(props.modelValue ?? '')
    panelHours.value = parsed.h
    panelMinutes.value = parsed.m
    panelSeconds.value = parsed.s
    tick.value++
    panelVisible.value = true
    nextTick(() => {
      syncInputsFromValues()
      scrollToAllLists()
    })
  }

  function closePanel() {
    panelVisible.value = false
  }

  function formatOutput(): string {
    const hh = String(panelHours.value).padStart(2, '0')
    const mm = String(panelMinutes.value).padStart(2, '0')
    if (props.showSeconds)
      return `${hh}:${mm}:${String(panelSeconds.value).padStart(2, '0')}`
    return `${hh}:${mm}`
  }

  function setNow() {
    const now = new Date()
    panelHours.value = now.getHours()
    panelMinutes.value = now.getMinutes()
    panelSeconds.value = now.getSeconds()
    nextTick(() => {
      syncInputsFromValues()
      scrollToAllLists()
    })
  }

  function confirm() {
    const val = formatOutput()
    emit('update:modelValue', val)
    emit('change', val)
    closePanel()
  }

  // ========== 列表选择 ==========
  function selectHour(h: number) {
    panelHours.value = h
    scrollToValue(hoursListRef.value, h)
    syncInputsFromValues()
  }

  function selectMinute(m: number) {
    panelMinutes.value = m
    scrollToValue(minutesListRef.value, m)
    syncInputsFromValues()
  }

  function selectSecond(s: number) {
    panelSeconds.value = s
    scrollToValue(secondsListRef.value, s)
    syncInputsFromValues()
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

  /** 将面板值同步到所有输入框 DOM */
  function syncInputsFromValues() {
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

  /** 输入事件：只过滤非数字、限制2位，不干预光标 */
  function onTimeInput(e: Event, unit: 'hours' | 'minutes' | 'seconds') {
    const el = e.target as HTMLInputElement
    const raw = el.value.replace(/\D/g, '').slice(0, 2)

    // 只在内容真的被过滤时才重写（避免干扰正常输入和光标位置）
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
    scrollToAllLists()
  }

  /** blur 时格式化（补零、限制范围） */
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
    // blur 时将最终值同步到面板
    const val = parseInt(el.value, 10)
    if (unit === 'hours')
      panelHours.value = val
    else if (unit === 'minutes')
      panelMinutes.value = val
    else panelSeconds.value = val
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
    scrollToAllLists()
  }

  /** Enter 键跳转到下一个输入框 */
  function focusNextInput(unit: 'hours' | 'minutes' | 'seconds') {
    const targetRef = getInputRef(unit)
    nextTick(() => {
      if (targetRef.value)
        targetRef.value.focus()
    })
  }

  // ========== 外部事件 ==========
  function handlePanelMouseDown(e: MouseEvent) {
    const target = e.target as HTMLElement
    const isInput = target.closest('.easy-time-panel__input-area')
    if (!isInput) {
      e.preventDefault()
    }
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
    closePanel()
  }

  function handleScrollClose(e: Event) {
    if (!panelVisible.value)
      return
    const target = e.target as HTMLElement
    if (panelRef.value?.contains(target))
      return
    closePanel()
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
    tick,
    panelHours,
    panelMinutes,
    panelSeconds,
    displayValue,
    panelStyle,
    // 面板操作
    openPanel,
    setNow,
    confirm,
    clear,
    // 列表选择
    selectHour,
    selectMinute,
    selectSecond,
    onScroll,
    // 分段输入
    onTimeInput,
    onTimeBlur,
    adjustInput,
    focusNextInput,
    // 事件
    handleFocus,
    handleBlur,
    handlePanelMouseDown,
  }
}
