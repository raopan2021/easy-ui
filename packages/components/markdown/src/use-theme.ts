import type { MarkdownTheme } from '../style/themes'

import type { MarkdownEmits, MarkdownProps } from './types'
import { computed, ref, watch } from 'vue'
import { markdownThemes } from '../style/themes'

/** 主题切换逻辑：内置主题 + 自定义主题合并，切换时同步 v-model:theme */
export function useMarkdownTheme(props: MarkdownProps, emit: MarkdownEmits) {
  /** 内置主题 + 自定义主题合并后的下拉选项 */
  const themeOptions = computed<MarkdownTheme[]>(() => {
    const map = new Map<string, MarkdownTheme>()
    for (const t of markdownThemes)
      map.set(t.key, t)
    for (const t of props.themes)
      map.set(t.key, t)
    return [...map.values()]
  })

  const currentTheme = ref(props.theme)

  watch(() => props.theme, (value) => {
    if (value)
      currentTheme.value = value
  })

  /** 切换主题 */
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

  return {
    themeOptions,
    currentTheme,
    setTheme,
    getTheme,
    handleThemeChange,
  }
}
