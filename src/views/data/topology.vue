<template>
  <div class="topology-doc">
    <div class="doc-header">
      <h1 class="doc-title">Topology 拓扑图</h1>
      <p class="doc-desc">
        用于展示网络设备、服务节点之间的拓扑关系，支持拖拽、缩放、连线动画和节点状态显示。
      </p>
    </div>

    <!-- 基础用法 -->
    <section class="doc-section">
      <h2 class="doc-section__title">基础用法</h2>
      <p class="doc-section__desc">
        传入 <code>nodes</code>（节点数据）和 <code>edges</code>（连线数据）即可渲染拓扑图。
        节点支持正常、警告、离线三种状态，连线提供动画效果。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body" style="justify-content: center">
          <div class="topo-actions">
            <el-radio-group v-model="topoView" size="small" @change="changeView">
              <el-radio-button value="tree">树形</el-radio-button>
              <el-radio-button value="star">星形</el-radio-button>
              <el-radio-button value="mesh">网状</el-radio-button>
            </el-radio-group>
          </div>
          <canvas
            ref="canvasRef"
            :width="canvasWidth"
            :height="600"
            class="topo-canvas"
            @mousemove="onMouseMove"
            @mouseleave="tooltipNode = null"
            @mousedown="onMouseDown"
            @mouseup="onMouseUp"
            @wheel.prevent="onWheel"
          />
          <div
            v-if="tooltipNode"
            class="topo-tooltip"
            :style="{ left: tooltipNode.x + 'px', top: tooltipNode.y + 'px' }"
          >
            <div class="topo-tooltip__name">{{ tooltipNode.name }}</div>
            <div class="topo-tooltip__info">IP: {{ tooltipNode.ip }}</div>
            <div class="topo-tooltip__info">状态: {{ statusText(tooltipNode.status) }}</div>
          </div>
        </div>
        <XlyDocCode :code='`<XlyTopology :nodes="nodes" :edges="edges" :width="900" :height="600" />`' />
      </div>
    </section>

    <!-- API 文档 -->
    <section class="doc-section">
      <h2 class="doc-section__title">API</h2>
      <h3 class="doc-subtitle">Props</h3>
      <div class="doc-table">
        <table>
          <thead><tr><th>属性名</th><th>说明</th><th>类型</th><th>默认值</th></tr></thead>
          <tbody>
            <tr><td>nodes</td><td>节点数据</td><td><code>TopoNode[]</code></td><td><code>[]</code></td></tr>
            <tr><td>edges</td><td>连线数据</td><td><code>TopoEdge[]</code></td><td><code>[]</code></td></tr>
            <tr><td>width</td><td>画布宽度</td><td><code>number</code></td><td><code>900</code></td></tr>
            <tr><td>height</td><td>画布高度</td><td><code>number</code></td><td><code>600</code></td></tr>
            <tr><td>draggable</td><td>节点是否可拖拽</td><td><code>boolean</code></td><td><code>true</code></td></tr>
          </tbody>
        </table>
      </div>
      <h3 class="doc-subtitle">TopoNode</h3>
      <div class="doc-table">
        <table>
          <thead><tr><th>字段</th><th>说明</th><th>类型</th></tr></thead>
          <tbody>
            <tr><td>id</td><td>节点唯一标识</td><td><code>string</code></td></tr>
            <tr><td>name</td><td>节点名称</td><td><code>string</code></td></tr>
            <tr><td>ip</td><td>IP 地址</td><td><code>string</code></td></tr>
            <tr><td>status</td><td>状态：normal / warning / offline</td><td><code>string</code></td></tr>
            <tr><td>x / y</td><td>坐标（初始值）</td><td><code>number</code></td></tr>
            <tr><td>icon</td><td>图标类型</td><td><code>string</code></td></tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'

// ===== 画布 =====
const canvasRef = ref<HTMLCanvasElement | null>(null)
const tooltipNode = ref<{ x: number; y: number; name: string; ip: string; status: string } | null>(null)
const canvasWidth = ref(960)

const topoView = ref('tree')

// ===== 节点类型 =====
interface TopoNode {
  id: string; name: string; ip: string; status: 'normal' | 'warning' | 'offline'
  x: number; y: number; icon: string
}

interface TopoEdge {
  from: string; to: string
}

// ===== 数据 =====
const treeNodes: TopoNode[] = [
  { id: 'root', name: '核心交换机', ip: '10.0.0.1', status: 'normal', x: 480, y: 40, icon: 'switch' },
  { id: 'fw1', name: '防火墙 A', ip: '10.0.0.2', status: 'normal', x: 240, y: 140, icon: 'firewall' },
  { id: 'fw2', name: '防火墙 B', ip: '10.0.0.3', status: 'warning', x: 720, y: 140, icon: 'firewall' },
  { id: 'srv1', name: 'Web 服务器 1', ip: '192.168.1.10', status: 'normal', x: 120, y: 260, icon: 'server' },
  { id: 'srv2', name: 'Web 服务器 2', ip: '192.168.1.11', status: 'normal', x: 360, y: 260, icon: 'server' },
  { id: 'db1', name: '数据库主库', ip: '192.168.2.10', status: 'normal', x: 600, y: 260, icon: 'db' },
  { id: 'db2', name: '数据库备库', ip: '192.168.2.11', status: 'offline', x: 840, y: 260, icon: 'db' },
  { id: 'cache', name: 'Redis 缓存', ip: '192.168.3.10', status: 'normal', x: 240, y: 380, icon: 'cache' },
  { id: 'mq', name: '消息队列', ip: '192.168.4.10', status: 'normal', x: 480, y: 380, icon: 'queue' },
  { id: 'storage', name: '文件存储', ip: '192.168.5.10', status: 'warning', x: 720, y: 380, icon: 'storage' },
  { id: 'monitor', name: '监控节点', ip: '192.168.6.10', status: 'normal', x: 360, y: 500, icon: 'monitor' },
  { id: 'backup', name: '备份节点', ip: '192.168.7.10', status: 'normal', x: 600, y: 500, icon: 'backup' },
]

const treeEdges: TopoEdge[] = [
  { from: 'root', to: 'fw1' }, { from: 'root', to: 'fw2' },
  { from: 'fw1', to: 'srv1' }, { from: 'fw1', to: 'srv2' },
  { from: 'fw2', to: 'db1' }, { from: 'fw2', to: 'db2' },
  { from: 'srv1', to: 'cache' }, { from: 'srv2', to: 'cache' },
  { from: 'db1', to: 'mq' }, { from: 'db2', to: 'storage' },
  { from: 'cache', to: 'monitor' }, { from: 'mq', to: 'backup' },
]

const starNodes: TopoNode[] = [
  { id: 'center', name: '核心路由', ip: '10.0.0.1', status: 'normal', x: 480, y: 300, icon: 'router' },
  { id: 'n1', name: '节点 A', ip: '192.168.1.1', status: 'normal', x: 480, y: 60, icon: 'server' },
  { id: 'n2', name: '节点 B', ip: '192.168.1.2', status: 'normal', x: 760, y: 140, icon: 'server' },
  { id: 'n3', name: '节点 C', ip: '192.168.1.3', status: 'warning', x: 760, y: 460, icon: 'server' },
  { id: 'n4', name: '节点 D', ip: '192.168.1.4', status: 'normal', x: 480, y: 540, icon: 'db' },
  { id: 'n5', name: '节点 E', ip: '192.168.1.5', status: 'offline', x: 200, y: 460, icon: 'db' },
  { id: 'n6', name: '节点 F', ip: '192.168.1.6', status: 'normal', x: 200, y: 140, icon: 'cache' },
]

const starEdges: TopoEdge[] = [
  { from: 'center', to: 'n1' }, { from: 'center', to: 'n2' },
  { from: 'center', to: 'n3' }, { from: 'center', to: 'n4' },
  { from: 'center', to: 'n5' }, { from: 'center', to: 'n6' },
]

const meshNodes: TopoNode[] = [
  { id: 'a', name: '区域 A', ip: '10.1.0.1', status: 'normal', x: 240, y: 80, icon: 'switch' },
  { id: 'b', name: '区域 B', ip: '10.2.0.1', status: 'normal', x: 720, y: 80, icon: 'switch' },
  { id: 'c', name: '区域 C', ip: '10.3.0.1', status: 'warning', x: 240, y: 520, icon: 'switch' },
  { id: 'd', name: '区域 D', ip: '10.4.0.1', status: 'normal', x: 720, y: 520, icon: 'switch' },
  { id: 'e', name: '汇聚 A', ip: '172.16.0.1', status: 'normal', x: 480, y: 180, icon: 'router' },
  { id: 'f', name: '汇聚 B', ip: '172.16.0.2', status: 'normal', x: 480, y: 420, icon: 'router' },
]

const meshEdges: TopoEdge[] = [
  { from: 'a', to: 'e' }, { from: 'b', to: 'e' },
  { from: 'c', to: 'f' }, { from: 'd', to: 'f' },
  { from: 'e', to: 'f' }, { from: 'a', to: 'b' },
  { from: 'c', to: 'd' }, { from: 'a', to: 'c' }, { from: 'b', to: 'd' },
]

const currentNodes = ref(treeNodeNodes())
const currentEdges = ref(treeEdges)

function treeNodeNodes() { return JSON.parse(JSON.stringify(treeNodes)) }
function starNodeNodes() { return JSON.parse(JSON.stringify(starNodes)) }
function meshNodeNodes() { return JSON.parse(JSON.stringify(meshNodes)) }

function changeView(v: string) {
  switch (v) {
    case 'tree': currentNodes.value = treeNodeNodes(); currentEdges.value = treeEdges; break
    case 'star': currentNodes.value = starNodeNodes(); currentEdges.value = starEdges; break
    case 'mesh': currentNodes.value = meshNodeNodes(); currentEdges.value = meshEdges; break
  }
  nextTick(() => drawTopology())
}

function statusText(s: string) {
  return s === 'normal' ? '正常' : s === 'warning' ? '警告' : '离线'
}

// ===== 图标绘制 =====
function drawIcon(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  icon: string,
  color: string,
) {
  ctx.save()
  ctx.strokeStyle = color
  ctx.fillStyle = color
  ctx.lineWidth = 2

  switch (icon) {
    case 'switch':
      ctx.fillRect(cx - 10, cy - 6, 20, 12)
      ctx.clearRect(cx - 7, cy - 3, 14, 6)
      ctx.fillRect(cx - 3, cy - 2, 6, 4)
      break
    case 'firewall':
      roundRect(ctx, cx - 10, cy - 8, 20, 16, 3)
      ctx.stroke()
      ctx.fillRect(cx - 5, cy - 4, 10, 2)
      ctx.fillRect(cx - 5, cy + 2, 10, 2)
      break
    case 'server':
      roundRect(ctx, cx - 8, cy - 10, 16, 20, 3)
      ctx.stroke()
      for (let j = -4; j <= 4; j += 4) {
        ctx.fillRect(cx - 4 - 5, cy + j - 1, 10, 2)
      }
      break
    case 'db':
      ctx.beginPath()
      ctx.ellipse(cx, cy - 6, 12, 5, 0, Math.PI, 0)
      ctx.stroke(); ctx.fill()
      ctx.beginPath()
      ctx.ellipse(cx, cy - 6, 12, 5, 0, 0, Math.PI)
      ctx.stroke()
      ctx.strokeRect(cx - 12, cy - 6, 24, 12)
      ctx.strokeRect(cx - 10, cy + 6, 20, 4)
      ctx.strokeRect(cx - 8, cy + 10, 16, 3)
      break
    case 'cache':
      ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI * 2); ctx.stroke()
      ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2); ctx.stroke()
      break
    case 'queue':
      ctx.fillText('MQ', cx - 12, cy + 4)
      break
    case 'storage':
      roundRect(ctx, cx - 10, cy - 8, 20, 16, 2)
      ctx.stroke()
      ctx.fillText('FS', cx - 10, cy + 4)
      break
    case 'monitor':
      ctx.beginPath(); ctx.arc(cx, cy - 2, 7, Math.PI, 0); ctx.stroke()
      ctx.fillRect(cx - 2, cy + 4, 4, 6)
      break
    case 'backup':
      roundRect(ctx, cx - 8, cy - 8, 16, 16, 3)
      ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx - 4, cy - 4); ctx.lineTo(cx + 4, cy); ctx.lineTo(cx - 4, cy + 4); ctx.stroke()
      break
    case 'router':
      ctx.beginPath(); ctx.arc(cx, cy, 12, 0, Math.PI * 2); ctx.stroke()
      ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2); ctx.fill()
      break
    default:
      roundRect(ctx, cx - 10, cy - 8, 20, 16, 3)
      ctx.stroke()
  }
  ctx.restore()
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.lineTo(x + w - r, y)
  ctx.arcTo(x + w, y, x + w, y + r, r)
  ctx.lineTo(x + w, y + h - r)
  ctx.arcTo(x + w, y + h, x + w - r, y + h, r)
  ctx.lineTo(x + r, y + h)
  ctx.arcTo(x, y + h, x, y + h - r, r)
  ctx.lineTo(x, y + r)
  ctx.arcTo(x, y, x + r, y, r)
  ctx.closePath()
}

// ===== 绘制 =====
function drawTopology() {
  const canvas = canvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  const width = canvas.width
  const height = canvas.height

  // 背景
  ctx.clearRect(0, 0, width, height)
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--el-bg-color').trim() || '#fafbfd'
  ctx.fillRect(0, 0, width, height)

  // 网格
  ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--el-border-color-lighter').trim() || '#e8e8e8'
  ctx.lineWidth = 0.5
  for (let x = 0; x < width; x += 40) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke()
  }
  for (let y = 0; y < height; y += 40) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke()
  }

  // 连线
  const nodeMap = new Map(currentNodes.value.map((n) => [n.id, n]))
  currentEdges.value.forEach((edge, idx) => {
    const from = nodeMap.get(edge.from)
    const to = nodeMap.get(edge.to)
    if (!from || !to) return

    const dashOffset = (Date.now() / 50 + idx * 10) % 20
    ctx.save()
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--el-color-primary').trim() || '#409eff'
    ctx.lineWidth = 2
    ctx.setLineDash([6, 4])
    ctx.lineDashOffset = -dashOffset
    ctx.beginPath()
    ctx.moveTo(from.x, from.y + 18)
    ctx.lineTo(to.x, to.y - 18)
    ctx.stroke()
    ctx.restore()
  })

  // 节点
  currentNodes.value.forEach((node) => {
    const colors: Record<string, string> = {
      normal: '#22c55e',
      warning: '#f59e0b',
      offline: '#ef4444',
    }
    const color = colors[node.status] || '#94a3b8'

    drawIcon(ctx, node.x, node.y, node.icon, color)

    // 状态点
    ctx.save()
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(node.x + 16, node.y - 14, 5, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()

    // 名称
    ctx.save()
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--el-text-color-primary').trim() || '#333'
    ctx.font = '12px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText(node.name, node.x, node.y + 34)
    ctx.restore()
  })

  requestAnimationFrame(drawTopology)
}

// ===== 交互 =====
interface DragState {
  nodeId: string | null
  offsetX: number
  offsetY: number
  isDragging: boolean
}

const drag = { nodeId: null, offsetX: 0, offsetY: 0, isDragging: false } as DragState

function getNodeAt(x: number, y: number): TopoNode | null {
  for (const node of currentNodes.value) {
    const dx = x - node.x
    const dy = y - node.y
    if (dx * dx + dy * dy < 30 * 30) return node
  }
  return null
}

function onMouseDown(e: MouseEvent) {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const mx = e.clientX - rect.left
  const my = e.clientY - rect.top
  const node = getNodeAt(mx, my)
  if (node) {
    drag.nodeId = node.id
    drag.offsetX = mx - node.x
    drag.offsetY = my - node.y
    drag.isDragging = true
  }
}

function onMouseUp() {
  drag.nodeId = null; drag.isDragging = false
}

function onMouseMove(e: MouseEvent) {
  const canvas = canvasRef.value
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()
  const mx = e.clientX - rect.left
  const my = e.clientY - rect.top

  if (drag.isDragging && drag.nodeId) {
    const node = currentNodes.value.find((n) => n.id === drag.nodeId)
    if (node) {
      node.x = Math.max(30, Math.min(canvas.width - 30, mx - drag.offsetX))
      node.y = Math.max(30, Math.min(canvas.height - 50, my - drag.offsetY))
    }
  } else {
    const node = getNodeAt(mx, my)
    if (node) {
      canvas.style.cursor = 'pointer'
      tooltipNode.value = {
        x: e.clientX - rect.left + 12,
        y: e.clientY - rect.top - 10,
        name: node.name,
        ip: node.ip,
        status: node.status,
      }
      return
    }
    canvas.style.cursor = 'default'
    tooltipNode.value = null
  }
}

function onWheel(e: WheelEvent) {
  // scale can be added if needed
  if (e.ctrlKey) e.preventDefault()
}

const scale = ref(1)

onMounted(() => {
  canvasWidth.value = Math.min(window.innerWidth - 280, 960)
  nextTick(() => drawTopology())
})
</script>

<style scoped lang="scss">
.topology-doc {
  padding: 8px 0 40px;
}
.doc-header {
  margin-bottom: 36px;
}
.doc-title {
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--el-text-color-primary);
}
.doc-desc {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0;
  line-height: 1.6;
  code {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 13px;
  }
}
.doc-section {
  margin-bottom: 32px;
  &__title {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    color: var(--el-text-color-primary);
  }
  &__desc {
    font-size: 14px;
    color: var(--el-text-color-secondary);
    margin: 0 0 16px;
    line-height: 1.6;
    code {
      background: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 13px;
    }
  }
}
.doc-preview {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  overflow: hidden;
  background: var(--el-bg-color-overlay);
  &__body {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    padding: 20px;
    gap: 16px;
    align-items: flex-start;
    flex-direction: column;
  }
}
.doc-code {
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-light);
  padding: 16px 20px;
  overflow-x: auto;
  pre {
    margin: 0;
    font-size: 13px;
    line-height: 1.6;
    code {
      color: var(--el-text-color-primary);
      font-family: 'Fira Code', 'Cascadia Code', monospace;
    }
  }
}
.doc-subtitle {
  font-size: 15px;
  font-weight: 600;
  margin: 20px 0 10px;
  color: var(--el-text-color-primary);
}
.doc-table {
  overflow-x: auto;
  margin-bottom: 20px;
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  th {
    background: var(--el-fill-color-light);
    padding: 8px 14px;
    text-align: left;
    border: 1px solid var(--el-border-color-lighter);
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
  td {
    padding: 8px 14px;
    border: 1px solid var(--el-border-color-lighter);
    color: var(--el-text-color-regular);
    code {
      background: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
      padding: 1px 6px;
      border-radius: 3px;
      font-size: 12px;
    }
  }
}

.topo-actions {
  margin-bottom: 4px;
}

.topo-canvas {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  cursor: default;
  background: var(--el-bg-color);
}

.topo-tooltip {
  position: absolute;
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color);
  border-radius: 6px;
  padding: 8px 12px;
  pointer-events: none;
  z-index: 10;
  box-shadow: var(--el-box-shadow-light);
  &__name {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin-bottom: 4px;
  }
  &__info {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}
</style>
