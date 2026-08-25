import type { ComputedRef, Ref } from 'vue'
import type { ChartProps, GaugeArc, GaugeTick } from './types'

import { computed } from 'vue'

/** 仪表盘起始角度（-210° = 左下方） */
const GAUGE_START_DEG = -210
/** 仪表盘扫过角度（共 240°，终点为右下方 30°） */
const GAUGE_SWEEP_DEG = 240
/** 仪表盘颜色区段缺省调色盘（props.colors 未传时使用） */
const GAUGE_FALLBACK_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444']
/** 仪表盘刻度段数（刻度数 = 段数 + 1） */
const GAUGE_TICK_COUNT = 5

/**
 * 仪表盘（type="gauge"）几何计算。
 *
 * 以 `gaugeCx / gaugeCy / gaugeR` 定义的圆为基准，在 -210° ~ 30° 的 240° 扇区内
 * 绘制轨道弧、颜色区段弧、进度弧、刻度文字与指针。圆心 Y 会自动下压，
 * 保证弧顶与刻度文字不溢出画布上边界。
 *
 * @param props 图表 props（响应式对象）
 * @param ctx   依赖注入：画布尺寸、数值格式化
 */
export function useChartGauge(props: ChartProps, ctx: {
  svgWidth: Ref<number>
  svgHeight: ComputedRef<number>
  formatValue: (val: number) => string
}) {
  const { svgWidth, svgHeight, formatValue } = ctx

  /** 圆心 X（画布水平中心） */
  const gaugeCx = computed(() => svgWidth.value / 2)

  /** 仪表盘半径（受画布宽高约束，上限 120px） */
  const gaugeR = computed(() => {
    // 顶部留白 = R + trackW/2 + 24（刻度文字），底部留白 = R*0.5（指针+数值）
    // 解方程：gaugeCy - R - trackW/2 - 24 >= 8（最小上边距）
    // 保守取 R 不超过 svgHeight * 0.42、svgWidth * 0.36
    return Math.min(svgWidth.value * 0.36, svgHeight.value * 0.42, 120)
  })

  /** 轨道宽度（半径的 14%，最小 10px） */
  const gaugeTrackW = computed(() => Math.max(gaugeR.value * 0.14, 10))

  /** 圆心 Y：确保顶部弧线 + 轨道宽 + 刻度文字不超出 SVG 上边界 */
  const gaugeCy = computed(() => {
    const topMargin = gaugeR.value + gaugeTrackW.value / 2 + 26 // 弧顶 + 刻度文字高度
    return Math.max(topMargin, svgHeight.value * 0.54)
  })

  /** 将角度 deg 转换为 SVG 坐标 */
  function gaugePt(cx: number, cy: number, r: number, deg: number) {
    const rad = (deg * Math.PI) / 180
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
  }

  /** 生成从 startDeg 到 endDeg 的圆弧路径 */
  function gaugeArcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
    const start = gaugePt(cx, cy, r, startDeg)
    const end = gaugePt(cx, cy, r, endDeg)
    const sweep = endDeg - startDeg
    const largeArc = Math.abs(sweep) > 180 ? 1 : 0
    return `M ${start.x} ${start.y} A ${r} ${r} 0 ${largeArc} 1 ${end.x} ${end.y}`
  }

  /** 当前值在 [gaugeMin, gaugeMax] 中的归一化比例（钳制到 0~1） */
  const gaugeRatio = computed(() => {
    const gaugeMin = props.gaugeMin ?? 0
    const gaugeMax = props.gaugeMax ?? 100
    const gaugeValue = props.gaugeValue ?? 0
    const range = gaugeMax - gaugeMin || 1
    return Math.max(0, Math.min((gaugeValue - gaugeMin) / range, 1))
  })

  /** 仪表盘轨道路径（灰色背景弧） */
  const gaugeTrackPath = computed(() =>
    gaugeArcPath(gaugeCx.value, gaugeCy.value, gaugeR.value, GAUGE_START_DEG, GAUGE_START_DEG + GAUGE_SWEEP_DEG),
  )

  /** 仪表盘进度弧路径 */
  const gaugeProgressPath = computed(() => {
    if (gaugeRatio.value <= 0)
      return ''
    const endDeg = GAUGE_START_DEG + GAUGE_SWEEP_DEG * gaugeRatio.value
    return gaugeArcPath(gaugeCx.value, gaugeCy.value, gaugeR.value, GAUGE_START_DEG, endDeg)
  })

  /** 仪表盘刻度线（含刻度文字坐标） */
  const gaugeTicks = computed((): GaugeTick[] => {
    const count = GAUGE_TICK_COUNT
    const ticks: GaugeTick[] = []
    const cx = gaugeCx.value
    const cy = gaugeCy.value
    const r = gaugeR.value
    const innerR = r - gaugeTrackW.value - 4
    const gaugeMin = props.gaugeMin ?? 0
    const gaugeMax = props.gaugeMax ?? 100
    for (let i = 0; i <= count; i++) {
      const deg = GAUGE_START_DEG + (GAUGE_SWEEP_DEG / count) * i
      const outer = gaugePt(cx, cy, r + 6, deg)
      const inner = gaugePt(cx, cy, innerR, deg)
      const lp = gaugePt(cx, cy, r + 18, deg)
      const val = gaugeMin + ((gaugeMax - gaugeMin) / count) * i
      ticks.push({ x1: outer.x, y1: outer.y, x2: inner.x, y2: inner.y, label: formatValue(val), lx: lp.x, ly: lp.y })
    }
    return ticks
  })

  /** 仪表盘指针（三角形路径 + 圆心坐标） */
  const gaugeNeedle = computed(() => {
    const deg = GAUGE_START_DEG + GAUGE_SWEEP_DEG * gaugeRatio.value
    const cx = gaugeCx.value
    const cy = gaugeCy.value
    const r = gaugeR.value
    const tip = gaugePt(cx, cy, r - gaugeTrackW.value - 10, deg)
    const base1 = gaugePt(cx, cy, 10, deg + 90)
    const base2 = gaugePt(cx, cy, 10, deg - 90)
    return {
      path: `M ${base1.x} ${base1.y} L ${tip.x} ${tip.y} L ${base2.x} ${base2.y} Z`,
      cx,
      cy,
    }
  })

  /** 仪表盘颜色渐变区段（传了 data 按值分段，否则按调色盘等分） */
  const gaugeArcs = computed((): GaugeArc[] => {
    const cx = gaugeCx.value
    const cy = gaugeCy.value
    const r = gaugeR.value
    const colors = props.colors?.length ? props.colors : GAUGE_FALLBACK_COLORS
    // 如果 data 传了区段信息就按 data 分段，否则按 4 等分上色
    const segments: Array<{ name: string, value: number, color?: string }>
      = props.data?.length ? props.data : colors.map((c, _i) => ({ name: '', value: 1, color: c }))
    const total = segments.reduce((s, d) => s + d.value, 0)
    let cur = GAUGE_START_DEG
    return segments.map((seg, i) => {
      const sweep = (seg.value / total) * GAUGE_SWEEP_DEG
      const endDeg = cur + sweep
      const arc: GaugeArc = {
        path: gaugeArcPath(cx, cy, r, cur, endDeg),
        color: seg.color || colors[i % colors.length],
        startDeg: cur,
        endDeg,
      }
      cur = endDeg
      return arc
    })
  })

  return {
    gaugeCx,
    gaugeCy,
    gaugeR,
    gaugeTrackW,
    gaugeRatio,
    gaugeTrackPath,
    gaugeProgressPath,
    gaugeTicks,
    gaugeNeedle,
    gaugeArcs,
  }
}
