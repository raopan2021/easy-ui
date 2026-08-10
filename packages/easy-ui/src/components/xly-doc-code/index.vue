<script setup lang="ts">
import hljs from 'highlight.js'
import { computed, onMounted, ref, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    code: string
    lang?: string
    collapseHeight?: number
  }>(),
  {
    lang: 'auto',
    collapseHeight: 100,
  },
)

const bodyRef = ref<HTMLElement | null>(null)
const expanded = ref(false)
const copied = ref(false)
const needsCollapse = ref(false)
const collapsed = ref(true)

/** 语言映射：显示名 → highlight.js 语言名 */
const langMap: Record<string, string> = {
  html: 'xml',
  vue: 'xml',
  xml: 'xml',
  js: 'javascript',
  javascript: 'javascript',
  ts: 'javascript',
  typescript: 'javascript',
  bash: 'bash',
  shell: 'bash',
  css: 'css',
  json: 'json',
}

/** 含 HTML 标签 → Vue 模板 */
function isVueTemplate(code: string): boolean {
  return /<\/?[a-z][\w-]*[\s/>]/i.test(code)
}

const highlightResult = computed(() => {
  if (!props.code)
    return null
  try {
    if (props.lang && props.lang !== 'auto') {
      const hljsLang = langMap[props.lang] || props.lang
      return { value: hljs.highlight(props.code, { language: hljsLang, ignoreIllegals: true }).value, lang: props.lang }
    }
    if (isVueTemplate(props.code)) {
      return { value: hljs.highlight(props.code, { language: 'xml', ignoreIllegals: true }).value, lang: 'vue' }
    }
    // 兜底用 highlightAuto
    const auto = hljs.highlightAuto(props.code)
    return { value: auto.value, lang: auto.language || 'text' }
  }
  catch (e) {
    console.warn('[DocCode] highlight failed, falling back to plain text:', e)
    return null
  }
})

const highlighted = computed(() => {
  if (highlightResult.value)
    return highlightResult.value.value
  // 兜底：纯文本（HTML 转义）
  return props.code.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
})

const effectiveLang = computed(() => {
  if (props.lang && props.lang !== 'auto')
    return props.lang
  return highlightResult.value?.lang || 'text'
})

const wrappedHtml = computed(() => `<pre><code>${highlighted.value}</code></pre>`)

function checkCollapse() {
  if (bodyRef.value) {
    needsCollapse.value = bodyRef.value.scrollHeight > props.collapseHeight
  }
}

const bodyStyle = computed(() => {
  if (!needsCollapse.value || expanded.value)
    return {}
  return { maxHeight: `${props.collapseHeight}px`, overflow: 'hidden' }
})

async function handleCopy() {
  try {
    await navigator.clipboard.writeText(props.code)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
  catch {
    const textarea = document.createElement('textarea')
    textarea.value = props.code
    textarea.style.position = 'fixed'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    textarea.select()
    document.execCommand('copy')
    document.body.removeChild(textarea)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  }
}

onMounted(() => {
  checkCollapse()
})

watch(
  () => props.code,
  () => {
    expanded.value = false
    setTimeout(checkCollapse, 0)
  },
)
</script>

<template>
  <div class="doc-code" :class="{ 'doc-code--collapsed': needsCollapse && collapsed && !expanded }">
    <div class="doc-code__toolbar">
      <span class="doc-code__toolbar__lang">{{ effectiveLang }}</span>

      <button class="doc-code__toolbar__btn" :class="{ 'doc-code__toolbar__btn--copied': copied }" @click="handleCopy">
        {{ copied ? '已复制' : '复制' }}
      </button>

      <button v-if="needsCollapse" class="doc-code__toolbar__btn" @click="expanded = !expanded">
        {{ expanded ? '收起' : '展开' }}
      </button>
    </div>

    <div ref="bodyRef" class="doc-code__body" :style="bodyStyle" v-html="wrappedHtml" />
  </div>
</template>

<style lang="scss">
.doc-code {
  position: relative;
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-light);

  .doc-code__toolbar {
    position: absolute;
    right: 0;
    top: 0;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 16px;
    background: var(--el-fill-color-light);

    .doc-code__toolbar__lang {
      font-size: 12px;
      color: var(--el-text-color-placeholder);
      font-family: 'SF Mono', Consolas, monospace;
    }

    .doc-code__toolbar__btn {
      font-size: 12px;
      padding: 2px 10px;
      background: var(--el-bg-color-overlay);
      color: var(--el-text-color-secondary);
      border: 1px solid var(--el-border-color);
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        color: var(--el-color-primary);
        border-color: var(--el-color-primary-light-5);
      }

      &.doc-code__toolbar__btn--copied,
      &.doc-code__toolbar__btn--copied:hover {
        color: var(--el-color-success);
        border-color: var(--el-color-success-light-5);
      }
    }
  }

  .doc-code__body {
    overflow-x: auto;
    padding: 10px;
    transition: max-height 0.3s ease;

    pre {
      margin: 0;
      padding: 0;
      background: none !important;
    }

    code {
      font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
      font-size: 13px;
      line-height: 1.7;
      color: var(--el-text-color-regular);
      white-space: pre;
    }
  }

  &.doc-code--collapsed .doc-code__body {
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 40px;
      background: linear-gradient(transparent, var(--el-fill-color-light));
      pointer-events: none;
    }
  }

  /* ---- highlight.js 主题（基于 Element Plus CSS 变量）---- */

  .hljs-comment {
    color: var(--el-text-color-placeholder);
    font-style: italic;
  }
  .hljs-quote {
    color: var(--el-text-color-placeholder);
    font-style: italic;
  }
  .hljs-keyword {
    color: var(--el-color-danger);
    font-weight: 500;
  }
  .hljs-type {
    color: var(--el-color-primary);
  }
  .hljs-string {
    color: var(--el-color-success);
  }
  .hljs-number {
    color: var(--el-color-success);
  }
  .hljs-literal {
    color: var(--el-color-primary);
  }
  .hljs-built_in {
    color: var(--el-color-info);
  }
  .hljs-title {
    color: var(--el-color-primary);
  }
  .hljs-params {
    color: var(--el-text-color-regular);
  }
  .hljs-tag {
    color: var(--el-color-primary);
  }
  .hljs-name {
    color: var(--el-color-primary);
  }
  .hljs-attr {
    color: #e6a23c;
  }
  .hljs-selector-tag {
    color: var(--el-color-primary);
  }
  .hljs-selector-class {
    color: #e6a23c;
  }
  .hljs-selector-id {
    color: var(--el-color-primary);
  }
  .hljs-template-variable {
    color: var(--el-color-warning);
  }
  .hljs-variable {
    color: var(--el-text-color-regular);
  }
  .hljs-meta {
    color: var(--el-color-info);
  }
  .hljs-section {
    color: var(--el-color-primary);
    font-weight: 600;
  }
  .hljs-addition {
    color: var(--el-color-success);
  }
  .hljs-deletion {
    color: var(--el-color-danger);
  }
  .hljs-emphasis {
    font-style: italic;
  }
  .hljs-strong {
    font-weight: 600;
  }
}

/* 深色模式微调 */
html.dark .doc-code {
  .hljs-attr {
    color: #e0a440;
  }
  .hljs-selector-class {
    color: #e0a440;
  }
  .hljs-comment {
    color: #6a9955;
  }
  .hljs-quote {
    color: #6a9955;
  }
}
</style>
