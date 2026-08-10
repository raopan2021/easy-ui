<script setup lang="ts">
import { computed, nextTick, onMounted, onUnmounted, ref, watch } from 'vue'
import EasyIcon from '../../icon'

defineOptions({ name: 'EasySignature' })

const props = withDefaults(
  defineProps<{
    /** 画布宽度（像素），默认撑满容器 */
    width?: number
    /** 画布高度（像素） */
    height?: number
    /** 画笔颜色 */
    penColor?: string
    /** 画笔粗细（像素） */
    penSize?: number
    /** 画布背景色 */
    canvasBgColor?: string
    /** 占位提示文字 */
    placeholder?: string
    /** 占位提示图标（EasyIcon 格式） */
    placeholderIcon?: string
    /** 是否显示工具栏 */
    showToolbar?: boolean
    /** 是否显示画笔粗细选择 */
    showPenSize?: boolean
    /** 是否显示画笔颜色选择 */
    showPenColor?: boolean
    /** 是否显示撤销按钮 */
    showUndo?: boolean
    /** 是否显示清空按钮 */
    showClear?: boolean
    /** 是否显示确认按钮 */
    showConfirm?: boolean
    /** 是否显示占位提示 */
    showPlaceholder?: boolean
    /** 工具栏按钮是否带文字 */
    toolbarText?: boolean
    /** 是否禁用 */
    disabled?: boolean
    /** 画布圆角（像素） */
    radius?: number
  }>(),
  {
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
  },
)

const emit = defineEmits<{
  /** 确认签名时触发，返回签名图片 dataURL */
  confirm: [dataUrl: string]
  /** 签名内容变化时触发 */
  change: [hasContent: boolean]
  /** 撤销 */
  undo: []
  /** 清空 */
  clear: []
}>()

// Refs
const wrapperRef = ref<HTMLDivElement>()
const canvasRef = ref<HTMLCanvasElement>()

// State
let ctx: CanvasRenderingContext2D | null = null
let isDrawing = false
let lastX = 0
let lastY = 0

/** light 模式默认笔画色 */
const DEFAULT_PEN = '#1a1a2e'
/** dark 模式默认笔画色（浅色，保证在深色画布上可辨识） */
const DARK_PEN = '#e4e4e7'

function isDarkMode(): boolean {
  return document.documentElement.classList.contains('dark')
}

/** 解析默认笔画色：用户显式自定义则始终使用；否则 dark 模式自动用浅色 */
function resolvePenColor(): string {
  if (props.penColor && props.penColor !== DEFAULT_PEN)
    return props.penColor
  return isDarkMode() ? DARK_PEN : DEFAULT_PEN
}

const currentPenColor = ref(resolvePenColor())
const currentPenSize = ref(props.penSize)
const canUndo = ref(false)
const hasContent = ref(false)

// 历史记录（存储每一笔之前的 ImageData）
const history: ImageData[] = []
const MAX_HISTORY = 30

// 预设颜色和粗细
const penColors = ['#1a1a2e', '#000000', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6']
const penSizes = [1, 2, 4, 6]

// ============ 计算属性 ============

const canvasWrapStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.width) {
    style.width = `${props.width}px`
  }
  style.height = `${props.height}px`
  return style
})

const signatureClass = computed(() => [
  {
    'is-disabled': props.disabled,
    'is-toolbar-hidden': !props.showToolbar,
  },
])

const signatureStyle = computed(() => {
  const style: Record<string, string> = {}
  if (props.width) {
    style.width = `${props.width}px`
  }
  if (props.radius !== undefined) {
    style.borderRadius = `${props.radius}px`
  }
  return style
})

// ============ 画布初始化 ============

function initCanvas() {
  const canvas = canvasRef.value
  if (!canvas)
    return

  const wrapper = canvas.parentElement
  const displayWidth = wrapper ? wrapper.clientWidth : props.width || 400
  const displayHeight = props.height || 200

  // 高清渲染（2x）
  const dpr = window.devicePixelRatio || 1
  canvas.width = displayWidth * dpr
  canvas.height = displayHeight * dpr
  canvas.style.width = `${displayWidth}px`
  canvas.style.height = `${displayHeight}px`

  ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.scale(dpr, dpr)
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
  }

  // 清空历史
  history.length = 0
  canUndo.value = false
  hasContent.value = false
}

onMounted(() => {
  nextTick(() => initCanvas())
  // 监听 html.dark class 变化：用户未自定义笔画色时，随主题自动切换默认笔画色
  themeObserver = new MutationObserver(() => {
    if (!props.penColor || props.penColor === DEFAULT_PEN) {
      currentPenColor.value = resolvePenColor()
    }
  })
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

onUnmounted(() => {
  history.length = 0
  themeObserver?.disconnect()
})

// 监听尺寸变化
watch(
  () => [props.width, props.height],
  () => {
    nextTick(() => initCanvas())
  },
)

// 窗口 resize
let resizeObserver: ResizeObserver | null = null
// 主题切换监听（dark class 变化时更新默认笔画色）
let themeObserver: MutationObserver | null = null
onMounted(() => {
  if (wrapperRef.value && !props.width) {
    resizeObserver = new ResizeObserver(() => {
      nextTick(() => initCanvas())
    })
    resizeObserver.observe(wrapperRef.value)
  }
})
onUnmounted(() => {
  resizeObserver?.disconnect()
})

// ============ 绘制逻辑 ============

function getCanvasPoint(clientX: number, clientY: number): { x: number, y: number } {
  const canvas = canvasRef.value!
  const rect = canvas.getBoundingClientRect()
  return {
    x: clientX - rect.left,
    y: clientY - rect.top,
  }
}

function saveHistory() {
  const canvas = canvasRef.value
  const context = ctx
  if (!canvas || !context)
    return

  const dpr = window.devicePixelRatio || 1
  const imageData = context.getImageData(0, 0, canvas.width / dpr, canvas.height / dpr)
  history.push(imageData)
  if (history.length > MAX_HISTORY) {
    history.shift()
  }
  canUndo.value = history.length > 0
}

function drawLine(x1: number, y1: number, x2: number, y2: number) {
  if (!ctx)
    return
  ctx.beginPath()
  ctx.strokeStyle = currentPenColor.value
  ctx.lineWidth = currentPenSize.value
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}

// ============ 鼠标事件 ============

function onPointerDown(e: MouseEvent) {
  if (props.disabled)
    return
  isDrawing = true
  const { x, y } = getCanvasPoint(e.clientX, e.clientY)
  lastX = x
  lastY = y

  // 保存当前状态用于撤销
  saveHistory()

  // 画一个点（处理单击不拖动的情况）
  if (ctx) {
    ctx.beginPath()
    ctx.fillStyle = currentPenColor.value
    ctx.arc(x, y, currentPenSize.value / 2, 0, Math.PI * 2)
    ctx.fill()
  }
}

function onPointerMove(e: MouseEvent) {
  if (!isDrawing || props.disabled)
    return
  const { x, y } = getCanvasPoint(e.clientX, e.clientY)
  drawLine(lastX, lastY, x, y)
  lastX = x
  lastY = y
  hasContent.value = true
}

function onPointerUp() {
  if (isDrawing) {
    isDrawing = false
    emit('change', true)
  }
}

// ============ 触摸事件 ============

function onTouchStart(e: TouchEvent) {
  if (props.disabled)
    return
  const touch = e.touches[0]
  isDrawing = true
  const { x, y } = getCanvasPoint(touch.clientX, touch.clientY)
  lastX = x
  lastY = y

  saveHistory()

  if (ctx) {
    ctx.beginPath()
    ctx.fillStyle = currentPenColor.value
    ctx.arc(x, y, currentPenSize.value / 2, 0, Math.PI * 2)
    ctx.fill()
  }
}

function onTouchMove(e: TouchEvent) {
  if (!isDrawing || props.disabled)
    return
  const touch = e.touches[0]
  const { x, y } = getCanvasPoint(touch.clientX, touch.clientY)
  drawLine(lastX, lastY, x, y)
  lastX = x
  lastY = y
  hasContent.value = true
}

// ============ 操作方法 ============

/** 撤销上一笔 */
function undo() {
  if (history.length === 0)
    return
  const lastState = history.pop()!
  const context = ctx
  if (context) {
    context.putImageData(lastState, 0, 0)
  }
  canUndo.value = history.length > 0
  hasContent.value = history.length > 0
  emit('undo')
}

/** 清空画布 */
function clear() {
  const canvas = canvasRef.value
  const context = ctx
  if (!canvas || !context)
    return

  const dpr = window.devicePixelRatio || 1
  const w = canvas.width / dpr
  const heightVal = canvas.height / dpr
  context.clearRect(0, 0, w, heightVal)

  history.length = 0
  canUndo.value = false
  hasContent.value = false
  emit('clear')
  emit('change', false)
}

/** 确认签名，返回 dataURL */
function confirm() {
  if (!canvasRef.value || !hasContent.value)
    return
  const dataUrl = canvasRef.value.toDataURL('image/png')
  emit('confirm', dataUrl)
}

/** 获取签名图片 dataURL（不触发事件） */
function getDataUrl(): string {
  if (!canvasRef.value)
    return ''
  return canvasRef.value.toDataURL('image/png')
}

/** 设置画笔颜色 */
function setPenColor(color: string) {
  currentPenColor.value = color
}

/** 设置画笔粗细 */
function setPenSize(size: number) {
  currentPenSize.value = size
}

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
              v-for="size in penSizes"
              :key="size"
              class="easy-signature__pen-btn"
              :class="{ 'is-active': currentPenSize === size }"
              :title="`${size}px`"
              @click="setPenSize(size)"
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
              v-for="color in penColors"
              :key="color"
              class="easy-signature__color-btn"
              :class="{ 'is-active': currentPenColor === color }"
              :style="{ backgroundColor: color }"
              @click="setPenColor(color)"
            />
          </div>
        </div>
      </div>
      <div class="easy-signature__toolbar-right">
        <!-- 撤销 -->
        <button v-if="showUndo" class="easy-signature__tool-btn" :disabled="!canUndo" title="撤销" @click="undo">
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          <span v-if="toolbarText">撤销</span>
        </button>
        <!-- 清空 -->
        <button v-if="showClear" class="easy-signature__tool-btn" :disabled="!hasContent" title="清空" @click="clear">
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <polyline points="3 6 5 6 21 6" />
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          </svg>
          <span v-if="toolbarText">清空</span>
        </button>
        <!-- 确认 -->
        <slot name="toolbar-right">
          <button
            v-if="showConfirm"
            class="easy-signature__tool-btn easy-signature__tool-btn--primary"
            :disabled="!hasContent"
            title="确认签名"
            @click="confirm"
          >
            <svg
              viewBox="0 0 24 24"
              width="16"
              height="16"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
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
        ref="canvasRef"
        class="easy-signature__canvas"
        :style="canvasBgColor ? { backgroundColor: canvasBgColor } : {}"
        @mousedown="onPointerDown"
        @mousemove="onPointerMove"
        @mouseup="onPointerUp"
        @mouseleave="onPointerUp"
        @touchstart.prevent="onTouchStart"
        @touchmove.prevent="onTouchMove"
        @touchend="onPointerUp"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
@use 'sass:color';

/* ========== 设计令牌 ========== */
$radius: 8px;
$transition: all 0.2s ease;

/* ========== 签名板主体 ========== */
.easy-signature {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
  overflow: hidden;
  box-sizing: border-box;
  transition: $transition;

  &.is-disabled {
    opacity: 0.5;
    pointer-events: none;
  }

  &.is-toolbar-hidden {
    border: none;
  }
}

/* ========== 工具栏 ========== */
.easy-signature__toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color-overlay);
  gap: 8px;
  min-height: 40px;
}

.easy-signature__toolbar-left {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}

.easy-signature__toolbar-center {
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  justify-content: center;
}

.easy-signature__toolbar-right {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
}

/* ========== 画笔选项 ========== */
.easy-signature__pen-size,
.easy-signature__pen-color {
  display: flex;
  align-items: center;
  gap: 6px;
}

.easy-signature__pen-label {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  white-space: nowrap;
}

.easy-signature__pen-options {
  display: flex;
  align-items: center;
  gap: 4px;
}

.easy-signature__pen-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: 1px solid transparent;
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  transition: $transition;

  &:hover {
    background: var(--el-fill-color-light);
  }

  &.is-active {
    background: rgba(var(--el-color-primary), 0.1);
    border-color: var(--el-color-primary);
  }
}

.easy-signature__pen-dot {
  display: block;
  border-radius: 50%;
  background: var(--el-text-color-primary);
}

.easy-signature__color-btn {
  width: 20px;
  height: 20px;
  border: 2px solid transparent;
  border-radius: 50%;
  cursor: pointer;
  transition: $transition;
  padding: 0;

  &:hover {
    transform: scale(1.15);
  }

  &.is-active {
    border-color: var(--el-color-primary);
    box-shadow: 0 0 0 2px rgba(var(--el-color-primary), 0.2);
  }
}

/* ========== 工具按钮 ========== */
.easy-signature__tool-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 6px 10px;
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  background: var(--el-bg-color);
  color: var(--el-text-color-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: $transition;
  white-space: nowrap;

  &:hover:not(:disabled) {
    border-color: var(--el-color-primary);
    color: var(--el-color-primary);
    background: rgba(var(--el-color-primary), 0.04);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  &.easy-signature__tool-btn--primary {
    background: var(--el-color-primary);
    border-color: var(--el-color-primary);
    color: var(--el-color-white);

    &:hover:not(:disabled) {
      background: var(--el-color-primary);
      border-color: var(--el-color-primary);
      color: var(--el-color-white);
    }

    &:disabled {
      background:
        linear-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4)),
        linear-gradient(rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05)), var(--el-color-primary);
      border-color:
        linear-gradient(rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0.4)),
        linear-gradient(rgba(0, 0, 0, 0.05), rgba(0, 0, 0, 0.05)), var(--el-color-primary);
      color: var(--el-color-white);
    }
  }
}

/* ========== Dark Mode ========== */
.easy-signature {
  html.dark & {
    .easy-signature__tool-btn:hover:not(:disabled) {
      background: rgba(79, 110, 247, 0.1);
    }
  }
}

/* ========== 画布区域 ========== */
.easy-signature__canvas-wrap {
  position: relative;
  flex: 1;
  overflow: hidden;
}

.easy-signature__canvas {
  display: block;
  width: 100%;
  height: 100%;
  cursor: crosshair;
  touch-action: none;
  background: var(--el-bg-color);
}

/* ========== 占位提示 ========== */
.easy-signature__placeholder {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  pointer-events: none;
  color: var(--el-text-color-placeholder);
  transition: opacity 0.3s;
}

.easy-signature__placeholder-text {
  font-size: 14px;
  user-select: none;
}
</style>

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
