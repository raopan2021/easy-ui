/**
 * 浏览器文件下载工具
 */

/**
 * 触发浏览器下载（支持字符串内容或直接传入 Blob）
 * @param content - 文件内容（字符串或已生成的 Blob）
 * @param filename - 保存的文件名（含扩展名）
 * @param mime - MIME 类型（传入 Blob 时忽略）
 */
export function downloadBlob(content: string | Blob, filename: string, mime = 'application/octet-stream'): void {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mime })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
