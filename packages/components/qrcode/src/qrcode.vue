<script setup lang="ts">
import type { QrcodeEmits, QrcodeProps } from './types'

import { useQrcode } from './use-qrcode'

defineOptions({ name: 'EasyQrcode' })

const props = withDefaults(defineProps<QrcodeProps>(), {
  content: '',
  size: 200,
  colorDark: '#000000',
  colorLight: '#ffffff',
  correctLevel: 'M',
  logo: '',
  logoSize: 0,
  logoBackgroundColor: '#ffffff',
  logoRadius: 8,
  margin: 0,
})

const emit = defineEmits<QrcodeEmits>()

const { canvasRef, toDataURL, toBlob, download } = useQrcode(props, emit)

/** 暴露的方法 */
defineExpose({
  /** 生成并返回 base64 数据 URL */
  toDataURL,
  /** 生成并返回 Blob 对象 */
  toBlob,
  /** 下载二维码图片 */
  download,
})

// 保持对外类型导出兼容（原定义在 qrcode.vue）
export type { QrcodeEmits, QrcodeOptions, QrcodeProps } from './types'
</script>

<template>
  <div class="easy-qrcode" :style="{ width: `${size}px`, height: `${size}px` }">
    <canvas ref="canvasRef" class="easy-qrcode__canvas" />
    <div v-if="!content" class="easy-qrcode__placeholder">
      <slot name="placeholder">
        <span>请输入内容</span>
      </slot>
    </div>
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 qrcode-style.scss） -->
<style scoped src="./qrcode-style.scss" lang="scss"></style>
