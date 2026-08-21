/**
 * 浏览器文件下载工具
 */

/**
 * 由字符串内容生成 Blob 并触发浏览器下载
 * @param content - 文件内容
 * @param filename - 保存的文件名（含扩展名）
 * @param mime - MIME 类型
 */
export function downloadBlob(content: string, filename: string, mime = 'application/octet-stream'): void {
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
