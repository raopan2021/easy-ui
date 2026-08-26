<script setup lang="ts">
import type { SearchItem } from '../../../search-form/src/types'

import type { CompressOptions } from '../types'
import { computed } from 'vue'
import EasyButton from '../../../button'
import EasyInput from '../../../input'
import EasyRadio, { EasyRadioGroup } from '../../../radio'
import EasySearchForm from '../../../search-form'
import EasySwitch from '../../../switch'
import EasyTag from '../../../tag'

import { DEFAULT_OPTIONS } from '../types'

defineProps<{
  /** 输出文件夹名称（未选择为空串） */
  outputDirName: string
  /** 浏览器是否支持目录选择 API */
  supportsDirectoryPicker: boolean
}>()

const emit = defineEmits<{
  (e: 'chooseDir'): void
  (e: 'clearDir'): void
}>()

/** 压缩选项（v-model 绑定到父级 reactive 对象） */
const options = defineModel<CompressOptions>({ required: true })

/** 尺寸调整方式选项 */
const sizeModeOptions = [
  { label: '保持原始尺寸', value: 'original' },
  { label: '指定像素', value: 'pixel' },
  { label: '百分比', value: 'percent' },
  { label: '短边', value: 'shortEdge' },
  { label: '长边', value: 'longEdge' },
  { label: '宽度', value: 'width' },
  { label: '高度', value: 'height' },
]

/** 输出格式选项 */
const outputFormatOptions = [
  { label: '和输入保持一致', value: 'auto' },
  { label: 'JPG', value: 'jpeg' },
  { label: 'PNG', value: 'png' },
  { label: 'WebP', value: 'webp' },
]

/** 缩放方式选项（映射 compressorjs resize） */
const resizeOptions = [
  { label: '保持比例（contain）', value: 'contain' },
  { label: '裁剪填满（cover）', value: 'cover' },
  { label: '拉伸铺满（scale）', value: 'scale' },
]

/** 透明背景填充色选项 */
const fillColorOptions = [
  { label: '不填充（保留透明）', value: '' },
  { label: '白色', value: 'white' },
  { label: '黑色', value: 'black' },
]

/**
 * 选项表单 items 配置（search-form 配置式渲染）：
 * - 其余字段通过 field-{prop} 插槽渲染，双向绑定 options（即改即用）
 */
const items = computed<SearchItem[]>(() => [
  // ── 第一组：压缩质量与尺寸 ──
  { prop: 'quality', label: '质量', type: 'custom' },
  { prop: 'lossless', label: '一键无损压缩', type: 'custom' },
  { prop: 'sizeMode', label: '尺寸调整方式', span: 24, type: 'custom' },
  { prop: 'sizeValue', label: '尺寸数值', type: 'custom', hide: options.value.sizeMode === 'original' },
  { prop: 'resize', label: '缩放方式', type: 'custom' },
  // ── 第二组：输出设置 ──
  { prop: 'outputFormat', label: '输出格式', type: 'custom' },
  { prop: 'prefix', label: '添加前缀', type: 'custom' },
  { prop: 'suffix', label: '添加后缀', type: 'custom' },
  { prop: 'skipLarger', label: '跳过更大文件', type: 'custom' },
  { prop: 'outputDir', label: '输出文件夹', type: 'custom' },
  // ── 第三组：其他 ──
  { prop: 'checkOrientation', label: '修正 EXIF 方向', type: 'custom' },
  { prop: 'retainExif', label: '保留 EXIF 信息', type: 'custom' },
  { prop: 'canvasFillColor', label: '透明背景填充色', type: 'custom' },
])

/** 恢复默认选项（search-form 重置按钮触发） */
function handleReset() {
  Object.assign(options.value, { ...DEFAULT_OPTIONS })
}
</script>

<template>
  <EasySearchForm
    :model-value="options"
    :items="items"
    reset-button-text="恢复默认"
    :show-expand-button="false"
    class="ic-options"
    @reset="handleReset"
  >
    <!-- 质量 -->
    <template #field-quality>
      <div class="ic-options__quality">
        <EasyInput
          v-model.number="options.quality"
          type="integer"
          :range="{ min: 0, max: 100 }"
          :disabled="options.lossless"
          suffix="%"
          style="width: 100%"
        />
        <span v-if="options.lossless" class="ic-options__quality-value">无损</span>
      </div>
    </template>

    <!-- 一键无损 -->
    <template #field-lossless>
      <EasySwitch v-model="options.lossless" />
      <span class="ic-options__desc">质量固定 100%，输出更接近原图</span>
    </template>

    <!-- 尺寸调整方式 -->
    <template #field-sizeMode>
      <div class="ic-options__radios">
        <EasyRadioGroup v-model="options.sizeMode">
          <EasyRadio v-for="opt in sizeModeOptions" :key="opt.value" :label="opt.value">
            {{ opt.label }}
          </EasyRadio>
        </EasyRadioGroup>
      </div>
    </template>

    <!-- 尺寸数值 -->
    <template #field-sizeValue>
      <div v-if="options.sizeMode === 'pixel'" class="ic-options__pixel">
        <EasyInput
          v-model.number="options.pixelWidth"
          type="integer"
          :range="{ min: 1, max: 8192 }"
          style="width: 100%"
        />
        <span class="ic-options__sep">×</span>
        <EasyInput
          v-model.number="options.pixelHeight"
          type="integer"
          :range="{ min: 1, max: 8192 }"
          style="width: 100%"
        />
      </div>
      <EasyInput
        v-else
        v-model.number="options.sizeValue"
        type="integer"
        :range="{ min: 1, max: 10000 }"
        style="width: 100%"
      />
    </template>

    <!-- 缩放方式 -->
    <template #field-resize>
      <div class="ic-options__radios">
        <EasyRadioGroup v-model="options.resize">
          <EasyRadio v-for="opt in resizeOptions" :key="opt.value" :label="opt.value">
            {{ opt.label }}
          </EasyRadio>
        </EasyRadioGroup>
      </div>
      <span class="ic-options__desc">cover 会裁剪边缘，scale 会变形</span>
    </template>

    <!-- 输出格式 -->
    <template #field-outputFormat>
      <div class="ic-options__radios">
        <EasyRadioGroup v-model="options.outputFormat">
          <EasyRadio v-for="opt in outputFormatOptions" :key="opt.value" :label="opt.value">
            {{ opt.label }}
          </EasyRadio>
        </EasyRadioGroup>
      </div>
    </template>

    <!-- 添加前缀 -->
    <template #field-prefix>
      <EasyInput v-model="options.prefix" placeholder="如 comp_" style="width: 100%" />
    </template>

    <!-- 添加后缀 -->
    <template #field-suffix>
      <EasyInput v-model="options.suffix" placeholder="如 _min" style="width: 100%" />
    </template>

    <!-- 跳过更大文件 -->
    <template #field-skipLarger>
      <EasySwitch v-model="options.skipLarger" />
      <span class="ic-options__desc">输出原图，避免文件变大</span>
    </template>

    <!-- 输出文件夹 -->
    <template #field-outputDir>
      <div class="ic-options__dir">
        <template v-if="outputDirName">
          <EasyTag type="info" size="small" class="ic-options__dir-tag">
            {{ outputDirName }}
          </EasyTag>
          <span class="ic-options__dir-clear" @click="emit('clearDir')">清除</span>
        </template>
        <EasyButton
          v-else
          size="small"
          :disabled="!supportsDirectoryPicker"
          @click="emit('chooseDir')"
        >
          {{ supportsDirectoryPicker ? '选择文件夹（自动写入）' : '浏览器不支持目录选择' }}
        </EasyButton>
      </div>
      <span class="ic-options__desc">默认使用图片所在文件夹</span>
    </template>

    <!-- 修正 EXIF 方向 -->
    <template #field-checkOrientation>
      <EasySwitch v-model="options.checkOrientation" />
      <span class="ic-options__desc">读取并修正 JPEG 方向</span>
    </template>

    <!-- 保留 EXIF -->
    <template #field-retainExif>
      <EasySwitch v-model="options.retainExif" />
      <span class="ic-options__desc">压缩后保留 EXIF 数据</span>
    </template>

    <!-- 透明背景填充色 -->
    <template #field-canvasFillColor>
      <div class="ic-options__radios">
        <EasyRadioGroup v-model="options.canvasFillColor">
          <EasyRadio v-for="opt in fillColorOptions" :key="opt.value" :label="opt.value">
            {{ opt.label }}
          </EasyRadio>
        </EasyRadioGroup>
      </div>
      <span class="ic-options__desc">PNG 转 JPG 时透明区域的处理</span>
    </template>
  </EasySearchForm>
</template>

<style scoped lang="scss">
.ic-options {
  // 固定 2 列（窄屏降 1 列），覆盖 search-form 的 auto-fit
  :deep(.search-grid-form) {
    grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  }

  // 抵消 search-form 的 min-width: 250px，保证 2 列下每列按容器等分
  :deep(.search-grid-form .easy-form-item) {
    min-width: 0 !important;
    width: 100% !important;
  }

  @media (max-width: 960px) {
    :deep(.search-grid-form) {
      grid-template-columns: 1fr !important;
    }
  }

  // 隐藏"查询"按钮与分隔线（选项即改即用，无需提交；保留"恢复默认"）
  :deep(.search-actions .easy-button--primary),
  :deep(.search-actions .action-divider) {
    display: none;
  }

  &__group-title {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-regular);
    padding-bottom: 8px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    width: 100%;
  }

  &__radios {
    width: 100%;
    height: 36px;

    :deep(.easy-radio) {
      margin-right: 14px;
    }
  }

  &__quality {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
  }

  &__quality-value {
    font-size: 12px;
    font-weight: 500;
    color: var(--el-color-success);
    white-space: nowrap;
    flex-shrink: 0;
  }

  &__desc {
    margin-top: 4px;
    font-size: 12px;
    line-height: 1.4;
    color: var(--el-text-color-placeholder);
    display: block;
  }

  &__pixel {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
  }

  &__sep {
    color: var(--el-text-color-placeholder);
  }

  &__dir {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    width: 100%;
  }

  &__dir-tag {
    max-width: 140px;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  &__dir-clear {
    font-size: 12px;
    color: var(--el-color-danger);
    cursor: pointer;

    &:hover {
      opacity: 0.8;
    }
  }
}
</style>
