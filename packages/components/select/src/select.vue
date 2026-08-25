<script setup lang="ts">
import type { SelectEmits } from './select'

import EasyIcon from '../../icon'
import { selectProps } from './select'
import { useSelectCore } from './use-select-core'

defineOptions({ name: 'EasySelect' })

const props = defineProps(selectProps)
const emit = defineEmits<SelectEmits>()

const slots = defineSlots()

// ──── 核心逻辑（选项规范化 / 选中态 / 过滤 / 下拉 / 创建 / 标签计算）────
const {
  valueKey,
  labelKey,
  triggerRef,
  dropdownRef,
  searchRef,
  tagsContainerRef,
  visible,
  hovering,
  hoverIndex,
  searchQuery,
  remoteOptions,
  effectiveFilterable,
  hasValue,
  selectedLabels,
  hiddenCount,
  displayLabel,
  visibleLabels,
  filteredOptions,
  isQueryExisting,
  dropdownStyle,
  isSelected,
  isDisabled,
  setTagRef,
  toggleDropdown,
  selectOption,
  handleCreateOption,
  removeTag,
  clear,
} = useSelectCore(props, emit)

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
    <div ref="triggerRef" class="easy-select__wrapper" :class="{ 'is-hover': hovering && !disabled }"
      @click="toggleDropdown" @mouseenter="hovering = true" @mouseleave="hovering = false">
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
            <input ref="searchRef" v-model="searchQuery" class="easy-select__search-input" placeholder="搜索..."
              @keydown.stop>
            <button v-if="allowCreate" class="easy-select__search-btn"
              :disabled="!searchQuery.trim() || isQueryExisting" @click="handleCreateOption">
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
</style>

<!-- ========== 下拉面板样式（Teleport 到 body，必须全局，不能 scoped）========== -->
<style lang="scss">
@use '../../../easy-ui/src/styles/tokens' as *;

.easy-select__dropdown {
  position: fixed;
  z-index: 3000;
  box-sizing: border-box;
  padding: 6px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  box-shadow: 0 6px 24px rgba(0, 0, 0, 0.14);

  .easy-select__search {
    display: flex;
    gap: 8px;
    padding: 2px 2px 8px;

    .easy-select__search-input {
      flex: 1;
      min-width: 0;
      height: 28px;
      padding: 0 10px;
      box-sizing: border-box;
      border: 1px solid var(--el-border-color);
      border-radius: 6px;
      background: var(--el-fill-color-blank);
      color: var(--el-text-color-regular);
      font-size: 13px;
      outline: none;
      transition: border-color 0.2s;

      &:focus {
        border-color: var(--el-color-primary);
      }
    }

    .easy-select__search-btn {
      flex-shrink: 0;
      height: 28px;
      padding: 0 10px;
      border: none;
      border-radius: 6px;
      background: var(--el-color-primary);
      color: #fff;
      font-size: 12px;
      cursor: pointer;

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }

  .easy-select__list {
    max-height: 220px;
    overflow-y: auto;
    overflow-x: hidden;
  }

  .easy-select__option {
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 10px;
    border-radius: 6px;
    font-size: 13px;
    color: var(--el-text-color-regular);
    cursor: pointer;
    user-select: none;
    transition:
      background-color 0.15s,
      color 0.15s;

    &:hover {
      background: var(--el-fill-color-light);
    }

    &.is-selected {
      color: var(--el-color-primary);
      font-weight: 500;
    }

    &.is-disabled {
      color: var(--el-text-color-placeholder);
      cursor: not-allowed;
    }

    .easy-select__option-check {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      color: var(--el-color-primary);
    }

    .easy-select__option-label {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .easy-select__empty {
    padding: 12px;
    text-align: center;
    font-size: 13px;
    color: var(--el-text-color-placeholder);
  }
}

// 过渡动画
.easy-select-zoom-enter-active,
.easy-select-zoom-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
}

.easy-select-zoom-enter-from,
.easy-select-zoom-leave-to {
  opacity: 0;
  transform: scale(0.95) translateY(-4px);
}
</style>
