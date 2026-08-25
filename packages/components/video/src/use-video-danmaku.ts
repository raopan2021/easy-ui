import type { Danmaku, VideoEmits, VideoProps } from './types'
import type { VideoCore } from './use-video-core'

import { computed, watch } from 'vue'

/**
 * 弹幕系统 composable
 *
 * 将原本内联在 video.vue 中的弹幕状态操作（颜色选择 / 开关 / 列表 / 发送）
 * 与逐帧轨道分配动画（updateDanmaku）抽离为独立 composable，
 * 依赖 useVideoCore 集中管理的弹幕状态与播放进度。
 *
 * @param core  核心响应式状态
 * @param props 组件 props（读取 danmaku 数据 / 开关）
 * @param emit  组件 emit（用于 danmakuSend 等）
 */
export function useVideoDanmaku(core: VideoCore, props: VideoProps, emit: VideoEmits) {
  const {
    videoRef,
    danmakuContainerRef,
    currentTime,
    danmakuVisible,
    danmakuListVisible,
    danmakuInputText,
    danmakuColor,
    colorPickerVisible,
    danmakuAnimationFrame,
    sentDanmaku,
    isSending,
    activeDanmaku,
    danmakuTrackMap,
    trackReleaseTime,
    danmakuTracks,
    danmakuTrackCount,
    scrollDuration,
  } = core

  // ──── 派生值 ────
  /** 进度条上的弹幕预览点（最多展示 20 个） */
  const danmakuPoints = computed(() => {
    return (props.danmaku ?? []).slice(0, 20).map(dm => ({
      time: dm.time,
      percent: core.duration.value ? (dm.time / core.duration.value) * 100 : 0,
      text: dm.text,
    }))
  })

  /** 弹幕列表（传入的 + 发送的） */
  const danmakuList = computed(() => [...(props.danmaku ?? []), ...sentDanmaku.value])

  // ──── 颜色选择 ────
  /** 切换颜色选择器 */
  function toggleColorPicker() {
    colorPickerVisible.value = !colorPickerVisible.value
  }

  /** 选择颜色 */
  function selectColor(color: string) {
    danmakuColor.value = color
    colorPickerVisible.value = false
  }

  // ──── 开关 / 列表 ────
  /** 切换弹幕显示 */
  function toggleDanmaku() {
    danmakuVisible.value = !danmakuVisible.value
  }

  /** 切换弹幕列表 */
  function toggleDanmakuList() {
    danmakuListVisible.value = !danmakuListVisible.value
  }

  // ──── 发送 ────
  /** 发送弹幕（按钮 / Enter 触发） */
  function handleSendDanmaku(e: Event) {
    e.preventDefault()
    e.stopPropagation()
    if (isSending.value)
      return
    doSendDanmaku()
  }

  /** 实际发送逻辑（防重复） */
  function doSendDanmaku() {
    if (!danmakuInputText.value.trim() || !videoRef.value)
      return
    if (isSending.value)
      return

    // 防止重复发送
    isSending.value = true

    const text = danmakuInputText.value.trim()
    const currentTime = videoRef.value.currentTime

    // 清空输入
    danmakuInputText.value = ''

    const newDanmaku: Danmaku = {
      id: Date.now(),
      text,
      time: currentTime,
      color: danmakuColor.value,
      mode: 'scroll',
    }

    // 使用 replace 添加到列表
    sentDanmaku.value = [...sentDanmaku.value, newDanmaku]
    emit('danmakuSend', newDanmaku)

    // 短暂延迟后重置发送状态
    setTimeout(() => {
      isSending.value = false
    }, 300)
  }

  // ──── 弹幕动画循环（纯 JS 逐帧更新位置）────
  function updateDanmaku() {
    // 如果弹幕功能未开启，清空弹幕并跳过
    if (!props.danmakuEnabled) {
      activeDanmaku.value = []
      danmakuTrackMap.clear()
      trackReleaseTime.clear()
      danmakuAnimationFrame.value = requestAnimationFrame(updateDanmaku)
      return
    }

    if (!danmakuContainerRef.value) {
      danmakuAnimationFrame.value = requestAnimationFrame(updateDanmaku)
      return
    }

    const containerWidth = danmakuContainerRef.value.offsetWidth
    const containerHeight = danmakuContainerRef.value.offsetHeight

    if (!containerWidth || !containerHeight) {
      danmakuAnimationFrame.value = requestAnimationFrame(updateDanmaku)
      return
    }

    // 合并所有弹幕
    const allDanmaku = [...(props.danmaku || []), ...sentDanmaku.value]

    // 过滤当前时间窗口内的弹幕
    const visibleDms = allDanmaku.filter((dm) => {
      if (!danmakuVisible.value)
        return false
      const elapsed = currentTime.value - dm.time
      return elapsed >= 0 && elapsed <= scrollDuration
    })

    // 轨道只分布在上半屏
    const trackHeight = containerHeight / 2 / danmakuTrackCount

    // 为每个弹幕分配固定轨道（使用id哈希），并检测冲突
    activeDanmaku.value = visibleDms.map((dm) => {
      const elapsed = currentTime.value - dm.time

      // 计算弹幕的"消失时间"（相对视频播放时间）
      const disappearTime = dm.time + scrollDuration

      // 如果弹幕已经有固定轨道，检查是否仍有效（未被新弹幕占用）
      let track = danmakuTrackMap.get(dm.id)

      if (track !== undefined) {
        // 检查当前轨道是否被其他弹幕占用
        const releaseTime = trackReleaseTime.get(track) || 0
        if (disappearTime <= releaseTime) {
          // 轨道被占用，需要找新轨道
          track = undefined
        }
      }

      // 如果没有固定轨道，分配一个新轨道
      if (track === undefined) {
        // 从哈希轨道开始，找最近的可用轨道
        const baseTrack = Math.abs(dm.id) % danmakuTrackCount

        for (let i = 0; i < danmakuTrackCount; i++) {
          const candidateTrack = (baseTrack + i) % danmakuTrackCount
          const releaseTime = trackReleaseTime.get(candidateTrack) || 0

          // 如果这个轨道已经释放，可以使用
          if (disappearTime <= releaseTime || currentTime.value >= releaseTime) {
            track = candidateTrack
            break
          }
        }

        // 如果所有轨道都被占用，使用哈希轨道（兜底）
        if (track === undefined) {
          track = baseTrack
        }
      }

      // 更新轨道记录
      danmakuTrackMap.set(dm.id, track)
      trackReleaseTime.set(track, disappearTime)

      // 计算当前位置：弹幕从右侧（containerWidth + 100）移动到左侧（-100px）
      // progress: 0 = 开始, 1 = 结束
      const progress = elapsed / scrollDuration
      const startX = containerWidth + 100
      const endX = -100
      const currentX = startX + (endX - startX) * progress

      const top = track * trackHeight + 16

      return {
        ...dm,
        offset: track,
        style: {
          left: `${currentX}px`,
          top: `${top}px`,
          color: dm.color,
        },
      }
    })

    // 清理已过期弹幕的轨道记录
    const currentIds = new Set(allDanmaku.map(dm => dm.id))
    for (const id of danmakuTrackMap.keys()) {
      if (!currentIds.has(id)) {
        danmakuTrackMap.delete(id)
      }
    }

    danmakuAnimationFrame.value = requestAnimationFrame(updateDanmaku)
  }

  /** 启动弹幕动画循环（组件挂载时调用） */
  function startDanmakuAnimation() {
    danmakuAnimationFrame.value = requestAnimationFrame(updateDanmaku)
  }

  /** 停止弹幕动画循环（组件卸载时调用） */
  function stopDanmakuAnimation() {
    if (danmakuAnimationFrame.value) {
      cancelAnimationFrame(danmakuAnimationFrame.value)
    }
  }

  // 监听弹幕数据变化 → 重置轨道
  watch(
    () => props.danmaku,
    () => {
      danmakuTracks.value = Array.from<number>({ length: danmakuTrackCount }).fill(0)
    },
  )

  return {
    danmakuPoints,
    danmakuList,
    toggleColorPicker,
    selectColor,
    toggleDanmaku,
    toggleDanmakuList,
    handleSendDanmaku,
    doSendDanmaku,
    updateDanmaku,
    startDanmakuAnimation,
    stopDanmakuAnimation,
  }
}

/** useVideoDanmaku 返回值类型 */
export type VideoDanmaku = ReturnType<typeof useVideoDanmaku>
