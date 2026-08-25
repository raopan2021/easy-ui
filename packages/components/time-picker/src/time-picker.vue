<script setup lang="ts">
import type { TimePickerEmits, TimePickerProps } from './types'

import { Clock, Close } from '@element-plus/icons-vue'
import { useTimePicker } from './use-time-picker'

// 保持对外类型导出兼容（原定义在 time-picker.vue）
export type { TimePickerEmits, TimePickerProps } from './types'

defineOptions({ name: 'EasyTimePicker' })

const props = withDefaults(defineProps<TimePickerProps>(), {
  modelValue: '',
  placeholder: '请选择时间',
  disabled: false,
  readonly: false,
  clearable: true,
  showSeconds: false,
  size: 'default',
})

const emit = defineEmits<TimePickerEmits>()

// ──── 核心逻辑（时间解析 / 滚动选择 / 分段输入 / 面板 / 外部事件 / 生命周期）────
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
  panelHours,
  panelMinutes,
  panelSeconds,
  displayValue,
  panelStyle,
  openPanel,
  setNow,
  confirm,
  clear,
  selectHour,
  selectMinute,
  selectSecond,
  onScroll,
  onTimeInput,
  onTimeBlur,
  adjustInput,
  focusNextInput,
  handleFocus,
  handleBlur,
  handlePanelMouseDown,
} = useTimePicker(props, emit)
</script>

<template>
  <div class="easy-time-picker" :class="[`easy-time-picker--${size}`, { 'is-disabled': disabled }]">
    <div ref="wrapperRef" class="easy-time-picker__wrapper"
      :class="{ 'is-focus': focusing, 'is-hover': hovering && !disabled }" @mouseenter="hovering = true"
      @mouseleave="hovering = false">
      <!-- 前缀图标 -->
      <span class="easy-time-picker__prefix">
        <slot name="prefix">
          <el-icon><Clock /></el-icon>
        </slot>
      </span>

      <!-- 时间输入（只读，点击打开弹窗） -->
      <input ref="inputRef" class="easy-time-picker__input" :value="displayValue" :placeholder="placeholder"
        :disabled="disabled" :readonly="true" @focus="handleFocus" @blur="handleBlur" @click="openPanel">

      <!-- 清除 -->
      <span v-if="clearable && modelValue && !disabled" class="easy-time-picker__clear" @click.stop="clear">
        <el-icon><Close /></el-icon>
      </span>
    </div>

    <!-- 时间面板 -->
    <Teleport to="body">
      <Transition name="easy-time-picker-fade">
        <div v-if="panelVisible" ref="panelRef" class="easy-time-picker__panel" :style="panelStyle"
          @mousedown="handlePanelMouseDown">
          <!-- 手动输入区 -->
          <div class="easy-time-panel__input-area">
            <input ref="hoursInputRef" class="easy-time-panel__time-input" maxlength="2"
              :value="String(panelHours).padStart(2, '0')" @input="onTimeInput($event, 'hours')"
              @blur="onTimeBlur($event, 'hours')" @keydown.down.prevent="adjustInput('hours', 1)"
              @keydown.up.prevent="adjustInput('hours', -1)" @keydown.enter.prevent="focusNextInput('minutes')">
            <span class="easy-time-panel__input-sep">:</span>
            <input ref="minutesInputRef" class="easy-time-panel__time-input" maxlength="2"
              @input="onTimeInput($event, 'minutes')" @blur="onTimeBlur($event, 'minutes')"
              @keydown.down.prevent="adjustInput('minutes', 1)" @keydown.up.prevent="adjustInput('minutes', -1)"
              @keydown.enter.prevent="showSeconds ? focusNextInput('seconds') : confirm()">
            <template v-if="showSeconds">
              <span class="easy-time-panel__input-sep">:</span>
              <input ref="secondsInputRef" class="easy-time-panel__time-input" maxlength="2"
                @input="onTimeInput($event, 'seconds')" @blur="onTimeBlur($event, 'seconds')"
                @keydown.down.prevent="adjustInput('seconds', 1)" @keydown.up.prevent="adjustInput('seconds', -1)"
                @keydown.enter.prevent="confirm">
            </template>
          </div>

          <!-- 滚动列表区 -->
          <div class="easy-time-panel__body">
            <!-- 时 -->
            <div class="easy-time-panel__column">
              <div class="easy-time-panel__list-wrap">
                <div ref="hoursListRef" class="easy-time-panel__list" @scroll.passive="onScroll($event, 'hours')">
                  <div v-for="h in 24" :key="h - 1" class="easy-time-panel__item"
                    :class="{ 'is-selected': h - 1 === panelHours }" @click="selectHour(h - 1)">
                    {{ String(h - 1).padStart(2, '0') }}
                  </div>
                </div>
              </div>
            </div>

            <span class="easy-time-panel__sep">:</span>

            <!-- 分 -->
            <div class="easy-time-panel__column">
              <div class="easy-time-panel__list-wrap">
                <div ref="minutesListRef" class="easy-time-panel__list" @scroll.passive="onScroll($event, 'minutes')">
                  <div v-for="m in 60" :key="m - 1" class="easy-time-panel__item"
                    :class="{ 'is-selected': m - 1 === panelMinutes }" @click="selectMinute(m - 1)">
                    {{ String(m - 1).padStart(2, '0') }}
                  </div>
                </div>
              </div>
            </div>

            <!-- 秒（可选） -->
            <template v-if="showSeconds">
              <span class="easy-time-panel__sep">:</span>
              <div class="easy-time-panel__column">
                <div class="easy-time-panel__list-wrap">
                  <div ref="secondsListRef" class="easy-time-panel__list" @scroll.passive="onScroll($event, 'seconds')">
                    <div v-for="s in 60" :key="s - 1" class="easy-time-panel__item"
                      :class="{ 'is-selected': s - 1 === panelSeconds }" @click="selectSecond(s - 1)">
                      {{ String(s - 1).padStart(2, '0') }}
                    </div>
                  </div>
                </div>
              </div>
            </template>
          </div>

          <!-- 底部按钮 -->
          <div class="easy-time-panel__footer">
            <button class="easy-time-panel__btn easy-time-panel__btn--now" @click="setNow">
              此刻
            </button>
            <button class="easy-time-panel__btn easy-time-panel__btn--primary" @click="confirm">
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

.easy-time-picker {
  display: inline-flex;
  width: 100%;

  &.easy-time-picker--large .easy-time-picker__wrapper {
    height: 44px;
  }
  &.easy-time-picker--large .easy-time-picker__input {
    font-size: 15px;
  }
  &.easy-time-picker--default .easy-time-picker__wrapper {
    height: 36px;
  }
  &.easy-time-picker--default .easy-time-picker__input {
    font-size: 14px;
  }
  &.easy-time-picker--small .easy-time-picker__wrapper {
    height: 30px;
  }
  &.easy-time-picker--small .easy-time-picker__input {
    font-size: 13px;
  }
}

.easy-time-picker__wrapper {
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
    border-color: $brand-blue;
    box-shadow: 0 0 0 2px $primary-bg;
  }
}

.easy-time-picker__prefix {
  display: inline-flex;
  align-items: center;
  margin-right: 6px;
  color: var(--el-text-color-placeholder);
  flex-shrink: 0;
}

.easy-time-picker__input {
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

.easy-time-picker__clear {
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

// ========== 时间面板（Teleport 到 body，不能 scoped）==========
.easy-time-picker__panel {
  position: fixed;
  z-index: 2000;
  width: auto;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: $radius;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.08),
    0 0 1px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  user-select: none;
}

// 手动输入区
.easy-time-panel__input-area {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 16px 12px;
  border-bottom: 1px solid #f0f1f5;
  gap: 2px;
}

.easy-time-panel__time-input {
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

.easy-time-panel__input-sep {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-placeholder);
  margin: 0 2px;
}

// 滚动列表区
.easy-time-panel__body {
  display: flex;
  align-items: stretch;
  position: relative;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 8px;
    right: 8px;
    height: 32px;
    transform: translateY(-50%);
    background: rgba(79, 110, 247, 0.06);
    border-radius: 6px;
    pointer-events: none;
    z-index: 1;
  }
}

.easy-time-panel__column {
  width: 48px;
  position: relative;
}

.easy-time-panel__sep {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-placeholder);
  width: 16px;
  flex-shrink: 0;
}

.easy-time-panel__list-wrap {
  height: 224px;
  overflow: hidden;
}

.easy-time-panel__list {
  height: 100%;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
}

.easy-time-panel__item {
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
  padding-left: 25px;

  &.is-selected {
    color: var(--el-color-primary);
    font-weight: 600;
    font-size: 14px;
  }
}

// 底部
.easy-time-panel__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 8px;
}

.easy-time-panel__btn {
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

  &.easy-time-panel__btn--now {
    color: var(--el-text-color-placeholder);
    &:hover {
      color: var(--el-color-primary);
    }
  }

  &.easy-time-panel__btn--primary {
    background: transparent;
    color: var(--el-color-primary);
    font-weight: 500;
    &:hover {
      background: var(--el-color-primary);
      color: var(--el-color-white);
    }
  }
}

// 过渡
.easy-time-picker-fade-enter-active,
.easy-time-picker-fade-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}
.easy-time-picker-fade-enter-from,
.easy-time-picker-fade-leave-to {
  opacity: 0;
  transform: scaleY(0.95) translateY(-4px);
}
</style>

<style lang="scss">
/* ========== Dark Mode ========== */
html.dark .easy-time-panel__input-area {
  border-bottom-color: var(--el-border-color);
}
html.dark .easy-time-panel__body::before {
  background: rgba(79, 110, 247, 0.12);
}
html.dark .easy-time-picker__panel {
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.2),
    0 0 1px rgba(0, 0, 0, 0.3);
}
</style>
