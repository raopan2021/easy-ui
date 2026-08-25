<script setup lang="ts">
import type { EasyIconEmits, EasyIconProps } from './types'

import { useIcon } from './use-icon'

defineOptions({ name: 'EasyIcon' })

const props = withDefaults(defineProps<EasyIconProps>(), {
  size: undefined,
  color: undefined,
  iconClass: undefined,
  clickable: false,
  alt: '',
})

const emit = defineEmits<EasyIconEmits>()

// 将原来内联的解析 / 映射 / 样式逻辑抽离到 composable
const {
  mode,
  epComponent,
  svgContent,
  resolvedImageSrc,
  rootStyle,
  handleClick,
  handleImageLoad,
  handleImageError,
} = useIcon(props, emit)

// 保持对外类型导出兼容（原定义在 icon.vue，现统一维护在 ./types）
export type { EasyIconEmits, EasyIconProps } from './types'
</script>

<template>
  <i class="easy-icon" :class="[iconClass, { 'easy-icon--clickable': clickable }]" :style="rootStyle"
    @click="handleClick">
    <!-- Element Plus 图标 (el:xxx) -->
    <el-icon v-if="mode === 'element'" :size="size" :color="color">
      <component :is="epComponent" />
    </el-icon>

    <!-- 自定义 SVG 图标 (svg:xxx → assets/icon/svg/) -->
    <span
      v-else-if="mode === 'svg'"
      class="easy-icon__svg"
      :style="{
        width: size ? `${size}px` : undefined,
        height: size ? `${size}px` : undefined,
        color: color || undefined,
      }"
      v-html="svgContent"
    />

    <!-- 图片 URL (无前缀，以 .png/.jpg/.webp 等结尾或 http(s):// 开头，或 @/ 开头的 Vite 别名路径) -->
    <img
      v-else-if="mode === 'image'"
      :src="resolvedImageSrc"
      :alt="alt"
      class="easy-icon__img"
      :style="{
        width: size ? `${size}px` : undefined,
        height: size ? `${size}px` : undefined,
      }"
      draggable="false"
      @error="handleImageError"
      @load="handleImageLoad"
    >
  </i>
</template>

<!-- 组件核心样式（scoped，独立维护在 icon-style.scss） -->
<style scoped src="./icon-style.scss" lang="scss"></style>
