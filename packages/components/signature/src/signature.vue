<script setup lang="ts">
import type { SignatureEmits, SignatureProps } from './types'

import EasyIcon from '../../icon'
import { useSignatureCanvas } from './use-signature-canvas'
import { useSignatureDraw } from './use-signature-draw'
import { useSignaturePen } from './use-signature-pen'
import { useSignatureStyle } from './use-signature-style'

// 保持对外类型导出兼容（原定义内联在 signature.vue）
export type { SignatureEmits, SignatureProps } from './types'

defineOptions({ name: 'EasySignature' })

const props = withDefaults(defineProps<SignatureProps>(), {
  width: undefined,
  height: 200,
  penColor: '#1a1a2e',
  penSize: 2,
  canvasBgColor: '',
  placeholder: '请在此处手写签名',
  placeholderIcon: '',
  showToolbar: true,
  showPenSize: true,
  showPenColor: false,
  showUndo: true,
  showClear: true,
  showConfirm: true,
  showPlaceholder: true,
  toolbarText: false,
  disabled: false,
  radius: 8,
})

const emit = defineEmits<SignatureEmits>()

// ──── 画笔状态（颜色 / 粗细 + 暗色模式默认笔画色跟随）────
const pen = useSignaturePen(props)
const { penColors, penSizes, currentPenColor, currentPenSize, setPenColor, setPenSize } = pen

// ──── 画布（高清初始化 / 尺寸监听 / 历史快照）────
const canvas = useSignatureCanvas(props)
const { wrapperRef, canvasRef, canUndo, hasContent } = canvas

// ──── 绘制与操作（鼠标 / 触摸 / 撤销 / 清空 / 确认）────
const {
  onPointerDown,
  onPointerMove,
  onPointerUp,
  onTouchStart,
  onTouchMove,
  undo,
  clear,
  confirm,
  getDataUrl,
} = useSignatureDraw(props, emit, canvas, pen)

// ──── 类名 / 样式 ────
const { canvasWrapStyle, signatureClass, signatureStyle } = useSignatureStyle(props)

// ============ 暴露方法 ============

defineExpose({
  undo,
  clear,
  confirm,
  getDataUrl,
  setPenColor,
  setPenSize,
  hasContent,
})
</script>

<template>
  <div ref="wrapperRef" class="easy-signature" :class="signatureClass" :style="signatureStyle">
    <!-- 工具栏 -->
    <div v-if="showToolbar" class="easy-signature__toolbar">
      <div class="easy-signature__toolbar-left">
        <slot name="toolbar-left" />
      </div>
      <div class="easy-signature__toolbar-center">
        <!-- 画笔粗细 -->
        <div v-if="showPenSize" class="easy-signature__pen-size">
          <span class="easy-signature__pen-label">粗细</span>
          <div class="easy-signature__pen-options">
            <button
              v-for="size in penSizes" :key="size" class="easy-signature__pen-btn"
              :class="{ 'is-active': currentPenSize === size }" :title="`${size}px`" @click="setPenSize(size)"
            >
              <span
                class="easy-signature__pen-dot"
                :style="{ width: `${Math.max(size, 4)}px`, height: `${Math.max(size, 4)}px` }"
              />
            </button>
          </div>
        </div>
        <!-- 画笔颜色 -->
        <div v-if="showPenColor" class="easy-signature__pen-color">
          <span class="easy-signature__pen-label">颜色</span>
          <div class="easy-signature__pen-options">
            <button
              v-for="color in penColors" :key="color" class="easy-signature__color-btn"
              :class="{ 'is-active': currentPenColor === color }" :style="{ backgroundColor: color }"
              @click="setPenColor(color)"
            />
          </div>
        </div>
      </div>
      <div class="easy-signature__toolbar-right">
        <!-- 撤销 -->
        <button v-if="showUndo" class="easy-signature__tool-btn" :disabled="!canUndo" title="撤销" @click="undo">
          <svg
            viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round"
          >
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          <span v-if="toolbarText">撤销</span>
        </button>
        <!-- 清空 -->
        <button v-if="showClear" class="easy-signature__tool-btn" :disabled="!hasContent" title="清空" @click="clear">
          <svg
            viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          <span v-if="toolbarText">清空</span>
        </button>
        <!-- 确认 -->
        <slot name="toolbar-right">
          <button
            v-if="showConfirm" class="easy-signature__tool-btn easy-signature__tool-btn--primary"
            :disabled="!hasContent" title="确认签名" @click="confirm"
          >
            <svg
              viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
            <span v-if="toolbarText">确认</span>
          </button>
        </slot>
      </div>
    </div>

    <!-- 画布区域 -->
    <div class="easy-signature__canvas-wrap" :style="canvasWrapStyle">
      <!-- 提示文字 -->
      <div v-if="showPlaceholder && !hasContent" class="easy-signature__placeholder">
        <slot name="placeholder">
          <EasyIcon v-if="placeholderIcon" :name="placeholderIcon" :size="24" />
          <span class="easy-signature__placeholder-text">{{ placeholder }}</span>
        </slot>
      </div>
      <canvas
        ref="canvasRef" class="easy-signature__canvas"
        :style="canvasBgColor ? { backgroundColor: canvasBgColor } : {}" @mousedown="onPointerDown"
        @mousemove="onPointerMove" @mouseup="onPointerUp" @mouseleave="onPointerUp" @touchstart.prevent="onTouchStart"
        @touchmove.prevent="onTouchMove" @touchend="onPointerUp"
      />
    </div>
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 signature-style.scss） -->
<style scoped src="./signature-style.scss" lang="scss"></style>

<style lang="scss">
/* ========== Dark Mode ========== */
html.dark .easy-signature {
  border-color: var(--el-border-color);
  background: var(--el-bg-color);
}
html.dark .easy-signature__toolbar {
  background: var(--el-fill-color-light);
  border-bottom-color: var(--el-border-color);
}
html.dark .easy-signature__pen-btn:hover {
  background: var(--el-fill-color);
}
html.dark .easy-signature__tool-btn {
  background: var(--el-bg-color);
  border-color: var(--el-border-color);
}
html.dark .easy-signature__tool-btn:hover:not(:disabled) {
  background: rgba(79, 110, 247, 0.1);
}
</style>
