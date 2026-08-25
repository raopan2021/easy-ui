<script setup lang="ts">
import type { DateTimePickerEmits, DateTimePickerProps } from './types'

import { ArrowLeft, ArrowRight, Calendar, Close } from '@element-plus/icons-vue'
import { useDateTimePicker } from './use-date-time-picker'

// 保持对外类型导出兼容（原定义在 date-time-picker.vue）
export type { DateTimePickerEmits, DateTimePickerProps } from './types'

defineOptions({ name: 'EasyDateTimePicker' })

const props = withDefaults(defineProps<DateTimePickerProps>(), {
  modelValue: '',
  placeholder: '请选择日期时间',
  disabled: false,
  readonly: false,
  clearable: true,
  showSeconds: false,
  size: 'default',
  format: '',
})

const emit = defineEmits<DateTimePickerEmits>()

// ──── 核心逻辑（日历 / 时间滚动 / 分段输入 / 面板操作 / 外部事件 / 生命周期）────
const {
  inputRef,
  wrapperRef,
  panelRef,
  hoursListRef,
  minutesListRef,
  secondsListRef,
  hoursInputRef,
  minutesInputRef,
  secondsInputRef,
  focusing,
  hovering,
  panelVisible,
  yearMode,
  panelYear,
  currentYear,
  weekdays,
  yearRange,
  panelTitle,
  calendarDays,
  panelHours,
  panelMinutes,
  panelSeconds,
  panelDateStr,
  displayValue,
  panelStyle,
  prevMonth,
  nextMonth,
  toggleYearMode,
  selectYear,
  selectDay,
  onTimeInput,
  onTimeBlur,
  adjustInput,
  focusNextInput,
  onScroll,
  selectTimeUnit,
  openPicker,
  setNow,
  confirm,
  clear,
  handleFocus,
  handleBlur,
  handlePanelMouseDown,
} = useDateTimePicker(props, emit)
</script>

<template>
  <div class="easy-date-time-picker" :class="[`easy-date-time-picker--${size}`, { 'is-disabled': disabled }]">
    <div ref="wrapperRef" class="easy-date-time-picker__wrapper"
      :class="{ 'is-focus': focusing, 'is-hover': hovering && !disabled }" @mouseenter="hovering = true"
      @mouseleave="hovering = false">
      <!-- 前缀图标 -->
      <span class="easy-date-time-picker__prefix">
        <slot name="prefix">
          <el-icon><Calendar /></el-icon>
        </slot>
      </span>

      <!-- 输入 -->
      <input ref="inputRef" class="easy-date-time-picker__input" :value="displayValue" :placeholder="placeholder"
        :disabled="disabled" :readonly="true" @focus="handleFocus" @blur="handleBlur" @click="openPicker">

      <!-- 清除 -->
      <span v-if="clearable && modelValue && !disabled" class="easy-date-time-picker__clear" @click.stop="clear">
        <el-icon><Close /></el-icon>
      </span>
    </div>

    <!-- 选择面板 -->
    <Teleport to="body">
      <Transition name="easy-dtp-fade">
        <div v-if="panelVisible" ref="panelRef" class="easy-date-time-picker__panel" :style="panelStyle"
          @mousedown="handlePanelMouseDown">
          <!-- 左侧：日期选择 -->
          <div class="easy-dtp__date-section">
            <!-- 头部：年月切换 -->
            <div class="easy-dtp-date__header">
              <el-icon class="easy-dtp-date__nav" @click="prevMonth">
                <ArrowLeft />
              </el-icon>
              <span class="easy-dtp-date__title" @click="toggleYearMode">{{ panelTitle }}</span>
              <el-icon class="easy-dtp-date__nav" @click="nextMonth">
                <ArrowRight />
              </el-icon>
            </div>

            <!-- 年份选择 -->
            <div v-if="yearMode" class="easy-dtp-date__body">
              <div class="easy-dtp-date__year-grid">
                <div
                  v-for="year in yearRange"
                  :key="year"
                  class="easy-dtp-date__year-cell"
                  :class="{
                    'is-current': year === currentYear,
                    'is-selected': year === panelYear,
                  }"
                  @click="selectYear(year)"
                >
                  {{ year }}
                </div>
              </div>
            </div>

            <!-- 日历 -->
            <div v-else class="easy-dtp-date__body">
              <div class="easy-dtp-date__weekdays">
                <span v-for="w in weekdays" :key="w">{{ w }}</span>
              </div>
              <div class="easy-dtp-date__days">
                <div
                  v-for="(day, i) in calendarDays"
                  :key="i"
                  class="easy-dtp-date__day"
                  :class="{
                    'is-other': !day.isCurrentMonth,
                    'is-today': day.isToday,
                    'is-selected': day.fullDate === panelDateStr,
                  }"
                  @click="selectDay(day)"
                >
                  {{ day.date }}
                </div>
              </div>
            </div>
          </div>

          <!-- 右侧：时间选择 -->
          <div class="easy-dtp__time-section">
            <!-- 手动输入区 -->
            <div class="easy-dtp-time__input-area">
              <input ref="hoursInputRef" class="easy-dtp-time__time-input" maxlength="2"
                @input="onTimeInput($event, 'hours')" @blur="onTimeBlur($event, 'hours')"
                @keydown.down.prevent="adjustInput('hours', 1)" @keydown.up.prevent="adjustInput('hours', -1)"
                @keydown.enter.prevent="focusNextInput('minutes')">
              <span class="easy-dtp-time__input-sep">:</span>
              <input ref="minutesInputRef" class="easy-dtp-time__time-input" maxlength="2"
                @input="onTimeInput($event, 'minutes')" @blur="onTimeBlur($event, 'minutes')"
                @keydown.down.prevent="adjustInput('minutes', 1)" @keydown.up.prevent="adjustInput('minutes', -1)"
                @keydown.enter.prevent="showSeconds ? focusNextInput('seconds') : confirm()">
              <template v-if="showSeconds">
                <span class="easy-dtp-time__input-sep">:</span>
                <input ref="secondsInputRef" class="easy-dtp-time__time-input" maxlength="2"
                  @input="onTimeInput($event, 'seconds')" @blur="onTimeBlur($event, 'seconds')"
                  @keydown.down.prevent="adjustInput('seconds', 1)" @keydown.up.prevent="adjustInput('seconds', -1)"
                  @keydown.enter.prevent="confirm()">
              </template>
            </div>

            <!-- 滚动列表面板 -->
            <div class="easy-dtp-time__body">
              <!-- 时 -->
              <div class="easy-dtp-time__column">
                <div class="easy-dtp-time__list-wrap">
                  <div ref="hoursListRef" class="easy-dtp-time__list" @scroll.passive="onScroll($event, 'hours')">
                    <div v-for="h in 24" :key="h - 1" class="easy-dtp-time__item"
                      :class="{ 'is-selected': h - 1 === panelHours }" @click="selectTimeUnit('hours', h - 1)">
                      {{ String(h - 1).padStart(2, '0') }}
                    </div>
                  </div>
                </div>
              </div>

              <span class="easy-dtp-time__sep">:</span>

              <!-- 分 -->
              <div class="easy-dtp-time__column">
                <div class="easy-dtp-time__list-wrap">
                  <div ref="minutesListRef" class="easy-dtp-time__list" @scroll.passive="onScroll($event, 'minutes')">
                    <div v-for="m in 60" :key="m - 1" class="easy-dtp-time__item"
                      :class="{ 'is-selected': m - 1 === panelMinutes }" @click="selectTimeUnit('minutes', m - 1)">
                      {{ String(m - 1).padStart(2, '0') }}
                    </div>
                  </div>
                </div>
              </div>

              <!-- 秒 -->
              <template v-if="showSeconds">
                <span class="easy-dtp-time__sep">:</span>
                <div class="easy-dtp-time__column">
                  <div class="easy-dtp-time__list-wrap">
                    <div ref="secondsListRef" class="easy-dtp-time__list" @scroll.passive="onScroll($event, 'seconds')">
                      <div v-for="s in 60" :key="s - 1" class="easy-dtp-time__item"
                        :class="{ 'is-selected': s - 1 === panelSeconds }" @click="selectTimeUnit('seconds', s - 1)">
                        {{ String(s - 1).padStart(2, '0') }}
                      </div>
                    </div>
                  </div>
                </div>
              </template>
            </div>
          </div>

          <!-- 底部按钮 -->
          <div class="easy-dtp__footer">
            <button class="easy-dtp__btn easy-dtp__btn--now" @click="setNow">
              此刻
            </button>
            <button class="easy-dtp__btn easy-dtp__btn--primary" @click="confirm">
              确定
            </button>
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

.easy-date-time-picker {
  display: inline-flex;
  width: 100%;

  &.easy-date-time-picker--large .easy-date-time-picker__wrapper {
    height: 44px;
  }
  &.easy-date-time-picker--large .easy-date-time-picker__input {
    font-size: 15px;
  }
  &.easy-date-time-picker--default .easy-date-time-picker__wrapper {
    height: 36px;
  }
  &.easy-date-time-picker--default .easy-date-time-picker__input {
    font-size: 14px;
  }
  &.easy-date-time-picker--small .easy-date-time-picker__wrapper {
    height: 30px;
  }
  &.easy-date-time-picker--small .easy-date-time-picker__input {
    font-size: 13px;
  }
}

.easy-date-time-picker__wrapper {
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

.easy-date-time-picker__prefix {
  display: inline-flex;
  align-items: center;
  margin-right: 6px;
  color: var(--el-text-color-placeholder);
  flex-shrink: 0;
}

.easy-date-time-picker__input {
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

.easy-date-time-picker__clear {
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

.easy-date-time-picker__panel {
  position: fixed;
  z-index: 2000;
  display: flex;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: $radius;
  box-shadow:
    0 6px 16px rgba(0, 0, 0, 0.08),
    0 3px 6px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  user-select: none;
}

// 日期区
.easy-dtp__date-section {
  border-right: 1px solid var(--el-border-color);
  padding: 8px;
}

.easy-dtp-date__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px 8px;
}

.easy-dtp-date__nav {
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

.easy-dtp-date__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-regular);
  padding: 2px 8px;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background: $primary-bg;
  }
}

.easy-dtp-date__weekdays {
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

.easy-dtp-date__days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
  padding: 4px 0;
}

.easy-dtp-date__day {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
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
}

.easy-dtp-date__year-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  padding: 8px;
}

.easy-dtp-date__year-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 10px 0;
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

// 时间区
.easy-dtp__time-section {
  padding: 8px;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

// 手动输入区
.easy-dtp-time__input-area {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0 8px;
  border-bottom: 1px solid #f0f1f5;
  gap: 2px;
  margin-bottom: 8px;
}

.easy-dtp-time__time-input {
  width: 44px;
  height: 32px;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
  color: var(--el-text-color-regular);
  background: var(--el-fill-color-light);
  border: 1px solid transparent;
  border-radius: 6px;
  outline: none;
  cursor: text;
  transition: all 0.15s;

  &:focus {
    background: var(--el-bg-color);
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 2px rgba(79, 110, 247, 0.12);
  }
}

.easy-dtp-time__input-sep {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-placeholder);
  margin: 0 2px;
}

// 滚动列表区
.easy-dtp-time__body {
  display: flex;
  align-items: stretch;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 4px;
    right: 4px;
    height: 32px;
    transform: translateY(-50%);
    background: rgba(79, 110, 247, 0.06);
    border-radius: 6px;
    pointer-events: none;
    z-index: 1;
  }
}

.easy-dtp-time__column {
  width: 48px;
  position: relative;
}

.easy-dtp-time__sep {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-placeholder);
  width: 12px;
  flex-shrink: 0;
}

.easy-dtp-time__list-wrap {
  height: 224px;
  overflow: hidden;
}

.easy-dtp-time__list {
  height: 100%;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

.easy-dtp-time__item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 32px;
  font-size: 13px;
  color: var(--el-text-color-regular);
  cursor: pointer;
  transition:
    color 0.15s,
    font-size 0.15s,
    font-weight 0.15s;
  scroll-snap-align: start;
  position: relative;
  z-index: 2;
  padding-left: 10px;

  &.is-selected {
    color: var(--el-color-primary);
    font-weight: 600;
    font-size: 14px;
  }
}

// 底部
.easy-dtp__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
  border-top: 1px solid var(--el-border-color);
}

.easy-dtp__btn {
  padding: 4px 12px;
  border: none;
  background: transparent;
  color: var(--el-text-color-regular);
  font-size: 13px;
  font-weight: 500;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
  line-height: 1.5;

  &.easy-dtp__btn--now {
    color: var(--el-text-color-placeholder);
    &:hover {
      color: var(--el-color-primary);
    }
  }

  &.easy-dtp__btn--primary {
    background: transparent;
    color: var(--el-color-primary);
    font-weight: 500;
    &:hover {
      background: var(--el-color-primary);
      color: #fff;
    }
  }
}

// 过渡
.easy-dtp-fade-enter-active,
.easy-dtp-fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
  transform-origin: top center;
}
.easy-dtp-fade-enter-from,
.easy-dtp-fade-leave-to {
  opacity: 0;
  transform: scaleY(0.95) translateY(-4px);
}
</style>
