<script setup lang="ts">
import type { MarkdownEmits, MarkdownProps, MarkdownView } from './types'

import { computed, ref } from 'vue'
import { EasyButton } from '../../button'
import { EasySelect } from '../../select'
import { defaultMarkdownTheme } from '../style/themes'
import { useMarkdownDownload } from './use-download'
import { useMarkdownEditor } from './use-editor'
import { useMarkdownMermaid } from './use-mermaid'
import { useMarkdownRender } from './use-render'
import { useMarkdownTheme } from './use-theme'

// 保持对外类型导出兼容（原定义在 markdown.vue）
export type { MarkdownDownloadType, MarkdownProps, MarkdownView } from './types'

defineOptions({
  name: 'EasyMarkdown',
})

const props = withDefaults(defineProps<MarkdownProps>(), {
  modelValue: '',
  placeholder: '请输入 Markdown 内容...',
  showToolbar: true,
  defaultView: 'split',
  height: 400,
  fill: false,
  lineNumbers: false,
  codeBlockLineNumbers: false,
  mermaid: false,
  softWrap: true,
  disabled: false,
  exportName: 'document',
  theme: defaultMarkdownTheme,
  themes: () => [],
})

const emit = defineEmits<MarkdownEmits>()

const view = ref<MarkdownView>(props.defaultView)

// ──── 主题 ────
const { themeOptions, currentTheme, setTheme, getTheme, handleThemeChange } = useMarkdownTheme(props, emit)

// ──── 渲染管线（markdown-it + 容错预处理 + 扩展规则）────
const { md, renderedHtml } = useMarkdownRender(props)

// ──── Mermaid 图表（预览与图片导出共用）────
const previewEl = ref<HTMLElement>()
const { renderMermaidBlocks } = useMarkdownMermaid(props, view, previewEl, renderedHtml)

// ──── 下载导出（md / html / docx / pdf / png / jpg / webp）────
const {
  downloadType,
  downloadOptions,
  handleDownloadChange,
  downloadMd,
  downloadHtml,
  downloadPdf,
  downloadPdfFile,
  downloadDocx,
  downloadImage,
} = useMarkdownDownload(props, { currentTheme, renderedHtml, md, renderMermaidBlocks, emit })

// ──── 编辑体验 + 行号 gutter + split 滚动同步 ────
const textareaEl = ref<HTMLTextAreaElement>()
const {
  handleKeydown,
  lineHeights,
  scrollTop,
  onEditScroll,
  onPreviewScroll,
} = useMarkdownEditor(props, emit, view, textareaEl, previewEl)

// ──── 视图 / 输入 / 保存 ────

function setView(v: MarkdownView) {
  view.value = v
}

function handleInput(e: Event) {
  const value = (e.target as HTMLTextAreaElement).value
  emit('update:modelValue', value)
  emit('change', value)
}

function handleSave() {
  emit('save', props.modelValue ?? '')
}

// ──── 高度 / 样式 ────

const bodyStyle = computed(() => {
  if (props.fill)
    return {}
  return { height: `${props.height}px` }
})

defineExpose({
  setView,
  setTheme,
  getTheme,
  getHtml: () => renderedHtml.value,
  downloadMd,
  downloadHtml,
  downloadPdf,
  downloadPdfFile,
  downloadDocx,
  downloadImage,
})
</script>

<template>
  <div class="easy-markdown" :class="{ 'is-disabled': disabled, 'is-fill': fill }" :data-theme="currentTheme">
    <!-- 工具栏 -->
    <div v-if="showToolbar" class="easy-markdown__toolbar">
      <div class="easy-markdown__views">
        <EasyButton type="text" size="small" class="easy-markdown__view-btn" :class="{ 'is-active': view === 'edit' }"
          :disabled="disabled" @click="setView('edit')">
          编辑
        </EasyButton>
        <EasyButton type="text" size="small" class="easy-markdown__view-btn" :class="{ 'is-active': view === 'split' }"
          :disabled="disabled" @click="setView('split')">
          分屏
        </EasyButton>
        <EasyButton type="text" size="small" class="easy-markdown__view-btn"
          :class="{ 'is-active': view === 'preview' }" :disabled="disabled" @click="setView('preview')">
          预览
        </EasyButton>
      </div>

      <div class="easy-markdown__actions">
        <EasySelect v-model="currentTheme" class="easy-markdown__theme-select" :options="themeOptions" value-key="key"
          :disabled="disabled" placeholder="切换主题" size="small" @change="handleThemeChange" />
        <EasyButton type="primary" size="small" class="easy-markdown__action" :disabled="disabled" @click="handleSave">
          保存
        </EasyButton>
        <EasySelect v-model="downloadType" class="easy-markdown__download-select" :options="downloadOptions"
          :disabled="disabled" placeholder="下载文档" size="small" @change="handleDownloadChange" />
      </div>
    </div>

    <!-- 主体区域 -->
    <div class="easy-markdown__body" :class="{
      'is-edit': view === 'edit',
      'is-preview': view === 'preview',
      'is-split': view === 'split',
    }" :style="bodyStyle">
      <!-- 编辑区 -->
      <div v-show="view === 'edit' || view === 'split'" class="easy-markdown__pane easy-markdown__pane--edit">
        <div class="easy-markdown__edit">
          <div v-if="lineNumbers" class="easy-markdown__gutter" aria-hidden="true">
            <div class="easy-markdown__gutter-inner" :style="{ transform: `translateY(${-scrollTop}px)` }">
              <div v-for="(h, i) in lineHeights" :key="i" class="easy-markdown__gutter-line"
                :style="{ height: `${h}px` }">
                {{ i + 1 }}
              </div>
            </div>
          </div>
          <textarea ref="textareaEl" class="easy-markdown__textarea" :class="{
            'is-with-gutter': lineNumbers,
            'is-no-wrap': !softWrap,
          }" :value="modelValue" :placeholder="placeholder" :disabled="disabled" :spellcheck="false"
            :wrap="softWrap ? 'soft' : 'off'" @input="handleInput" @keydown="handleKeydown" @scroll="onEditScroll" />
        </div>
      </div>

      <!-- 预览区 -->
      <div v-show="view === 'preview' || view === 'split'" ref="previewEl"
        class="easy-markdown__pane easy-markdown__pane--preview" @scroll="onPreviewScroll">
        <div class="easy-markdown__preview markdown-body" v-html="renderedHtml" />
      </div>
    </div>
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 markdown-style.scss） -->
<style scoped src="./markdown-style.scss" lang="scss"></style>

<!-- 主题预览样式：独立维护在 style/preview/*.scss（SCSS 嵌套，以 .easy-markdown 类名前缀隔离） -->
<style src="../style/preview/base.scss" lang="scss"></style>

<style src="../style/preview/github.scss" lang="scss"></style>

<style src="../style/preview/clean.scss" lang="scss"></style>

<style src="../style/preview/extras.scss" lang="scss"></style>
