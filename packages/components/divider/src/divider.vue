<script setup lang="ts">
import { dividerProps } from './divider'
import { useDivider } from './use-divider'

defineOptions({ name: 'EasyDivider' })

const props = defineProps(dividerProps)

const { isHorizontal, dividerStyle, textClass } = useDivider(props)
</script>

<template>
  <div class="easy-divider" :class="{ 'easy-divider--vertical': !isHorizontal }" :style="dividerStyle">
    <span v-if="$slots.default && isHorizontal" class="easy-divider__text" :class="textClass">
      <slot />
    </span>
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 divider-style.scss） -->
<style scoped src="./divider-style.scss" lang="scss"></style>
