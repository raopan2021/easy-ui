<script setup lang="ts">
import type { BarcodeEmits, BarcodeProps } from './types'

import { useBarcode } from './use-barcode'

defineOptions({ name: 'EasyBarcode' })

const props = withDefaults(defineProps<BarcodeProps>(), {
  content: '',
  format: 'CODE128',
  width: 2,
  height: 100,
  displayValue: true,
  font: 'Courier New',
  fontSize: 20,
  textAlign: 'center',
  margin: 10,
  background: '#ffffff',
  lineColor: '#000000',
})

const emit = defineEmits<BarcodeEmits>()

const {
  svgRef,
  getSvgElement,
  toSVGString,
  downloadSVG,
  downloadPNG,
} = useBarcode(props, emit)

/** 暴露的方法 */
defineExpose({
  /** 获取 SVG 元素 */
  getSvgElement,
  /** 获取 SVG 字符串 */
  toSVGString,
  /** 下载为 SVG 文件 */
  downloadSVG,
  /** 下载为 PNG 图片 */
  downloadPNG,
})

// 保持对外类型导出兼容（原定义在 barcode.vue）
export type { BarcodeEmits, BarcodeOptions, BarcodeProps } from './types'
</script>

<template>
  <div class="easy-barcode">
    <svg ref="svgRef" class="easy-barcode__svg" />
    <div v-if="!content" class="easy-barcode__placeholder">
      <slot name="placeholder">
        <span>请输入内容</span>
      </slot>
    </div>
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 barcode-style.scss） -->
<style scoped src="./barcode-style.scss" lang="scss"></style>
