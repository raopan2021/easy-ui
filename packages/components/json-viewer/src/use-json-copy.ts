import type { ComputedRef } from 'vue'

import { EasyMsg } from '../../message'

/**
 * 复制能力：把解析后的 JSON 写入剪贴板并提示。
 *
 * @param parsedData 解析后的数据（null 时不执行复制）
 */
export function useJsonCopy(parsedData: ComputedRef<unknown>) {
  /** 复制 */
  function handleCopy() {
    if (parsedData.value === null)
      return
    const str = typeof parsedData.value === 'string' ? parsedData.value : JSON.stringify(parsedData.value, null, 2)
    navigator.clipboard.writeText(str).then(() => {
      EasyMsg.success('已复制到剪贴板')
    })
  }

  return {
    handleCopy,
  }
}
