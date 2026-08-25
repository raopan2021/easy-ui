/**
 * EasyFilePreview 文件类型图标
 *
 * 将原本内联在 file-preview.vue 中的 7 个 SVG 图标组件（PdfIcon / WordIcon /
 * ExcelIcon / PptIcon / ImageIcon / VideoIcon / FileIcon）及其映射抽离为独立模块，
 * 按 URL 文件类型返回对应图标组件。
 */

import { defineComponent, h } from 'vue'

import { getFileType } from './file-utils'

/** SVG 图标的公共属性（线性描边风格） */
function iconAttrs() {
  return {
    'viewBox': '0 0 24 24',
    'fill': 'none',
    'stroke': 'currentColor',
    'stroke-width': '1.5',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
  }
}

/** PDF 图标 */
const PdfIcon = defineComponent({
  render: () =>
    h(
      'svg',
      iconAttrs(),
      [
        h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
        h('polyline', { points: '14 2 14 8 20 8' }),
        h('path', { d: 'M9 13h2a1 1 0 0 1 0 2H9v-4h2a1 1 0 0 1 0 2' }),
        h('path', { d: 'M14 13v4' }),
        h('path', { d: 'M17 13h-1.5a1.5 1.5 0 0 0 0 3H17' }),
      ],
    ),
})

/** Word 图标 */
const WordIcon = defineComponent({
  render: () =>
    h(
      'svg',
      iconAttrs(),
      [
        h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
        h('polyline', { points: '14 2 14 8 20 8' }),
        h('path', { d: 'M8 13l2 6 2-4 2 4 2-6' }),
      ],
    ),
})

/** Excel 图标 */
const ExcelIcon = defineComponent({
  render: () =>
    h(
      'svg',
      iconAttrs(),
      [
        h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
        h('polyline', { points: '14 2 14 8 20 8' }),
        h('line', { x1: '9', y1: '12', x2: '15', y2: '18' }),
        h('line', { x1: '15', y1: '12', x2: '9', y2: '18' }),
      ],
    ),
})

/** PPT 图标 */
const PptIcon = defineComponent({
  render: () =>
    h(
      'svg',
      iconAttrs(),
      [
        h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
        h('polyline', { points: '14 2 14 8 20 8' }),
        h('rect', { x: '8', y: '12', width: '8', height: '5', rx: '1' }),
        h('line', { x1: '12', y1: '12', x2: '12', y2: '10' }),
      ],
    ),
})

/** 图片图标 */
const ImageIcon = defineComponent({
  render: () =>
    h(
      'svg',
      iconAttrs(),
      [
        h('rect', { x: '3', y: '3', width: '18', height: '18', rx: '2', ry: '2' }),
        h('circle', { cx: '8.5', cy: '8.5', r: '1.5' }),
        h('polyline', { points: '21 15 16 10 5 21' }),
      ],
    ),
})

/** 视频图标 */
const VideoIcon = defineComponent({
  render: () =>
    h(
      'svg',
      iconAttrs(),
      [
        h('polygon', { points: '23 7 16 12 23 17 23 7' }),
        h('rect', { x: '1', y: '5', width: '15', height: '14', rx: '2', ry: '2' }),
      ],
    ),
})

/** 默认文件图标 */
export const FileIcon = defineComponent({
  render: () =>
    h(
      'svg',
      iconAttrs(),
      [
        h('path', { d: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z' }),
        h('polyline', { points: '14 2 14 8 20 8' }),
        h('line', { x1: '16', y1: '13', x2: '8', y2: '13' }),
        h('line', { x1: '16', y1: '17', x2: '8', y2: '17' }),
        h('polyline', { points: '10 9 9 9 8 9' }),
      ],
    ),
})

/** 文件大类 → 图标组件映射 */
const ICON_MAP: Record<string, any> = {
  pdf: PdfIcon,
  word: WordIcon,
  excel: ExcelIcon,
  ppt: PptIcon,
  image: ImageIcon,
  video: VideoIcon,
  file: FileIcon,
}

/**
 * 根据 URL 获取对应的文件图标组件
 * @param url - 文件地址
 * @returns SVG 图标组件
 */
export function getFileIcon(url: string) {
  return ICON_MAP[getFileType(url)] ?? FileIcon
}
