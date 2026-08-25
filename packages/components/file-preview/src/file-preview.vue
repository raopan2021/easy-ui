<script setup lang="ts">
import type { FieldNames, FileInputType } from './types'

import VueOfficeDocx from '@vue-office/docx/lib/v3/vue-office-docx.mjs'
import VueOfficeExcel from '@vue-office/excel/lib/v3/vue-office-excel.mjs'
import VueOfficePdf from '@vue-office/pdf/lib/v3/vue-office-pdf.mjs'

import { formatSize, getExt, getFileType } from './file-utils'
import { FileIcon, getFileIcon } from './use-file-icons'
import { useFilePreview } from './use-file-preview'

import '@vue-office/docx/lib/v3/index.css'
import '@vue-office/excel/lib/v3/index.css'

// 保持对外类型导出兼容（原定义在 file-preview.vue）
export type { FieldNames, FileInputType, FileItem } from './types'

defineOptions({ name: 'EasyFilePreview' })

const props = withDefaults(
  defineProps<{
    files?: FileInputType | FileInputType[]
    fieldNames?: FieldNames
  }>(),
  {
    files: () => [],
    fieldNames: () => ({ name: 'name', url: 'url', size: 'size' }),
  },
)

// ──── 核心逻辑（文件规范化 / 弹窗 / 内容加载 / 资源清理 / ESC 关闭）────
const {
  normalizedFiles,
  visible,
  currentIndex,
  loading,
  loadingText,
  officeSrc,
  officeError,
  pptContainerRef,
  currentFile,
  currentType,
  currentIcon,
  openPreview,
  closePreview,
  navigate,
  onRendered,
  onError,
} = useFilePreview(props)
</script>

<template>
  <div class="easy-file-preview">
    <!-- 文件列表 -->
    <div class="easy-file-preview__list">
      <div
        v-for="(file, index) in normalizedFiles" :key="index" class="easy-file-preview__item"
        @click="openPreview(file)"
      >
        <div class="easy-file-preview__icon" :class="`easy-file-preview__icon--${getFileType(file.url)}`">
          <component :is="getFileIcon(file.url)" />
        </div>
        <div class="easy-file-preview__info">
          <span class="easy-file-preview__name" :title="file.name">{{ file.name }}</span>
          <span v-if="file.size" class="easy-file-preview__size">{{ formatSize(file.size) }}</span>
        </div>
        <button class="easy-file-preview__btn" title="预览">
          <svg
            viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round"
          >
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </button>
      </div>
      <div v-if="normalizedFiles.length === 0" class="easy-file-preview__empty">
        <svg
          viewBox="0 0 24 24" width="32" height="32" fill="none" stroke="currentColor" stroke-width="1.5"
          stroke-linecap="round"
        >
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
        </svg>
        <span>暂无文件</span>
      </div>
    </div>

    <!-- 预览弹窗 -->
    <Teleport to="body">
      <Transition name="easy-fp-fade">
        <div v-if="visible" class="easy-fp-mask" @click.self="closePreview">
          <Transition name="easy-fp-zoom" appear>
            <div v-if="visible" class="easy-fp-dialog">
              <!-- 头部 -->
              <div class="easy-fp-header">
                <div class="easy-fp-header__left">
                  <div class="easy-fp-header__icon" :class="`easy-fp-header__icon--${currentType}`">
                    <component :is="currentIcon" />
                  </div>
                  <div class="easy-fp-header__info">
                    <span class="easy-fp-header__name" :title="currentFile?.name">{{ currentFile?.name }}</span>
                    <span v-if="currentFile?.size" class="easy-fp-header__size">{{ formatSize(currentFile.size) }}</span>
                  </div>
                </div>
                <div class="easy-fp-header__actions">
                  <div v-if="normalizedFiles.length > 1" class="easy-fp-nav">
                    <button class="easy-fp-nav__btn" :disabled="currentIndex <= 0" title="上一个" @click="navigate(-1)">
                      <svg
                        viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round"
                      >
                        <polyline points="15 18 9 12 15 6" />
                      </svg>
                    </button>
                    <span class="easy-fp-nav__text">{{ currentIndex + 1 }} / {{ normalizedFiles.length }}</span>
                    <button
                      class="easy-fp-nav__btn" :disabled="currentIndex >= normalizedFiles.length - 1" title="下一个"
                      @click="navigate(1)"
                    >
                      <svg
                        viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round"
                      >
                        <polyline points="9 18 15 12 9 6" />
                      </svg>
                    </button>
                  </div>
                  <a class="easy-fp-action-btn" :href="currentFile?.url" :download="currentFile?.name" title="下载">
                    <svg
                      viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
                      stroke-linecap="round"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="7 10 12 15 17 10" />
                      <line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                  </a>
                  <a class="easy-fp-action-btn" :href="currentFile?.url" target="_blank" title="在新标签页打开">
                    <svg
                      viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
                      stroke-linecap="round"
                    >
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </a>
                  <button class="easy-fp-action-btn easy-fp-close" title="关闭" @click="closePreview">
                    <svg
                      viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"
                      stroke-linecap="round"
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                </div>
              </div>

              <!-- 内容区 -->
              <div class="easy-fp-body">
                <!-- Loading 遮罩 -->
                <div v-if="loading" class="easy-fp-loading">
                  <div class="easy-fp-loading__spinner" />
                  <span>{{ loadingText }}</span>
                </div>

                <!-- PDF（vue-office/pdf） -->
                <template v-if="currentType === 'pdf' && officeSrc">
                  <VueOfficePdf :src="officeSrc" class="easy-fp-office-viewer" @rendered="onRendered" @error="onError" />
                </template>

                <!-- Word（vue-office/docx） -->
                <template v-else-if="currentType === 'word' && !officeError">
                  <VueOfficeDocx :src="officeSrc" class="easy-fp-office-viewer" @rendered="onRendered" @error="onError" />
                </template>

                <!-- Excel（vue-office/excel） -->
                <template v-else-if="currentType === 'excel' && !officeError">
                  <VueOfficeExcel :src="officeSrc" class="easy-fp-office-viewer" @rendered="onRendered" @error="onError" />
                </template>

                <!-- Office 错误提示 -->
                <template v-else-if="officeError && ['pdf', 'word', 'excel'].includes(currentType)">
                  <div class="easy-fp-unsupported">
                    <div class="easy-fp-unsupported__icon" :class="`easy-fp-unsupported__icon--${currentType}`">
                      <component :is="currentIcon" />
                    </div>
                    <h3 class="easy-fp-unsupported__title">
                      无法预览此文件
                    </h3>
                    <p class="easy-fp-unsupported__desc">
                      {{ officeError }}
                    </p>
                    <div class="easy-fp-unsupported__actions">
                      <a class="easy-fp-btn easy-fp-btn--primary" :href="currentFile?.url" :download="currentFile?.name">
                        <svg
                          viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
                          stroke-width="2" stroke-linecap="round"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        下载文件
                      </a>
                    </div>
                  </div>
                </template>

                <!-- PPT（pptx-preview） -->
                <div
                  v-else-if="currentType === 'ppt' && !officeError" ref="pptContainerRef"
                  class="easy-fp-ppt-container"
                />

                <!-- PPT 错误提示 -->
                <template v-else-if="currentType === 'ppt' && officeError">
                  <div class="easy-fp-unsupported">
                    <div class="easy-fp-unsupported__icon easy-fp-unsupported__icon--ppt">
                      <component :is="currentIcon" />
                    </div>
                    <h3 class="easy-fp-unsupported__title">
                      无法预览此文件
                    </h3>
                    <p class="easy-fp-unsupported__desc">
                      {{ officeError }}
                    </p>
                    <div class="easy-fp-unsupported__actions">
                      <a class="easy-fp-btn easy-fp-btn--primary" :href="currentFile?.url" :download="currentFile?.name">
                        <svg
                          viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor"
                          stroke-width="2" stroke-linecap="round"
                        >
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="7 10 12 15 17 10" />
                          <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        下载文件
                      </a>
                    </div>
                  </div>
                </template>

                <!-- 图片 -->
                <template v-else-if="currentType === 'image'">
                  <div class="easy-fp-image-wrap">
                    <img :src="currentFile?.url" :alt="currentFile?.name" class="easy-fp-image">
                  </div>
                </template>

                <!-- 视频 -->
                <template v-else-if="currentType === 'video'">
                  <div class="easy-fp-video-wrap">
                    <video :src="currentFile?.url" controls class="easy-fp-video" />
                  </div>
                </template>

                <!-- 不支持的文件类型 -->
                <template v-else-if="currentType === 'file'">
                  <div class="easy-fp-unsupported">
                    <div class="easy-fp-unsupported__icon easy-fp-unsupported__icon--file">
                      <FileIcon />
                    </div>
                    <h3 class="easy-fp-unsupported__title">
                      暂不支持此格式预览
                    </h3>
                    <p class="easy-fp-unsupported__desc">
                      文件类型：<code>{{ getExt(currentFile?.url ?? '') }}</code>
                    </p>
                    <a class="easy-fp-btn easy-fp-btn--primary" :href="currentFile?.url" :download="currentFile?.name">
                      <svg
                        viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"
                        stroke-linecap="round"
                      >
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="7 10 12 15 17 10" />
                        <line x1="12" y1="15" x2="12" y2="3" />
                      </svg>
                      下载文件
                    </a>
                  </div>
                </template>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped lang="scss">
@use '../../../easy-ui/src/styles/tokens' as *;
$radius: 10px;
$shadow:
  0 20px 60px rgba(0, 0, 0, 0.15),
  0 4px 16px rgba(0, 0, 0, 0.06);
$transition: 0.2s ease;

@mixin tc($t, $c) {
  .easy-file-preview__icon--#{$t},
  .easy-fp-header__icon--#{$t},
  .easy-fp-unsupported__icon--#{$t} {
    color: $c;
    background-color: rgba($c, 0.1);
  }
}

.easy-file-preview {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.easy-file-preview__list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.easy-file-preview__item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border-radius: $radius;
  border: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
  cursor: pointer;
  transition: all $transition;
  user-select: none;
  &:hover {
    background: var(--el-fill-color-light);
    border-color: rgba(var(--el-color-primary), 0.3);
    box-shadow: 0 2px 8px rgba(var(--el-color-primary), 0.08);
    .easy-file-preview__btn {
      opacity: 1;
      color: var(--el-color-primary);
    }
  }
}
.easy-file-preview__icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-placeholder);
  background: var(--el-fill-color-light);
  svg {
    width: 18px;
    height: 18px;
  }
  @include tc(pdf, var(--el-color-danger));
  @include tc(word, var(--el-color-primary));
  @include tc(excel, $file-excel);
  @include tc(ppt, $file-ppt);
  @include tc(image, $file-image);
  @include tc(video, $file-video);
  @include tc(file, $file-other);
}
.easy-file-preview__info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.easy-file-preview__name {
  font-size: 13px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.easy-file-preview__size {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.easy-file-preview__btn {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: var(--el-text-color-placeholder);
  opacity: 0;
  transition: all $transition;
  &:hover {
    background: rgba(var(--el-color-primary), 0.08);
  }
}
.easy-file-preview__empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 32px 16px;
  color: var(--el-text-color-placeholder);
  font-size: 13px;
  svg {
    opacity: 0.4;
  }
}

.easy-fp-mask {
  position: fixed;
  inset: 0;
  z-index: 2100;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  backdrop-filter: blur(2px);
}
.easy-fp-dialog {
  width: min(92vw, 1100px);
  height: min(90vh, 800px);
  background: var(--el-bg-color);
  border-radius: 16px;
  box-shadow: $shadow;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
}
.easy-fp-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-bottom: 1px solid var(--el-border-color);
  flex-shrink: 0;
  gap: 12px;
  z-index: 10;
}
.easy-fp-header__left {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  flex: 1;
}
.easy-fp-header__icon {
  flex-shrink: 0;
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-placeholder);
  background: var(--el-fill-color-light);
  svg {
    width: 18px;
    height: 18px;
  }
  @include tc(pdf, var(--el-color-danger));
  @include tc(word, var(--el-color-primary));
  @include tc(excel, $file-excel);
  @include tc(ppt, $file-ppt);
  @include tc(image, $file-image);
  @include tc(video, $file-video);
  @include tc(file, $file-other);
}
.easy-fp-header__info {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.easy-fp-header__name {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 500px;
}
.easy-fp-header__size {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
}
.easy-fp-header__actions {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}
.easy-fp-nav {
  display: flex;
  align-items: center;
  gap: 2px;
  margin-right: 8px;
  padding: 0 4px;
  border-right: 1px solid var(--el-border-color);
}
.easy-fp-nav__btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: var(--el-text-color-secondary);
  transition: all $transition;
  &:hover:not(:disabled) {
    background: var(--el-fill-color-light);
    color: var(--el-color-primary);
  }
  &:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }
}
.easy-fp-nav__text {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  padding: 0 6px;
  white-space: nowrap;
}
.easy-fp-action-btn {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  color: var(--el-text-color-secondary);
  text-decoration: none;
  transition: all $transition;
  &:hover {
    background: var(--el-fill-color-light);
    color: var(--el-color-primary);
  }
}
.easy-fp-close:hover {
  background: var(--el-color-danger-light-9) !important;
  color: var(--el-color-danger) !important;
}

.easy-fp-body {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: var(--el-fill-color-lighter);
}
.easy-fp-office-viewer {
  width: 100%;
  height: 100%;
  overflow: auto;
}
.easy-fp-ppt-container {
  position: absolute;
  inset: 0;
  overflow: auto;
  background: var(--el-fill-color);
  z-index: 1;
}

// vue-office/docx 样式覆盖
.easy-fp-office-viewer :deep(.docx-wrapper) {
  background: var(--el-fill-color) !important;
  padding: 20px 0 !important;
  & > section.docx {
    box-shadow: 0 1px 8px rgba(0, 0, 0, 0.12) !important;
    margin: 12px auto !important;
  }
}

// vue-office/excel 样式覆盖
.easy-fp-office-viewer :deep(.excel-container) {
  width: 100% !important;
  height: 100% !important;
}

.easy-fp-loading {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: var(--el-text-color-placeholder);
  font-size: 14px;
  background: rgba(248, 250, 252, 0.92);
  z-index: 10;
}
.easy-fp-loading__spinner {
  width: 32px;
  height: 32px;
  border: 3px solid var(--el-border-color);
  border-top-color: var(--el-color-primary);
  border-radius: 50%;
  animation: fp-spin 0.8s linear infinite;
}
@keyframes fp-spin {
  to {
    transform: rotate(360deg);
  }
}

.easy-fp-image-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  background: repeating-conic-gradient(#e2e8f0 0% 25%, transparent 0% 50%) 0 0 / 16px 16px;
}
.easy-fp-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 4px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
}
.easy-fp-video-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #000;
}
.easy-fp-video {
  max-width: 100%;
  max-height: 100%;
}

.easy-fp-unsupported {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  text-align: center;
}
.easy-fp-unsupported__icon {
  width: 72px;
  height: 72px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-fill-color-light);
  color: var(--el-text-color-placeholder);
  svg {
    width: 36px;
    height: 36px;
  }
  @include tc(pdf, var(--el-color-danger));
  @include tc(word, var(--el-color-primary));
  @include tc(excel, $file-excel);
  @include tc(ppt, $file-ppt);
  @include tc(image, $file-image);
  @include tc(video, $file-video);
  @include tc(file, $file-other);
}
.easy-fp-unsupported__title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}
.easy-fp-unsupported__desc {
  font-size: 13px;
  color: var(--el-text-color-placeholder);
  line-height: 1.6;
  margin: 0;
  code {
    background: var(--el-fill-color-light);
    padding: 2px 6px;
    border-radius: 4px;
    font-family: monospace;
    color: var(--el-text-color-secondary);
  }
}
.easy-fp-unsupported__actions {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}
.easy-fp-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
  color: var(--el-text-color-secondary);
  cursor: pointer;
  text-decoration: none;
  transition: all $transition;
  &:hover {
    border-color: rgba(var(--el-color-primary), 0.4);
    color: var(--el-color-primary);
  }
  &.easy-fp-btn--primary {
    background: var(--el-color-primary);
    border-color: var(--el-color-primary);
    color: #fff;
    &:hover {
      background: #4540d4;
      color: #fff;
    }
  }
}

.easy-fp-fade-enter-active {
  transition: opacity 0.25s ease;
}
.easy-fp-fade-leave-active {
  transition: opacity 0.2s ease;
}
.easy-fp-fade-enter-from,
.easy-fp-fade-leave-to {
  opacity: 0;
}
.easy-fp-zoom-enter-active {
  transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.easy-fp-zoom-leave-active {
  transition: all 0.2s ease;
}
.easy-fp-zoom-enter-from {
  opacity: 0;
  transform: scale(0.88) translateY(12px);
}
.easy-fp-zoom-leave-to {
  opacity: 0;
  transform: scale(0.95);
}
</style>
