<script setup lang="ts">
import type { ImageUploadEmits, ImageUploadProps } from './types'
import { useImageUpload } from './use-image-upload'

// 保持对外类型导出兼容（原定义在 image-upload.vue）
export type { ImageUploadEmits, ImageUploadProps, UploadFile, UploadStatus, UploadValueMode } from './types'

defineOptions({ name: 'EasyUpload' })

const props = withDefaults(defineProps<ImageUploadProps>(), {
  modelValue: () => [],
  valueMode: 'array',
  multiple: true,
  accept: 'image/*',
  fit: 'cover',
  size: 100,
  disabled: false,
  previewable: true,
  triggerText: '',
  minSize: 0,
})

const emit = defineEmits<ImageUploadEmits>()

// ──── 核心逻辑（内置校验 / modelValue 同步 / 本地上传 / 删除 / 预览）────
const {
  inputRef,
  isDragover,
  fileList,
  isMaxReached,
  itemStyle,
  handleTriggerClick,
  handleInputChange,
  handleDrop,
  handleRemove,
  previewVisible,
  previewIndex,
  previewUrlList,
  previewImgStyle,
  handlePreview,
  handlePreviewWheel,
  handlePreviewDragStart,
  previewPrev,
  previewNext,
  previewZoomIn,
  previewZoomOut,
  previewRotateLeft,
  previewRotateRight,
  previewReset,
  clearFileList,
  getFileList,
} = useImageUpload(props, emit)

// 暴露方法（通过 ref 调用）
defineExpose({
  /** 手动触发选文件 */
  open: handleTriggerClick,
  /** 清空所有文件 */
  clear: clearFileList,
  /** 获取文件列表 */
  getFileList,
})
</script>

<template>
  <div class="easy-upload" :class="{ 'is-disabled': disabled }">
    <!-- 图片列表 -->
    <div class="easy-upload__list">
      <!-- 已上传图片 -->
      <TransitionGroup name="easy-upload-fade">
        <div v-for="(item, index) in fileList" :key="item.uid" class="easy-upload__item"
          :class="[`easy-upload__item--${item.status}`]" :style="itemStyle">
          <!-- 预览图 -->
          <img v-if="item.url" :src="item.url" :alt="item.name" class="easy-upload__img" :style="{ objectFit: fit }"
            @click="handlePreview(index)">

          <!-- 上传进度 -->
          <div v-if="item.status === 'uploading'" class="easy-upload__progress">
            <div class="easy-upload__progress-ring">
              <svg viewBox="0 0 36 36" class="progress-svg">
                <circle class="progress-track" cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.3)"
                  stroke-width="3" />
                <circle class="progress-fill" cx="18" cy="18" r="14" fill="none" stroke="#fff" stroke-width="3"
                  stroke-linecap="round" :stroke-dasharray="`${(item.percent || 0) * 0.88} 88`"
                  transform="rotate(-90 18 18)" />
              </svg>
              <span class="progress-text">{{ item.percent || 0 }}%</span>
            </div>
          </div>

          <!-- 错误遮罩 -->
          <div v-if="item.status === 'error'" class="easy-upload__error-mask">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="#fff" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <span>上传失败</span>
          </div>

          <!-- 操作遮罩（hover 显示） -->
          <div v-if="!disabled && item.status !== 'uploading'" class="easy-upload__actions">
            <!-- 预览 -->
            <span v-if="item.url && previewable" class="easy-upload__action" title="预览"
              @click.stop="handlePreview(index)">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </span>
            <!-- 删除 -->
            <span class="easy-upload__action easy-upload__action--danger" title="删除" @click.stop="handleRemove(index)">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </span>
          </div>

          <!-- 状态角标 -->
          <div v-if="item.status === 'success'" class="easy-upload__badge">
            <svg viewBox="0 0 12 12" width="12" height="12" fill="none" stroke="#fff" stroke-width="2">
              <polyline points="2 6 5 9 10 3" />
            </svg>
          </div>
        </div>
      </TransitionGroup>

      <!-- 上传触发区域 -->
      <div v-if="!disabled && !isMaxReached" class="easy-upload__trigger" :class="{ 'is-dragover': isDragover }"
        :style="itemStyle" @click="handleTriggerClick" @dragover.prevent="isDragover = true"
        @dragleave.prevent="isDragover = false" @drop.prevent="handleDrop">
        <slot name="trigger">
          <div class="easy-upload__trigger-inner">
            <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" stroke-width="1.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span v-if="triggerText" class="easy-upload__trigger-text">{{ triggerText }}</span>
          </div>
        </slot>
      </div>

      <!-- 隐藏的 input -->
      <input ref="inputRef" type="file" :accept="accept" :multiple="multiple && (limit === undefined || limit > 1)"
        class="easy-upload__input" @change="handleInputChange">
    </div>

    <!-- 提示文字 -->
    <div v-if="tip || $slots.tip" class="easy-upload__tip">
      <slot name="tip">
        {{ tip }}
      </slot>
    </div>

    <!-- 图片预览弹窗 -->
    <Teleport to="body">
      <Transition name="easy-upload-preview">
        <div v-if="previewVisible" class="easy-upload-preview-modal" @click.self="previewVisible = false"
          @wheel.prevent="handlePreviewWheel">
          <!-- 关闭 -->
          <button class="easy-upload-preview__close" @click="previewVisible = false">
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>

          <!-- 上一张 -->
          <button v-if="previewUrlList.length > 1" class="easy-upload-preview__arrow easy-upload-preview__arrow--prev"
            @click="previewPrev">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          <!-- 图片 -->
          <div class="easy-upload-preview__body" @mousedown="handlePreviewDragStart">
            <img :src="previewUrlList[previewIndex]" :style="previewImgStyle" class="easy-upload-preview__img"
              draggable="false">
          </div>

          <!-- 下一张 -->
          <button v-if="previewUrlList.length > 1" class="easy-upload-preview__arrow easy-upload-preview__arrow--next"
            @click="previewNext">
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2.5">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>

          <!-- 底部工具栏 -->
          <div class="easy-upload-preview__footer">
            <span class="easy-upload-preview__count">{{ previewIndex + 1 }} / {{ previewUrlList.length }}</span>
            <div class="easy-upload-preview__toolbar">
              <button class="preview-btn" title="缩小" @click="previewZoomOut">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </button>
              <button class="preview-btn" title="放大" @click="previewZoomIn">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  <line x1="11" y1="8" x2="11" y2="14" />
                  <line x1="8" y1="11" x2="14" y2="11" />
                </svg>
              </button>
              <button class="preview-btn" title="向左旋转" @click="previewRotateLeft">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
                </svg>
              </button>
              <button class="preview-btn" title="向右旋转" @click="previewRotateRight">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="23 4 23 10 17 10" />
                  <path d="M20.49 15a9 9 0 1 1-.49-4.95" />
                </svg>
              </button>
              <button class="preview-btn" title="重置" @click="previewReset">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="1 4 1 10 7 10" />
                  <path d="M3.51 15a9 9 0 1 0 .49-4.95" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped lang="scss">
// ---- 设计令牌 ----

$radius: 8px;
$transition: all 0.2s ease;

// ==================== 组件容器 ====================
.easy-upload {
  display: inline-block;

  &.is-disabled {
    pointer-events: none;
    opacity: 0.6;
  }
}

// ==================== 文件列表 ====================
.easy-upload__list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  align-items: flex-start;
}

// ==================== 单个文件项 ====================
.easy-upload__item {
  position: relative;
  border-radius: $radius;
  overflow: hidden;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color);
  flex-shrink: 0;
  cursor: default;

  &.easy-upload__item--success {
    border-color: transparent;

    &:hover .easy-upload__actions {
      opacity: 1;
    }
  }

  &.easy-upload__item--uploading {
    border-color: var(--el-color-primary);
  }

  &.easy-upload__item--error {
    border-color: var(--el-color-danger);
  }
}

.easy-upload__img {
  width: 100%;
  height: 100%;
  display: block;
}

// ==================== 进度覆盖层 ====================
.easy-upload__progress {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
}

.easy-upload__progress-ring {
  position: relative;
  width: 40px;
  height: 40px;

  .progress-svg {
    width: 100%;
    height: 100%;
    transform: none;
  }

  .progress-text {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 9px;
    font-weight: 600;
    color: var(--el-color-white);
    line-height: 1;
  }
}

// ==================== 错误遮罩 ====================
.easy-upload__error-mask {
  position: absolute;
  inset: 0;
  background: rgba(255, 59, 48, 0.75);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  color: var(--el-color-white);
  font-size: 11px;
}

// ==================== 操作遮罩 ====================
.easy-upload__actions {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.easy-upload__action {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  color: var(--el-color-white);
  cursor: pointer;
  transition: $transition;

  &:hover {
    background: rgba(255, 255, 255, 0.35);
    transform: scale(1.1);
  }

  &.easy-upload__action--danger:hover {
    background: var(--el-fill-color-light);
  }
}

// ==================== 成功角标 ====================
.easy-upload__badge {
  position: absolute;
  bottom: 0;
  right: 0;
  width: 18px;
  height: 18px;
  background: var(--el-color-success);
  border-radius: 4px 0 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

// ==================== 触发区域 ====================
.easy-upload__trigger {
  border: 1.5px dashed var(--el-border-color);
  border-radius: $radius;
  background: var(--el-fill-color-light);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: $transition;
  flex-shrink: 0;

  &:hover,
  &.is-dragover {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }
}

.easy-upload__trigger-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: var(--el-text-color-placeholder);
  transition: color 0.2s;

  .easy-upload__trigger:hover &,
  .easy-upload__trigger.is-dragover & {
    color: var(--el-color-primary);
  }
}

.easy-upload__trigger-text {
  font-size: 12px;
  line-height: 1;
}

// ==================== 隐藏 input ====================
.easy-upload__input {
  display: none;
}

// ==================== 提示文字 ====================
.easy-upload__tip {
  margin-top: 8px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
}

// ==================== 预览弹窗 ====================
.easy-upload-preview-modal {
  position: fixed;
  inset: 0;
  z-index: 3000;
  background: rgba(0, 0, 0, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
}

.easy-upload-preview__close {
  position: absolute;
  top: 16px;
  right: 16px;
  z-index: 10;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: var(--el-color-white);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: $transition;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }
}

.easy-upload-preview__body {
  max-width: calc(100% - 120px);
  max-height: calc(100vh - 120px);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.easy-upload-preview__img {
  max-width: 100%;
  max-height: calc(100vh - 120px);
  object-fit: contain;
  user-select: none;
  display: block;
}

.easy-upload-preview__arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.15);
  border: none;
  color: var(--el-color-white);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: $transition;
  z-index: 10;

  &:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  &.easy-upload-preview__arrow--prev {
    left: 16px;
  }
  &.easy-upload-preview__arrow--next {
    right: 16px;
  }
}

.easy-upload-preview__footer {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.easy-upload-preview__count {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.7);
}

.easy-upload-preview__toolbar {
  display: flex;
  gap: 4px;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 24px;
  padding: 6px 12px;
}

.preview-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: transparent;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: $transition;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    color: var(--el-color-white);
  }
}

// ==================== 过渡动画 ====================
.easy-upload-fade-enter-active,
.easy-upload-fade-leave-active {
  transition: all 0.25s ease;
}

.easy-upload-fade-enter-from,
.easy-upload-fade-leave-to {
  opacity: 0;
  transform: scale(0.85);
}

.easy-upload-preview-enter-active,
.easy-upload-preview-leave-active {
  transition: opacity 0.25s ease;
}

.easy-upload-preview-enter-from,
.easy-upload-preview-leave-to {
  opacity: 0;
}
</style>
