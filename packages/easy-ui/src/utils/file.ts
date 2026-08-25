/**
 * 文件工具函数（组件库演示用，纯前端实现，不依赖后端）
 *
 * 预览 / 下载均在浏览器本地完成，可直接作用于 mock 上传产生的
 * blob: 对象地址；接入真实业务时按需替换为你的实现即可。
 */

/** 可直接在浏览器中预览的文件扩展名 */
const PREVIEWABLE_EXTS = ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'bmp', 'webp', 'svg', 'txt']

/**
 * 获取文件扩展名（小写，不含点）
 */
export function getFileExt(nameOrUrl: string): string {
  const clean = nameOrUrl.split(/[?#]/)[0]
  const idx = clean.lastIndexOf('.')
  return idx > -1 ? clean.slice(idx + 1).toLowerCase() : ''
}

/**
 * 预览文件
 * - 图片 / PDF / 文本等浏览器可渲染的类型：新窗口打开
 * - blob: 地址（mock 上传产物）：直接新窗口打开
 * - 其他类型：降级为下载
 * @param url - 文件地址
 * @param name - 文件名（用于判断类型）
 */
export async function previewFile(url: string, name?: string): Promise<void> {
  if (!url)
    return
  const ext = getFileExt(name || url)
  // blob 地址或可预览类型：直接打开
  if (url.startsWith('blob:') || PREVIEWABLE_EXTS.includes(ext)) {
    window.open(url, '_blank', 'noopener')
    return
  }
  // 不可预览的类型降级为下载
  downloadFile(url, name)
}

/**
 * 下载文件（纯前端，通过 <a download> 触发）
 * @param url - 文件地址（支持 blob: 地址）
 * @param name - 下载保存的文件名
 */
export function downloadFile(url: string, name?: string): void {
  if (!url)
    return
  const a = document.createElement('a')
  a.href = url
  a.download = name || url.split('/').pop()?.split(/[?#]/)[0] || 'download'
  a.target = '_blank'
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
}

/**
 * 格式化文件大小（字节为单位，B/KB/MB/GB/TB 自适应）
 * @param bytes - 文件大小（字节）
 * @returns 格式化后的字符串，如 "2.5 MB"
 */
export function formatFileSize(bytes: number | undefined | null): string {
  if (bytes === undefined || bytes === null || bytes === 0)
    return '0 B'
  const k = 1024
  if (bytes < k)
    return `${bytes} B`
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${(bytes / k ** i).toFixed(i > 1 ? 1 : 0)} ${['B', 'KB', 'MB', 'GB', 'TB'][i]}`
}
