<script setup lang="ts">
import type { VideoEmits, VideoProps } from './types'

import EasyButton from '../../button'
import EasyIcon from '../../icon'
import { useVideoController } from './use-video-controller'
import { useVideoCore } from './use-video-core'
import { useVideoDanmaku } from './use-video-danmaku'
import { useVideoPlayback } from './use-video-playback'
import { useVideoPoster } from './use-video-poster'

// 保持对外类型导出兼容（原定义在 video.vue）
export type { Danmaku, VideoEmits, VideoProps } from './types'

defineOptions({ name: 'EasyVideo' })

const props = withDefaults(defineProps<VideoProps>(), {
  src: '',
  poster: '',
  autoplay: false,
  muted: true, // 默认静音
  loop: false,
  preload: 'auto',
  width: '100%',
  height: 540,
  controls: true,
  showPoster: true,
  showSpeed: true,
  showVolume: true,
  showFullscreen: true,
  dblclickFullscreen: true,
  danmakuEnabled: true,
  showDanmakuToggle: true,
  showDanmakuInput: true,
  showDanmakuList: true,
  danmaku: () => [],
  viewCount: 0,
  initialVolume: 0,
  playbackRates: () => [0.5, 0.75, 1, 1.25, 1.5, 2],
})

const emit = defineEmits<VideoEmits>()

// ──── 核心状态（所有响应式 ref / Map / 常量集中管理）────
const core = useVideoCore(props)

// ──── 播放控制（进度 / 音量 / 速度 / 全屏 / 时间格式化）────
const playback = useVideoPlayback(core)
const {
  playedPercent,
  bufferedPercent,
  volumePercent,
  play,
  togglePlay,
  seekTo,
  seekToTime,
  toggleMute,
  handleVolumeClick,
  startVolumeDrag,
  handleVolumeEnter,
  handleVolumeLeave,
  toggleSpeedMenu,
  setPlaybackRate,
  toggleFullscreen,
  formatTime,
} = playback

// ──── 封面（自定义 poster 优先，否则捕获视频第一帧）────
const { posterSrc, captureFirstFrame } = useVideoPoster(core, props)

// ──── 弹幕系统（颜色 / 开关 / 列表 / 发送 / 逐帧轨道动画）────
const danmaku = useVideoDanmaku(core, props, emit)
const {
  danmakuPoints,
  danmakuList,
  toggleColorPicker,
  selectColor,
  toggleDanmaku,
  toggleDanmakuList,
  handleSendDanmaku,
} = danmaku

// ──── 事件 / 控制栏 / 键盘 / 生命周期 ────
const {
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
} = useVideoController(core, props, emit, {
  playback,
  poster: { posterSrc, captureFirstFrame },
  danmaku,
})

// ──── 模板所需状态（从 core 解构）────
const {
  videoRef,
  danmakuContainerRef,
  isPlaying,
  hasPlayed,
  isLoading,
  currentTime,
  duration,
  isMuted,
  isFullscreen,
  controlsVisible,
  speedMenuVisible,
  playbackRate,
  danmakuVisible,
  danmakuListVisible,
  danmakuInputText,
  danmakuColor,
  colorPickerVisible,
  activeDanmaku,
  danmakuColors,
  isSending,
  containerStyle,
} = core
</script>

<template>
  <div class="easy-video-wrapper">
    <!-- 视频播放器容器 -->
    <div
      class="easy-video" :class="{ 'is-fullscreen': isFullscreen, 'is-hover': controlsVisible }"
      :style="containerStyle" @mouseenter="showControls" @mouseleave="hideControls" @mousemove="handleMouseMove"
      @click="handleClick" @dblclick="handleDblclick"
    >
      <!-- 封面图 -->
      <div v-if="showPoster && !hasPlayed" class="easy-video__poster" @click="play">
        <img v-if="posterSrc" :src="posterSrc" class="easy-video__poster-img">
        <div v-else class="easy-video__poster-placeholder">
          <svg viewBox="0 0 24 24" width="64" height="64">
            <path
              fill="currentColor"
              d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"
            />
          </svg>
        </div>
        <div class="easy-video__play-btn">
          <svg viewBox="0 0 24 24" width="48" height="48">
            <path fill="currentColor" d="M8 5v14l11-7z" />
          </svg>
        </div>
      </div>

      <!-- 视频元素 -->
      <video
        ref="videoRef" class="easy-video__player" crossorigin="anonymous" :src="src"
        :poster="!showPoster || hasPlayed ? undefined : posterSrc" :autoplay="autoplay" :muted="muted" :loop="loop"
        :preload="preload" @play="handlePlay" @pause="handlePause" @ended="handleEnded" @timeupdate="handleTimeUpdate"
        @loadedmetadata="handleLoadedMetadata" @waiting="handleWaiting" @canplay="handleCanPlay" @error="handleError"
      />

      <!-- 弹幕层 -->
      <div v-if="danmakuEnabled" ref="danmakuContainerRef" class="easy-video__danmaku-container">
        <div
          v-for="dm in activeDanmaku" v-show="danmakuVisible" :key="dm.id" class="easy-video__danmaku-item"
          :class="dm.mode" :style="dm.style"
        >
          <span class="easy-video__danmaku-text">{{ dm.text }}</span>
        </div>
      </div>

      <!-- 加载中遮罩 -->
      <div v-if="isLoading" class="easy-video__loading">
        <div class="easy-video__spinner" />
      </div>

      <!-- 控制栏 -->
      <div
        v-show="controlsVisible || !isPlaying || isFullscreen" class="easy-video__controls"
        :class="{ 'is-show': controlsVisible || !isPlaying || isFullscreen }" @click.stop @dblclick.stop
      >
        <!-- 进度条 -->
        <div class="easy-video__progress-wrap" @click.stop @dblclick.stop>
          <div class="easy-video__progress" @click="seekTo">
            <div class="easy-video__progress-buffered" :style="{ width: `${bufferedPercent}%` }" />
            <div class="easy-video__progress-played" :style="{ width: `${playedPercent}%` }">
              <div class="easy-video__progress-thumb" />
            </div>
            <!-- 弹幕预览点 -->
            <template v-for="dm in danmakuPoints" :key="dm.time">
              <div
                v-if="danmakuEnabled" class="easy-video__progress-danmaku" :style="{ left: `${dm.percent}%` }"
                :title="dm.text"
              />
            </template>
          </div>
        </div>

        <!-- 控制按钮 -->
        <div class="easy-video__controls-inner">
          <!-- 左侧控制 -->
          <div class="easy-video__controls-left">
            <!-- 播放/暂停  -->
            <div class="easy-video__btn-play" @click="togglePlay">
              <svg v-if="isPlaying" viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
              </svg>
              <svg v-else viewBox="0 0 24 24" width="20" height="20">
                <path fill="currentColor" d="M8 5v14l11-7z" />
              </svg>
            </div>

            <!-- 当前时间 / 总时长 -->
            <div class="easy-video__time">
              {{ formatTime(currentTime) }} / {{ formatTime(duration) }}
            </div>
          </div>

          <!-- 右侧控制 - 按B站图片顺序 -->
          <div class="easy-video__controls-right">
            <!-- 弹幕开关 -->
            <div
              v-if="danmakuEnabled && showDanmakuToggle" class="easy-video__btn"
              :class="{ 'is-active': danmakuVisible }" @click.stop="toggleDanmaku"
            >
              <span class="easy-video__btn-text">{{ danmakuVisible ? '弹幕' : '弹幕' }}</span>
            </div>

            <!-- 播放速度 -->
            <div v-if="showSpeed" class="easy-video__speed" @click.stop="toggleSpeedMenu">
              <span class="easy-video__speed-text">{{ playbackRate }}x</span>
              <div v-show="speedMenuVisible" class="easy-video__speed-menu">
                <div
                  v-for="rate in playbackRates" :key="rate" class="easy-video__speed-item"
                  :class="{ 'is-active': playbackRate === rate }" @click.stop="setPlaybackRate(rate)"
                >
                  {{ rate }}x
                </div>
              </div>
            </div>

            <!-- 音量控制 -->
            <div
              v-if="showVolume" class="easy-video__volume" @mouseenter="handleVolumeEnter"
              @mouseleave="handleVolumeLeave"
            >
              <!-- 静音按钮 -->
              <div class="easy-video__volume-btn" @click.stop="toggleMute">
                <!-- 静音图标 -->
                <svg v-if="isMuted || volumePercent === 0" viewBox="0 0 24 24" width="20" height="20">
                  <path
                    fill="currentColor"
                    d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"
                  />
                </svg>
                <!-- 低音量图标 -->
                <svg v-else-if="volumePercent < 30" viewBox="0 0 24 24" width="20" height="20">
                  <path
                    fill="currentColor"
                    d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"
                  />
                </svg>
                <!-- 中音量图标 -->
                <svg v-else-if="volumePercent < 70" viewBox="0 0 24 24" width="20" height="20">
                  <path
                    fill="currentColor"
                    d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5zm6.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z"
                  />
                </svg>
                <!-- 高音量图标 -->
                <svg v-else viewBox="0 0 24 24" width="20" height="20">
                  <path
                    fill="currentColor"
                    d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
                  />
                </svg>
              </div>

              <!-- 水平音量滑块 -->
              <div class="easy-video__volume-slider">
                <div class="easy-video__volume-track" @mousedown="startVolumeDrag" @click.stop="handleVolumeClick">
                  <div class="easy-video__volume-progress" :style="{ width: `${volumePercent}%` }" />
                  <div class="easy-video__volume-handle" :style="{ left: `${volumePercent}%` }" />
                </div>
              </div>

              <!-- 音量数值 -->
              <div class="easy-video__volume-value" :class="{ 'is-muted': isMuted }">
                {{ Math.round(volumePercent) }}
              </div>
            </div>

            <!-- 全屏 - 始终显示 -->
            <div class="easy-video__btn" @click="toggleFullscreen">
              <svg v-if="isFullscreen" viewBox="0 0 24 24" width="18" height="18">
                <path
                  fill="currentColor"
                  d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z"
                />
              </svg>
              <svg v-else viewBox="0 0 24 24" width="18" height="18">
                <path
                  fill="currentColor"
                  d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
                />
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 大播放按钮（暂停时显示） -->
      <div v-if="!isPlaying && hasPlayed" class="easy-video__big-play" @click="play">
        <svg viewBox="0 0 24 24" width="56" height="56">
          <path fill="currentColor" d="M8 5v14l11-7z" />
        </svg>
      </div>

      <!-- 弹幕列表面板 -->
      <transition name="slide-right">
        <div v-if="danmakuEnabled && danmakuListVisible" class="easy-video__danmaku-panel" @click.stop>
          <div class="easy-video__danmaku-panel-header">
            <span>弹幕列表</span>
            <span class="easy-video__danmaku-panel-count">{{ danmakuList.length }}条</span>
            <EasyButton type="text" size="small" @click="danmakuListVisible = false">
              <EasyIcon name="el:Close" :size="16" />
            </EasyButton>
          </div>
          <div class="easy-video__danmaku-panel-list">
            <div
              v-for="(dm, index) in danmakuList" :key="index" class="easy-video__danmaku-panel-item"
              @click="seekToTime(dm.time)"
            >
              <span class="easy-video__danmaku-panel-time">{{ formatTime(dm.time) }}</span>
              <span class="easy-video__danmaku-panel-text" :style="{ color: dm.color }">{{ dm.text }}</span>
            </div>
          </div>
        </div>
      </transition>
    </div>

    <!-- 弹幕输入区域（播放器下方）- 完全按B站图片 -->
    <div v-if="danmakuEnabled && showDanmakuInput" class="easy-video__danmaku-bar">
      <div class="easy-video__danmaku-bar-inner">
        <!-- 左侧：弹幕数 + 图标 -->
        <div class="easy-video__danmaku-left">
          <span class="easy-video__danmaku-info">
            已装填
            <span class="easy-video__danmaku-count" @click.stop="toggleDanmakuList">
              {{ danmakuList.length }}
            </span>
            条弹幕
            <span v-if="!danmakuEnabled">（已关闭）</span>
          </span>
        </div>

        <!-- 中间：输入框 -->
        <div class="easy-video__danmaku-input-area">
          <input
            v-model="danmakuInputText" type="text" class="easy-video__danmaku-input" placeholder="发个友善的弹幕见证当下"
            maxlength="20" @keydown.enter.stop="handleSendDanmaku"
          >
        </div>

        <!-- 右侧：颜色选择 + 发送 -->
        <div class="easy-video__danmaku-right">
          <!-- 颜色选择器 -->
          <div class="easy-video__danmaku-color-picker" @click.stop>
            <div class="easy-video__danmaku-color-btn" @click.stop="toggleColorPicker">
              <span class="easy-video__danmaku-color-current" :style="{ background: danmakuColor }" />
            </div>
            <!-- 颜色选择面板 -->
            <transition name="fade">
              <div v-show="colorPickerVisible" class="easy-video__danmaku-color-panel">
                <div
                  v-for="color in danmakuColors" :key="color" class="easy-video__danmaku-color-item"
                  :class="{ 'is-active': danmakuColor === color }" :style="{ background: color }"
                  @click.stop="selectColor(color)"
                >
                  <svg v-if="danmakuColor === color" viewBox="0 0 24 24" width="14" height="14">
                    <path fill="#fff" d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                  </svg>
                </div>
              </div>
            </transition>
          </div>

          <button
            type="button" class="easy-video__danmaku-send" :disabled="!danmakuInputText.trim() || isSending"
            @click.stop="handleSendDanmaku"
          >
            发送
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
@use '../../../easy-ui/src/styles/tokens' as *;

/* ========== 设计令牌 ========== */
// 播放器主题色被 rgba() 函数计算依赖，保留局部变量；与公共 tokens 重复的值引用 tokens
$color-primary-light: #00c8ff;
$color-primary-dark: #007bb0;
$color-white: $white;
$color-black: $black;
$color-bg-dark: $mask-heavy;
$color-bg-darker: $mask-solid;
$color-bg-glass: rgba(20, 20, 30, 0.85);
$color-bg-panel: rgba(0, 0, 0, 0.9);
$color-text-light: $white;
$color-text-muted: $white-muted;
$color-text-dim: $white-dim;
$radius-base: 6px;
$radius-sm: 4px;
$radius-lg: 8px;
$transition-fast: 0.15s;
$transition-normal: 0.25s;

/* ========== 外包装 ========== */
.easy-video-wrapper {
  width: 100%;
}

/* ========== 视频容器 ========== */
.easy-video {
  position: relative;
  width: 100%;
  background: $color-black;
  border-radius: $radius-base;
  overflow: hidden;
  user-select: none;

  &.is-fullscreen {
    border-radius: 0;
  }

  &:hover {
    .easy-video__controls {
      opacity: 1;
    }
  }

  /* 封面图 */
  .easy-video__poster {
    position: absolute;
    inset: 0;
    z-index: 2;
    cursor: pointer;

    &-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    &-placeholder {
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);

      .easy-icon {
        color: var(--el-fill-color-light);
      }
    }
  }

  .easy-video__play-btn {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 72px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--el-color-primary-light-9);
    border-radius: 50%;
    color: $color-white;
    transition: all $transition-normal;
    box-shadow:
      0 4px 16px rgba(var(--el-color-primary), 0.4),
      0 8px 32px rgba(0, 0, 0, 0.3);

    svg {
      margin-left: 3px; // 视觉居中
    }

    &:hover {
      transform: translate(-50%, -50%) scale(1.08);
      background: var(--el-color-primary);
      box-shadow:
        0 6px 20px rgba(var(--el-color-primary), 0.5),
        0 12px 40px rgba(0, 0, 0, 0.35);
    }
  }

  /* 视频播放器 */
  .easy-video__player {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    background: $color-black;
    z-index: 0;
  }

  /* 加载中 */
  .easy-video__loading {
    position: absolute;
    inset: 0;
    z-index: 3;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.5);
  }

  .easy-video__spinner {
    width: 40px;
    height: 40px;
    border: 3px solid rgba($color-white, 0.2);
    border-top-color: $color-white;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }

  /* 大播放按钮 */
  .easy-video__big-play {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
    width: 72px;
    height: 72px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--el-color-primary-light-9);
    border-radius: 50%;
    color: $color-white;
    cursor: pointer;
    transition: all $transition-normal;
    box-shadow:
      0 4px 16px rgba(var(--el-color-primary), 0.4),
      0 8px 32px rgba(0, 0, 0, 0.3);

    &:hover {
      transform: translate(-50%, -50%) scale(1.08);
      background: var(--el-color-primary);
      box-shadow:
        0 6px 20px rgba(var(--el-color-primary), 0.5),
        0 12px 40px rgba(0, 0, 0, 0.35);
    }

    svg {
      margin-left: 3px; // 视觉居中
    }
  }

  /* ========== 弹幕层 ========== */
  .easy-video__danmaku-container {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 1;
    pointer-events: none;
    overflow: hidden;
  }

  .easy-video__danmaku-item {
    position: absolute;
    white-space: nowrap;
    font-size: 18px;
    font-weight: 500;
    line-height: 1.4;
    text-shadow:
      1px 1px 2px rgba(0, 0, 0, 0.8),
      -1px -1px 2px rgba(0, 0, 0, 0.8);
    will-change: left, transform;
    transform: translateZ(0);

    /* 顶部弹幕 */
    &.top {
      left: 50%;
      transform: translateX(-50%);
      top: 10%;
    }

    /* 底部弹幕 */
    &.bottom {
      left: 50%;
      transform: translateX(-50%);
      top: 90%;
    }
  }

  .easy-video__danmaku-text {
    display: block;
  }

  /* ========== 控制栏 ========== */
  .easy-video__controls {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 10;
    padding: 24px 20px 14px;
    background: linear-gradient(to top, rgba(0, 0, 0, 0.85) 0%, rgba(0, 0, 0, 0.4) 50%, transparent 100%);
    opacity: 0;
    transition: opacity $transition-normal;

    &.is-show {
      opacity: 1;
    }
  }

  .easy-video__controls-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .easy-video__controls-left,
  .easy-video__controls-right {
    display: flex;
    align-items: center;
    gap: 2px;
  }

  .easy-video__btn {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 8px 10px;
    color: $color-text-light;
    border-radius: $radius-sm;
    cursor: pointer;
    transition: all $transition-fast;

    &:hover {
      background: var(--el-fill-color-light);
    }

    &.is-active {
      color: var(--el-color-primary);
      background: var(--el-color-primary-light-9);
    }

    .easy-video__btn-text {
      font-size: 13px;
      font-weight: 500;
    }
  }

  /* 无圆圈播放按钮 */
  .easy-video__btn-play {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    color: $color-text-light;
    cursor: pointer;
    transition: all $transition-fast;

    &:hover {
      color: var(--el-color-primary);
    }
  }

  /* 清晰度按钮 */
  .easy-video__quality {
    font-size: 12px;
    color: $color-text-muted;
  }

  .easy-video__time {
    color: $color-text-light;
    font-size: 13px;
    margin-left: 12px;
    font-variant-numeric: tabular-nums;
    font-family: 'SF Mono', 'Monaco', 'Menlo', monospace;
  }

  /* 进度条 */
  .easy-video__progress-wrap {
    padding: 10px 0;
    cursor: pointer;
  }

  .easy-video__progress {
    position: relative;
    height: 4px;
    background: var(--el-fill-color-light);
    border-radius: 2px;
    transition: height $transition-fast;

    &:hover {
      height: 5px;

      .easy-video__progress-thumb {
        opacity: 1;
        transform: translateY(-50%) scale(1);
      }
    }
  }

  .easy-video__progress-buffered {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: var(--el-fill-color-light);
    border-radius: 2px;
  }

  .easy-video__progress-played {
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    background: var(--el-color-primary);
    border-radius: 2px;
  }

  .easy-video__progress-thumb {
    position: absolute;
    right: -6px;
    top: 50%;
    transform: translateY(-50%) scale(0);
    width: 12px;
    height: 12px;
    background: $color-white;
    border-radius: 50%;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    opacity: 0;
    transition: all $transition-fast;
  }

  .easy-video__progress-danmaku {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    width: 3px;
    height: 3px;
    background: var(--el-color-primary);
    border-radius: 50%;
    opacity: 0.7;
    cursor: pointer;

    &:hover {
      transform: translateY(-50%) scale(1.5);
      opacity: 1;
    }
  }

  /* 播放速度 */
  .easy-video__speed {
    position: relative;
    cursor: pointer;

    &-text {
      color: $color-text-light;
      font-size: 13px;
      padding: 8px 12px;
      display: block;
      border-radius: $radius-sm;
      transition: all $transition-fast;
      font-weight: 500;

      &:hover {
        background: var(--el-fill-color-light);
      }
    }

    &-menu {
      position: absolute;
      bottom: 100%;
      right: 0;
      margin-bottom: 10px;
      background: $color-bg-glass;
      backdrop-filter: blur(10px);
      -webkit-backdrop-filter: blur(10px);
      border: 1px solid rgba($color-white, 0.1);
      border-radius: $radius-lg;
      padding: 6px 0;
      min-width: 80px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
      animation: menuSlideIn 0.2s ease;
    }

    @keyframes menuSlideIn {
      from {
        opacity: 0;
        transform: translateY(6px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    &-item {
      color: $color-text-muted;
      font-size: 13px;
      padding: 8px 16px;
      text-align: center;
      transition: all $transition-fast;

      &:hover {
        color: $color-white;
        background: var(--el-fill-color-light);
      }

      &.is-active {
        color: var(--el-color-primary);
        background: var(--el-color-primary-light-9);
        font-weight: 600;
      }
    }
  }

  /* 音量 */
  .easy-video__volume {
    position: relative;
    display: flex;
    align-items: center;
    gap: 8px;
    z-index: 15;

    &-btn {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      color: $color-text-light;
      cursor: pointer;
      border-radius: $radius-sm;
      transition: all $transition-fast;

      &:hover {
        color: var(--el-color-primary);
        background: var(--el-fill-color-light);
      }
    }

    &-slider {
      width: 80px;
      height: 24px;
      display: flex;
      align-items: center;
    }

    &-track {
      position: relative;
      width: 100%;
      height: 4px;
      background: var(--el-fill-color-light);
      border-radius: 2px;
      cursor: pointer;
      transition: height $transition-fast;

      &:hover {
        height: 6px;

        .easy-video__volume-handle {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }
      }
    }

    &-progress {
      position: absolute;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
      height: 100%;
      background: var(--el-color-primary);
      border-radius: 2px;
      transition: width 0.05s;
    }

    &-handle {
      position: absolute;
      top: 50%;
      left: 0;
      transform: translate(-50%, -50%) scale(0);
      width: 14px;
      height: 14px;
      background: var(--el-bg-color);
      border-radius: 50%;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
      cursor: grab;
      opacity: 0;
      transition: all $transition-fast;

      &:active {
        cursor: grabbing;
        transform: translate(-50%, -50%) scale(1.1);
      }
    }

    &-value {
      min-width: 36px;
      font-size: 12px;
      color: $color-text-light;
      font-variant-numeric: tabular-nums;
      text-align: right;
      transition: color $transition-fast;

      &.is-muted {
        color: $color-text-dim;
      }
    }
  }

  /* ========== 弹幕列表面板 ========== */
  .easy-video__danmaku-panel {
    position: absolute;
    top: 0;
    right: 0;
    width: 300px;
    height: 100%;
    z-index: 20;
    background: $color-bg-panel;
    backdrop-filter: blur(15px);
    -webkit-backdrop-filter: blur(15px);
    border-left: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    flex-direction: column;

    &-header {
      display: flex;
      align-items: center;
      padding: 14px 16px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
      font-size: 14px;
      font-weight: 600;
      color: $color-white;

      .easy-video__danmaku-panel-count {
        margin-left: auto;
        margin-right: 6px;
        font-size: 12px;
        color: $color-text-muted;
        font-weight: 400;
      }
    }

    &-list {
      flex: 1;
      overflow-y: auto;
      padding: 6px 0;

      &::-webkit-scrollbar {
        width: 5px;
      }

      &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.15);
        border-radius: 3px;
      }
    }

    &-item {
      display: flex;
      align-items: flex-start;
      padding: 8px 16px;
      cursor: pointer;
      transition: background $transition-fast;

      &:hover {
        background: rgba(255, 255, 255, 0.05);
      }
    }

    &-time {
      flex-shrink: 0;
      font-size: 12px;
      color: $color-text-muted;
      font-family: 'SF Mono', 'Monaco', 'Menlo', monospace;
      margin-right: 10px;
    }

    &-text {
      font-size: 13px;
      line-height: 1.5;
      word-break: break-all;
    }
  }
}

/* 弹幕列表面板动画 */
.slide-right-enter-active,
.slide-right-leave-active {
  transition:
    transform 0.25s ease,
    opacity 0.25s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* ========== 弹幕工具栏（播放器下方）- 完全按B站图片 ========== */
.easy-video__danmaku-bar {
  background: var(--el-bg-color);
  border-radius: 0 0 8px 8px;
  border: 1px solid var(--el-border-color);
  border-top: none;
}

.easy-video__danmaku-bar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  gap: 16px;
}

/* 左侧 */
.easy-video__danmaku-left {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.easy-video__danmaku-info {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.easy-video__danmaku-count {
  cursor: pointer;
  border-bottom: 1px solid var(--el-border-color);
  padding-bottom: 1px;
  transition: all 0.2s;

  &:hover {
    color: #00a1d6;
    border-bottom-color: #00a1d6;
  }
}

.easy-video__danmaku-icon-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: var(--el-text-color-placeholder);
  cursor: pointer;
  transition: color 0.2s;

  &:hover {
    color: #00a1d6;
  }
}

/* 中间：输入框 */
.easy-video__danmaku-input-area {
  flex: 1;
  display: flex;
  align-items: center;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  padding: 0 12px;
  height: 36px;
  transition: all 0.2s;

  &:focus-within {
    background: var(--el-bg-color);
    box-shadow: 0 0 0 2px var(--el-color-primary);
  }
}

.easy-video__danmaku-input-a {
  font-size: 14px;
  color: var(--el-text-color-placeholder);
  margin-right: 8px;
  font-family: Arial, sans-serif;
}

.easy-video__danmaku-input {
  flex: 1;
  border: none;
  background: transparent;
  color: var(--el-text-color-primary);
  font-size: 14px;
  outline: none;
  min-width: 0;

  &::placeholder {
    color: var(--el-text-color-placeholder);
  }
}

/* 右侧 */
.easy-video__danmaku-right {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-shrink: 0;
}

.easy-video__danmaku-tip {
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 13px;
  color: var(--el-text-color-placeholder);
  text-decoration: none;

  &:hover {
    color: #00a1d6;
  }
}

.easy-video__danmaku-send {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 20px;
  height: 32px;
  background: #00a1d6;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  color: #fff;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #00b5e5;
  }

  &:disabled {
    background: #e3e5e7;
    color: var(--el-text-color-placeholder);
    cursor: not-allowed;
  }
}

/* 颜色选择器 */
.easy-video__danmaku-color-picker {
  position: relative;
}

.easy-video__danmaku-color-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: var(--el-fill-color-light);
  }
}

.easy-video__danmaku-color-current {
  width: 18px;
  height: 18px;
  border-radius: 3px;
  border: 2px solid rgba(0, 0, 0, 0.15);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.15);
}

.easy-video__danmaku-color-panel {
  position: absolute;
  bottom: 100%;
  right: 0;
  margin-bottom: 8px;
  padding: 8px;
  background: var(--el-bg-color);
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  z-index: 100;
}

.easy-video__danmaku-color-item {
  width: 24px;
  height: 24px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s;
  border: 2px solid transparent;

  &:hover {
    transform: scale(1.1);
  }

  &.is-active {
    border-color: #00a1d6;
    box-shadow: 0 0 0 2px rgba(0, 161, 214, 0.3);
  }
}

/* 颜色选择面板淡入动画 */
.fade-enter-active,
.fade-leave-active {
  transition:
    opacity 0.2s,
    transform 0.2s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>

<style lang="scss">
/* ========== 视频播放器 Dark Mode ========== */
html.dark .easy-video {
  background: #111;
}
html.dark .easy-video__danmaku-bar {
  background: var(--el-bg-color);
  border-color: var(--el-border-color);
}
html.dark .easy-video__danmaku-input-area {
  background: var(--el-fill-color-light);
}
html.dark .easy-video__danmaku-input {
  color: var(--el-text-color-primary);
}
html.dark .easy-video__danmaku-input::placeholder {
  color: var(--el-text-color-placeholder);
}
html.dark .easy-video__danmaku-icon-btn {
  color: var(--el-text-color-secondary);
}
html.dark .easy-video__danmaku-info {
  color: var(--el-text-color-secondary);
}
html.dark .easy-video__danmaku-tip {
  color: var(--el-text-color-secondary);
}
html.dark .easy-video__danmaku-send:disabled {
  background: var(--el-fill-color);
  color: var(--el-text-color-disabled);
}
</style>
