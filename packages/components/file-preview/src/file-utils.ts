/**
 * EasyFilePreview 基础工具函数
 *
 * 将原本内联在 file-preview.vue 中的 URL 解析 / 类型识别 / 大小格式化
 * 抽离为纯函数模块，便于复用与单测。
 */

/** 扩展名 → 文件大类映射 */
export const EXT_MAP: Record<string, string> = {
  pdf: 'pdf',
  doc: 'word',
  docx: 'word',
  xls: 'excel',
  xlsx: 'excel',
  ppt: 'ppt',
  pptx: 'ppt',
  jpg: 'image',
  jpeg: 'image',
  png: 'image',
  gif: 'image',
  webp: 'image',
  bmp: 'image',
  svg: 'image',
  mp4: 'video',
  webm: 'video',
  ogg: 'video',
  mov: 'video',
  avi: 'video',
}

/**
 * 从 URL 中提取文件扩展名（去掉 query / hash 后取最后一段）
 * @param url - 文件地址
 * @returns 小写扩展名，无扩展名返回空字符串
 */
export function getExt(url: string): string {
  const clean = url.split('?')[0].split('#')[0]
  const parts = clean.split('.')
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : ''
}

/**
 * 从 URL 中提取文件名（decodeURIComponent 还原编码后的中文等字符）
 * @param url - 文件地址
 * @returns 文件名，无法解析时返回「未知文件」
 */
export function getFileName(url: string): string {
  const clean = url.split('?')[0].split('#')[0]
  return decodeURIComponent(clean.split('/').pop() || '未知文件')
}

/**
 * 根据 URL 识别文件大类（pdf / word / excel / ppt / image / video / file）
 * @param url - 文件地址
 */
export function getFileType(url: string): string {
  return EXT_MAP[getExt(url)] ?? 'file'
}

/**
 * 格式化文件大小（输入单位为 KB）
 * - 小于 1KB 显示 B；小于 1024KB 显示 KB；小于 1MB 显示 MB；否则显示 GB
 * @param size - 文件大小（KB，兼容字符串）
 * @returns 格式化后的字符串，非法值返回空字符串
 */
export function formatSize(size: number | string | undefined): string {
  if (size === undefined || size === null || size === '')
    return ''
  const n = typeof size === 'string' ? Number.parseFloat(size) : size
  if (Number.isNaN(n))
    return String(size)
  if (n < 1)
    return `${(n * 1024).toFixed(0)} B`
  if (n < 1024)
    return `${n.toFixed(1)} KB`
  if (n < 1024 * 1024)
    return `${(n / 1024).toFixed(1)} MB`
  return `${(n / 1024 / 1024).toFixed(1)} GB`
}
