import type { Ref } from 'vue'
import type { MarkdownEmits, MarkdownProps, MarkdownView } from './types'

import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { measureLineHeights } from './markdown-it-ext'

/**
 * 编辑体验：
 * - Tab / Shift+Tab 缩进、Enter 自动续行缩进、Ctrl+S 保存
 * - 编辑区行号 gutter（mirror 精确测量 + 滚动同步）
 * - split 视图下编辑区 / 预览区滚动比例联动
 */
export function useMarkdownEditor(
  props: Pick<MarkdownProps, 'modelValue' | 'disabled' | 'lineNumbers'>,
  emit: MarkdownEmits,
  view: Ref<MarkdownView>,
  textareaEl: Ref<HTMLTextAreaElement | undefined>,
  previewEl: Ref<HTMLElement | undefined>,
) {
  // ──── 编辑快捷键 ────

  /** 应用编辑并保持光标位置（受控组件下 props.modelValue 会同步为 newValue） */
  function applyEdit(ta: HTMLTextAreaElement, newValue: string, selStart: number, selEnd: number) {
    emit('update:modelValue', newValue)
    emit('change', newValue)
    ta.value = newValue
    ta.focus()
    ta.setSelectionRange(selStart, selEnd)
  }

  function handleKeydown(e: KeyboardEvent) {
    if (props.disabled)
      return
    const ta = e.target as HTMLTextAreaElement
    const mod = e.ctrlKey || e.metaKey
    // Ctrl / Cmd + S → 保存
    if (mod && !e.altKey && e.key.toLowerCase() === 's') {
      e.preventDefault()
      emit('save', props.modelValue ?? '')
      return
    }
    // Tab / Shift+Tab → 缩进 / 反缩进
    if (e.key === 'Tab' && !mod && !e.altKey) {
      e.preventDefault()
      handleTab(ta, e.shiftKey)
      return
    }
    // Enter → 自动延续上一行缩进
    if (e.key === 'Enter' && !mod && !e.altKey && !e.shiftKey) {
      const { value, selectionStart: start, selectionEnd: end } = ta
      const lineStart = value.lastIndexOf('\n', start - 1) + 1
      const indent = value.slice(lineStart, start).match(/^[ \t]*/)?.[0] ?? ''
      if (indent) {
        e.preventDefault()
        const insert = `\n${indent}`
        applyEdit(ta, value.slice(0, start) + insert + value.slice(end), start + insert.length, start + insert.length)
      }
    }
  }

  function handleTab(ta: HTMLTextAreaElement, shift: boolean) {
    const { value, selectionStart: start, selectionEnd: end } = ta
    const selected = value.slice(start, end)
    // 无选区或单行选区
    if (!selected.includes('\n')) {
      if (shift) {
        const before = value.slice(0, start)
        if (before.endsWith('  ')) {
          applyEdit(ta, value.slice(0, start - 2) + value.slice(end), start - 2, start - 2)
        }
        else if (before.endsWith('\t')) {
          applyEdit(ta, value.slice(0, start - 1) + value.slice(end), start - 1, start - 1)
        }
        else {
          // 已到行首：光标移到行首
          const lineStart = value.lastIndexOf('\n', start - 1) + 1
          ta.setSelectionRange(lineStart, lineStart)
        }
      }
      else {
        applyEdit(ta, `${value.slice(0, start)}  ${value.slice(end)}`, start + 2, start + 2)
      }
      return
    }
    // 多行缩进 / 反缩进
    const lineStart = value.lastIndexOf('\n', start - 1) + 1
    const rawEnd = value.indexOf('\n', end)
    const blockEnd = rawEnd === -1 ? value.length : rawEnd
    const block = value.slice(lineStart, blockEnd)
    const lines = block.split('\n')
    if (shift) {
      const newLines = lines.map(l => (l.startsWith('  ') ? l.slice(2) : l.startsWith('\t') ? l.slice(1) : l))
      applyEdit(ta, value.slice(0, lineStart) + newLines.join('\n') + value.slice(blockEnd), start, Math.max(start, end - 2))
    }
    else {
      const newBlock = lines.map(l => `  ${l}`).join('\n')
      applyEdit(ta, value.slice(0, lineStart) + newBlock + value.slice(blockEnd), start + 2, end + lines.length * 2)
    }
  }

  // ──── 编辑区行号 gutter ────

  const lineHeights = ref<number[]>([])
  const scrollTop = ref(0)
  let measureTimer: ReturnType<typeof setTimeout> | null = null
  let gutterRO: ResizeObserver | null = null

  function scheduleMeasure() {
    if (!props.lineNumbers)
      return
    if (measureTimer)
      clearTimeout(measureTimer)
    measureTimer = setTimeout(() => {
      measureTimer = null
      measureLines()
    }, 80)
  }

  function measureLines() {
    const ta = textareaEl.value
    if (!ta)
      return
    try {
      lineHeights.value = measureLineHeights(ta, props.modelValue ?? '')
    }
    catch {
      lineHeights.value = []
    }
  }

  watch(() => props.modelValue, () => nextTick(scheduleMeasure))
  watch(view, () => nextTick(scheduleMeasure))
  watch(() => props.lineNumbers, (on) => {
    if (on)
      nextTick(measureLines)
    else
      lineHeights.value = []
  })

  onMounted(() => {
    nextTick(measureLines)
    if (typeof ResizeObserver !== 'undefined' && textareaEl.value) {
      gutterRO = new ResizeObserver(() => scheduleMeasure())
      gutterRO.observe(textareaEl.value)
    }
  })

  // ──── split 视图滚动同步（按滚动比例双向联动）────

  let syncLock = false

  function syncFromEdit(ta: HTMLTextAreaElement) {
    const pre = previewEl.value
    if (!pre || syncLock)
      return
    const max = ta.scrollHeight - ta.clientHeight
    if (max <= 0)
      return
    syncLock = true
    pre.scrollTop = (ta.scrollTop / max) * (pre.scrollHeight - pre.clientHeight)
    syncLock = false
  }

  function syncFromPreview(pre: HTMLElement) {
    const ta = textareaEl.value
    if (!ta || syncLock)
      return
    const max = pre.scrollHeight - pre.clientHeight
    if (max <= 0)
      return
    syncLock = true
    ta.scrollTop = (pre.scrollTop / max) * (ta.scrollHeight - ta.clientHeight)
    syncLock = false
  }

  function onEditScroll() {
    if (view.value !== 'split')
      return
    scrollTop.value = textareaEl.value?.scrollTop ?? 0
    if (textareaEl.value)
      syncFromEdit(textareaEl.value)
  }

  function onPreviewScroll() {
    if (view.value !== 'split')
      return
    if (previewEl.value)
      syncFromPreview(previewEl.value)
  }

  onBeforeUnmount(() => {
    gutterRO?.disconnect()
    if (measureTimer)
      clearTimeout(measureTimer)
  })

  return {
    handleKeydown,
    lineHeights,
    scrollTop,
    onEditScroll,
    onPreviewScroll,
  }
}
