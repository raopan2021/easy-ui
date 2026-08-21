<script setup lang="ts">
import type { MarkdownTheme } from '../style/themes'
import hljs from 'highlight.js'
import MarkdownIt from 'markdown-it'
import { computed, ref, watch } from 'vue'
import { downloadBlob } from '../../../utils/download'
import { EasyButton } from '../../button'
import { EasySelect } from '../../select'
import { defaultMarkdownTheme, getMarkdownTheme, hljsGithubCss, markdownThemes } from '../style/themes'

export interface MarkdownProps {
  /** 绑定值（Markdown 源码） */
  modelValue?: string
  /** 占位符 */
  placeholder?: string
  /** 是否显示工具栏 */
  showToolbar?: boolean
  /** 默认视图：edit | preview | split */
  defaultView?: 'edit' | 'preview' | 'split'
  /** 编辑区与预览区高度（像素） */
  height?: number
  /** 是否禁用 */
  disabled?: boolean
  /** 导出文件名（不含扩展名） */
  exportName?: string
  /** 当前主题 key（default | github | clean，或自定义主题 key） */
  theme?: string
  /** 自定义主题列表，与内置主题合并，同名 key 覆盖 */
  themes?: MarkdownTheme[]
}

defineOptions({
  name: 'EasyMarkdown',
})

const props = withDefaults(defineProps<MarkdownProps>(), {
  modelValue: '',
  placeholder: '请输入 Markdown 内容...',
  showToolbar: true,
  defaultView: 'split',
  height: 400,
  disabled: false,
  exportName: 'document',
  theme: defaultMarkdownTheme,
  themes: () => [],
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
  (e: 'save', value: string): void
  (e: 'download', type: 'md' | 'html' | 'pdf', value: string): void
  (e: 'update:theme', value: string): void
}>()

const view = ref<'edit' | 'preview' | 'split'>(props.defaultView)

// ──── 主题 ────

/** 内置主题 + 自定义主题合并后的下拉选项 */
const themeOptions = computed<MarkdownTheme[]>(() => {
  const map = new Map<string, MarkdownTheme>()
  for (const t of markdownThemes) {
    map.set(t.key, t)
  }
  for (const t of props.themes) {
    map.set(t.key, t)
  }
  return [...map.values()]
})

const currentTheme = ref(props.theme)

watch(() => props.theme, (value) => {
  if (value)
    currentTheme.value = value
})

/** 切换主题（供模板与外部调用） */
function setTheme(key: string) {
  if (!themeOptions.value.some(t => t.key === key))
    return
  currentTheme.value = key
  emit('update:theme', key)
}

function getTheme() {
  return currentTheme.value
}

function handleThemeChange(key: string) {
  setTheme(key)
}

// ──── markdown-it 实例复用，并接入 highlight.js 代码高亮 ────
const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
  highlight(code: string, lang: string) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre class="hljs"><code>${hljs.highlight(code, { language: lang, ignoreIllegals: true }).value}</code></pre>`
      }
      catch {
        // ignore
      }
    }
    return `<pre class="hljs"><code>${md.utils.escapeHtml(code)}</code></pre>`
  },
})

// 渲染结果
const renderedHtml = computed(() => {
  const content = props.modelValue ?? ''
  if (!content.trim())
    return '<p class="easy-markdown__empty">内容为空</p>'
  return md.render(content)
})

// 切换视图
function setView(v: 'edit' | 'preview' | 'split') {
  view.value = v
}

// 输入处理
function handleInput(e: Event) {
  const value = (e.target as HTMLTextAreaElement).value
  emit('update:modelValue', value)
  emit('change', value)
}

// 保存事件
function handleSave() {
  emit('save', props.modelValue ?? '')
}

// 下载类型下拉（选择后自动下载并复位）
const downloadType = ref('')
const downloadOptions = [
  { value: 'md', label: '下载 .md' },
  { value: 'html', label: '下载 .html' },
  { value: 'pdf', label: '下载 .pdf' },
]

function handleDownloadChange(type: 'md' | 'html' | 'pdf') {
  // 复位为占位项，避免重复选择同一格式时无法触发
  downloadType.value = ''
  if (type === 'md')
    handleDownloadMd()
  else if (type === 'html')
    handleDownloadHtml()
  else if (type === 'pdf')
    handleDownloadPdf()
}

// 下载 .md 文件
function handleDownloadMd() {
  const content = props.modelValue ?? ''
  downloadBlob(content, `${props.exportName}.md`, 'text/markdown;charset=utf-8')
  emit('download', 'md', content)
}

/** 构建导出文档（含 @page 打印样式、当前主题样式、代码高亮） */
function buildPrintableHtml(): string {
  const theme = getMarkdownTheme(currentTheme.value)
  const content = props.modelValue ?? ''
  const body = content.trim() ? renderedHtml.value : ''
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(props.exportName)}</title>
  <style>
${theme.exportCss}
${hljsGithubCss}
  </style>
</head>
<body>
  ${body}
</body>
</html>`
}

// 下载 .html 文件（包含完整页面骨架、当前主题样式与代码高亮）
function handleDownloadHtml() {
  const html = buildPrintableHtml()
  downloadBlob(html, `${props.exportName}.html`, 'text/html;charset=utf-8')
  emit('download', 'html', html)
}

// 下载 .pdf：将渲染结果注入隐藏 iframe 并调用浏览器打印，
// 用户可在打印对话框中「另存为 PDF」（与 print-js 原理一致，零依赖）
let printFrame: HTMLIFrameElement | null = null

function handleDownloadPdf() {
  const html = buildPrintableHtml()
  if (printFrame) {
    printFrame.remove()
    printFrame = null
  }
  const iframe = document.createElement('iframe')
  iframe.setAttribute('aria-hidden', 'true')
  iframe.style.position = 'fixed'
  iframe.style.right = '0'
  iframe.style.bottom = '0'
  iframe.style.width = '0'
  iframe.style.height = '0'
  iframe.style.border = '0'
  printFrame = iframe
  document.body.appendChild(iframe)

  const win = iframe.contentWindow
  if (!win) {
    iframe.remove()
    printFrame = null
    return
  }
  win.document.open()
  win.document.write(html)
  win.document.close()

  const cleanup = () => {
    iframe.remove()
    if (printFrame === iframe) {
      printFrame = null
    }
    win.removeEventListener('afterprint', cleanup)
  }
  // 打印完成 / 对话框关闭后清理
  win.addEventListener('afterprint', cleanup)
  // 兜底清理，避免长期占用隐藏 iframe
  window.setTimeout(cleanup, 60_000)

  win.focus()
  win.print()
  emit('download', 'pdf', html)
}

// 转义 HTML（用于 .html 导出的 title 等）
function escapeHtml(str: string): string {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

defineExpose({
  setView,
  setTheme,
  getTheme,
  getHtml: () => renderedHtml.value,
  downloadMd: handleDownloadMd,
  downloadHtml: handleDownloadHtml,
  downloadPdf: handleDownloadPdf,
})
</script>

<template>
  <div
    class="easy-markdown"
    :class="{ 'is-disabled': disabled }"
    :data-theme="currentTheme"
  >
    <!-- 工具栏 -->
    <div v-if="showToolbar" class="easy-markdown__toolbar">
      <div class="easy-markdown__views">
        <EasyButton
          type="text"
          size="small"
          class="easy-markdown__view-btn"
          :class="{ 'is-active': view === 'edit' }"
          :disabled="disabled"
          @click="setView('edit')"
        >
          编辑
        </EasyButton>
        <EasyButton
          type="text"
          size="small"
          class="easy-markdown__view-btn"
          :class="{ 'is-active': view === 'split' }"
          :disabled="disabled"
          @click="setView('split')"
        >
          分屏
        </EasyButton>
        <EasyButton
          type="text"
          size="small"
          class="easy-markdown__view-btn"
          :class="{ 'is-active': view === 'preview' }"
          :disabled="disabled"
          @click="setView('preview')"
        >
          预览
        </EasyButton>
      </div>

      <div class="easy-markdown__actions">
        <EasySelect
          v-model="currentTheme"
          class="easy-markdown__theme-select"
          :options="themeOptions"
          value-key="key"
          :disabled="disabled"
          placeholder="切换主题"
          size="small"
          @change="handleThemeChange"
        />
        <EasyButton
          type="primary"
          size="small"
          class="easy-markdown__action"
          :disabled="disabled"
          @click="handleSave"
        >
          保存
        </EasyButton>
        <EasySelect
          v-model="downloadType"
          class="easy-markdown__download-select"
          :options="downloadOptions"
          :disabled="disabled"
          placeholder="下载文档"
          size="small"
          @change="handleDownloadChange"
        />
      </div>
    </div>

    <!-- 主体区域 -->
    <div
      class="easy-markdown__body"
      :class="{
        'is-edit': view === 'edit',
        'is-preview': view === 'preview',
        'is-split': view === 'split',
      }"
      :style="{ height: `${height}px` }"
    >
      <!-- 编辑区 -->
      <div v-show="view === 'edit' || view === 'split'" class="easy-markdown__pane easy-markdown__pane--edit">
        <textarea
          class="easy-markdown__textarea"
          :value="modelValue"
          :placeholder="placeholder"
          :disabled="disabled"
          :spellcheck="false"
          @input="handleInput"
        />
      </div>

      <!-- 预览区 -->
      <div v-show="view === 'preview' || view === 'split'" class="easy-markdown__pane easy-markdown__pane--preview">
        <div class="easy-markdown__preview markdown-body" v-html="renderedHtml" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.easy-markdown {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  border: 1px solid var(--el-border-color);
  border-radius: 8px;
  overflow: hidden;
  background: var(--el-bg-color);

  &.is-disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  .easy-markdown__toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 8px;
    min-width: 0;
    max-width: 100%;
    box-sizing: border-box;
    padding: 8px 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    background: var(--el-fill-color-blank);

    > * {
      min-width: 0;
    }
  }

  .easy-markdown__views {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 4px;
    padding: 3px;
    border-radius: 6px;
    background: var(--el-fill-color-light);
  }

  .easy-markdown__view-btn {
    // 基础外观由 EasyButton (type="text") 提供
    &.is-active {
      background: var(--el-bg-color);
      color: var(--el-color-primary);
      font-weight: 500;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
    }
  }

  .easy-markdown__actions {
    display: inline-flex;
    align-items: center;
    justify-content: flex-end;
    flex-wrap: wrap;
    gap: 8px;
    min-width: 0;
    max-width: 100%;
  }

  .easy-markdown__theme-select,
  .easy-markdown__download-select {
    flex: 0 1 auto;
    min-width: 0;
    max-width: 100%;
    width: 130px;
  }

  .easy-markdown__body {
    display: flex;
    width: 100%;
    max-width: 100%;
    min-width: 0;

    &.is-edit .easy-markdown__pane--edit,
    &.is-preview .easy-markdown__pane--preview {
      flex: 1;
    }

    &.is-split .easy-markdown__pane {
      flex: 1;
    }
  }

  .easy-markdown__pane {
    flex: 1;
    min-width: 0;
    max-width: 100%;
    height: 100%;
    overflow: auto;

    &--edit {
      border-right: 1px solid var(--el-border-color-lighter);
    }

    &--preview {
      padding: 16px 20px;
    }
  }

  .easy-markdown__textarea {
    width: 100%;
    height: 100%;
    padding: 16px 20px;
    border: none;
    outline: none;
    resize: none;
    font-family: 'SF Mono', Consolas, 'Courier New', monospace;
    font-size: 14px;
    line-height: 1.7;
    color: var(--el-text-color-primary);
    background: var(--el-bg-color);
  }
}
</style>

<!-- 主题预览样式：独立维护在 style/preview/*.scss（SCSS 嵌套，以 .easy-markdown 类名前缀隔离） -->
<style src="../style/preview/base.scss" lang="scss"></style>

<style src="../style/preview/github.scss" lang="scss"></style>

<style src="../style/preview/clean.scss" lang="scss"></style>
