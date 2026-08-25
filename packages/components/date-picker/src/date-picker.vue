<script setup lang="ts">
import type { DatePickerEmits, DatePickerProps } from './types'

import { ArrowLeft, ArrowRight, Calendar, Close } from '@element-plus/icons-vue'
import { useDatePicker } from './use-date-picker'

// 保持对外类型导出兼容（原定义在 date-picker.vue）
export type { DatePickerEmits, DatePickerProps } from './types'

defineOptions({ name: 'EasyDatePicker' })

const props = withDefaults(defineProps<DatePickerProps>(), {
  modelValue: '',
  type: 'date',
  placeholder: '请选择日期',
  disabled: false,
  readonly: false,
  clearable: true,
  format: 'YYYY-MM-DD',
  size: 'default',
})

const emit = defineEmits<DatePickerEmits>()

// ──── 核心逻辑（日历/年/月面板 / 选择回调 / 外部事件 / 生命周期）────
const {
  inputRef,
  wrapperRef,
  panelRef,
  focusing,
  hovering,
  panelVisible,
  yearMode,
  panelYear,
  currentYear,
  currentMonth,
  weekdays,
  months,
  displayValue,
  panelTitle,
  yearRange,
  calendarDays,
  panelStyle,
  openPicker,
  prevMonth,
  nextMonth,
  toggleYearMode,
  selectYear,
  selectMonth,
  selectDay,
  isSelectedDate,
  isYearSelected,
  isMonthSelected,
  isRangeStart,
  isRangeEnd,
  isInRange,
  clear,
  handleFocus,
  handleBlur,
} = useDatePicker(props, emit)
</script>

<template>
  <div class="easy-date-picker" :class="[`easy-date-picker--${size}`, { 'is-disabled': disabled }]">
    <div
      ref="wrapperRef" class="easy-date-picker__wrapper"
      :class="{ 'is-focus': focusing, 'is-hover': hovering && !disabled }" @mouseenter="hovering = true"
      @mouseleave="hovering = false"
    >
      <!-- 前缀图标 -->
      <span class="easy-date-picker__prefix">
        <slot name="prefix">
          <el-icon><Calendar /></el-icon>
        </slot>
      </span>

      <!-- 日期输入 -->
      <input
        ref="inputRef" class="easy-date-picker__input" :value="displayValue" :placeholder="placeholder"
        :disabled="disabled" :readonly="readonly" @focus="handleFocus" @blur="handleBlur" @click="openPicker"
      >

      <!-- 清除 -->
      <span v-if="clearable && modelValue && !disabled" class="easy-date-picker__clear" @click.stop="clear">
        <el-icon><Close /></el-icon>
      </span>
    </div>

    <!-- 日期选择面板 -->
    <Teleport to="body">
      <Transition name="easy-date-picker-fade">
        <div v-if="panelVisible" ref="panelRef" class="easy-date-picker__panel" :style="panelStyle" @mousedown.prevent>
          <!-- 头部：年月切换 -->
          <div class="easy-date-panel__header">
            <el-icon class="easy-date-panel__nav" @click="prevMonth">
              <ArrowLeft />
            </el-icon>
            <span
              class="easy-date-panel__title" :class="{ 'is-title-clickable': type !== 'year' }"
              @click="toggleYearMode"
            >{{ panelTitle }}</span>
            <el-icon class="easy-date-panel__nav" @click="nextMonth">
              <ArrowRight />
            </el-icon>
          </div>

          <!-- 年份选择 -->
          <div v-if="type === 'year' || yearMode" class="easy-date-panel__body">
            <div class="easy-date-panel__year-grid">
              <div
                v-for="year in yearRange"
                :key="year"
                class="easy-date-panel__year-cell"
                :class="{
                  'is-current': year === currentYear && type !== 'month',
                  'is-selected': isYearSelected(year),
                }"
                @click="selectYear(year)"
              >
                {{ year }}
              </div>
            </div>
          </div>

          <!-- 月份选择 -->
          <div v-else-if="type?.startsWith('month')" class="easy-date-panel__body">
            <div class="easy-date-panel__month-grid">
              <div
                v-for="(m, i) in months"
                :key="i"
                class="easy-date-panel__month-cell"
                :class="{
                  'is-current': i === currentMonth && panelYear === currentYear,
                  'is-selected': isMonthSelected(i),
                }"
                @click="selectMonth(i)"
              >
                {{ m }}
              </div>
            </div>
          </div>

          <!-- 日历（日期模式） -->
          <div v-else class="easy-date-panel__body">
            <!-- 星期标题 -->
            <div class="easy-date-panel__weekdays">
              <span v-for="w in weekdays" :key="w">{{ w }}</span>
            </div>
            <!-- 日期网格 -->
            <div class="easy-date-panel__days">
              <div
                v-for="(day, i) in calendarDays"
                :key="i"
                class="easy-date-panel__day"
                :class="{
                  'is-other': !day.isCurrentMonth,
                  'is-today': day.isToday,
                  'is-selected': isSelectedDate(day),
                  'is-range-start': isRangeStart(day),
                  'is-range-end': isRangeEnd(day),
                  'is-in-range': isInRange(day),
                }"
                @click="selectDay(day)"
              >
                {{ day.date }}
              </div>
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

.easy-date-picker {
  display: inline-flex;
  width: 100%;

  &.easy-date-picker--large .easy-date-picker__wrapper {
    height: 44px;
  }
  &.easy-date-picker--large .easy-date-picker__input {
    font-size: 15px;
  }
  &.easy-date-picker--default .easy-date-picker__wrapper {
    height: 36px;
  }
  &.easy-date-picker--default .easy-date-picker__input {
    font-size: 14px;
  }
  &.easy-date-picker--small .easy-date-picker__wrapper {
    height: 30px;
  }
  &.easy-date-picker--small .easy-date-picker__input {
    font-size: 13px;
  }
}

.easy-date-picker__wrapper {
  flex: 1;
  display: inline-flex;
  align-items: center;
  padding: 0 12px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: $radius;
  cursor: pointer;
  transition: $transition;

  &.is-hover:not(.is-disabled) {
    border-color: var(--el-border-color-darker);
  }
  &.is-focus {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 2px $primary-bg;
  }
}

.easy-date-picker__prefix {
  display: inline-flex;
  align-items: center;
  margin-right: 6px;
  color: var(--el-text-color-placeholder);
  flex-shrink: 0;
}

.easy-date-picker__input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  color: var(--el-text-color-regular);
  cursor: pointer;
  font-family: inherit;

  &::placeholder {
    color: var(--el-text-color-placeholder);
  }
}

.easy-date-picker__clear {
  display: inline-flex;
  cursor: pointer;
  color: var(--el-text-color-placeholder);
  border-radius: 50%;
  &:hover {
    color: var(--el-text-color-regular);
  }
}

// ========== 触发器样式（scoped）==========
.easy-date-picker__clear {
  display: inline-flex;
  cursor: pointer;
  color: var(--el-text-color-placeholder);
  border-radius: 50%;
  &:hover {
    color: var(--el-text-color-regular);
  }
}
</style>

<style lang="scss">
@use '../../../easy-ui/src/styles/tokens' as *;

$radius: 8px;

// ========== 选择面板（Teleport 到 body，不能 scoped）==========
.easy-date-picker__panel {
  position: fixed;
  z-index: 2000;
  width: 300px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: $radius;
  box-shadow:
    0 6px 16px rgba(0, 0, 0, 0.08),
    0 3px 6px rgba(0, 0, 0, 0.06);
  padding: 8px;
  user-select: none;
}

.easy-date-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px 8px;
}

.easy-date-panel__nav {
  display: inline-flex;
  cursor: pointer;
  color: var(--el-text-color-regular);
  padding: 4px;
  border-radius: 4px;
  transition: background 0.15s;
  &:hover {
    background: $primary-bg;
  }
}

.easy-date-panel__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-regular);
  padding: 2px 8px;
  border-radius: 4px;

  &.is-title-clickable {
    cursor: pointer;
    &:hover {
      background: $primary-bg;
    }
  }
}

.easy-date-panel__weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  padding: 4px 0;
  border-bottom: 1px solid var(--el-border-color);

  span {
    text-align: center;
    font-size: 12px;
    color: var(--el-text-color-placeholder);
    font-weight: 500;
    padding: 4px 0;
  }
}

.easy-date-panel__days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  padding: 4px 0;
}

.easy-date-panel__day {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  margin: 0 auto;
  font-size: 13px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  color: var(--el-text-color-regular);

  &:hover:not(.is-other):not(.is-selected) {
    background: $primary-bg;
  }
  &.is-other {
    color: var(--el-text-color-disabled);
  }
  &.is-today {
    color: var(--el-color-primary);
    font-weight: 600;
  }
  &.is-selected {
    background: var(--el-color-primary);
    color: #fff;
    font-weight: 500;
  }
  &.is-range-start {
    border-radius: 6px 0 0 6px;
    background: rgba(79, 110, 247, 0.15);
  }
  &.is-range-end {
    border-radius: 0 6px 6px 0;
    background: rgba(79, 110, 247, 0.15);
  }
  &.is-in-range {
    background: $primary-bg;
    border-radius: 0;
  }
}

.easy-date-panel__month-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
  padding: 8px;
}

.easy-date-panel__month-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px 0;
  font-size: 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  color: var(--el-text-color-regular);

  &:hover:not(.is-selected) {
    background: $primary-bg;
  }
  &.is-current {
    color: var(--el-color-primary);
    font-weight: 600;
  }
  &.is-selected {
    background: var(--el-color-primary);
    color: #fff;
  }
}

.easy-date-panel__year-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 8px;
}

.easy-date-panel__year-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px 0;
  font-size: 14px;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s;
  color: var(--el-text-color-regular);

  &:hover:not(.is-selected) {
    background: $primary-bg;
  }
  &.is-current {
    color: var(--el-color-primary);
    font-weight: 600;
  }
  &.is-selected {
    background: var(--el-color-primary);
    color: #fff;
  }
}

.easy-date-picker-fade-enter-active,
.easy-date-picker-fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
  transform-origin: top center;
}
.easy-date-picker-fade-enter-from,
.easy-date-picker-fade-leave-to {
  opacity: 0;
  transform: scaleY(0.95) translateY(-4px);
}

/* ========== Dark Mode ========== */
html.dark .easy-date-panel__day.is-other {
  color: var(--el-text-color-placeholder);
}
html.dark .easy-date-panel__day:hover:not(.is-other):not(.is-selected) {
  background: rgba(79, 110, 247, 0.12);
}
html.dark .easy-date-panel__month-cell:hover:not(.is-selected),
html.dark .easy-date-panel__year-cell:hover:not(.is-selected) {
  background: rgba(79, 110, 247, 0.12);
}
html.dark .easy-date-picker__panel {
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.2),
    0 0 1px rgba(0, 0, 0, 0.3);
}
</style>
