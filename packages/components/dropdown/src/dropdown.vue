<script setup lang="ts">
import type { DropdownProps } from './types'

import { useDropdown } from './use-dropdown'

defineOptions({ name: 'EasyDropdown' })

const props = withDefaults(defineProps<DropdownProps>(), {
  label: '下拉菜单',
  trigger: 'click',
})

const {
  visible,
  triggerRef,
  menuRef,
  menuStyle,
  show,
  hide,
  toggle,
  isOpen,
  handleClick,
  handleMouseEnter,
  handleMouseLeave,
  handleMenuMouseEnter,
  handleMenuMouseLeave,
  handleMenuClick,
} = useDropdown(props)

defineExpose({
  show,
  hide,
  toggle,
  isOpen,
})

// 保持对外类型导出兼容
export type { DropdownProps } from './types'
</script>

<template>
  <div ref="triggerRef" class="easy-dropdown" @click="handleClick" @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave">
    <!-- 触发器：优先使用 slot，否则用 label prop -->
    <slot>
      <span class="easy-dropdown__trigger">
        {{ label }}
        <svg class="easy-dropdown__arrow" :class="{ 'is-open': visible }" viewBox="0 0 1024 1024" width="12" height="12">
          <path d="M512 714.667c-8.533 0-17.067-2.134-23.467-8.534L168.533 386.133c-12.8-12.8-12.8-32 0-44.8 12.8-12.8 32-12.8 44.8 0L512 640l298.667-298.667c12.8-12.8 32-12.8 44.8 0 12.8 12.8 12.8 32 0 44.8L535.467 706.133c-6.4 6.4-14.934 8.534-23.467 8.534z"
            fill="currentColor" />
        </svg>
      </span>
    </slot>

    <!-- 下拉菜单：fixed 定位脱离文档流，不依赖 Teleport（Teleport 会导致 slot 内组件事件丢失） -->
    <transition name="easy-dropdown-fade">
      <ul v-if="visible" ref="menuRef" class="easy-dropdown-menu" :style="menuStyle" @mouseenter="handleMenuMouseEnter"
        @mouseleave="handleMenuMouseLeave" @click="handleMenuClick">
        <slot name="dropdown" />
      </ul>
    </transition>
  </div>
</template>

<!-- 触发器样式（scoped，独立维护在 dropdown-style.scss） -->
<style scoped src="./dropdown-style.scss" lang="scss"></style>

<!-- 菜单样式：全局生效（fixed 定位脱离文档流后 scoped 不生效），保持内联 -->
<style>
/* 全局样式，因为 Teleport 到 body 后 scoped 不生效 */
.easy-dropdown-menu {
  padding: 8px 0;
  margin: 0;
  list-style: none;
  background-color: var(--el-bg-color);
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  box-shadow:
    0 6px 16px 0 rgba(0, 0, 0, 0.08),
    0 3px 6px -4px rgba(0, 0, 0, 0.12);
}

.easy-dropdown-fade-enter-active,
.easy-dropdown-fade-leave-active {
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.easy-dropdown-fade-enter-from,
.easy-dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}

/* ========== Dark Mode ========== */
html.dark .easy-dropdown-menu {
  background: var(--el-bg-color-overlay);
  border-color: var(--el-border-color);
  box-shadow:
    0 6px 16px 0 rgba(0, 0, 0, 0.3),
    0 3px 6px -4px rgba(0, 0, 0, 0.4);
}
</style>
