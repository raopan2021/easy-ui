import type { AxisRange } from './types'

/**
 * Chart 组件内部纯函数工具集（无响应式依赖，多个 composable 共用）。
 *
 * 从 chart.vue 原 `<script setup>` 中平移而来，逻辑保持不变。
 */

/** Y 轴刻度最小像素间距（低于该间距的刻度会被丢弃，避免标签重叠） */
const MIN_TICK_SPACING = 36

/** 计算「美观刻度」时期望的刻度段数（刻度数 = 段数 + 1） */
const PREFER_TICK_COUNT = 5

/**
 * 从对象中提取除已知字段外的所有额外字段。
 *
 * 用于把用户在 serie / data 上挂的业务字段透传到 drill 事件的 extra 中。
 *
 * @param obj         源对象（serie 或 data 项）
 * @param excludeKeys 需要排除的内置字段名
 * @returns 额外字段组成的对象；没有额外字段时返回 undefined
 */
export function pickExtra(obj: Record<string, any>, excludeKeys: string[]): Record<string, any> | undefined {
  const result: Record<string, any> = {}
  let hasExtra = false
  for (const key of Object.keys(obj)) {
    if (!excludeKeys.includes(key)) {
      result[key] = obj[key]
      hasExtra = true
    }
  }
  return hasExtra ? result : undefined
}

/**
 * 按像素间距过滤刻度列表：始终保留首个刻度，其后仅保留与上一个保留刻度
 * 像素距离 >= MIN_TICK_SPACING 的刻度。
 *
 * @param ticks  候选刻度值
 * @param getYFn 刻度值 → SVG Y 坐标的映射函数
 */
export function filterTicksBySpacing(ticks: number[], getYFn: (v: number) => number): number[] {
  if (!ticks.length)
    return []
  const positions = ticks.map(getYFn)
  const result: number[] = [ticks[0]]
  let lastPos = positions[0]
  for (let i = 1; i < ticks.length; i++) {
    if (Math.abs(lastPos - positions[i]) >= MIN_TICK_SPACING) {
      result.push(ticks[i])
      lastPos = positions[i]
    }
  }
  return result
}

/**
 * 根据数值数组计算漂亮的 min / max / ticks（1、2、5 幂次步长对齐）。
 *
 * 折柱混用（type="mixed"）的左右双 Y 轴使用。
 *
 * @param vals 参与计算的所有数值
 */
export function calcAxisRange(vals: number[]): AxisRange {
  if (!vals.length)
    return { min: 0, max: 100, ticks: [0, 25, 50, 75, 100] }
  const rawMin = Math.min(...vals)
  const rawMax = Math.max(...vals)
  const min = rawMin >= 0 ? 0 : rawMin * 1.1
  const max = rawMax <= 0 ? (rawMin < 0 ? 0 : 100) : rawMax * 1.15
  const range = max - min || 1
  const rawStep = range / PREFER_TICK_COUNT
  const magnitude = 10 ** Math.floor(Math.log10(rawStep))
  const normalized = rawStep / magnitude
  let niceStep: number
  if (normalized <= 1)
    niceStep = 1 * magnitude
  else if (normalized <= 2)
    niceStep = 2 * magnitude
  else if (normalized <= 5)
    niceStep = 5 * magnitude
  else niceStep = 10 * magnitude
  const ticks: number[] = []
  const start = min <= 0 ? 0 : Math.ceil(min / niceStep) * niceStep
  for (let v = start; v <= max * 1.001 + niceStep * 0.01; v = Math.round((v + niceStep) * 1e10) / 1e10) {
    ticks.push(v)
    if (ticks.length > 10)
      break
  }
  if (ticks.length < 2)
    ticks.push(max)
  return { min, max: ticks[ticks.length - 1] ?? max, ticks }
}

/**
 * Canvas 绘制圆角矩形路径（仅生成路径，不填充）。
 *
 * PNG 导出时绘制图例色块使用。
 */
export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + r)
  ctx.lineTo(x + w, y + h - r)
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h)
  ctx.lineTo(x + r, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - r)
  ctx.lineTo(x, y + r)
  ctx.quadraticCurveTo(x, y, x + r, y)
  ctx.closePath()
}

/** 转义 XML 特殊字符（SVG 导出时写入 text 节点） */
export function escXml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

/**
 * 触发浏览器下载并延迟回收 ObjectURL。
 *
 * @param url      Blob URL
 * @param filename 保存的文件名（含扩展名）
 */
export function triggerDownload(url: string, filename: string): void {
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
