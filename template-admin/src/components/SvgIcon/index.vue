<script setup lang="ts">
import { getIconSize } from '@/utils/svg-sprite'

defineOptions({ name: 'SvgIcon' })

const props = withDefaults(
  defineProps<{
    /** 图标名，对应 src/assets/svg/<name>.svg（不含扩展名） */
    name: string
    /** 显式尺寸，覆盖图标原始 width/height；数字按 px 处理 */
    size?: string | number
  }>(),
  { size: undefined },
)

// 图标自身原始尺寸作为默认，保证迁移后视觉与原 ?component 内联 SVG 一致
const defaultSize = getIconSize(props.name)

function toCss(v: string | number | undefined, fallback: string) {
  if (v === undefined || v === '')
    return fallback
  return typeof v === 'number' ? `${v}px` : v
}
</script>

<template>
  <svg
    aria-hidden="true"
    :style="{
      width: toCss(size, defaultSize.width),
      height: toCss(size, defaultSize.height),
    }"
  >
    <use :href="`#icon-${name}`" />
  </svg>
</template>
