<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'XlyDivider' })

const props = withDefaults(
  defineProps<{
    /** 分割线方向 */
    direction?: DividerDirection
    /** 是否为简约样式（隐藏分割线） */
    plain?: boolean
    /** 分割线内容位置 */
    contentPosition?: DividerContentPosition
    /** 自定义颜色 */
    color?: string
    /** 自定义线宽（px） */
    borderWidth?: string | number
    /** 自定义类名 */
    customClass?: string
  }>(),
  {
    direction: 'horizontal',
    plain: false,
    contentPosition: 'center',
    color: '',
    borderWidth: 1,
    customClass: '',
  },
)
type DividerDirection = 'horizontal' | 'vertical'
type DividerContentPosition = 'left' | 'center' | 'right'

const dividerClass = computed(() => [
  `xly-divider--${props.direction}`,
  props.plain ? 'xly-divider--plain' : '',
  props.customClass,
])

const dividerStyle = computed(() => {
  const style: Record<string, string> = {}

  if (props.color) {
    style.borderColor = props.color
  }

  if (props.direction === 'horizontal') {
    style.borderWidth = `${props.borderWidth}px 0 0 0`
  }
  else {
    style.borderWidth = `0 ${props.borderWidth}px 0 0`
  }

  return style
})
</script>

<template>
  <div class="xly-divider" :class="dividerClass" :style="dividerStyle">
    <span v-if="$slots.default && !plain" class="xly-divider__text" :class="[`xly-divider__text--${contentPosition}`]">
      <slot />
    </span>
    <span
      v-else-if="$slots.default && plain"
      class="xly-divider__text xly-divider__text--plain"
      :class="[`xly-divider__text--${contentPosition}`]"
    >
      <slot />
    </span>
  </div>
</template>

<style scoped lang="scss">
/* ========== 设计令牌 ========== */

/* ========== 基础分割线 ========== */
.xly-divider {
  position: relative;
  background-color: var(--el-border-color);
  border: none;
  margin: 0;
  box-sizing: border-box;

  &.xly-divider--horizontal {
    display: block;
    width: 100%;
    border-top: 1px solid var(--el-border-color);
    margin: 20px 0;
  }

  &.xly-divider--vertical {
    display: inline-block;
    width: 1px;
    height: 1em;
    vertical-align: middle;
    border-right: 1px solid var(--el-border-color);
    margin: 0 16px;
  }

  &.xly-divider--plain {
    background-color: transparent;
  }
}

/* ========== 分割线文字 ========== */
.xly-divider__text {
  position: absolute;
  display: inline-block;
  padding: 0 16px;
  background-color: var(--el-bg-color);
  font-size: 14px;
  color: var(--el-text-color-regular);
  line-height: 1;
  transform: translateY(-50%);
  white-space: nowrap;

  &.xly-divider__text--left {
    left: 20px;
  }

  &.xly-divider__text--center {
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
  }

  &.xly-divider__text--right {
    right: 20px;
  }

  &.xly-divider__text--plain {
    background-color: transparent;
    color: var(--el-text-color-primary);
    font-weight: 500;
  }
}

/* ========== 垂直分割线的文字位置 ========== */
.xly-divider--vertical.xly-divider--horizontal {
  // 垂直分割线不支持内容
}

/* 垂直分割线不需要文字位置调整 */
.xly-divider--vertical .xly-divider__text {
  position: relative;
  transform: none;
  padding: 0 8px;
  top: auto;
  left: auto;
  right: auto;
}
</style>

<style lang="scss">
html.dark .xly-divider {
  border-color: var(--el-border-color);
}
html.dark .xly-divider__text {
  color: var(--el-text-color-secondary);
  background-color: var(--el-bg-color);
}
html.dark .xly-divider__text--plain {
  color: var(--el-text-color-primary);
}
</style>
