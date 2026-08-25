<script setup lang="ts">
import type { UploadEmits, UploadProps } from './types'

import { View } from '@element-plus/icons-vue'
import { ref } from 'vue'

import { formatFileSize } from '../../../easy-ui/src/utils/file'
import { getFileIcon } from './use-file-icons'
import { useUploadCore } from './use-upload-core'

// 保持对外类型导出兼容（原定义在 file-upload.vue）
export type { UploadEmits, UploadFileItem, UploadProps, UploadStatus, UploadValueMode } from './types'

defineOptions({ name: 'EasyUpload' })

const props = withDefaults(defineProps<UploadProps>(), {
  modelValue: () => [],
  valueMode: 'array',
  multiple: true,
  accept: '*',
  disabled: false,
  downloadable: true,
  triggerText: '',
  listType: 'horizontal',
  minSize: 0,
  autoNetworkUpload: true,
})

const emit = defineEmits<UploadEmits>()

/** 文件输入框引用 */
const inputRef = ref<HTMLInputElement>()

// ──── 核心逻辑（文件列表 / 校验 / 上传 / 删除 / 预览 / 下载 / modelValue 同步）────
const {
  isDragover,
  fileList,
  isMaxReached,
  handleTriggerClick,
  handleInputChange,
  handleDrop,
  handleRemove,
  handlePreview,
  handleDownload,
  open,
  clear,
  getFileList,
} = useUploadCore(props, emit, inputRef)

// ──── 暴露方法（通过 ref 调用）────
defineExpose({ open, clear, getFileList })
</script>

<template>
  <div class="easy-upload" :class="{ 'is-disabled': disabled }">
    <!-- ========================================
         文件列表
         包含上传按钮和已上传文件列表
    ======================================== -->
    <div class="easy-upload__list">
      <!-- ----------------------------------------
           上传按钮（放在最上面）
      ---------------------------------------- -->
      <div v-if="!disabled && !isMaxReached" class="easy-upload__trigger" :class="{ 'is-dragover': isDragover }"
        @click="handleTriggerClick" @dragover.prevent="isDragover = true" @dragleave.prevent="isDragover = false"
        @drop.prevent="handleDrop">
        <!-- 自定义触发区域插槽 -->
        <slot name="trigger">
          <div class="easy-upload__trigger-inner">
            <!-- 图标 -->
            <div class="easy-upload__trigger-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
            </div>
            <!-- 文字 -->
            <div class="easy-upload__trigger-text">
              <span class="primary">{{ triggerText || '点击上传' }}</span>
              <span class="secondary">或拖拽文件到此处</span>
            </div>
          </div>
        </slot>
      </div>

      <!-- ----------------------------------------
           已上传文件列表
      ---------------------------------------- -->
      <TransitionGroup name="easy-upload-fade">
        <div v-for="(item, index) in fileList" :key="item.id" class="easy-upload__item"
          :class="[`easy-upload__item--${item.status}`, { 'easy-upload__item--just-uploaded': item.justUploaded }]"
          @animationend="item.justUploaded = false">
          <!-- 文件图标 -->
          <div class="easy-upload__file-icon">
            <component :is="getFileIcon(item)" />
          </div>

          <!-- 文件信息 -->
          <div class="easy-upload__file-info">
            <span class="easy-upload__file-name" :title="item.name">{{ item.name }}</span>
            <span v-if="item.size" class="easy-upload__file-size">
              {{ formatFileSize(item.size) }}
            </span>
          </div>

          <!-- 上传进度 -->
          <div v-if="item.status === 'uploading'" class="easy-upload__progress">
            <div class="easy-upload__progress-bar">
              <div class="easy-upload__progress-fill" :style="{ width: `${item.percent || 0}%` }" />
            </div>
            <span class="easy-upload__progress-text">{{ item.percent || 0 }}%</span>
          </div>

          <!-- 操作按钮 -->
          <div v-if="item.status !== 'uploading'" class="easy-upload__actions">
            <!-- 预览 -->
            <button v-if="item.url && downloadable" class="easy-upload__btn easy-upload__btn--preview" title="预览"
              @click.stop="handlePreview(item)">
              <el-icon>
                <View />
              </el-icon>
            </button>
            <!-- 下载 -->
            <button v-if="item.url && downloadable" class="easy-upload__btn easy-upload__btn--download" title="下载"
              @click.stop="handleDownload(item)">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
            <!-- 删除 -->
            <button v-if="!disabled" class="easy-upload__btn easy-upload__btn--delete" title="删除"
              @click.stop="handleRemove(index)">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6M14 11v6" />
                <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
              </svg>
            </button>
          </div>

          <!-- 成功状态角标 -->
          <div v-if="!disabled && item.status === 'success'" class="easy-upload__badge">
            <svg viewBox="0 0 12 12" width="10" height="10" fill="none" stroke="#fff" stroke-width="2">
              <polyline points="2 6 5 9 10 3" />
            </svg>
          </div>

          <!-- 错误标签 -->
          <div v-if="!disabled && item.status === 'error'" class="easy-upload__error-tag">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            上传失败
          </div>
        </div>
      </TransitionGroup>
    </div>

    <!-- ========================================
         提示文字
    ======================================== -->
    <div v-if="tip || $slots.tip" class="easy-upload__tip">
      <slot name="tip">
        {{ tip }}
      </slot>
    </div>

    <!-- 隐藏的文件输入框 -->
    <input ref="inputRef" type="file" :accept="accept" :multiple="multiple && (limit === undefined || limit > 1)"
      class="easy-upload__input" @change="handleInputChange">
  </div>
</template>

<style scoped lang="scss">
// ============================================================
// 设计令牌
// ============================================================
// ============================================================
// 样式变量
// ============================================================

$radius: 8px;

// ============================================================
// 组件容器
// ============================================================
.easy-upload {
  display: inline-block;
  width: 100%;

  &.is-disabled {
    // pointer-events: none;
    // opacity: 0.6;
  }
}

// ============================================================
// 文件列表
// ============================================================
.easy-upload__list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 12px;
}

// ============================================================
// 单个文件项
// ============================================================
.easy-upload__item {
  position: relative;
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 14px 16px;
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: $radius;
  transition: all 0.2s ease;

  &:hover {
    border-color: var(--el-border-color-darker);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .easy-upload__actions {
      opacity: 1;
    }
  }

  &.easy-upload__item--success {
    border-color: var(--el-fill-color-light);

    .easy-upload__badge {
      opacity: 1;
    }
  }

  &.easy-upload__item--just-uploaded {
    animation: easy-upload-flash 3s ease;
  }

  &.easy-upload__item--uploading {
    border-color: var(--el-color-primary-light-9);
  }

  &.easy-upload__item--error {
    border-color: var(--el-fill-color-light);
    background: var(--el-fill-color-light);
  }
}

// ============================================================
// 文件图标
// ============================================================
.easy-upload__file-icon {
  flex-shrink: 0;
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-fill-color-light);
  border-radius: 6px;

  svg {
    width: 28px;
    height: 28px;
  }
}

// ============================================================
// 文件信息
// ============================================================
.easy-upload__file-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.easy-upload__file-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.easy-upload__file-size {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

// ============================================================
// 进度条
// ============================================================
.easy-upload__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 10px 16px;
  background: linear-gradient(to top, rgba(#fff, 0.98), rgba(#fff, 0.95));
  border-radius: 0 0 $radius $radius;
  display: flex;
  align-items: center;
  gap: 12px;
}

.easy-upload__progress-bar {
  flex: 1;
  height: 4px;
  background: var(--el-fill-color-light);
  border-radius: 2px;
  overflow: hidden;
}

.easy-upload__progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--el-color-primary), var(--el-color-primary)-hover);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.easy-upload__progress-text {
  font-size: 12px;
  font-weight: 500;
  color: var(--el-color-primary);
  min-width: 36px;
  text-align: right;
}

// ============================================================
// 操作按钮
// ============================================================
.easy-upload__actions {
  display: flex;
  gap: 4px;
  transition: opacity 0.2s ease;
}

.easy-upload__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &.easy-upload__btn--preview {
    background: var(--el-color-success)-light;
    color: var(--el-color-success);

    &:hover {
      background: var(--el-color-success);
      color: #fff;
    }
  }

  &.easy-upload__btn--download {
    background: rgba(79, 110, 247, 0.08);
    color: var(--el-color-primary);

    &:hover {
      background: var(--el-color-primary);
      color: #fff;
    }
  }

  &.easy-upload__btn--delete {
    background: var(--el-fill-color-light);
    color: var(--el-color-danger);

    &:hover {
      background: var(--el-color-danger);
      color: #fff;
    }
  }
}

// ============================================================
// 成功角标
// ============================================================
.easy-upload__badge {
  position: absolute;
  top: -6px;
  right: -6px;
  width: 20px;
  height: 20px;
  background: var(--el-color-success);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
  box-shadow: 0 2px 4px rgba(var(--el-color-success), 0.3);
}

// ============================================================
// 错误标签
// ============================================================
.easy-upload__error-tag {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: var(--el-color-danger);
  background: var(--el-fill-color-light);
  padding: 4px 10px;
  border-radius: 4px;
}

// ============================================================
// 上传按钮
// ============================================================
.easy-upload__trigger {
  display: flex;
  align-items: center;
  justify-content: center;
  grid-column: 1 / -1;
  padding: 24px;
  border: 2px dashed var(--el-border-color-lighter);
  border-radius: $radius;
  background: var(--el-fill-color-light);
  cursor: pointer;
  transition: all 0.25s ease;

  &:hover,
  &.is-dragover {
    border-color: var(--el-color-primary);
    background: rgba(79, 110, 247, 0.08);

    .easy-upload__trigger-icon {
      background: var(--el-color-primary);
      color: #fff;
      transform: translateY(-2px);
    }

    .easy-upload__trigger-text .primary {
      color: var(--el-color-primary);
    }
  }
}

.easy-upload__trigger-inner {
  display: flex;
  align-items: center;
  gap: 16px;
}

.easy-upload__trigger-icon {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-bg-color);
  border-radius: 12px;
  color: var(--el-color-primary);
  box-shadow: 0 2px 8px rgba(var(--el-color-primary), 0.15);
  transition: all 0.25s ease;

  svg {
    width: 24px;
    height: 24px;
  }
}

.easy-upload__trigger-text {
  display: flex;
  flex-direction: column;
  gap: 2px;

  .primary {
    font-size: 15px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    transition: color 0.2s;
  }

  .secondary {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
}

// ============================================================
// 隐藏 input
// ============================================================
.easy-upload__input {
  display: none;
}

// ============================================================
// 提示文字
// ============================================================
.easy-upload__tip {
  margin-top: 10px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  line-height: 1.5;
}

// ============================================================
// 过渡动画
// ============================================================
.easy-upload-fade-enter-active,
.easy-upload-fade-leave-active {
  transition: all 0.25s ease;
}

.easy-upload-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}

.easy-upload-fade-leave-to {
  opacity: 0;
  transform: translateX(8px);
}

// ============================================================
// 上传成功闪烁动画（浅色/暗色通用）
// ============================================================
@keyframes easy-upload-flash {
  0% {
    box-shadow: 0 0 0 0 rgba(var(--el-color-success), 0);
    border-color: var(--el-fill-color-light);
    background: var(--el-bg-color);
    transform: scale(1);
  }

  12% {
    box-shadow:
      0 0 0 10px rgba(var(--el-color-success), 0.55),
      0 0 30px rgba(var(--el-color-success), 0.4),
      0 0 60px rgba(var(--el-color-success), 0.18);
    border-color: var(--el-color-success);
    background: var(--el-fill-color-light);
    transform: scale(1.02);
  }

  28% {
    box-shadow: 0 0 0 3px rgba(var(--el-color-success), 0.3);
    border-color: var(--el-fill-color-light);
    background: var(--el-bg-color);
    transform: scale(1);
  }

  44% {
    box-shadow:
      0 0 0 8px rgba(var(--el-color-success), 0.45),
      0 0 24px rgba(var(--el-color-success), 0.3),
      0 0 48px rgba(var(--el-color-success), 0.12);
    border-color: var(--el-color-success);
    background: var(--el-fill-color-light);
    transform: scale(1.015);
  }

  58% {
    box-shadow: 0 0 0 2px rgba(var(--el-color-success), 0.22);
    border-color: var(--el-fill-color-light);
    background: var(--el-bg-color);
    transform: scale(1);
  }

  76% {
    box-shadow:
      0 0 0 6px rgba(var(--el-color-success), 0.42),
      0 0 18px rgba(var(--el-color-success), 0.22);
    border-color: var(--el-color-success);
    background: var(--el-fill-color-light);
    transform: scale(1.01);
  }

  100% {
    box-shadow: none;
    border-color: var(--el-fill-color-light);
    background: var(--el-bg-color);
    transform: scale(1);
  }
}
</style>

<style lang="scss">
html.dark .easy-upload__item {
  background: var(--el-bg-color);
  border-color: var(--el-border-color);
}
html.dark .easy-upload__item:hover {
  border-color: var(--el-border-color-darker);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}
html.dark .easy-upload__trigger {
  background: var(--el-fill-color-lighter);
  border-color: var(--el-border-color-darker);
}
html.dark .easy-upload__trigger:hover,
html.dark .easy-upload__trigger.is-dragover {
  background: rgba(79, 110, 247, 0.1);
}
html.dark .easy-upload__file-name {
  color: var(--el-text-color-primary);
}
html.dark .easy-upload__file-size,
html.dark .easy-upload__tip {
  color: var(--el-text-color-secondary);
}
html.dark .easy-upload__trigger-text .primary {
  color: var(--el-text-color-primary);
}
html.dark .easy-upload__trigger-text .secondary {
  color: var(--el-text-color-secondary);
}
</style>
