<script setup lang="ts">
import type { DrawerEmits, DrawerProps } from './types'

import { useDrawer } from './use-drawer'

// 保持对外类型导出兼容（原内联定义在 drawer.vue）
export type { DrawerDirection, DrawerEmits, DrawerProps } from './types'

defineOptions({ name: 'EasyDrawer' })

const props = withDefaults(
  defineProps<DrawerProps>(),
  {
    title: '',
    direction: 'right',
    showClose: true,
    showHeader: true,
    showMask: true,
    closeOnClickModal: true,
    size: '30%',
    customClass: '',
    showFooter: false,
  },
)

const emit = defineEmits<DrawerEmits>()

const { drawerRef, drawerClass, drawerStyle, handleClose, handleMaskClick } = useDrawer(props, emit)
</script>

<template>
  <Teleport to="body">
    <Transition name="easy-drawer-fade">
      <div v-if="modelValue" class="easy-drawer-mask" :class="{ 'easy-drawer-mask--transparent': !showMask }"
        @click.self="handleMaskClick">
        <Transition :name="`easy-drawer-${direction}`" appear>
          <div v-if="modelValue" ref="drawerRef" class="easy-drawer" :class="drawerClass" :style="drawerStyle">
            <!-- 头部 -->
            <div v-if="showHeader" class="easy-drawer__header">
              <div class="easy-drawer__title">
                <slot name="header">
                  <span>{{ title }}</span>
                </slot>
              </div>
              <button v-if="showClose" class="easy-drawer__close" @click="handleClose">
                <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2"
                  stroke-linecap="round">
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              </button>
            </div>

            <!-- 主体 -->
            <div class="easy-drawer__body">
              <slot />
            </div>

            <!-- 底部 -->
            <div v-if="$slots.footer" class="easy-drawer__footer">
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<!-- 组件核心样式（scoped，独立维护在 drawer-style.scss） -->
<style scoped src="./drawer-style.scss" lang="scss"></style>
