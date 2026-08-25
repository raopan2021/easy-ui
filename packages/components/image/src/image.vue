<script setup lang="ts">
import type { ImageEmits, ImageProps } from './types'

import EasyButton from '../../button'
import EasyIcon from '../../icon'
import { useImage } from './use-image'

// 保持对外类型导出兼容（原定义在 image.vue 内联）
export type { ImageEmits, ImageFit, ImageProps } from './types'

defineOptions({
  name: 'EasyImage',
})

const props = withDefaults(defineProps<ImageProps>(), {
  src: '',
  alt: '',
  previewSrcList: () => [],
  preview: true,
  previewActions: true,
  max: 4,
  fit: 'cover',
  mode: 'grid',
})

const emit = defineEmits<ImageEmits>()

const {
  displayImages,
  visibleImages,
  hideCount,
  displayMode,
  singleStyle,
  listStyle,
  previewVisible,
  previewIndex,
  previewSrc,
  previewContainerRef,
  previewImgRef,
  previewImgStyle,
  handlePreview,
  closePreview,
  prevImage,
  nextImage,
  zoomIn,
  zoomOut,
  rotateLeft,
  rotateRight,
  resetTransform,
  handleWheel,
  handleDragStart,
  handleError,
  hasAction,
} = useImage(props, emit)
</script>

<template>
  <div class="easy-image" :class="[`easy-image--${displayMode}`]">
    <!-- 单图模式 -->
    <template v-if="displayImages.length === 1">
      <div class="easy-image__single" :style="singleStyle" @click="handlePreview(0)">
        <img :src="displayImages[0]" :alt="alt" class="easy-image__img" :style="{ objectFit: fit }" @error="handleError">
        <div v-if="$slots.overlay" class="easy-image__overlay">
          <slot name="overlay" />
        </div>
      </div>
    </template>

    <!-- 多图模式 -->
    <template v-else>
      <div class="easy-image__list" :style="listStyle">
        <div v-for="(img, index) in visibleImages" :key="index" class="easy-image__item" @click="handlePreview(index)">
          <img :src="img" :alt="alt" class="easy-image__img" :style="{ objectFit: fit }" @error="handleError">
          <!-- 超出提示：显示在最后一个可见图片上 -->
          <div v-if="index === visibleImages.length - 1 && hideCount > 0" class="easy-image__mask">
            <span>+{{ hideCount }}</span>
          </div>
        </div>
      </div>
    </template>

    <!-- 预览弹窗 -->
    <Teleport to="body">
      <div v-if="previewVisible" class="easy-image-preview" @click.self="closePreview" @wheel.prevent="handleWheel">
        <!-- 关闭按钮（右上角） -->
        <div class="easy-image-preview__close">
          <EasyButton type="text" @click="closePreview">
            <EasyIcon name="el:Close" />
          </EasyButton>
        </div>

        <!-- 图片容器（居中） -->
        <div ref="previewContainerRef" class="easy-image-preview__container"
          style="display: block; grid-template-columns: unset" @mousedown="handleDragStart">
          <img ref="previewImgRef" :src="previewSrc" :style="previewImgStyle" class="easy-image-preview__img"
            style="width: auto; height: auto; max-width: 100%; max-height: 100%" @error="handleError">
        </div>

        <!-- 左侧切换按钮 -->
        <EasyButton v-if="displayImages.length > 1 && hasAction('prev')"
          class="easy-image-preview__arrow easy-image-preview__arrow--left" type="text" @click="prevImage">
          <EasyIcon name="el:ArrowLeft" :size="30" />
        </EasyButton>

        <!-- 右侧切换按钮 -->
        <EasyButton v-if="displayImages.length > 1 && hasAction('next')"
          class="easy-image-preview__arrow easy-image-preview__arrow--right" type="text" @click="nextImage">
          <EasyIcon name="el:ArrowRight" :size="30" />
        </EasyButton>

        <!-- 底部控制栏 -->
        <div class="easy-image-preview__footer">
          <!-- 指示器 -->
          <div v-if="displayImages.length > 1" class="easy-image-preview__indicators">
            <span v-for="(_, index) in displayImages" :key="index" class="easy-image-preview__indicator"
              :class="{ 'is-active': index === previewIndex }" @click="previewIndex = index" />
          </div>

          <!-- 图片信息 -->
          <div class="easy-image-preview__info">
            {{ previewIndex + 1 }} / {{ displayImages.length }}
          </div>

          <!-- 操作栏 -->
          <div class="easy-image-preview__toolbar">
            <EasyButton v-if="hasAction('zoomOut')" type="text" @click="zoomOut">
              <EasyIcon name="el:ZoomOut" />
            </EasyButton>
            <EasyButton v-if="hasAction('zoomIn')" type="text" @click="zoomIn">
              <EasyIcon name="el:ZoomIn" />
            </EasyButton>
            <EasyButton v-if="hasAction('rotateLeft')" type="text" @click="rotateLeft">
              <EasyIcon name="el:RefreshLeft" />
            </EasyButton>
            <EasyButton v-if="hasAction('rotateRight')" type="text" @click="rotateRight">
              <EasyIcon name="el:RefreshRight" />
            </EasyButton>
            <EasyButton v-if="hasAction('reset')" type="text" @click="resetTransform">
              <EasyIcon name="el:Refresh" />
            </EasyButton>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 image-style.scss） -->
<style scoped src="./image-style.scss" lang="scss"></style>
