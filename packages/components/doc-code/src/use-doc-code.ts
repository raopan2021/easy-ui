import type { DocCodeProps } from './types'

import hljs from 'highlight.js'

import { computed, onMounted, ref, watch } from 'vue'

/**
 * 代码高亮、折叠与复制逻辑（highlight.js + 复制/折叠状态）。
 *
 * 将原本内联在 doc-code.vue 中的大量 computed 与事件处理抽离为独立 composable，
 * 让 .vue 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 *
 * @param props 代码展示 props（需传入响应式对象，composable 内部 computed/watch 会自动追踪依赖）
 */
export function useDocCode(props: DocCodeProps) {
  /** 代码体 DOM 引用（用于测量是否超出折叠高度） */
  const bodyRef = ref<HTMLElement | null>(null)
  /** 是否已展开（覆盖折叠高度限制） */
  const expanded = ref(false)
  /** 是否已复制（控制按钮文案） */
  const copied = ref(false)
  /** 是否需要折叠（内容超出 collapseHeight 时为 true） */
  const needsCollapse = ref(false)
  /** 是否已折叠（初始折叠，展开后置 false） */
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

  /** 含 HTML 标签 → 判定为 Vue 模板（按 xml 高亮） */
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
      needsCollapse.value = bodyRef.value.scrollHeight > (props.collapseHeight ?? 100)
    }
  }

  const bodyStyle = computed(() => {
    if (!needsCollapse.value || expanded.value)
      return {}
    return { maxHeight: `${props.collapseHeight ?? 100}px`, overflow: 'hidden' }
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

  return {
    bodyRef,
    expanded,
    copied,
    needsCollapse,
    collapsed,
    effectiveLang,
    handleCopy,
    bodyStyle,
    wrappedHtml,
  }
}
