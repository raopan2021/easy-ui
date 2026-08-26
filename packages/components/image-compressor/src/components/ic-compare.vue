<script setup lang="ts">
import type { CompressResult } from '../types'

import { computed, onMounted, onUnmounted, ref } from 'vue'
import { formatFileSize } from '../../../../easy-ui/src/utils/file'
import EasyButton from '../../../button'

import EasyIcon from '../../../icon'

const props = defineProps<{
  /** 当前预览项 */
  item: CompressResult | null
  /** 当前索引 */
  index: number
  /** 结果总数 */
  total: number
  /** 缩放比例 */
  scale: number
  /** 旋转角度 */
  rotation: number
}>()

const emit = defineEmits<{
  (e: 'prev'): void
  (e: 'next'): void
  (e: 'close'): void
  (e: 'zoomIn'): void
  (e: 'zoomOut'): void
  (e: 'rotate'): void
}>()

/** 图片缩放 / 旋转样式 */
const imgStyle = computed(() => ({
  transform: `scale(${props.scale}) rotate(${props.rotation}deg)`,
}))

// ──── 全屏（组件内部管理）────
const rootRef = ref<HTMLElement>()
const isFullscreen = ref(false)

async function toggleFullscreen() {
  if (!rootRef.value)
    return
  if (document.fullscreenElement) {
    await document.exitFullscreen()
  }
  else {
    await rootRef.value.requestFullscreen()
  }
}

function handleFullscreenChange() {
  isFullscreen.value = !!document.fullscreenElement
}

onMounted(() => document.addEventListener('fullscreenchange', handleFullscreenChange))
onUnmounted(() => document.removeEventListener('fullscreenchange', handleFullscreenChange))
</script>

<template>
  <div ref="rootRef" class="ic-compare" :class="{ 'is-fullscreen': isFullscreen }">
    <div class="ic-compare__header">
      <div class="ic-compare__title">
        对比预览
        <span class="ic-compare__name">{{ item?.name }}</span>
      </div>
      <div class="ic-compare__nav">
        <EasyButton size="small" :disabled="index === 0" @click="emit('prev')">
          上一张
        </EasyButton>
        <EasyButton size="small" :disabled="index === total - 1" @click="emit('next')">
          下一张
        </EasyButton>
        <EasyButton size="small" type="ghost" @click="emit('close')">
          关闭
        </EasyButton>
      </div>
    </div>

    <div class="ic-compare__body">
      <div class="ic-compare__side">
        <div class="ic-compare__label">
          原图
        </div>
        <div class="ic-compare__img-wrap">
          <img :src="item?.originalUrl" class="ic-compare__img" :style="imgStyle">
        </div>
        <div class="ic-compare__meta">
          {{ item?.originalWidth }} × {{ item?.originalHeight }}
          · {{ formatFileSize(item?.originalSize) }}
        </div>
      </div>
      <div class="ic-compare__side">
        <div class="ic-compare__label">
          压缩后
        </div>
        <div class="ic-compare__img-wrap">
          <img :src="item?.compressedUrl" class="ic-compare__img" :style="imgStyle">
        </div>
        <div class="ic-compare__meta">
          {{ item?.compressedWidth }} × {{ item?.compressedHeight }}
          · {{ formatFileSize(item?.compressedSize) }}
          · 节省 {{ item?.savedPercent }}%
        </div>
      </div>
    </div>

    <div class="ic-compare__tools">
      <div class="ic-compare__tools-group">
        <EasyButton size="small" @click="emit('zoomOut')">
          <EasyIcon name="el:Minus" />
        </EasyButton>
        <EasyButton size="small" @click="emit('zoomIn')">
          <EasyIcon name="el:Plus" />
        </EasyButton>
        <EasyButton size="small" @click="emit('rotate')">
          <EasyIcon name="el:RefreshLeft" />
        </EasyButton>
        <EasyButton size="small" @click="toggleFullscreen">
          <EasyIcon name="el:FullScreen" />
        </EasyButton>
      </div>
      <span class="ic-compare__scale">{{ Math.round(scale * 100) }}%</span>
    </div>
  </div>
</template>

<style scoped lang="scss">
.ic-compare {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  padding: 14px;
  background: var(--el-bg-color);

  &.is-fullscreen {
    width: 100vw;
    height: 100vh;
    border-radius: 0;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
  }

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;
  }

  &__title {
    font-size: 14px;
    font-weight: 600;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  &__name {
    font-size: 12px;
    font-weight: 400;
    color: var(--el-text-color-secondary);
    max-width: 260px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__nav {
    display: flex;
    gap: 8px;
  }

  &__body {
    display: flex;
    gap: 14px;
    flex: 1;
    min-height: 0;
  }

  &__side {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
  }

  &__label {
    font-size: 13px;
    font-weight: 500;
    margin-bottom: 8px;
  }

  &__img-wrap {
    flex: 1;
    min-height: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    border: 1px solid var(--el-border-color-lighter);
    border-radius: 8px;
    background:
      linear-gradient(45deg, var(--el-fill-color-lighter) 25%, transparent 25%),
      linear-gradient(-45deg, var(--el-fill-color-lighter) 25%, transparent 25%),
      linear-gradient(45deg, transparent 75%, var(--el-fill-color-lighter) 75%),
      linear-gradient(-45deg, transparent 75%, var(--el-fill-color-lighter) 75%);
    background-size: 16px 16px;
    background-position:
      0 0,
      0 8px,
      8px -8px,
      -8px 0;
  }

  &__img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
    transition: transform 0.2s ease;
  }

  &__meta {
    margin-top: 8px;
    font-size: 12px;
    color: var(--el-text-color-placeholder);
    text-align: center;
  }

  &__tools {
    margin-top: 12px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 12px;
  }

  &__tools-group {
    display: flex;
    gap: 8px;
  }

  &__scale {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}
</style>
