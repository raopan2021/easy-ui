<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref } from 'vue'

defineOptions({ name: 'EasyDropdown' })

const props = withDefaults(
  defineProps<{
    /** 触发器文本（简化用法） */
    label?: string
    /** 触发方式 */
    trigger?: 'click' | 'hover'
  }>(),
  {
    label: '下拉菜单',
    trigger: 'click',
  },
)

const visible = ref(false)
const triggerRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const menuPosition = ref({ top: 0, left: 0, minWidth: 0 })

const menuStyle = computed(() => ({
  // fixed 定位：脱离文档流，不受祖先 overflow:hidden 裁剪，且避免 Teleport 导致
  // slot 内组件（DropdownItem）的事件监听器丢失（onClick 无法触发）
  position: 'fixed' as const,
  top: `${menuPosition.value.top}px`,
  left: `${menuPosition.value.left}px`,
  minWidth: `${menuPosition.value.minWidth}px`,
  zIndex: 2050,
}))

function updatePosition() {
  if (!triggerRef.value)
    return
  const rect = triggerRef.value.getBoundingClientRect()
  menuPosition.value = {
    top: rect.bottom + 4,
    left: rect.left,
    minWidth: rect.width,
  }
}

function show() {
  visible.value = true
  nextTick(updatePosition)
}

function hide() {
  visible.value = false
}

function toggle() {
  if (visible.value) {
    hide()
  }
  else {
    show()
  }
}

function handleClick(event: MouseEvent) {
  if (props.trigger === 'click') {
    // 点击菜单内部（菜单项）时不触发 toggle：菜单项由 handleMenuClick 负责关闭，
    // 否则 hide() 后事件冒泡到触发器会再次 toggle 打开菜单
    if (menuRef.value?.contains(event.target as Node))
      return
    toggle()
  }
}

let hoverTimer: ReturnType<typeof setTimeout> | null = null

function clearHoverTimer() {
  if (hoverTimer) {
    clearTimeout(hoverTimer)
    hoverTimer = null
  }
}

function handleMouseEnter() {
  if (props.trigger === 'hover') {
    clearHoverTimer()
    show()
  }
}

function handleMouseLeave() {
  if (props.trigger === 'hover') {
    hoverTimer = setTimeout(hide, 150)
  }
}

function handleMenuMouseEnter() {
  if (props.trigger === 'hover') {
    clearHoverTimer()
  }
}

function handleMenuMouseLeave() {
  if (props.trigger === 'hover') {
    hoverTimer = setTimeout(hide, 150)
  }
}

function handleMenuClick(event: MouseEvent) {
  // 点击菜单项（选项）后关闭；点击菜单自身空白区域不关闭
  if (event.target !== menuRef.value) {
    hide()
  }
}

function handleClickOutside(event: MouseEvent) {
  const target = event.target as Element | null
  if (!target)
    return
  if (triggerRef.value?.contains(target))
    return
  if (menuRef.value?.contains(target))
    return
  hide()
}

function handleScroll() {
  if (visible.value) {
    hide()
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside, true)
  window.addEventListener('scroll', handleScroll, true)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside, true)
  window.removeEventListener('scroll', handleScroll, true)
  clearHoverTimer()
})

defineExpose({
  show,
  hide,
  toggle,
  isOpen: () => visible.value,
})
</script>

<template>
  <div
    ref="triggerRef"
    class="easy-dropdown"
    @click="handleClick"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- 触发器：优先使用 slot，否则用 label prop -->
    <slot>
      <span class="easy-dropdown__trigger">
        {{ label }}
        <svg class="easy-dropdown__arrow" :class="{ 'is-open': visible }" viewBox="0 0 1024 1024" width="12" height="12">
          <path
            d="M512 714.667c-8.533 0-17.067-2.134-23.467-8.534L168.533 386.133c-12.8-12.8-12.8-32 0-44.8 12.8-12.8 32-12.8 44.8 0L512 640l298.667-298.667c12.8-12.8 32-12.8 44.8 0 12.8 12.8 12.8 32 0 44.8L535.467 706.133c-6.4 6.4-14.934 8.534-23.467 8.534z"
            fill="currentColor"
          />
        </svg>
      </span>
    </slot>

    <!-- 下拉菜单：fixed 定位脱离文档流，不依赖 Teleport（Teleport 会导致 slot 内组件事件丢失） -->
    <transition name="easy-dropdown-fade">
      <ul
        v-if="visible"
        ref="menuRef"
        class="easy-dropdown-menu"
        :style="menuStyle"
        @mouseenter="handleMenuMouseEnter"
        @mouseleave="handleMenuMouseLeave"
        @click="handleMenuClick"
      >
        <slot name="dropdown" />
      </ul>
    </transition>
  </div>
</template>

<style scoped>
.easy-dropdown {
  display: inline-block;
}

.easy-dropdown__trigger {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  font-size: 14px;
  color: var(--text-color, #606266);
  transition: color 0.2s;
  user-select: none;
}

.easy-dropdown__trigger:hover {
  color: var(--primary-color, #4f6ef7);
}

.easy-dropdown__arrow {
  transition: transform 0.25s ease;
}

.easy-dropdown__arrow.is-open {
  transform: rotate(180deg);
}
</style>

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
