import type { ImageEmits, ImagePreviewAction, ImageProps } from './types'

import { computed, ref, watch } from 'vue'

/**
 * 图片组件核心逻辑（解析 / 尺寸 / 预览交互）。
 *
 * 将原本内联在 image.vue 中的大量 computed 与交互方法抽离为独立 composable，
 * 便于单测复用，也让 .vue 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 *
 * @param props 响应式 props（需传入 withDefaults 后的对象，computed 会自动追踪依赖）
 * @param emit   组件 emit 函数（callable 形式的 ImageEmits）
 */
export function useImage(props: ImageProps, emit: ImageEmits) {
  // ============ 图片解析 ============

  // 解析图片列表
  const displayImages = computed(() => {
    // 优先使用 previewSrcList
    if (props.previewSrcList && props.previewSrcList.length > 0)
      return props.previewSrcList

    // 解析 src
    if (!props.src)
      return []

    if (Array.isArray(props.src))
      return props.src

    // 处理逗号拼接的字符串
    if (typeof props.src === 'string') {
      return props.src
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    }

    return []
  })

  // 预览时的图片列表
  const previewImages = computed(() => {
    if (props.previewSrcList && props.previewSrcList.length > 0)
      return props.previewSrcList
    return displayImages.value
  })

  // 实际显示的图片列表（根据 max 截断）
  const visibleImages = computed(() => {
    return displayImages.value.slice(0, props.max ?? 4)
  })

  // 超出数量
  const hideCount = computed(() => {
    if (displayImages.value.length <= (props.max ?? 4))
      return 0
    return displayImages.value.length - (props.max ?? 4)
  })

  // 显示模式
  const displayMode = computed(() => {
    if (props.mode === 'single')
      return 'single'
    // 使用 visibleImages 判断：只有一张可见图片时才是单图模式
    return visibleImages.value.length === 1 ? 'single' : 'grid'
  })

  // ============ 样式计算 ============

  // 计算最终尺寸值：仅设置宽或高时，两者相同
  const finalWidth = computed(() => props.width ?? props.height ?? 120)
  const finalHeight = computed(() => props.height ?? props.width ?? 120)

  const singleStyle = computed(() => {
    if (props.width !== undefined || props.height !== undefined) {
      return {
        width: getSizeValue(finalWidth.value),
        height: getSizeValue(finalHeight.value),
      }
    }
    return {}
  })

  const listStyle = computed(() => {
    if (props.width !== undefined || props.height !== undefined) {
      return {
        '--image-width': getSizeValue(finalWidth.value),
        '--image-height': getSizeValue(finalHeight.value),
      }
    }
    return {}
  })

  // 处理尺寸值，支持数字或字符串
  function getSizeValue(value: number | string) {
    if (typeof value === 'number')
      return `${value}px`
    return value
  }

  // ============ 预览功能 ============

  const previewVisible = ref(false)
  const previewIndex = ref(0)
  const previewSrc = ref<string>('')
  const previewContainerRef = ref<HTMLElement>()
  const previewImgRef = ref<HTMLImageElement>()

  // 预览相关状态
  const scale = ref(1)
  const rotation = ref(0)
  const position = ref({ x: 0, y: 0 })
  const isDragging = ref(false)
  const dragStart = ref({ x: 0, y: 0 })
  const dragPosition = ref({ x: 0, y: 0 })

  const previewImgStyle = computed(() => ({
    transform: `translate(${position.value.x + dragPosition.value.x}px, ${position.value.y + dragPosition.value.y}px) scale(${scale.value}) rotate(${rotation.value}deg)`,
    transition: isDragging.value ? 'none' : 'transform 0.3s ease',
  }))

  // 打开预览
  function handlePreview(index: number) {
    if (!props.preview)
      return
    previewIndex.value = index
    previewSrc.value = previewImages.value[index] ?? ''
    previewVisible.value = true
    resetTransform()
    emit('preview', index)
  }

  // 关闭预览
  function closePreview() {
    previewVisible.value = false
  }

  // 切换图片（循环）
  function prevImage() {
    previewIndex.value = previewIndex.value > 0 ? previewIndex.value - 1 : previewImages.value.length - 1
    previewSrc.value = previewImages.value[previewIndex.value] ?? ''
    resetTransform()
  }

  function nextImage() {
    previewIndex.value = previewIndex.value < previewImages.value.length - 1 ? previewIndex.value + 1 : 0
    previewSrc.value = previewImages.value[previewIndex.value] ?? ''
    resetTransform()
  }

  // 缩放
  function zoomIn() {
    scale.value = Math.min(scale.value + 0.2, 5)
  }

  function zoomOut() {
    scale.value = Math.max(scale.value - 0.2, 0.2)
  }

  // 旋转
  function rotateLeft() {
    rotation.value -= 90
  }

  function rotateRight() {
    rotation.value += 90
  }

  // 重置变换
  function resetTransform() {
    scale.value = 1
    rotation.value = 0
    position.value = { x: 0, y: 0 }
    dragPosition.value = { x: 0, y: 0 }
  }

  // 滚轮缩放
  function handleWheel(e: WheelEvent) {
    if (e.deltaY < 0)
      zoomIn()
    else
      zoomOut()
  }

  // 拖拽开始
  function handleDragStart(e: MouseEvent) {
    if (scale.value <= 1)
      return

    isDragging.value = true
    dragStart.value = { x: e.clientX, y: e.clientY }

    const handleMove = (moveEvent: MouseEvent) => {
      if (!isDragging.value)
        return
      dragPosition.value = {
        x: moveEvent.clientX - dragStart.value.x,
        y: moveEvent.clientY - dragStart.value.y,
      }
    }

    const handleUp = () => {
      isDragging.value = false
      position.value = {
        x: position.value.x + dragPosition.value.x,
        y: position.value.y + dragPosition.value.y,
      }
      dragPosition.value = { x: 0, y: 0 }
      document.removeEventListener('mousemove', handleMove)
      document.removeEventListener('mouseup', handleUp)
    }

    document.addEventListener('mousemove', handleMove)
    document.addEventListener('mouseup', handleUp)
  }

  // 错误处理
  function handleError(e: Event) {
    emit('error', e)
  }

  // 检查是否显示某个操作按钮
  function hasAction(action: string) {
    if (props.previewActions === true)
      return true
    if (Array.isArray(props.previewActions))
      return props.previewActions.includes(action as ImagePreviewAction)
    return false
  }

  // ESC 关闭预览
  watch(previewVisible, (val) => {
    if (val) {
      const handleEsc = (e: KeyboardEvent) => {
        if (e.key === 'Escape')
          closePreview()
      }
      document.addEventListener('keydown', handleEsc)
      document.body.style.overflow = 'hidden'

      return () => {
        document.removeEventListener('keydown', handleEsc)
        document.body.style.overflow = ''
      }
    }
    else {
      document.body.style.overflow = ''
    }
  })

  return {
    // 解析结果
    displayImages,
    previewImages,
    visibleImages,
    hideCount,
    displayMode,
    // 尺寸样式
    finalWidth,
    finalHeight,
    singleStyle,
    listStyle,
    // 预览状态
    previewVisible,
    previewIndex,
    previewSrc,
    previewContainerRef,
    previewImgRef,
    previewImgStyle,
    // 交互方法
    handlePreview,
    closePreview,
    prevImage,
    nextImage,
    zoomIn,
    zoomOut,
    rotateLeft,
    rotateRight,
    resetTransform,
    handleWheel,
    handleDragStart,
    handleError,
    hasAction,
  }
}
