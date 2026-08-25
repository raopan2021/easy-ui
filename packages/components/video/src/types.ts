/**
 * 视频播放器组件类型定义。
 *
 * 从原 video.vue 内联声明中提取，统一在此维护，供 video.vue 与各个
 * use-* composable 共享（对齐 markdown / table 组件拆分规范）。
 */

/** 弹幕类型 */
export interface Danmaku {
  /** 弹幕唯一 id */
  id: number
  /** 弹幕文本 */
  text: string
  /** 出现时间（秒） */
  time: number
  /** 弹幕颜色 */
  color: string
  /** 弹幕模式：滚动 / 顶部固定 / 底部固定 */
  mode: 'scroll' | 'top' | 'bottom'
}

/** 组件 props（defineProps 与内部 composable 共用） */
export interface VideoProps {
  /** 视频地址 */
  src?: string
  /** 封面图地址（未传时使用视频第一帧） */
  poster?: string
  /** 自动播放 */
  autoplay?: boolean
  /** 静音播放（默认 true） */
  muted?: boolean
  /** 循环播放 */
  loop?: boolean
  /** 预加载模式 */
  preload?: 'auto' | 'metadata' | 'none'
  /** 宽度 */
  width?: number | string
  /** 高度 */
  height?: number | string
  /** 是否显示控制栏 */
  controls?: boolean
  /** 是否显示封面图（播放前显示封面，点击后播放） */
  showPoster?: boolean
  /** 是否显示播放速度选择 */
  showSpeed?: boolean
  /** 是否显示音量控制 */
  showVolume?: boolean
  /** 是否显示全屏按钮 */
  showFullscreen?: boolean
  /** 是否开启双击全屏（默认 true） */
  dblclickFullscreen?: boolean
  /** 是否开启弹幕功能（关闭后所有弹幕相关 UI 都不显示） */
  danmakuEnabled?: boolean
  /** 是否显示弹幕开关 */
  showDanmakuToggle?: boolean
  /** 是否显示弹幕输入 */
  showDanmakuInput?: boolean
  /** 是否显示弹幕列表 */
  showDanmakuList?: boolean
  /** 弹幕数据 */
  danmaku?: Danmaku[]
  /** 观看人数 */
  viewCount?: number | string
  /** 初始音量 0-1 */
  initialVolume?: number
  /** 播放速率选项 */
  playbackRates?: number[]
}

/** 组件事件（defineEmits 与内部 composable 共用，采用「可调用接口」形式） */
export interface VideoEmits {
  (e: 'play', event: Event): void
  (e: 'pause', event: Event): void
  (e: 'ended', event: Event): void
  (e: 'timeupdate', currentTime: number): void
  (e: 'error', error: ErrorEvent): void
  (e: 'volumechange', volume: number): void
  (e: 'danmakuSend', danmaku: Danmaku): void
}
