import type { Danmaku, VideoProps } from './types'

import { computed, ref } from 'vue'

/**
 * 视频播放器核心响应式状态（集中管理，供各 concern composable 共享）。
 *
 * 抽取原 video.vue 中大量分散的 `ref` / `Map` / 常量，让 video.vue 仅承担
 * 「组合 + 模板」职责（对齐 markdown / progress 组件拆分规范）。
 *
 * @param props 组件 props（用于派生容器尺寸）
 */
export function useVideoCore(props: VideoProps) {
  /** 原生 video 元素引用 */
  const videoRef = ref<HTMLVideoElement>()
  /** 弹幕层容器引用 */
  const danmakuContainerRef = ref<HTMLElement>()

  // ──── 播放状态 ────
  const isPlaying = ref(false)
  const hasPlayed = ref(false)
  const isLoading = ref(true)

  // ──── 进度 ────
  const currentTime = ref(0)
  const duration = ref(0)
  const buffered = ref(0)

  // ──── 音量 ────
  const volume = ref(0.5) // 实际音量
  const isMuted = ref(false) // 静音状态
  const isDragging = ref(false) // 是否正在拖动
  const volumeHover = ref(false) // 鼠标是否在音量区域

  // ──── 全屏 / 控制栏 ────
  const isFullscreen = ref(false)
  const controlsVisible = ref(true)
  const speedMenuVisible = ref(false)
  const playbackRate = ref(1)

  // ──── 封面 ────
  const firstFramePoster = ref('')
  const isFirstFrameCaptured = ref(false)

  // ──── 弹幕状态 ────
  const danmakuVisible = ref(true)
  const danmakuListVisible = ref(false)
  const danmakuInputText = ref('')
  const danmakuColor = ref('#ffffff')
  // 颜色选择器是否显示
  const colorPickerVisible = ref(false)
  // 弹幕动画帧句柄
  const danmakuAnimationFrame = ref<number>()
  // 用户发送的弹幕
  const sentDanmaku = ref<Danmaku[]>([])
  // 防止重复发送
  const isSending = ref(false)
  // 弹幕实例（渲染中的）
  const activeDanmaku = ref<(Danmaku & { style: Record<string, string>, offset: number })[]>([])
  // 每个轨道的占用计数（重置时使用）
  const danmakuTracks = ref<number[]>(Array.from<number>({ length: 10 }).fill(0))

  // 记录每个弹幕 ID 对应的轨道（确保弹幕始终在同一轨道）
  const danmakuTrackMap = new Map<number, number>()
  // 记录每个轨道的"释放时间"，用于避免轨道冲突
  const trackReleaseTime = new Map<number, number>()

  // 控制栏隐藏计时器句柄
  const hideControlsTimer = ref<ReturnType<typeof setTimeout>>()

  // ──── 弹幕常量 ────
  // 弹幕颜色选项
  const danmakuColors = ['#ffffff', '#FE0302', '#FF7204', '#FFFF00', '#00FF00', '#00FFFF', '#4A5BEE', '#FF39C4']
  // 轨道数量
  const danmakuTrackCount = 10
  // 滚动时长（秒）
  const scrollDuration = 12

  // ──── 容器样式（宽高）────
  const containerStyle = computed<Record<string, string>>(() => {
    const style: Record<string, string> = {}
    const width = typeof props.width === 'number' ? `${props.width}px` : props.width
    const height = typeof props.height === 'number' ? `${props.height}px` : props.height
    style.width = width ?? ''
    style.height = height ?? ''
    return style
  })

  return {
    videoRef,
    danmakuContainerRef,
    isPlaying,
    hasPlayed,
    isLoading,
    currentTime,
    duration,
    buffered,
    volume,
    isMuted,
    isDragging,
    volumeHover,
    isFullscreen,
    controlsVisible,
    speedMenuVisible,
    playbackRate,
    firstFramePoster,
    isFirstFrameCaptured,
    danmakuVisible,
    danmakuListVisible,
    danmakuInputText,
    danmakuColor,
    colorPickerVisible,
    danmakuAnimationFrame,
    sentDanmaku,
    isSending,
    activeDanmaku,
    danmakuTracks,
    danmakuTrackMap,
    trackReleaseTime,
    hideControlsTimer,
    danmakuColors,
    danmakuTrackCount,
    scrollDuration,
    containerStyle,
  }
}

/** useVideoCore 返回值类型（供其它 composable 共享同一状态对象） */
export type VideoCore = ReturnType<typeof useVideoCore>
