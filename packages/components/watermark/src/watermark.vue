<script setup lang="ts">
import type { WatermarkOptions } from './types'

import { ref } from 'vue'
import { useWatermarkRender } from './use-render'
import { useWatermarkTile } from './use-tile'

// 保持对外类型导出兼容（原内联定义在 watermark.vue，指令与外部均从此处引用过）
export type { WatermarkOptions } from './types'

defineOptions({ name: 'EasyWatermark' })

const props = withDefaults(defineProps<WatermarkOptions>(), {
  content: '',
  image: '',
  fullPage: true,
  rotate: -22,
  width: 120,
  height: 64,
  fontSize: 14,
  fontColor: 'rgba(0, 0, 0, 0.15)',
  fontFamily: 'sans-serif',
  fontWeight: 'normal',
  opacity: 1,
  gapX: 100,
  gapY: 100,
  offset: () => ({}),
  imageWidth: 120,
  preventDelete: false,
  zIndex: 9,
})

/** 水印容器节点（尺寸监听与防篡改的观察目标） */
const containerRef = ref<HTMLElement | null>(null)
/** 覆盖层画布节点（水印实际绘制载体） */
const canvasRef = ref<HTMLCanvasElement | null>(null)

// ──── 水印 tile 生成（dark 模式配色 + 文字/图片绘制）────
const { isDark, generateTileUrl, generateTileUrlAsync } = useWatermarkTile(props)

// ──── 平铺渲染 + 尺寸/主题/防篡改监听 ────
const { canvasStyle, relative, draw } = useWatermarkRender(props, {
  containerRef,
  canvasRef,
  isDark,
  generateTileUrl,
  generateTileUrlAsync,
})

/** 暴露重绘方法 */
defineExpose({ redraw: draw })
</script>

<template>
  <div ref="containerRef" class="easy-watermark" :style="{ position: relative ? 'relative' : undefined }">
    <slot />
    <canvas ref="canvasRef" class="easy-watermark__canvas" :style="canvasStyle" />
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 watermark-style.scss） -->
<style scoped src="./watermark-style.scss" lang="scss"></style>
