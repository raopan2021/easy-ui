<script setup lang="ts">
import type { ImageCropperEmits, ImageCropperProps } from './types'

import EasyButton from '../../button'

import { useImageCropper } from './use-image-cropper'
import 'cropperjs/dist/cropper.css'

defineOptions({ name: 'EasyImageCropper' })

const props = withDefaults(
  defineProps<ImageCropperProps>(),
  {
    alt: 'cropper',
    toolbar: true,
    showAction: true,
    autoCropArea: 0.8,
    viewMode: 0,
    outputType: 'png',
    outputQuality: 0.9,
    guides: true,
    center: true,
    high: false,
  },
)

const emit = defineEmits<ImageCropperEmits>()

// ──── 裁剪器核心逻辑（生命周期 / 交互 / 导出抽离到 composable）────
const {
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
} = useImageCropper(props, emit)

// ──── 对外方法集（保持原 defineExpose 导出面不变）────
defineExpose(exposeApi)

// 保持对外类型导出兼容（原内联定义于 image-cropper.vue）
export type { CropData, ImageCropperEmits, ImageCropperProps } from './types'
</script>

<template>
  <div class="easy-image-cropper">
    <!-- 工具栏 -->
    <div v-if="toolbar" class="easy-image-cropper__toolbar">
      <div class="easy-image-cropper__group">
        <el-tooltip content="左旋转90°" placement="top">
          <button class="easy-image-cropper__btn" @click="onRotate(-90)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M2.5 2v6h6M2.66 15.57a10 10 0 1 0 .57-8.38" />
            </svg>
            <span>左旋</span>
          </button>
        </el-tooltip>
        <el-tooltip content="右旋转90°" placement="top">
          <button class="easy-image-cropper__btn" @click="onRotate(90)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38" />
            </svg>
            <span>右旋</span>
          </button>
        </el-tooltip>
      </div>
      <div class="easy-image-cropper__sep" />
      <div class="easy-image-cropper__group">
        <el-tooltip content="左右翻转" placement="top">
          <button class="easy-image-cropper__btn" @click="onScaleX">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M8 3H5a2 2 0 0 0-2 2v14c0 1.1.9 2 2 2h3M16 3h3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-3M12 20v2M12 2v2" />
            </svg>
            <span>镜像</span>
          </button>
        </el-tooltip>
        <el-tooltip content="上下翻转" placement="top">
          <button class="easy-image-cropper__btn" @click="onScaleY">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 8V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v3M3 16v3a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-3M20 12H4M2 12h2" />
            </svg>
            <span>翻转</span>
          </button>
        </el-tooltip>
      </div>
      <div class="easy-image-cropper__sep" />
      <div class="easy-image-cropper__group">
        <el-tooltip content="放大" placement="top">
          <button class="easy-image-cropper__btn" @click="onZoom(0.1)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35M11 8v6M8 11h6" />
            </svg>
            <span>放大</span>
          </button>
        </el-tooltip>
        <el-tooltip content="缩小" placement="top">
          <button class="easy-image-cropper__btn" @click="onZoom(-0.1)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35M8 11h6" />
            </svg>
            <span>缩小</span>
          </button>
        </el-tooltip>
      </div>
      <div class="easy-image-cropper__sep" />
      <div class="easy-image-cropper__group">
        <el-tooltip content="重置" placement="top">
          <button class="easy-image-cropper__btn easy-image-cropper__btn--reset" @click="onReset">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round" stroke-linejoin="round">
              <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
              <path d="M3 3v5h5" />
            </svg>
            <span>重置</span>
          </button>
        </el-tooltip>
      </div>
    </div>

    <!-- 裁剪区域 -->
    <div class="easy-image-cropper__view">
      <img v-if="src" ref="imgRef" class="easy-image-cropper__img" :src="src" :alt="alt"
        style="display: block; max-width: 100%" @error="onImgError">
      <div v-else class="easy-image-cropper__placeholder">
        <svg width="48" height="48" viewBox="0 0 48 48" fill="#ccc">
          <rect x="6" y="10" width="36" height="28" rx="2" stroke="#ccc" stroke-width="2" fill="none" />
          <circle cx="16" cy="20" r="4" stroke="#ccc" stroke-width="2" fill="none" />
          <path d="M6 32l8-8 6 6 12-12 10 10" stroke="#ccc" stroke-width="2" fill="none" />
        </svg>
        <span>请选择图片</span>
      </div>
    </div>

    <!-- 操作按钮 -->
    <div v-if="$slots.action || showAction" class="easy-image-cropper__action">
      <slot name="action">
        <EasyButton @click="handleCancel">
          取消
        </EasyButton>
        <EasyButton type="primary" @click="handleConfirm">
          确认裁剪
        </EasyButton>
      </slot>
    </div>
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 image-cropper-style.scss） -->
<style scoped src="./image-cropper-style.scss" lang="scss"></style>

<!-- 暗色模式覆盖（非 scoped，全局 html.dark 作用域） -->
<style lang="scss">
/* ========== Dark Mode ========== */
html.dark .easy-image-cropper__btn:hover {
  background: rgba(79, 110, 247, 0.12);
}
html.dark .easy-image-cropper__btn--reset:hover {
  background: rgba(239, 68, 68, 0.1);
}
html.dark .easy-image-cropper__view {
  background: #333;
}
</style>
