<script setup lang="ts">
import type { CascaderEmits, CascaderProps } from './types'

import EasyIcon from '../../icon'
import { useCascaderCore } from './use-cascader-core'

// 保持对外类型导出兼容（原定义在 cascader.vue）
export type { CascaderEmits, CascaderNode, CascaderProps } from './types'

defineOptions({ name: 'EasyCascader' })

const props = withDefaults(defineProps<CascaderProps>(), {
  modelValue: () => [],
  options: () => [],
  placeholder: '请选择',
  disabled: false,
  clearable: false,
  filterable: false,
  multiple: false,
  maxTagCount: 3,
  size: 'default',
  maxLevel: undefined,
  lazyLoad: undefined,
  expandTrigger: 'click',
  accordion: false,
  checkStrictly: false,
  valueKey: 'value',
  labelKey: 'label',
  childrenKey: 'children',
  remote: false,
  remoteMethod: undefined,
  loading: false,
  debounce: 300,
  valueType: 'array',
  separator: ',',
  menuNodeClass: undefined,
  menuNodeStyle: undefined,
})

const emit = defineEmits<CascaderEmits>()

// ──── 核心逻辑（状态 / 菜单交互 / 搜索 / 面板定位 / 生命周期）────
const {
  triggerRef,
  panelRef,
  searchRef,
  tagsContainerRef,
  panelVisible,
  hovering,
  searchQuery,
  activeMenus,
  searchResults,
  hiddenCount,
  selectedLabels,
  displayLabel,
  visibleLabels,
  panelStyle,
  hasValue,
  getNodeKey,
  getMenuNodeClass,
  getMenuNodeStyle,
  setTagRef,
  isLeaf,
  isNodeInActivePath,
  isNodeChecked,
  isSearchResultSelected,
  togglePanel,
  handleSearch,
  selectSearchResult,
  handleNodeHover,
  handleCheckboxClick,
  handleNodeClick,
  handleNodeClickAndSelect,
  clear,
  removeSelected,
  blur,
  remoteOptions,
} = useCascaderCore(props, emit)

// ──── 暴露方法（通过 ref 调用）────
defineExpose({ blur, remoteOptions })
</script>

<template>
  <div class="easy-cascader" :class="[`easy-cascader--${size}`, { 'is-disabled': disabled, 'is-focus': panelVisible }]">
    <!-- 触发器 -->
    <div ref="triggerRef" class="easy-cascader__wrapper"
      :class="{ 'is-hover': hovering && !disabled, 'has-tags': multiple && selectedLabels.length > 0 }"
      @click="togglePanel" @mouseenter="hovering = true" @mouseleave="hovering = false">
      <!-- 多选标签 -->
      <div v-if="multiple && selectedLabels.length" ref="tagsContainerRef" class="easy-cascader__tags">
        <span v-for="(tag, i) in visibleLabels" :key="i" :ref="(el) => setTagRef(el, i)" class="easy-cascader__tag">
          {{ tag }}
          <span class="easy-cascader__tag-close" @click.stop="removeSelected(i)">
            <EasyIcon name="el:Close" :size="12" />
          </span>
        </span>
        <span v-if="hiddenCount > 0" class="easy-cascader__tag easy-cascader__tag--count">+{{ hiddenCount }}</span>
      </div>

      <!-- 单选显示 -->
      <span v-else class="easy-cascader__value" :class="{ 'is-placeholder': !selectedLabels.length }">
        {{ selectedLabels.length ? displayLabel : placeholder }}
      </span>

      <!-- 后缀 -->
      <span class="easy-cascader__suffix">
        <span v-if="clearable && hasValue && !disabled" class="easy-cascader__clear" @click.stop="clear">
          <EasyIcon name="el:Close" />
        </span>
        <EasyIcon name="el:ArrowDown" class="easy-cascader__arrow" :class="{ 'is-reverse': panelVisible }" />
      </span>
    </div>

    <!-- 下拉面板 -->
    <Teleport to="body">
      <Transition name="easy-cascader-zoom">
        <div v-if="panelVisible" ref="panelRef" class="easy-cascader__panel" :style="panelStyle" @mousedown.prevent>
          <!-- 搜索框 -->
          <div v-if="filterable" class="easy-cascader__search">
            <input ref="searchRef" v-model="searchQuery" class="easy-cascader__search-input" placeholder="搜索..."
              @input="handleSearch">
          </div>

          <!-- 搜索结果模式 -->
          <div v-if="filterable && searchQuery" class="easy-cascader__search-results">
            <div v-for="(result, idx) in searchResults" :key="idx" class="easy-cascader__search-item"
              :class="{ 'is-selected': isSearchResultSelected(result.path) }" @click="selectSearchResult(result)">
              <span v-if="multiple" class="easy-cascader__search-check">
                <EasyIcon v-if="isSearchResultSelected(result.path)" name="el:Check" />
              </span>
              <span class="easy-cascader__search-path">
                <span v-for="(label, li) in result.pathLabels" :key="li">
                  {{ label }}<span v-if="li < result.pathLabels.length - 1" class="easy-cascader__search-sep"> / </span>
                </span>
              </span>
            </div>
            <div v-if="searchResults.length === 0" class="easy-cascader__empty">
              {{ props.loading ? '加载中...' : '暂无数据' }}
            </div>
          </div>

          <!-- 级联菜单模式 -->
          <div v-else class="easy-cascader__menu">
            <div v-for="(menu, level) in activeMenus" :key="level" class="easy-cascader__menu-list">
              <div
                v-for="node in menu"
                :key="getNodeKey(node)"
                class="easy-cascader__menu-item"
                :class="[
                  {
                    'is-active': isNodeInActivePath(node, level),
                    'is-disabled': node.disabled,
                    'is-loading': node._loading,
                  },
                  getMenuNodeClass(node, level),
                ]"
                :style="getMenuNodeStyle(node, level)"
                @mouseenter="handleNodeHover(node, level)"
              >
                <!-- 多选模式：勾选框用于选择 -->
                <span v-if="multiple" class="easy-cascader__menu-checkbox"
                  @click.stop="handleCheckboxClick(node, level)">
                  <EasyIcon v-if="isNodeChecked(node)" name="el:Check" />
                </span>
                <!-- 文本区域：多选模式下点击展开下一级，单选模式下点击直接选择 -->
                <span class="easy-cascader__menu-label"
                  @click="multiple ? handleNodeClick(node, level) : handleNodeClickAndSelect(node, level)">
                  {{ node[labelKey] }}
                </span>
                <EasyIcon v-if="!isLeaf(node)" name="el:ArrowRight" class="easy-cascader__menu-arrow" />
                <span v-if="node._loading" class="easy-cascader__menu-loading">...</span>
              </div>
              <div v-if="menu.length === 0" class="easy-cascader__empty">
                暂无数据
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

.easy-cascader {
  display: inline-flex;
  width: 100%;

  &.easy-cascader--large .easy-cascader__wrapper {
    min-height: 44px;
  }
  &.easy-cascader--large .easy-cascader__wrapper.has-tags {
    min-height: 44px;
  }
  &.easy-cascader--large .easy-cascader__value {
    font-size: 15px;
  }
  &.easy-cascader--default .easy-cascader__wrapper {
    min-height: 36px;
  }
  &.easy-cascader--default .easy-cascader__wrapper.has-tags {
    min-height: 36px;
  }
  &.easy-cascader--default .easy-cascader__value {
    font-size: 14px;
  }
  &.easy-cascader--small .easy-cascader__wrapper {
    min-height: 30px;
  }
  &.easy-cascader--small .easy-cascader__wrapper.has-tags {
    min-height: 30px;
  }
  &.easy-cascader--small .easy-cascader__value {
    font-size: 13px;
  }

  .easy-cascader__wrapper {
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

  &.is-focus .easy-cascader__wrapper {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 2px $primary-bg;
  }

  .easy-cascader__value {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--el-text-color-regular);

    &.is-placeholder {
      color: var(--el-text-color-placeholder);
    }
  }

  .easy-cascader__tags {
    flex: 1;
    display: flex;
    flex-wrap: nowrap;
    gap: 4px;
    overflow: hidden;
    align-items: center;
    min-width: 0;
  }

  .easy-cascader__tag {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 1px 6px;
    background: $primary-bg;
    color: var(--el-color-primary);
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    flex-shrink: 0;

    &.easy-cascader--count {
      background: rgba(79, 110, 247, 0.12);
    }
  }

  .easy-cascader__tag-close {
    display: inline-flex;
    cursor: pointer;
    border-radius: 50%;
    transition: background 0.15s;
    &:hover {
      background: rgba(79, 110, 247, 0.15);
    }
  }

  .easy-cascader__suffix {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    margin-left: 6px;
    color: var(--el-text-color-placeholder);
    flex-shrink: 0;
  }

  .easy-cascader__clear {
    display: inline-flex;
    cursor: pointer;
    border-radius: 50%;
    transition: color 0.15s;
    &:hover {
      color: var(--el-text-color-regular);
    }
  }

  .easy-cascader__arrow {
    transition: transform 0.2s ease;
    &.is-reverse {
      transform: rotate(180deg);
    }
  }
}
</style>

<style lang="scss">
@use '../../../easy-ui/src/styles/tokens' as *;

$radius: 8px;

.easy-cascader__panel {
  position: fixed;
  z-index: 2000;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color);
  border-radius: $radius;
  box-shadow:
    0 6px 16px rgba(0, 0, 0, 0.08),
    0 3px 6px rgba(0, 0, 0, 0.06);
  overflow: hidden;
}

.easy-cascader__search {
  padding: 8px;
  border-bottom: 1px solid var(--el-border-color);
}

.easy-cascader__search-input {
  width: 100%;
  height: 30px;
  padding: 0 10px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  outline: none;
  font-size: 13px;
  color: var(--el-text-color-regular);
  transition: border-color 0.2s;
  box-sizing: border-box;

  &:focus {
    border-color: var(--el-color-primary);
  }
  &::placeholder {
    color: var(--el-text-color-placeholder);
  }
}

.easy-cascader__search-results {
  max-height: 274px;
  overflow-y: auto;
}

.easy-cascader__search-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 13px;
  color: var(--el-text-color-regular);
  border-radius: 6px;
  cursor: pointer;
  transition: background 0.15s;

  &:hover {
    background: $primary-bg;
  }
  &.is-selected {
    color: var(--el-color-primary);
    font-weight: 500;
  }
}

.easy-cascader__search-check {
  width: 16px;
  display: inline-flex;
  justify-content: center;
  flex-shrink: 0;
}

.easy-cascader__search-path {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.easy-cascader__search-sep {
  color: var(--el-text-color-placeholder);
}

.easy-cascader__menu {
  display: flex;
  max-height: 300px;
}

.easy-cascader__menu-list {
  min-width: 160px;
  max-height: 300px;
  overflow-y: auto;
  border-right: 1px solid var(--el-border-color);
  padding: 4px 0;

  &:last-child {
    border-right: none;
  }
}

.easy-cascader__menu-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 14px;
  color: var(--el-text-color-regular);
  border-radius: 0;
  cursor: pointer;
  transition: background 0.15s;

  &:hover:not(.is-disabled) {
    background: $primary-bg;
  }
  &.is-active {
    color: var(--el-color-primary);
    font-weight: 500;
  }
  &.is-disabled {
    color: var(--el-text-color-placeholder);
    cursor: not-allowed;
  }
}

.easy-cascader__menu-checkbox {
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  cursor: pointer;
  border: 1px solid var(--el-border-color);
  border-radius: 3px;
  transition: all 0.15s;
  color: var(--el-color-white);

  &:hover {
    border-color: var(--el-color-primary);
  }

  &:has(.easy-icon) {
    background: var(--el-color-primary);
    border-color: var(--el-color-primary);
  }
}

.easy-cascader__menu-label {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.easy-cascader__menu-arrow {
  color: var(--el-text-color-placeholder);
  flex-shrink: 0;
}

.easy-cascader__menu-loading {
  color: var(--el-color-primary);
  font-size: 12px;
}

.easy-cascader__empty {
  padding: 16px;
  text-align: center;
  color: var(--el-text-color-placeholder);
  font-size: 13px;
}

.easy-cascader-zoom-enter-active,
.easy-cascader-zoom-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
  transform-origin: top center;
}
.easy-cascader-zoom-enter-from,
.easy-cascader-zoom-leave-to {
  opacity: 0;
  transform: scaleY(0.9) translateY(-4px);
}
</style>

<style lang="scss">
/* ========== Dark Mode ========== */
html.dark .easy-cascader__placeholder {
  color: var(--el-text-color-placeholder);
}
html.dark .easy-cascader__label {
  color: var(--el-text-color-primary);
}
html.dark .easy-cascader__clear {
  color: var(--el-text-color-secondary);
}
html.dark .easy-cascader__arrow.is-reverse {
  color: var(--el-text-color-placeholder);
}
html.dark .easy-cascader__menu {
  background: var(--el-bg-color-overlay);
  border-color: var(--el-border-color);
  box-shadow: 0 6px 16px 0 rgba(0, 0, 0, 0.2);
}
html.dark .easy-cascader__node__label {
  color: var(--el-text-color-regular);
}
html.dark .easy-cascader__node:hover:not(.is-disabled) {
  background: var(--el-fill-color-light);
}
html.dark .easy-cascader__node.is-active:not(.is-disabled) {
  background: var(--el-fill-color-light);
  color: var(--el-color-primary);
}
html.dark .easy-cascader__node.is-disabled .easy-cascader__node__label {
  color: var(--el-text-color-disabled);
}
html.dark .easy-cascader__menu-search {
  background: var(--el-bg-color);
  border-bottom-color: var(--el-border-color);
}
html.dark .easy-cascader__menu-search .search-input {
  background: var(--el-fill-color-lighter);
  color: var(--el-text-color-primary);
}
html.dark .easy-cascader__menu-tag {
  background: var(--el-fill-color-lighter);
  border-color: var(--el-border-color);
}
</style>
