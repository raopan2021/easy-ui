import type { CropData, ImageCropperEmits, ImageCropperProps } from './types'

import Cropper from 'cropperjs'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'

/**
 * 图片裁剪器核心逻辑（封装 cropperjs 生命周期与交互）。
 *
 * 将原本内联在 image-cropper.vue 中的全部逻辑（初始化 / 销毁 / 裁剪 / 工具栏
 * 操作 / 生命周期 / 事件）抽离为独立 composable，让 .vue 仅承担「组合 + 模板 +
 * defineExpose」职责（对齐 markdown 组件拆分规范）。
 * emit 以 ImageCropperEmits 可调用接口直接标注（不使用 EmitFn<>）。
 *
 * @param props 裁剪器 props
 * @param emit 裁剪器事件（cropped / ready / destroyed / confirm / cancel）
 */
export function useImageCropper(props: ImageCropperProps, emit: ImageCropperEmits) {
  const imgRef = ref<HTMLImageElement | null>(null)
  let cropper: Cropper | null = null

  /** 翻转方向（水平 / 垂直各自维护一个符号，支持连续翻转） */
  let scaleXValue = 1
  let scaleYValue = 1

  /** 初始化裁剪器 */
  function initCropper(): void {
    if (!imgRef.value || !props.src)
      return
    if (!imgRef.value.complete || !imgRef.value.naturalWidth)
      return

    destroyCropper()

    cropper = new Cropper(imgRef.value, {
      aspectRatio: props.aspectRatio,
      viewMode: props.viewMode,
      dragMode: 'crop',
      autoCropArea: props.autoCropArea,
      guides: props.guides,
      center: props.center,
      background: false,
      responsive: true,
      restore: false,
      checkCrossOrigin: true,
      modal: true,
      cropBoxMovable: true,
      cropBoxResizable: true,
      toggleDragModeOnDblclick: false,
      ready() {
        emit('ready')
      },
    })
  }

  /** 图片加载失败 */
  function onImgError() {
    console.error('[EasyImageCropper] 图片加载失败:', props.src)
  }

  /** 销毁裁剪器 */
  function destroyCropper(): void {
    if (cropper) {
      cropper.destroy()
      cropper = null
      emit('destroyed')
    }
  }

  /** 执行裁剪，获取同步裁剪数据 */
  function getCropData(): CropData | null {
    if (!cropper)
      return null

    const canvas = cropper.getCroppedCanvas({
      maxWidth: props.outputWidth || undefined,
      maxHeight: props.outputHeight || undefined,
      imageSmoothingEnabled: true,
      imageSmoothingQuality: 'high',
    })

    const cropBox = cropper.getCropBoxData()
    const imageData = cropper.getImageData()

    return {
      canvas,
      cropBox: {
        left: cropBox.left,
        top: cropBox.top,
        width: cropBox.width,
        height: cropBox.height,
      },
      naturalSize: {
        width: imageData.naturalWidth,
        height: imageData.naturalHeight,
      },
      blob: null,
      dataURL: '',
    }
  }

  /** 获取裁剪结果（含异步生成的 blob 与 dataURL） */
  async function getCroppedData(): Promise<CropData | null> {
    const data = getCropData()
    if (!data)
      return null

    const blob = await new Promise<Blob | null>((resolve) => {
      data.canvas.toBlob(resolve, `image/${props.outputType}`, props.outputQuality)
    })

    data.blob = blob
    data.dataURL = data.canvas.toDataURL(`image/${props.outputType}`, props.outputQuality)

    return data
  }

  // ============ 工具栏事件处理 ============
  /** 旋转指定角度（度） */
  function onRotate(degree: number) {
    cropper?.rotate(degree)
  }

  /** 缩放指定比例 */
  function onZoom(ratio: number) {
    cropper?.zoom(ratio)
  }

  /** 重置裁剪框 */
  function onReset() {
    cropper?.reset()
  }

  /** 水平翻转（每次取反当前方向） */
  function onScaleX() {
    scaleXValue = -scaleXValue
    cropper?.scaleX(scaleXValue)
  }

  /** 垂直翻转（每次取反当前方向） */
  function onScaleY() {
    scaleYValue = -scaleYValue
    cropper?.scaleY(scaleYValue)
  }

  /** 确认裁剪：导出并同步触发 confirm + cropped 事件 */
  async function handleConfirm(): Promise<void> {
    const data = await getCroppedData()
    if (data) {
      emit('confirm', data)
      emit('cropped', data)
    }
  }

  /** 取消：仅触发 cancel 事件 */
  function handleCancel(): void {
    emit('cancel')
  }

  /** 监听 src 变化：有值时初始化，无值时销毁 */
  watch(
    () => props.src,
    (newSrc) => {
      if (newSrc) {
        nextTick(() => {
          if (!imgRef.value)
            return
          if (imgRef.value.complete && imgRef.value.naturalWidth) {
            initCropper()
          }
          else {
            imgRef.value.onload = () => initCropper()
            imgRef.value.onerror = () => onImgError()
          }
        })
      }
      else {
        destroyCropper()
      }
    },
  )

  onMounted(() => {
    if (!props.src || !imgRef.value)
      return
    if (imgRef.value.complete && imgRef.value.naturalWidth) {
      initCropper()
    }
    else {
      imgRef.value.onload = () => initCropper()
      imgRef.value.onerror = () => onImgError()
    }
  })

  onBeforeUnmount(() => {
    destroyCropper()
  })

  // ============ defineExpose 对外方法集（保持原导出面不变）============
  const exposeApi = {
    /** 执行裁剪，返回裁剪数据（同步） */
    crop(): CropData | null {
      return getCropData()
    },
    /** 执行裁剪并触发 cropped 事件 */
    async cropAndEmit(): Promise<CropData | null> {
      const data = await getCroppedData()
      if (data)
        emit('cropped', data)
      return data
    },
    /** 获取裁剪后的 Canvas */
    getCroppedCanvas(): HTMLCanvasElement | null {
      return (
        cropper?.getCroppedCanvas({
          maxWidth: props.outputWidth || undefined,
          maxHeight: props.outputHeight || undefined,
        }) || null
      )
    },
    /** 获取裁剪后的 Blob */
    getCroppedBlob(): Promise<Blob | null> {
      return new Promise((resolve) => {
        const canvas = cropper?.getCroppedCanvas({
          maxWidth: props.outputWidth || undefined,
          maxHeight: props.outputHeight || undefined,
        })
        if (!canvas) {
          resolve(null)
          return
        }
        canvas.toBlob(resolve, `image/${props.outputType}`, props.outputQuality)
      })
    },
    /** 获取裁剪后的 Base64 */
    getCroppedDataURL(): string {
      const canvas = cropper?.getCroppedCanvas({
        maxWidth: props.outputWidth || undefined,
        maxHeight: props.outputHeight || undefined,
      })
      if (!canvas)
        return ''
      return canvas.toDataURL(`image/${props.outputType}`, props.outputQuality)
    },
    /** 重置 */
    reset(): void {
      cropper?.reset()
    },
    /** 旋转 */
    rotate(degree: number): void {
      cropper?.rotate(degree)
    },
    /** 缩放 */
    zoom(ratio: number): void {
      cropper?.zoom(ratio)
    },
    /** 左右翻转 */
    scaleX(): void {
      onScaleX()
    },
    /** 上下翻转 */
    scaleY(): void {
      onScaleY()
    },
    /** 替换图片 */
    replace(url: string, onlyColorChanged?: boolean): void {
      cropper?.replace(url, onlyColorChanged)
    },
    /** 销毁裁剪器 */
    destroy(): void {
      destroyCropper()
    },
  }

  return {
    imgRef,
    onRotate,
    onZoom,
    onReset,
    onScaleX,
    onScaleY,
    onImgError,
    handleConfirm,
    handleCancel,
    exposeApi,
  }
}
