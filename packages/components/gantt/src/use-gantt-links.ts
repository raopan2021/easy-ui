import type { Ref } from 'vue'
import type { GanttProps, GanttTask } from './types'

/**
 * 甘特图依赖连线 composable
 *
 * 将原本内联在 gantt.vue 中的依赖线路径算法抽离为独立模块：
 *  - 依赖线颜色分配（getDepColor）
 *  - 角使用记录（useCorner / getUnusedCorners / clearCornerUsage）
 *  - bar 矩形与四角坐标（getBarRect / getTaskCorners）
 *  - 线段碰撞检测（segmentHitsRect / pathHitsAnyBar）
 *  - 曼哈顿路径生成（makePath / candidatePaths）
 *  - 主路径规划 getDependencyPath 与里程碑菱形 getMilestonePoints
 *
 * @param props 甘特图 props（读取 rowHeight / barHeight 等布局参数）
 * @param deps  依赖的数据上下文（useGanttData 的 flatTasks / getTimeX / parseDate）
 */
export interface GanttLinkDeps {
  flatTasks: Ref<GanttTask[]>
  getTimeX: (date: Date) => number
  parseDate: (dateStr: string | number | Date | null | undefined) => Date
}

/** 依赖线颜色数组（按 depId 哈希取色） */
const DEP_COLORS = ['#4f6ef7', '#f7c94f', '#4fe07c', '#f74f6e', '#9f4ff7', '#4fd1f7', '#f74f9f', '#4ff7c9']

/** 角点位置标识（左上 / 右上 / 左下 / 右下） */
type CornerKey = 'tl' | 'tr' | 'bl' | 'br'

/** 候选角点 */
const ALL_CORNERS: CornerKey[] = ['tl', 'tr', 'bl', 'br']

export function useGanttLinks(props: GanttProps, deps: GanttLinkDeps) {
  const { flatTasks, getTimeX, parseDate } = deps

  /** 角使用记录（同一任务已用过的角点不再复用，避免多条线重叠出发） */
  const cornerUsage = new Map<string | number, Set<CornerKey>>()

  /** 根据依赖 ID 获取稳定颜色（字符串哈希取模） */
  function getDepColor(depId: string | number) {
    const str = String(depId)
    const hash = str.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    return DEP_COLORS[hash % DEP_COLORS.length]
  }

  // ─────────────────────────────────────────────────
  //  角使用记录
  // ─────────────────────────────────────────────────

  function useCorner(taskId: string | number, corner: CornerKey) {
    if (!cornerUsage.has(taskId))
      cornerUsage.set(taskId, new Set())
    cornerUsage.get(taskId)!.add(corner)
  }

  function getUnusedCorners(taskId: string | number): CornerKey[] {
    const used = cornerUsage.get(taskId)
    return used ? ALL_CORNERS.filter(c => !used.has(c)) : [...ALL_CORNERS]
  }

  // ─────────────────────────────────────────────────
  //  几何辅助
  // ─────────────────────────────────────────────────

  /** 获取 bar 真实像素矩形（不含行空白），用于碰撞检测；向内收缩 1px 避免"恰好在边框上"误判 */
  function getBarRect(taskIndex: number) {
    const task = flatTasks.value[taskIndex]
    if (!task || !task.startDate)
      return null

    if (task.isMilestone) {
      const cx = getTimeX(parseDate(task.startDate))
      const cy = taskIndex * props.rowHeight + props.rowHeight / 2
      return { x1: cx - 9, x2: cx + 9, y1: cy - 9, y2: cy + 9 }
    }

    if (!task.endDate)
      return null

    const x1 = getTimeX(parseDate(task.startDate)) + 1 // 向内 1px
    const x2 = getTimeX(parseDate(task.endDate)) - 1
    const rawTop = taskIndex * props.rowHeight + (props.rowHeight - props.barHeight) / 2
    const y1 = rawTop + 1
    const y2 = rawTop + props.barHeight - 1

    return { x1, x2, y1, y2 }
  }

  /** 获取四角坐标（角点正好在边框外 1px，避免连线一出发就触碰边框） */
  function getTaskCorners(taskIndex: number): Record<CornerKey, { x: number, y: number }> | null {
    const task = flatTasks.value[taskIndex]
    if (!task || !task.startDate)
      return null

    if (task.isMilestone) {
      const x = getTimeX(parseDate(task.startDate))
      const cy = taskIndex * props.rowHeight + props.rowHeight / 2
      // 里程碑上下各 10px，左右取同一 x（菱形顶底）
      return {
        tl: { x: x - 1, y: cy - 10 },
        tr: { x: x + 1, y: cy - 10 },
        bl: { x: x - 1, y: cy + 10 },
        br: { x: x + 1, y: cy + 10 },
      }
    }

    if (!task.endDate)
      return null

    const startX = getTimeX(parseDate(task.startDate))
    const endX = getTimeX(parseDate(task.endDate))
    const rawTop = taskIndex * props.rowHeight + (props.rowHeight - props.barHeight) / 2
    const topY = rawTop // bar 顶边
    const bottomY = rawTop + props.barHeight // bar 底边

    // 角点往外偏移 1px，让线不贴边框
    return {
      tl: { x: startX - 1, y: topY },
      tr: { x: endX + 1, y: topY },
      bl: { x: startX - 1, y: bottomY },
      br: { x: endX + 1, y: bottomY },
    }
  }

  /**
   * 检测一条正交线段是否穿过矩形（严格，边框也算）
   * @param x1 线段起点 x
   * @param y1 线段起点 y
   * @param x2 线段终点 x
   * @param y2 线段终点 y
   * @param rect 待检测的矩形（null 表示不存在，直接返回 false）
   * @param eps 允许的浮点误差（角点外偏 1px 后，端点不再在边框上）
   */
  function segmentHitsRect(x1: number, y1: number, x2: number, y2: number, rect: { x1: number, x2: number, y1: number, y2: number } | null, eps = 0.5) {
    if (!rect)
      return false

    // 水平线段
    if (Math.abs(y1 - y2) < 0.01) {
      const lx = Math.min(x1, x2)
      const rx = Math.max(x1, x2)
      // y 在矩形内
      if (y1 > rect.y1 - eps && y1 < rect.y2 + eps) {
        // x 范围有实质重叠（允许端点恰好落在边框外 eps 内）
        if (rx > rect.x1 + eps && lx < rect.x2 - eps)
          return true
      }
      return false
    }

    // 垂直线段
    if (Math.abs(x1 - x2) < 0.01) {
      const ty = Math.min(y1, y2)
      const by = Math.max(y1, y2)
      if (x1 > rect.x1 - eps && x1 < rect.x2 + eps) {
        if (by > rect.y1 + eps && ty < rect.y2 - eps)
          return true
      }
      return false
    }

    return false
  }

  /** 检查折线路径是否穿过任意非排除柱子 */
  function pathHitsAnyBar(points: { x: number, y: number }[], excludeIds: (string | number)[]) {
    for (let i = 0; i < points.length - 1; i++) {
      const p1 = points[i]
      const p2 = points[i + 1]
      for (let j = 0; j < flatTasks.value.length; j++) {
        if (excludeIds.includes(flatTasks.value[j].id))
          continue
        const rect = getBarRect(j)
        if (!rect)
          continue
        if (segmentHitsRect(p1.x, p1.y, p2.x, p2.y, rect))
          return true
      }
    }
    return false
  }

  /** 曼哈顿路径总长（用于候选路径代价比较） */
  function manhattanLen(pts: { x: number, y: number }[]) {
    let s = 0
    for (let i = 0; i < pts.length - 1; i++) {
      s += Math.abs(pts[i].x - pts[i + 1].x) + Math.abs(pts[i].y - pts[i + 1].y)
    }
    return s
  }

  // ─────────────────────────────────────────────────
  //  路径候选生成
  //  策略：以"不穿任何柱子"为硬约束，生成多条候选路径，
  //  选代价（路径长度）最小的；全部失败则逐步加大绕行距离
  // ─────────────────────────────────────────────────

  /**
   * 从 start 到 end 生成一条 Z 形路径，途经中间 midX 纵向转折。
   * start/end 角点已外偏 1px，不会贴边框。
   */
  function makePath(start: { x: number, y: number }, end: { x: number, y: number }, midX: number) {
    // 直接三折：start.x→midX 水平, midX 纵向, midX→end.x 水平
    return [
      { x: start.x, y: start.y },
      { x: midX, y: start.y },
      { x: midX, y: end.y },
      { x: end.x, y: end.y },
    ]
  }

  /**
   * 针对两个任务生成多条候选路径：
   *  - 右绕：midX = max(depEndX, taskEndX) + gap
   *  - 左绕：midX = min(depStartX, taskStartX) - gap
   *  gap 从 20 开始，如果穿柱则逐步增大
   */
  function candidatePaths(
    sc: CornerKey,
    ec: CornerKey,
    startCorners: Record<CornerKey, { x: number, y: number }>,
    endCorners: Record<CornerKey, { x: number, y: number }>,
    depStartX: number,
    depEndX: number,
    taskStartX: number,
    taskEndX: number,
  ) {
    const s = startCorners[sc]
    const e = endCorners[ec]
    const rightBase = Math.max(depEndX, taskEndX)
    const leftBase = Math.min(depStartX, taskStartX)

    const paths = []

    // 右绕候选（gap 20 / 50 / 100）
    for (const gap of [20, 50, 100]) {
      paths.push(makePath(s, e, rightBase + gap))
    }
    // 左绕候选
    for (const gap of [20, 50, 100]) {
      paths.push(makePath(s, e, leftBase - gap))
    }

    return paths
  }

  // ─────────────────────────────────────────────────
  //  clearCornerUsage 供模板调用（保持兼容）
  // ─────────────────────────────────────────────────
  function clearCornerUsage() {
    // 模板中每个任务的 dependencies 渲染前会调用此函数
    // 全局角使用记录由 getDependencyPath 收集时自行管理，此处留空即可。
  }

  // ─────────────────────────────────────────────────
  //  主函数：生成依赖连线 SVG path 字符串
  // ─────────────────────────────────────────────────
  function getDependencyPath(task: GanttTask, depTask: GanttTask | null, taskIndex: number) {
    if (!depTask || !depTask.endDate || !task.startDate)
      return ''

    const depTaskIndex = flatTasks.value.findIndex(t => t.id === depTask.id)
    if (depTaskIndex === -1)
      return ''

    const startCorners = getTaskCorners(depTaskIndex)
    const endCorners = getTaskCorners(taskIndex)
    if (!startCorners || !endCorners)
      return ''

    const depStartX = getTimeX(parseDate(depTask.startDate))
    const depEndX = getTimeX(parseDate(depTask.endDate))
    const taskStartX = getTimeX(parseDate(task.startDate))
    const taskEndX = getTimeX(parseDate(task.endDate))

    const excludeIds = [depTask.id, task.id]

    // 候选起点/终点角（优先未使用）
    const startUnused = getUnusedCorners(depTask.id)
    const endUnused = getUnusedCorners(task.id)
    const startCandidates = startUnused.length > 0 ? startUnused : [...ALL_CORNERS]
    const endCandidates = endUnused.length > 0 ? endUnused : [...ALL_CORNERS]

    let bestPath: { x: number, y: number }[] | null = null
    let bestSC: CornerKey | null = null
    let bestEC: CornerKey | null = null
    let bestCost = Infinity

    for (const sc of startCandidates) {
      for (const ec of endCandidates) {
        const candidates = candidatePaths(sc, ec, startCorners, endCorners, depStartX, depEndX, taskStartX, taskEndX)
        for (const pts of candidates) {
          if (!pathHitsAnyBar(pts, excludeIds)) {
            const cost = manhattanLen(pts)
            if (cost < bestCost) {
              bestCost = cost
              bestPath = pts
              bestSC = sc
              bestEC = ec
            }
          }
        }
      }
    }

    // 极端 fallback：超大绕行（200px），必有一条不穿柱子
    if (!bestPath) {
      const rightFar = Math.max(depEndX, taskEndX) + 200
      const leftFar = Math.min(depStartX, taskStartX) - 200
      const sc = startCandidates[0]
      const ec = endCandidates[0]
      const s = startCorners[sc]
      const e = endCorners[ec]
      for (const midX of [rightFar, leftFar]) {
        const pts = makePath(s, e, midX)
        if (!pathHitsAnyBar(pts, excludeIds)) {
          bestPath = pts
          bestSC = sc
          bestEC = ec
          break
        }
      }
      // 若仍为空（理论不会），强制用右绕
      if (!bestPath) {
        bestPath = makePath(s, e, rightFar)
        bestSC = sc
        bestEC = ec
      }
    }

    // 记录已使用的角
    useCorner(depTask.id, bestSC!)
    useCorner(task.id, bestEC!)

    // 转为 SVG path
    let d = `M ${bestPath[0].x} ${bestPath[0].y}`
    for (let i = 1; i < bestPath.length; i++) {
      d += ` L ${bestPath[i].x} ${bestPath[i].y}`
    }
    return d
  }

  /** 里程碑菱形 points（SVG polygon 的 points 属性值） */
  function getMilestonePoints(taskIndex: number) {
    const task = flatTasks.value[taskIndex]
    const x = getTimeX(parseDate(task?.startDate))
    const y = taskIndex * props.rowHeight + props.rowHeight / 2
    const size = 10
    return `${x},${y - size} ${x + size},${y} ${x},${y + size} ${x - size},${y}`
  }

  return {
    getDependencyPath,
    getMilestonePoints,
    getDepColor,
    clearCornerUsage,
  }
}
