<script setup lang="ts">
import { stepsProps } from './steps'
import { useSteps } from './use-steps'

defineOptions({ name: 'EasySteps' })

// ──── props ────
const props = defineProps(stepsProps)

// ──── 子步骤计数 / 自定义配色 / 上下文下发（抽离到 composable）────
const { customColorsStyle } = useSteps(props)
</script>

<template>
  <div class="easy-steps" :class="[`easy-steps--${direction}`]" :style="customColorsStyle">
    <slot />
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 steps-style.scss） -->
<style scoped src="./steps-style.scss" lang="scss"></style>

<!-- 暗色模式覆盖（非 scoped，全局 html.dark 作用域） -->
<style lang="scss">
/* ========== Dark Mode ========== */
html.dark .easy-steps__line {
  background-color: var(--el-border-color);
}
html.dark .easy-steps__line--active {
  background-color: var(--el-color-primary);
}
html.dark .easy-steps__number {
  background-color: var(--el-fill-color);
  border-color: var(--el-border-color);
  color: var(--el-text-color-secondary);
}
html.dark .easy-steps__step.is-process .easy-steps__number {
  border-color: var(--el-color-primary);
  color: var(--el-color-white);
  background-color: var(--el-color-primary);
}
html.dark .easy-steps__step.is-finish .easy-steps__number {
  border-color: var(--el-color-primary);
  color: var(--el-color-primary);
  background-color: var(--el-color-primary-light-9);
}
</style>
