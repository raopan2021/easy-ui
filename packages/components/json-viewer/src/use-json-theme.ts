import type { JsonViewerProps } from './types'

import { useDark } from '@vueuse/core'
import { computed } from 'vue'

/**
 * 主题解析：auto 模式下跟随 html.dark，其余直接使用传入主题。
 *
 * @param props 组件 props（theme 由 withDefaults 保证存在）
 */
export function useJsonTheme(props: Required<Pick<JsonViewerProps, 'theme'>>) {
  const isDark = useDark()

  /** 实际生效主题 */
  const resolvedTheme = computed<'light' | 'dark'>(() => {
    if (props.theme === 'auto')
      return isDark.value ? 'dark' : 'light'
    return props.theme
  })

  return {
    isDark,
    resolvedTheme,
  }
}
