import type { VideoProps } from './types'
import type { VideoCore } from './use-video-core'

import { computed } from 'vue'

/**
 * 封面逻辑：优先使用自定义 `poster`，否则在元数据就绪后捕获视频第一帧。
 *
 * 抽取原 video.vue 中封面相关的 `posterSrc` computed 与 `captureFirstFrame` 方法，
 * 仅依赖 core 中的 video 引用与封面状态，无副作用外溢。
 *
 * @param core  核心响应式状态
 * @param props 组件 props（读取 poster）
 */
export function useVideoPoster(core: VideoCore, props: VideoProps) {
  const { videoRef, firstFramePoster, isFirstFrameCaptured } = core

  /** 封面图地址（有自定义封面用自定义，没有则用第一帧） */
  const posterSrc = computed(() => {
    if (props.poster)
      return props.poster
    return firstFramePoster.value
  })

  /** 捕获视频第一帧作为封面 */
  async function captureFirstFrame() {
    if (!videoRef.value || isFirstFrameCaptured.value)
      return

    try {
      // 创建 canvas 捕获第一帧
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      if (!ctx)
        return

      // 等待视频元数据加载
      if (videoRef.value.readyState < 1) {
        await new Promise<void>((resolve) => {
          videoRef.value?.addEventListener('loadedmetadata', () => resolve(), { once: true })
        })
      }

      // 设置 canvas 尺寸
      canvas.width = videoRef.value.videoWidth || 320
      canvas.height = videoRef.value.videoHeight || 180

      // 跳转到 0.1 秒位置捕获第一帧（避免黑屏）
      const oldTime = videoRef.value.currentTime
      videoRef.value.currentTime = 0.1

      await new Promise<void>((resolve) => {
        videoRef.value?.addEventListener('seeked', () => resolve(), { once: true })
      })

      // 绘制第一帧
      ctx.drawImage(videoRef.value, 0, 0, canvas.width, canvas.height)

      // 恢复原始时间
      videoRef.value.currentTime = oldTime

      // 转换为 Data URL
      firstFramePoster.value = canvas.toDataURL('image/jpeg', 0.8)
      isFirstFrameCaptured.value = true
    }
    catch (e) {
      console.warn('Failed to capture first frame:', e)
    }
  }

  return { posterSrc, captureFirstFrame }
}

/** useVideoPoster 返回值类型（供 controller 等 composable 共享） */
export type VideoPoster = ReturnType<typeof useVideoPoster>
