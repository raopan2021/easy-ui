<script setup lang="ts">
import type { AvatarEmits, AvatarProps } from './avatar'

import { useAvatar } from './use-avatar'

defineOptions({
  name: 'EasyAvatar',
  // 透传非 prop 的 attribute 到根节点（原第二个 <script> 块的 inheritAttrs: false）
  inheritAttrs: false,
})

const props = withDefaults(defineProps<AvatarProps>(), {
  alt: '',
  size: 'default',
  shape: 'circle',
  color: '',
  fit: 'cover',
  customClass: '',
})

const emit = defineEmits<AvatarEmits>()

// 头像展示 + 事件逻辑抽离到 composable
const { hasLoadError, isShowText, avatarClass, avatarStyle, handleClick, handleError } = useAvatar(props, emit)

// 保持对外类型导出兼容（原定义在 avatar.ts）
export type { AvatarEmits, AvatarProps } from './avatar'
</script>

<template>
  <div class="easy-avatar" :class="avatarClass" :style="avatarStyle" @click="handleClick">
    <img v-if="(src || srcSet) && !hasLoadError" class="easy-avatar__image" :src="src" :srcset="srcSet" :alt="alt"
      @error="handleError">
    <span v-else-if="isShowText" class="easy-avatar__text">
      <slot />
    </span>
    <span v-else class="easy-avatar__icon">
      <slot name="icon">
        <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="1.5"
          stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </slot>
    </span>
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 avatar-style.scss） -->
<style scoped src="./avatar-style.scss" lang="scss"></style>
