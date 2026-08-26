<script setup lang="ts">
import type { CompressOptions } from './types'

import { computed, ref } from 'vue'
import EasyTag from '../../tag'
import IcActions from './components/ic-actions.vue'
import IcCompare from './components/ic-compare.vue'
import IcOptions from './components/ic-options.vue'
import IcResults from './components/ic-results.vue'
import { DEFAULT_OPTIONS } from './types'
import { useImageCompressor } from './use-image-compressor'

/** 打开文件选择器的 window API（用于获取默认输出文件夹） */
type FilePickerWindow = Window & {
  showOpenFilePicker?: (...args: any[]) => Promise<unknown>
}

defineOptions({ name: 'EasyImageCompressor' })

// ──── 压缩选项（v-model 传给 ic-options）────
const options = ref<CompressOptions>({ ...DEFAULT_OPTIONS })

// ──── 核心逻辑（待压缩文件 / 输出目录 / 压缩 / 结果 / 对比预览）────
const {
  inputRef,
  pendingFiles,
  selectFiles,
  pickImages,
  removePendingFile,
  outputDirName,
  supportsDirectoryPicker,
  chooseOutputDir,
  clearOutputDir,
  compressing,
  progress,
  startCompress,
  results,
  clearHistory,
  selectedIndex,
  selectedItem,
  previewScale,
  previewRotation,
  openPreview,
  closePreview,
  previewPrev,
  previewNext,
  zoomIn,
  zoomOut,
  rotate,
} = useImageCompressor()

// ──── 上传 ────
const isDragover = ref(false)

/** 浏览器是否支持 showOpenFilePicker（决定能否拿到默认输出文件夹） */
const supportsFilePicker = computed(() => typeof (window as FilePickerWindow).showOpenFilePicker === 'function')

/** 选择图片：优先 File System Access API（自动默认输出文件夹），不支持则降级 input */
async function handleSelect() {
  if (supportsFilePicker.value) {
    await pickImages()
  }
  else {
    inputRef.value?.click()
  }
}

function handleInputChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (input.files?.length)
    selectFiles(input.files)
  input.value = ''
}

function handleDrop(e: DragEvent) {
  isDragover.value = false
  if (e.dataTransfer?.files.length)
    selectFiles(e.dataTransfer.files)
}
</script>

<template>
  <div class="easy-image-compressor">
    <!-- 上传区 -->
    <div
      class="ic-upload"
      :class="{ 'is-dragover': isDragover }"
      @click="handleSelect"
      @dragover.prevent="isDragover = true"
      @dragleave="isDragover = false"
      @drop.prevent="handleDrop"
    >
      <input ref="inputRef" type="file" accept="image/*" multiple style="display: none" @change="handleInputChange">
      <div class="ic-upload__icon">
        <svg viewBox="0 0 24 24" width="40" height="40" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M4 16l4.586-4.586a2 2 0 0 1 2.828 0L16 16" />
          <path d="M14 14l1.586-1.586a2 2 0 0 1 2.828 0L20 14" />
          <rect x="2" y="4" width="20" height="16" rx="2" />
        </svg>
      </div>
      <div class="ic-upload__text">
        点击或拖拽图片到此处（支持多选）
      </div>
      <div class="ic-upload__hint">
        支持 JPG / PNG / WebP / GIF
      </div>
    </div>

    <!-- 压缩选项（固定 3 列） -->
    <section class="ic-section">
      <IcOptions
        v-model="options"
        :output-dir-name="outputDirName"
        :supports-directory-picker="supportsDirectoryPicker"
        @choose-dir="chooseOutputDir"
        @clear-dir="clearOutputDir"
      />
    </section>

    <!-- 操作按钮 + 进度 -->
    <IcActions
      :compressing="compressing"
      :progress="progress"
      :file-count="pendingFiles.length"
      :result-count="results.length"
      @select="handleSelect"
      @compress="startCompress(options)"
      @clear="clearHistory"
    />

    <!-- 待压缩文件列表 -->
    <div v-if="pendingFiles.length > 0" class="ic-pending">
      <span class="ic-pending__title">待压缩（{{ pendingFiles.length }}）</span>
      <EasyTag
        v-for="(file, i) in pendingFiles"
        :key="`${file.name}-${i}`"
        closable
        size="small"
        @close="removePendingFile(i)"
      >
        {{ file.name }}
      </EasyTag>
    </div>

    <!-- 结果表格 -->
    <section v-if="results.length > 0" class="ic-section">
      <IcResults
        :results="results"
        @select-row="openPreview"
      />
    </section>

    <!-- 对比预览（非弹窗，展示在结果下方） -->
    <section v-if="selectedItem" class="ic-section">
      <IcCompare
        :item="selectedItem"
        :index="selectedIndex"
        :total="results.length"
        :scale="previewScale"
        :rotation="previewRotation"
        @prev="previewPrev"
        @next="previewNext"
        @close="closePreview"
        @zoom-in="zoomIn"
        @zoom-out="zoomOut"
        @rotate="rotate"
      />
    </section>
  </div>
</template>

<style scoped lang="scss">
.easy-image-compressor {
  width: 100%;
}

/* ========== 上传区 ========== */
.ic-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 32px 20px;
  border: 2px dashed var(--el-border-color);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  color: var(--el-text-color-secondary);

  &:hover,
  &.is-dragover {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }

  &__text {
    font-size: 14px;
    font-weight: 500;
  }

  &__hint {
    font-size: 12px;
    color: var(--el-text-color-placeholder);
  }
}

/* ========== 区块 ========== */
.ic-section {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px dashed var(--el-border-color-lighter);
}

/* ========== 待压缩列表 ========== */
.ic-pending {
  margin-top: 12px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;

  &__title {
    font-size: 13px;
    font-weight: 500;
    color: var(--el-text-color-regular);
  }
}
</style>
