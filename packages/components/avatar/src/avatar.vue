<script setup lang="ts">
import { computed, ref } from 'vue'

import { avatarEmits, avatarProps } from './avatar'

defineOptions({ name: 'EasyAvatar' })

const props = defineProps(avatarProps)
const emit = defineEmits(avatarEmits)

const hasLoadError = ref(false)
const isShowText = ref(false)

const avatarClass = computed(() => [
  `easy-avatar--${props.size}`,
  `easy-avatar--${props.shape}`,
  props.customClass,
])

const avatarStyle = computed(() => {
  const style: Record<string, string> = {}

  // 尺寸处理
  if (typeof props.size === 'number') {
    style.width = `${props.size}px`
    style.height = `${props.size}px`
    style.fontSize = `${props.size / 2}px`
  }
  else if (typeof props.size === 'string' && !['small', 'default', 'large'].includes(props.size)) {
    style.width = props.size
    style.height = props.size
  }

  // 背景色
  if (props.color) {
    style.backgroundColor = props.color
  }

  // 图片填充模式
  style.objectFit = props.fit

  return style
})

function handleClick(e: MouseEvent) {
  emit('click', e)
}

function handleError(e: Event) {
  hasLoadError.value = true
  emit('error', e)
}
</script>

<script lang="ts">
export default {
  inheritAttrs: false,
}
</script>

<template>
  <div class="easy-avatar" :class="avatarClass" :style="avatarStyle" @click="handleClick">
    <img
      v-if="(src || srcSet) && !hasLoadError"
      class="easy-avatar__image"
      :src="src"
      :srcset="srcSet"
      :alt="alt"
      @error="handleError"
    >
    <span v-else-if="isShowText" class="easy-avatar__text">
      <slot />
    </span>
    <span v-else class="easy-avatar__icon">
      <slot name="icon">
        <svg
          viewBox="0 0 24 24"
          width="100%"
          height="100%"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </slot>
    </span>
  </div>
</template>
