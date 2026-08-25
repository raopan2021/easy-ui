import type { VideoEmits, VideoProps } from './types'
import type { VideoCore } from './use-video-core'
import type { VideoDanmaku } from './use-video-danmaku'
import type { VideoPlayback } from './use-video-playback'
import type { VideoPoster } from './use-video-poster'

import { onMounted, onUnmounted, watch } from 'vue'

/** 控制栏 composable 依赖的其它 concern composable */
export interface VideoControllerDeps {
  playback: VideoPlayback
  poster: VideoPoster
  danmaku: VideoDanmaku
}

/**
 * 播放器控制 composable
 *
 * 将原本内联在 video.vue 中的控制栏显隐、点击 / 双击、视频元素事件、
 * 全屏 / 键盘监听与生命周期等「编排型」逻辑抽离为独立 composable，
 * 组合 playback / poster / danmaku 三个 concern composable 完成跨域协作。
 *
 * @param core  核心响应式状态
 * @param props 组件 props
 * @param emit  组件 emit
 * @param deps  播放 / 封面 / 弹幕三个 concern composable
 */
export function useVideoController(
  core: VideoCore,
  props: VideoProps,
  emit: VideoEmits,
  deps: VideoControllerDeps,
) {
  const {
    videoRef,
    isPlaying,
    hasPlayed,
    duration,
    volume,
    isMuted,
    controlsVisible,
    isFullscreen,
    hideControlsTimer,
  } = core
  const { playback, poster, danmaku } = deps

  // ──── 控制栏显隐 ────
  /** 显示控制栏并重置隐藏计时器 */
  function showControls() {
    controlsVisible.value = true
    clearHideControlsTimer()
    if (isPlaying.value) {
      startHideControlsTimer()
    }
  }

  /** 隐藏控制栏（播放中才启用计时器） */
  function hideControls() {
    if (isPlaying.value) {
      startHideControlsTimer()
    }
  }

  /** 鼠标移动时显示控制栏 */
  function handleMouseMove() {
    if (isPlaying.value) {
      showControls()
    }
  }

  /** 开始隐藏控制栏计时器（3s） */
  function startHideControlsTimer() {
    clearHideControlsTimer()
    hideControlsTimer.value = setTimeout(() => {
      controlsVisible.value = false
    }, 3000)
  }

  /** 清除隐藏控制栏计时器 */
  function clearHideControlsTimer() {
    if (hideControlsTimer.value) {
      clearTimeout(hideControlsTimer.value)
    }
  }

  // ──── 点击 / 双击 ────
  /** 点击处理：未播放过且显示封面时播放，否则切换播放/暂停 */
  function handleClick() {
    if (props.showPoster && !hasPlayed.value) {
      playback.play()
    }
    else {
      playback.togglePlay()
    }
  }

  /** 双击处理（仅在开启双击全屏时触发） */
  function handleDblclick() {
    if (props.dblclickFullscreen) {
      playback.toggleFullscreen()
    }
  }

  // ──── 视频元素事件 ────
  function handlePlay(e: Event) {
    isPlaying.value = true
    hasPlayed.value = true
    emit('play', e)
  }

  function handlePause(e: Event) {
    isPlaying.value = false
    controlsVisible.value = true
    emit('pause', e)
  }

  function handleEnded(e: Event) {
    isPlaying.value = false
    controlsVisible.value = true
    emit('ended', e)
  }

  function handleTimeUpdate() {
    if (!videoRef.value)
      return
    core.currentTime.value = videoRef.value.currentTime
    emit('timeupdate', core.currentTime.value)

    // 更新缓冲进度
    if (videoRef.value.buffered.length > 0) {
      core.buffered.value = videoRef.value.buffered.end(videoRef.value.buffered.length - 1)
    }
  }

  function handleLoadedMetadata() {
    if (!videoRef.value)
      return
    duration.value = videoRef.value.duration
    core.isLoading.value = false

    // 捕获第一帧作为封面
    if (props.showPoster && !props.poster && !core.isFirstFrameCaptured.value) {
      poster.captureFirstFrame()
    }
  }

  function handleWaiting() {
    core.isLoading.value = true
  }

  function handleCanPlay() {
    core.isLoading.value = false
  }

  function handleError(e: Event) {
    core.isLoading.value = false
    emit('error', e as ErrorEvent)
  }

  /** 全屏状态变化 */
  function handleFullscreenChange() {
    isFullscreen.value = !!document.fullscreenElement
  }

  // ──── 键盘控制 ────
  function handleKeydown(e: KeyboardEvent) {
    if (!videoRef.value)
      return
    // 忽略当焦点在输入框等元素上时
    if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName))
      return

    switch (e.key) {
      case ' ':
      case 'k':
        e.preventDefault()
        playback.togglePlay()
        break
      case 'f':
        e.preventDefault()
        playback.toggleFullscreen()
        break
      case 'm':
        e.preventDefault()
        playback.toggleMute()
        break
      case 'c':
        e.preventDefault()
        danmaku.toggleDanmaku()
        break
      case 'ArrowLeft':
        e.preventDefault()
        videoRef.value.currentTime = Math.max(0, videoRef.value.currentTime - 5)
        break
      case 'ArrowRight':
        e.preventDefault()
        videoRef.value.currentTime = Math.min(duration.value, videoRef.value.currentTime + 5)
        break
      case 'ArrowUp':
        e.preventDefault()
        volume.value = Math.min(1, volume.value + 0.1)
        if (volume.value > 0) {
          isMuted.value = false
        }
        playback.applyVolume()
        break
      case 'ArrowDown':
        e.preventDefault()
        volume.value = Math.max(0, volume.value - 0.1)
        if (volume.value > 0) {
          isMuted.value = false
        }
        playback.applyVolume()
        break
    }
  }

  // ──── 生命周期 ────
  onMounted(() => {
    // 初始化音量
    core.volume.value = props.initialVolume || 0.5
    isMuted.value = !!props.muted
    playback.applyVolume()

    document.addEventListener('fullscreenchange', handleFullscreenChange)
    document.addEventListener('keydown', handleKeydown)
    danmaku.startDanmakuAnimation()
  })

  onUnmounted(() => {
    clearHideControlsTimer()
    document.removeEventListener('fullscreenchange', handleFullscreenChange)
    document.removeEventListener('keydown', handleKeydown)
    danmaku.stopDanmakuAnimation()
  })

  // 监听 props 变化
  watch(
    () => props.initialVolume,
    (val) => {
      core.volume.value = val ?? 0
      if (videoRef.value) {
        videoRef.value.volume = val ?? 0
      }
    },
  )

  watch(
    () => props.muted,
    (val) => {
      isMuted.value = !!val
      playback.applyVolume()
    },
  )

  return {
    showControls,
    hideControls,
    handleMouseMove,
    handleClick,
    handleDblclick,
    handlePlay,
    handlePause,
    handleEnded,
    handleTimeUpdate,
    handleLoadedMetadata,
    handleWaiting,
    handleCanPlay,
    handleError,
    handleFullscreenChange,
    handleKeydown,
  }
}
