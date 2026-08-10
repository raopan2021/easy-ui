<script setup lang="ts">
import { computed } from 'vue'

import { dividerProps } from './divider'

defineOptions({ name: 'EasyDivider' })

const props = defineProps(dividerProps)

const isHorizontal = computed(() => props.direction === 'horizontal')

const dividerStyle = computed(() => {
  const style: Record<string, string> = {
    borderTopStyle: props.borderStyle,
  }
  if (!isHorizontal.value && props.height) {
    style.height = props.height
  }
  if (isHorizontal.value && props.width) {
    style.width = props.width
  }
  return style
})

const textClass = computed(() => [
  `easy-divider__text--${props.contentPosition}`,
])
</script>

<template>
  <div class="easy-divider" :class="{ 'easy-divider--vertical': !isHorizontal }" :style="dividerStyle">
    <span v-if="$slots.default && isHorizontal" class="easy-divider__text" :class="textClass">
      <slot />
    </span>
  </div>
</template>

<style scoped lang="scss">
.easy-divider {
  position: relative;
  display: flex;
  align-items: center;
  margin: 16px 0;
  border-top: 1px solid var(--el-border-color);
  box-sizing: border-box;
}

.easy-divider--vertical {
  display: inline-flex;
  height: 1em;
  margin: 0 8px;
  border-top: none;
  border-left: 1px solid var(--el-border-color);
}

.easy-divider__text {
  position: absolute;
  background: var(--el-bg-color);
  padding: 0 16px;
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-secondary);
  line-height: 1;

  &--left {
    left: 20px;
  }
  &--center {
    left: 50%;
    transform: translateX(-50%);
  }
  &--right {
    right: 20px;
  }
}
</style>
