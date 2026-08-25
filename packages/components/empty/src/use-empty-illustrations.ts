import type { EmptyType } from './empty'
import { useDark } from '@vueuse/core'

import { h } from 'vue'

/**
 * 内置 SVG 插图集合（零依赖、inline 渲染）。
 * 每个函数读取当前暗色模式状态（isDark），自动切换描边/填充色，
 * 与原本内联在 empty.vue 中的实现保持一致的行为。
 */

/** 默认 / 数据 空状态插图 */
function renderDefault(isDark: boolean) {
  return h(
    'svg',
    {
      viewBox: '0 0 200 160',
      xmlns: 'http://www.w3.org/2000/svg',
      fill: 'none',
    },
    [
      // 背景椭圆
      h('ellipse', { cx: '100', cy: '145', rx: '70', ry: '10', fill: '#f2f3f7' }),
      // 盒子底部
      h('path', {
        'd': 'M40 80 L100 55 L160 80 L160 130 L40 130 Z',
        'fill': isDark ? '#1e1e2e' : '#eef0f8',
        'stroke': isDark ? '#555' : '#d0d5e8',
        'stroke-width': '1.5',
      }),
      // 盒子侧面
      h('path', { 'd': 'M40 80 L40 130 L100 145 L100 95 Z', 'fill': '#dde1f0', 'stroke': '#d0d5e8', 'stroke-width': '1.5' }),
      h('path', {
        'd': 'M160 80 L160 130 L100 145 L100 95 Z',
        'fill': '#cfd4ea',
        'stroke': '#d0d5e8',
        'stroke-width': '1.5',
      }),
      // 盒子顶部开口
      h('path', {
        'd': 'M40 80 L100 55 L160 80 L100 95 Z',
        'fill': isDark ? '#2a2a3a' : '#f8f9ff',
        'stroke': isDark ? '#555' : '#d0d5e8',
        'stroke-width': '1.5',
      }),
      // 开口折叠左
      h('path', { 'd': 'M40 80 L70 67.5 L100 95 L70 102.5 Z', 'fill': '#eef0f8', 'stroke': '#d0d5e8', 'stroke-width': '1' }),
      // 开口折叠右
      h('path', {
        'd': 'M160 80 L130 67.5 L100 95 L130 102.5 Z',
        'fill': '#e4e7f5',
        'stroke': '#d0d5e8',
        'stroke-width': '1',
      }),
      // 文档线条
      h('line', {
        'x1': '62',
        'y1': '100',
        'x2': '90',
        'y2': '108',
        'stroke': '#b8bdd6',
        'stroke-width': '2',
        'stroke-linecap': 'round',
      }),
      h('line', {
        'x1': '62',
        'y1': '108',
        'x2': '85',
        'y2': '115',
        'stroke': '#b8bdd6',
        'stroke-width': '2',
        'stroke-linecap': 'round',
      }),
    ],
  )
}

/** 搜索无结果插图 */
function renderSearch() {
  return h('svg', { viewBox: '0 0 200 160', xmlns: 'http://www.w3.org/2000/svg', fill: 'none' }, [
    h('ellipse', { cx: '100', cy: '148', rx: '68', ry: '9', fill: '#f2f3f7' }),
    // 放大镜圆圈
    h('circle', { 'cx': '88', 'cy': '78', 'r': '38', 'fill': '#eef0f8', 'stroke': '#c8cde4', 'stroke-width': '5' }),
    // 放大镜手柄
    h('line', {
      'x1': '116',
      'y1': '106',
      'x2': '148',
      'y2': '138',
      'stroke': '#c8cde4',
      'stroke-width': '7',
      'stroke-linecap': 'round',
    }),
    // 叉叉
    h('line', {
      'x1': '76',
      'y1': '66',
      'x2': '100',
      'y2': '90',
      'stroke': '#b8bdd6',
      'stroke-width': '3.5',
      'stroke-linecap': 'round',
    }),
    h('line', {
      'x1': '100',
      'y1': '66',
      'x2': '76',
      'y2': '90',
      'stroke': '#b8bdd6',
      'stroke-width': '3.5',
      'stroke-linecap': 'round',
    }),
    // 小星星
    h('circle', { cx: '148', cy: '52', r: '4', fill: '#d0d5e8' }),
    h('circle', { cx: '40', cy: '90', r: '3', fill: '#dde1f0' }),
    h('circle', { cx: '158', cy: '100', r: '2.5', fill: '#c8cde4' }),
  ])
}

/** 网络异常插图 */
function renderNetwork() {
  return h('svg', { viewBox: '0 0 200 160', xmlns: 'http://www.w3.org/2000/svg', fill: 'none' }, [
    h('ellipse', { cx: '100', cy: '148', rx: '68', ry: '9', fill: '#f2f3f7' }),
    // 云朵
    h('path', {
      'd': 'M148 85 a28 28 0 0 0-54-10 a20 20 0 1 0 4 39 h46 a20 20 0 0 0 4-29z',
      'fill': '#eef0f8',
      'stroke': '#c8cde4',
      'stroke-width': '2',
    }),
    // 叉叉
    h('line', {
      'x1': '86',
      'y1': '95',
      'x2': '114',
      'y2': '123',
      'stroke': '#ff7b7b',
      'stroke-width': '4',
      'stroke-linecap': 'round',
    }),
    h('line', {
      'x1': '114',
      'y1': '95',
      'x2': '86',
      'y2': '123',
      'stroke': '#ff7b7b',
      'stroke-width': '4',
      'stroke-linecap': 'round',
    }),
  ])
}

/** 无权限插图 */
function renderPermission() {
  return h('svg', { viewBox: '0 0 200 160', xmlns: 'http://www.w3.org/2000/svg', fill: 'none' }, [
    h('ellipse', { cx: '100', cy: '148', rx: '68', ry: '9', fill: '#f2f3f7' }),
    // 锁体
    h('rect', {
      'x': '62',
      'y': '88',
      'width': '76',
      'height': '54',
      'rx': '10',
      'fill': '#eef0f8',
      'stroke': '#c8cde4',
      'stroke-width': '2',
    }),
    // 锁扣
    h('path', {
      'd': 'M76 88 V72 a24 24 0 0 1 48 0 V88',
      'stroke': '#c8cde4',
      'stroke-width': '5',
      'stroke-linecap': 'round',
      'fill': 'none',
    }),
    // 锁孔
    h('circle', { cx: '100', cy: '110', r: '8', fill: '#d0d5e8' }),
    h('rect', { x: '96', y: '110', width: '8', height: '12', rx: '2', fill: '#d0d5e8' }),
  ])
}

/** 列表空插图 */
function renderList() {
  return h('svg', { viewBox: '0 0 200 160', xmlns: 'http://www.w3.org/2000/svg', fill: 'none' }, [
    h('ellipse', { cx: '100', cy: '148', rx: '68', ry: '9', fill: '#f2f3f7' }),
    // 纸张
    h('rect', {
      'x': '50',
      'y': '30',
      'width': '100',
      'height': '115',
      'rx': '8',
      'fill': '#f8f9ff',
      'stroke': '#d0d5e8',
      'stroke-width': '1.5',
    }),
    // 折角
    h('path', { 'd': 'M120 30 L150 60 L120 60 Z', 'fill': '#eef0f8', 'stroke': '#d0d5e8', 'stroke-width': '1.5' }),
    // 横线（内容）
    h('line', {
      'x1': '66',
      'y1': '75',
      'x2': '134',
      'y2': '75',
      'stroke': '#dde1f0',
      'stroke-width': '2.5',
      'stroke-linecap': 'round',
    }),
    h('line', {
      'x1': '66',
      'y1': '92',
      'x2': '134',
      'y2': '92',
      'stroke': '#dde1f0',
      'stroke-width': '2.5',
      'stroke-linecap': 'round',
    }),
    h('line', {
      'x1': '66',
      'y1': '109',
      'x2': '110',
      'y2': '109',
      'stroke': '#dde1f0',
      'stroke-width': '2.5',
      'stroke-linecap': 'round',
    }),
    // 问号
    h(
      'text',
      { 'x': '91', 'y': '138', 'font-size': '22', 'fill': '#c8cde4', 'font-weight': '700', 'text-anchor': 'middle' },
      '?',
    ),
  ])
}

/**
 * 组装内置插图映射，并接入暗色模式（@vueuse/core useDark）。
 * 返回 svgMap：type -> 渲染函数，供组件按当前类型选择对应插图。
 */
export function useEmptyIllustrations() {
  const isDark = useDark()

  const svgMap: Record<EmptyType, () => ReturnType<typeof h>> = {
    default: () => renderDefault(isDark.value),
    data: () => renderDefault(isDark.value),
    search: () => renderSearch(),
    network: () => renderNetwork(),
    permission: () => renderPermission(),
    list: () => renderList(),
  }

  return { svgMap }
}
