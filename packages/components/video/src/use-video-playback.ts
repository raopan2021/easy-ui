import type { VideoCore } from './use-video-core'

import { computed } from 'vue'

/**
 * 播放控制：播放 / 暂停 / 跳转 / 音量 / 速度 / 全屏，以及进度与音量百分比派生值。
 *
 * 抽取原 video.vue 中播放控制相关的方法与 computed，依赖 core 共享的 video 引用
 * 与音量 / 速度 / 控制栏状态。键盘与事件处理 composable 复用这里的 `play` /
 * `togglePlay` / `toggleMute` / `toggleFullscreen` / `applyVolume` 等方法。
 *
 * @param core 核心响应式状态
 */
export function useVideoPlayback(core: VideoCore) {
  const {
    videoRef,
    isPlaying,
    volume,
    isMuted,
    isDragging,
    volumeHover,
    speedMenuVisible,
    playbackRate,
    duration,
    currentTime,
    buffered,
  } = core

  // 音量轨道位置（拖动时记录，非响应式）
  let volumeTrackRect: DOMRect | null = null

  // ──── 进度 / 音量派生值 ────
  /** 播放进度百分比 */
  const playedPercent = computed(() => {
    if (!duration.value)
      return 0
    return (currentTime.value / duration.value) * 100
  })

  /** 缓冲进度百分比 */
  const bufferedPercent = computed(() => {
    if (!duration.value)
      return 0
    return (buffered.value / duration.value) * 100
  })

  /** 音量百分比 */
  const volumePercent = computed(() => {
    if (isMuted.value)
      return 0
    return Math.round(volume.value * 100)
  })

  // ──── 播放 / 暂停 / 跳转 ────
  /** 播放 */
  function play() {
    if (!videoRef.value)
      return
    videoRef.value.play()
  }

  /** 暂停 */
  function pause() {
    if (!videoRef.value)
      return
    videoRef.value.pause()
  }

  /** 切换播放 / 暂停 */
  function togglePlay() {
    if (isPlaying.value) {
      pause()
    }
    else {
      play()
    }
  }

  /** 跳转播放进度（点击进度条） */
  function seekTo(e: MouseEvent) {
    if (!videoRef.value || !duration.value)
      return
    const progressEl = e.currentTarget as HTMLElement
    const rect = progressEl.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const time = percent * duration.value
    videoRef.value.currentTime = time
  }

  /** 跳转到指定时间 */
  function seekToTime(time: number) {
    if (!videoRef.value)
      return
    videoRef.value.currentTime = time
  }

  // ──── 音量 ────
  /** 设置视频音量（含静音） */
  function applyVolume() {
    if (!videoRef.value)
      return
    const v = volume.value > 0 ? volume.value : 0
    videoRef.value.volume = v
    videoRef.value.muted = isMuted.value
  }

  /** 切换静音 */
  function toggleMute() {
    isMuted.value = !isMuted.value
    applyVolume()
  }

  /** 点击音量轨道 */
  function handleVolumeClick(e: MouseEvent) {
    const trackEl = e.currentTarget as HTMLElement
    const rect = trackEl.getBoundingClientRect()
    const percent = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    volume.value = percent
    if (percent > 0) {
      isMuted.value = false
    }
    applyVolume()
  }

  /** 拖动开始 */
  function startVolumeDrag(e: MouseEvent) {
    e.preventDefault()
    e.stopPropagation()

    const trackEl = e.currentTarget as HTMLElement
    volumeTrackRect = trackEl.getBoundingClientRect()

    // 立即计算并更新音量
    const percent = Math.max(0, Math.min(1, (e.clientX - volumeTrackRect.left) / volumeTrackRect.width))
    volume.value = percent
    if (percent > 0) {
      isMuted.value = false
    }
    applyVolume()

    isDragging.value = true
    document.addEventListener('mousemove', onVolumeDrag)
    document.addEventListener('mouseup', stopVolumeDrag)
  }

  /** 拖动中 */
  function onVolumeDrag(e: MouseEvent) {
    if (!isDragging.value || !volumeTrackRect)
      return

    const percent = Math.max(0, Math.min(1, (e.clientX - volumeTrackRect.left) / volumeTrackRect.width))
    volume.value = percent
    if (percent > 0) {
      isMuted.value = false
    }
    applyVolume()
  }

  /** 拖动结束 */
  function stopVolumeDrag() {
    isDragging.value = false
    volumeTrackRect = null
    document.removeEventListener('mousemove', onVolumeDrag)
    document.removeEventListener('mouseup', stopVolumeDrag)
  }

  /** 音量区域鼠标进入 */
  function handleVolumeEnter() {
    volumeHover.value = true
  }

  /** 音量区域鼠标离开 */
  function handleVolumeLeave() {
    volumeHover.value = false
  }

  // ──── 播放速度 ────
  /** 切换播放速度菜单 */
  function toggleSpeedMenu() {
    speedMenuVisible.value = !speedMenuVisible.value
  }

  /** 设置播放速度 */
  function setPlaybackRate(rate: number) {
    if (!videoRef.value)
      return
    playbackRate.value = rate
    videoRef.value.playbackRate = rate
    speedMenuVisible.value = false
  }

  // ──── 全屏 ────
  /** 切换全屏 */
  function toggleFullscreen() {
    const container = videoRef.value?.parentElement?.closest('.easy-video')
    if (!container)
      return

    if (!document.fullscreenElement) {
      container.requestFullscreen()
    }
    else {
      document.exitFullscreen()
    }
  }

  // ──── 工具 ────
  /** 格式化时间（秒 → mm:ss） */
  function formatTime(seconds: number): string {
    if (!seconds || Number.isNaN(seconds))
      return '00:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return {
    playedPercent,
    bufferedPercent,
    volumePercent,
    play,
    pause,
    togglePlay,
    seekTo,
    seekToTime,
    applyVolume,
    toggleMute,
    handleVolumeClick,
    startVolumeDrag,
    onVolumeDrag,
    stopVolumeDrag,
    handleVolumeEnter,
    handleVolumeLeave,
    toggleSpeedMenu,
    setPlaybackRate,
    toggleFullscreen,
    formatTime,
  }
}

/** useVideoPlayback 返回值类型（供 controller 等 composable 共享） */
export type VideoPlayback = ReturnType<typeof useVideoPlayback>
