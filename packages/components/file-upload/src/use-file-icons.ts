import type { UploadFileItem } from './types'

import { h } from 'vue'

/** 单个图标配置：描边色 + SVG 子节点（path/polyline/line 等） */
interface FileIconConfig {
  stroke: string
  paths: any[]
}

/** 文件类型 → 图标配置映射表 */
const ICON_MAP: Record<string, FileIconConfig> = {
  // 图片
  image: {
    stroke: '#52c41a',
    paths: [
      h('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2', ry: '2' }),
      h('circle', { cx: '8.5', cy: '8.5', r: '1.5' }),
      h('polyline', { points: '21 15 16 10 5 21' }),
    ],
  },
  // PDF
  pdf: {
    stroke: '#ff4d4f',
    paths: [
      h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
      h('polyline', { points: '14 2 14 8 20 8' }),
      h('path', { d: 'M9 15h6M9 11h6' }),
    ],
  },
  // Word
  word: {
    stroke: '#1890ff',
    paths: [
      h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
      h('polyline', { points: '14 2 14 8 20 8' }),
      h('path', { d: 'M8 13h2M8 17h2M14 13h2M14 17h2' }),
    ],
  },
  // Excel
  excel: {
    stroke: '#52c41a',
    paths: [
      h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
      h('polyline', { points: '14 2 14 8 20 8' }),
      h('path', { d: 'M8 13h8M8 17h5' }),
    ],
  },
  // PPT
  ppt: {
    stroke: '#fa8c16',
    paths: [
      h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
      h('polyline', { points: '14 2 14 8 20 8' }),
      h('path', { d: 'M10 12v4M14 12v1' }),
    ],
  },
  // 压缩包
  zip: {
    stroke: '#722ed1',
    paths: [h('path', { d: 'M21 8v13H3V8M1 3h22v5H1z' }), h('path', { d: 'M10 12h4' })],
  },
  // 视频
  video: {
    stroke: '#eb2f96',
    paths: [
      h('polygon', { points: '23 7 16 12 23 17 23 7' }),
      h('rect', { x: '1', y: '5', width: '15', height: '14', rx: '2', ry: '2' }),
    ],
  },
  // 音频
  audio: {
    stroke: '#13c2c2',
    paths: [
      h('path', { d: 'M9 18V5l12-2v13' }),
      h('circle', { cx: '6', cy: '18', r: '3' }),
      h('circle', { cx: '18', cy: '16', r: '3' }),
    ],
  },
  // 文本
  text: {
    stroke: '#8c8c8c',
    paths: [
      h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
      h('polyline', { points: '14 2 14 8 20 8' }),
      h('line', { x1: '16', y1: '13', x2: '8', y2: '13' }),
      h('line', { x1: '16', y1: '17', x2: '8', y2: '17' }),
    ],
  },
  // 默认文件
  default: {
    stroke: '#8c8c8c',
    paths: [
      h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
      h('polyline', { points: '14 2 14 8 20 8' }),
    ],
  },
}

/** 常见图片扩展名 */
const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
/** 常见 Word 扩展名 */
const WORD_EXTS = ['doc', 'docx']
/** 常见 Excel 扩展名 */
const EXCEL_EXTS = ['xls', 'xlsx']
/** 常见 PPT 扩展名 */
const PPT_EXTS = ['ppt', 'pptx']
/** 常见压缩包扩展名 */
const ARCHIVE_EXTS = ['zip', 'rar', '7z', 'tar', 'gz']
/** 常见视频扩展名 */
const VIDEO_EXTS = ['mp4', 'avi', 'mov', 'wmv', 'flv']
/** 常见音频扩展名 */
const AUDIO_EXTS = ['mp3', 'wav', 'flac', 'aac', 'ogg']

/**
 * 根据文件类型获取对应的 SVG 图标组件
 * @param item - 上传文件项
 * @returns SVG VNode
 */
export function getFileIcon(item: UploadFileItem) {
  const type = item.raw?.type || ''
  const name = item.name || ''
  const ext = name.split('.').pop()?.toLowerCase() || ''

  // 根据文件类型选择对应图标
  let icon = ICON_MAP.default
  if (type.startsWith('image/') || IMAGE_EXTS.includes(ext)) {
    icon = ICON_MAP.image
  }
  else if (type === 'application/pdf' || ext === 'pdf') {
    icon = ICON_MAP.pdf
  }
  else if (type === 'application/msword' || WORD_EXTS.includes(ext)) {
    icon = ICON_MAP.word
  }
  else if (type === 'application/vnd.ms-excel' || EXCEL_EXTS.includes(ext)) {
    icon = ICON_MAP.excel
  }
  else if (type === 'application/vnd.ms-powerpoint' || PPT_EXTS.includes(ext)) {
    icon = ICON_MAP.ppt
  }
  else if (ARCHIVE_EXTS.includes(ext)) {
    icon = ICON_MAP.zip
  }
  else if (type.startsWith('video/') || VIDEO_EXTS.includes(ext)) {
    icon = ICON_MAP.video
  }
  else if (type.startsWith('audio/') || AUDIO_EXTS.includes(ext)) {
    icon = ICON_MAP.audio
  }
  else if (type.startsWith('text/') || ext === 'txt') {
    icon = ICON_MAP.text
  }

  return h(
    'svg',
    {
      'viewBox': '0 0 24 24',
      'width': '36',
      'height': '36',
      'fill': 'none',
      'stroke': icon.stroke,
      'stroke-width': '1.5',
    },
    icon.paths,
  )
}
