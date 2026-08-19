<script setup lang="ts">
import hljs from 'highlight.js'
import MarkdownIt from 'markdown-it'
import { computed, ref } from 'vue'

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
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
  (e: 'save', value: string): void
  (e: 'download', type: 'md' | 'html', value: string): void
}>()

const view = ref<'edit' | 'preview' | 'split'>(props.defaultView)

// markdown-it 实例复用，并接入 highlight.js 代码高亮
const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
  highlight(code, lang) {
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

// 下载 .md 文件
function handleDownloadMd() {
  const content = props.modelValue ?? ''
  downloadBlob(content, `${props.exportName}.md`, 'text/markdown;charset=utf-8')
  emit('download', 'md', content)
}

// 下载 .html 文件（包含完整页面骨架与基础样式）
function handleDownloadHtml() {
  const body = renderedHtml.value
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(props.exportName)}</title>
  <style>
    body { max-width: 860px; margin: 0 auto; padding: 32px 20px; color: #333; font-family: -apple-system, "Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif; line-height: 1.7; }
    h1, h2, h3, h4, h5, h6 { margin: 1.2em 0 0.6em; line-height: 1.4; }
    pre { background: #f6f8fa; border-radius: 6px; padding: 14px; overflow: auto; }
    code { font-family: "SF Mono", Consolas, "Courier New", monospace; }
    :not(pre) > code { background: #f0f0f0; border-radius: 4px; padding: 2px 6px; font-size: 0.9em; }
    blockquote { border-left: 4px solid #ddd; margin: 1em 0; padding: 0 1em; color: #666; }
    table { border-collapse: collapse; margin: 1em 0; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; }
    th { background: #f6f8fa; }
    img { max-width: 100%; }
    a { color: #1677ff; }
  </style>
</head>
<body>
  ${body}
</body>
</html>`
  downloadBlob(html, `${props.exportName}.html`, 'text/html;charset=utf-8')
  emit('download', 'html', html)
}

// 通用文件下载
function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
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

defineExpose({ setView, getHtml: () => renderedHtml.value, downloadMd: handleDownloadMd, downloadHtml: handleDownloadHtml })
</script>

<template>
  <div
    class="easy-markdown"
    :class="{ 'is-disabled': disabled }"
  >
    <!-- 工具栏 -->
    <div v-if="showToolbar" class="easy-markdown__toolbar">
      <div class="easy-markdown__views">
        <button
          type="button"
          class="easy-markdown__view-btn"
          :class="{ 'is-active': view === 'edit' }"
          :disabled="disabled"
          @click="setView('edit')"
        >
          编辑
        </button>
        <button
          type="button"
          class="easy-markdown__view-btn"
          :class="{ 'is-active': view === 'split' }"
          :disabled="disabled"
          @click="setView('split')"
        >
          分屏
        </button>
        <button
          type="button"
          class="easy-markdown__view-btn"
          :class="{ 'is-active': view === 'preview' }"
          :disabled="disabled"
          @click="setView('preview')"
        >
          预览
        </button>
      </div>

      <div class="easy-markdown__actions">
        <button
          type="button"
          class="easy-markdown__action easy-markdown__action--primary"
          :disabled="disabled"
          @click="handleSave"
        >
          保存
        </button>
        <button
          type="button"
          class="easy-markdown__action"
          :disabled="disabled"
          @click="handleDownloadMd"
        >
          下载 .md
        </button>
        <button
          type="button"
          class="easy-markdown__action"
          :disabled="disabled"
          @click="handleDownloadHtml"
        >
          下载 .html
        </button>
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
    padding: 8px 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    background: var(--el-fill-color-blank);
  }

  .easy-markdown__views {
    display: inline-flex;
    gap: 4px;
    padding: 3px;
    border-radius: 6px;
    background: var(--el-fill-color-light);
  }

  .easy-markdown__view-btn {
    border: none;
    padding: 5px 12px;
    border-radius: 4px;
    background: transparent;
    color: var(--el-text-color-regular);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;

    &.is-active {
      background: var(--el-bg-color);
      color: var(--el-color-primary);
      font-weight: 500;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
    }

    &:hover:not(.is-active) {
      color: var(--el-color-primary);
    }
  }

  .easy-markdown__actions {
    display: inline-flex;
    gap: 8px;
  }

  .easy-markdown__action {
    border: 1px solid var(--el-border-color);
    padding: 5px 12px;
    border-radius: 4px;
    background: var(--el-bg-color);
    color: var(--el-text-color-regular);
    font-size: 13px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: var(--el-color-primary);
      color: var(--el-color-primary);
    }

    &.easy-markdown__action--primary {
      background: var(--el-color-primary);
      border-color: var(--el-color-primary);
      color: #fff;

      &:hover {
        background: var(--el-color-primary-light-3);
        border-color: var(--el-color-primary-light-3);
        color: #fff;
      }
    }
  }

  .easy-markdown__body {
    display: flex;
    width: 100%;

    &.is-edit .easy-markdown__pane--edit,
    &.is-preview .easy-markdown__pane--preview {
      flex: 1;
    }

    &.is-split .easy-markdown__pane {
      flex: 1;
      min-width: 0;
    }
  }

  .easy-markdown__pane {
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

  .easy-markdown__preview {
    font-size: 14px;
    line-height: 1.7;
    color: var(--el-text-color-regular);
    word-break: break-word;

    .easy-markdown__empty {
      color: var(--el-text-color-placeholder);
    }

    :deep(h1),
    :deep(h2),
    :deep(h3),
    :deep(h4),
    :deep(h5),
    :deep(h6) {
      margin: 1.2em 0 0.6em;
      color: var(--el-text-color-primary);
      line-height: 1.4;
    }
    :deep(h1) { font-size: 24px; }
    :deep(h2) { font-size: 20px; }
    :deep(h3) { font-size: 17px; }
    :deep(h4) { font-size: 15px; }

    :deep(p) {
      margin: 0.8em 0;
    }

    :deep(pre) {
      background: var(--el-fill-color-light);
      border-radius: 6px;
      padding: 12px 14px;
      overflow: auto;
    }

    :deep(code) {
      font-family: 'SF Mono', Consolas, 'Courier New', monospace;
    }

    :deep(:not(pre) > code) {
      background: var(--el-fill-color-light);
      border-radius: 4px;
      padding: 2px 6px;
      font-size: 0.9em;
      color: var(--el-color-primary);
    }

    :deep(blockquote) {
      border-left: 4px solid var(--el-border-color);
      margin: 1em 0;
      padding: 0 1em;
      color: var(--el-text-color-secondary);
    }

    :deep(table) {
      border-collapse: collapse;
      margin: 1em 0;
    }
    :deep(th),
    :deep(td) {
      border: 1px solid var(--el-border-color-lighter);
      padding: 8px 12px;
    }
    :deep(th) {
      background: var(--el-fill-color-light);
      font-weight: 500;
    }

    :deep(img) {
      max-width: 100%;
    }

    :deep(a) {
      color: var(--el-color-primary);
    }
  }
}
</style>
