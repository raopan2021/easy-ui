<script setup lang="ts">

import { nextTick, onMounted, ref } from 'vue'

// ===== 签名数据 =====
interface SigItem {
  type: 'handwrite' | 'stamp'
  data: string
  x: number
  y: number
}

const signatures = ref<SigItem[]>([])

// ===== 手写画布 =====
const drawCanvasRef = ref<HTMLCanvasElement | null>(null)
let isDrawing = false

function getDrawCtx() {
  const canvas = drawCanvasRef.value
  if (!canvas)
    return null
  return { ctx: canvas.getContext('2d'), canvas }
}

function startDraw(e: MouseEvent) {
  isDrawing = true
  const r = getDrawCtx()
  if (!r)
    return
  const rect = r.canvas.getBoundingClientRect()
  r.ctx.beginPath()
  r.ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
}

function startDrawTouch(e: TouchEvent) {
  isDrawing = true
  const r = getDrawCtx()
  if (!r)
    return
  const rect = r.canvas.getBoundingClientRect()
  const t = e.touches[0]
  r.ctx.beginPath()
  r.ctx.moveTo(t.clientX - rect.left, t.clientY - rect.top)
}

function onDraw(e: MouseEvent) {
  if (!isDrawing)
    return
  const r = getDrawCtx()
  if (!r)
    return
  const rect = r.canvas.getBoundingClientRect()
  r.ctx.strokeStyle = '#1a1a2e'
  r.ctx.lineWidth = 2.5
  r.ctx.lineCap = 'round'
  r.ctx.lineJoin = 'round'
  r.ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
  r.ctx.stroke()
}

function onDrawTouch(e: TouchEvent) {
  if (!isDrawing)
    return
  const r = getDrawCtx()
  if (!r)
    return
  const rect = r.canvas.getBoundingClientRect()
  const t = e.touches[0]
  r.ctx.strokeStyle = '#1a1a2e'
  r.ctx.lineWidth = 2.5
  r.ctx.lineCap = 'round'
  r.ctx.lineJoin = 'round'
  r.ctx.lineTo(t.clientX - rect.left, t.clientY - rect.top)
  r.ctx.stroke()
}

function stopDraw() {
  isDrawing = false
}

function clearCanvas() {
  const r = getDrawCtx()
  if (!r)
    return
  r.ctx.clearRect(0, 0, r.canvas.width, r.canvas.height)
}

function addSignature() {
  const canvas = drawCanvasRef.value
  if (!canvas)
    return
  const dataUrl = canvas.toDataURL()
  // 判断画布是否为空
  const ctx = canvas.getContext('2d')
  if (!ctx)
    return
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const hasContent = imageData.data.some(v => v !== 0)
  if (!hasContent) {
    return
  }
  signatures.value.push({ type: 'handwrite', data: dataUrl, x: 100, y: 20 })
  clearCanvas()
  nextTick(() => renderSigCanvases())
}

// ===== 印章 =====
const stamps = ref<string[]>([])

function generateStamps() {
  const colors = ['#dc2626', '#d97706', '#2563eb']
  stamps.value = colors.map((color) => {
    const c = document.createElement('canvas')
    c.width = 100
    c.height = 100
    const ctx = c.getContext('2d')!
    ctx.translate(50, 50)

    // 外圈
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(0, 0, 44, 0, Math.PI * 2)
    ctx.stroke()

    // 内圈
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(0, 0, 38, 0, Math.PI * 2)
    ctx.stroke()

    // 文字
    ctx.fillStyle = color
    ctx.font = 'bold 16px serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('合同专用章', 0, 0)

    // 星星
    ctx.fillStyle = color
    ctx.beginPath()
    for (let i = 0; i < 5; i++) {
      const angle = (i * (Math.PI * 2)) / 5 - Math.PI / 2
      const x = Math.cos(angle) * 24
      const y = Math.sin(angle) * 24
      if (i === 0)
        ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.closePath()
    ctx.lineWidth = 1
    ctx.stroke()

    return c.toDataURL()
  })
}

function addStamp(stamp: string) {
  signatures.value.push({ type: 'stamp', data: stamp, x: 200, y: 20 })
}

// ===== 渲染签名缩略图 =====
function renderSigCanvases() {
  nextTick(() => {
    const canvases = document.querySelectorAll('.signature-canvas-small') as NodeListOf<HTMLCanvasElement>
    canvases.forEach((c, idx) => {
      const sig = signatures.value[idx]
      if (!sig || sig.type !== 'handwrite')
        return
      const img = new Image()
      img.onload = () => {
        c.getContext('2d')!.drawImage(img, 0, 0, c.width, c.height)
      }
      img.src = sig.data
    })
  })
}

// ===== 拖拽签名 =====
let dragSigIdx = -1
let dragSigStart = { x: 0, y: 0 }
let dragMouseStart = { x: 0, y: 0 }

function startDragSig(e: MouseEvent, idx: number) {
  dragSigIdx = idx
  dragSigStart = { x: signatures.value[idx].x, y: signatures.value[idx].y }
  dragMouseStart = { x: e.clientX, y: e.clientY }
  document.addEventListener('mousemove', onDragSig)
  document.addEventListener('mouseup', stopDragSig)
}

function onDragSig(e: MouseEvent) {
  if (dragSigIdx === -1)
    return
  const dx = e.clientX - dragMouseStart.x
  const dy = e.clientY - dragMouseStart.y
  signatures.value[dragSigIdx].x = Math.max(0, dragSigStart.x + dx)
  signatures.value[dragSigIdx].y = Math.max(0, dragSigStart.y + dy)
}

function stopDragSig() {
  dragSigIdx = -1
  document.removeEventListener('mousemove', onDragSig)
  document.removeEventListener('mouseup', stopDragSig)
}

function removeSig(idx: number) {
  signatures.value.splice(idx, 1)
}

onMounted(() => {
  generateStamps()
  renderSigCanvases()
})
</script>

<template>
  <div class="pdf-sign-doc">
    <div class="doc-header">
      <h1 class="doc-title">
        PdfSign PDF 签名
      </h1>
      <p class="doc-desc">
        PDF 电子签名组件，支持手写签名、印章添加、签名位置拖拽调整。可在 PDF 页面指定位置添加签名或印章。
      </p>
    </div>

    <!-- 基础用法 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        基础用法
      </h2>
      <p class="doc-section__desc">
        左侧为 PDF 预览区，右侧为签名面板。在签名区手写后，点击「添加签名」将其放置到 PDF 页面上，支持拖拽调整位置。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <div class="pdf-workspace">
            <!-- PDF 预览区 -->
            <div class="pdf-preview">
              <div class="pdf-page">
                <div class="pdf-page__header">
                  <h3>合同编号：HT-2026-001</h3>
                  <h4>技术服务合同</h4>
                </div>
                <div class="pdf-page__body">
                  <p>甲方：XX科技有限公司</p>
                  <p>乙方：YY信息技术有限公司</p>
                  <p>
                    根据《中华人民共和国民法典》及相关法律法规，甲乙双方在平等、自愿的基础上，经协商一致，就甲方委托乙方提供技术服务相关事宜达成如下协议：
                  </p>
                  <p>
                    一、服务内容：乙方为甲方提供企业信息化系统开发与维护服务，包括但不限于需求分析、系统设计、编码实现、测试部署及后期运维。
                  </p>
                  <p>二、服务期限：自合同签订之日起 12 个月。</p>
                  <p>三、服务费用：人民币肆拾万元整（¥400,000）。</p>
                  <p>四、支付方式：合同签订后支付 30%，系统上线后支付 50%，验收通过后支付剩余 20%。</p>
                  <p>&nbsp;</p>
                  <p>甲方代表（签字）：</p>
                  <p>&nbsp;</p>
                  <div class="signature-area">
                    <div
                      v-for="(sig, idx) in signatures"
                      :key="idx"
                      class="signature-item"
                      :style="{ left: `${sig.x}px`, top: `${sig.y}px` }"
                      @mousedown.stop="startDragSig($event, idx)"
                    >
                      <img v-if="sig.type === 'stamp'" :src="sig.data" alt="印章" class="signature-stamp">
                      <canvas v-else class="signature-canvas-small" :width="160" :height="60" />
                      <EasyButton class="signature-item__del" size="small" circle link @click.stop="removeSig(idx)">
                        <EasyIcon name="el:Close" />
                      </EasyButton>
                    </div>
                  </div>
                  <p>&nbsp;</p>
                  <p>乙方代表（签字）：</p>
                  <p>&nbsp;</p>
                  <div class="signature-area" style="margin-left: 240px">
                    <p style="font-size: 13px; color: #999">
                      拖拽签名到此处
                    </p>
                  </div>
                  <p>&nbsp;</p>
                  <p style="text-align: right; margin-top: 40px">
                    签订日期：2026 年 7 月 27 日
                  </p>
                </div>
              </div>
            </div>

            <!-- 签名面板 -->
            <div class="sign-panel">
              <EasyTabs model-value="handwrite">
                <EasyTabPane label="手写签名" name="handwrite">
                  <canvas
                    ref="drawCanvasRef"
                    :width="300"
                    :height="150"
                    class="draw-canvas"
                    @mousedown="startDraw"
                    @mousemove="onDraw"
                    @mouseup="stopDraw"
                    @mouseleave="stopDraw"
                    @touchstart.prevent="startDrawTouch"
                    @touchmove.prevent="onDrawTouch"
                    @touchend="stopDraw"
                  />
                  <div class="draw-actions">
                    <EasyButton size="small" @click="clearCanvas">
                      清空
                    </EasyButton>
                    <EasyButton size="small" type="primary" @click="addSignature">
                      添加签名
                    </EasyButton>
                  </div>
                </EasyTabPane>
                <EasyTabPane label="签章" name="stamp">
                  <div class="stamp-list">
                    <div v-for="(stamp, idx) in stamps" :key="idx" class="stamp-item" @click="addStamp(stamp)">
                      <img :src="stamp" alt="印章" class="stamp-thumb">
                      <span>印章 {{ idx + 1 }}</span>
                    </div>
                  </div>
                </EasyTabPane>
              </EasyTabs>
            </div>
          </div>
        </div>
        <EasyDocCode
          code="<EasyPdfSign
  :pdf-url=&quot;contractUrl&quot;
  :signatures=&quot;signatures&quot;
  @add=&quot;handleAdd&quot;
  @remove=&quot;handleRemove&quot;
/>"
        />
      </div>
    </section>

    <!-- API 文档 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        API
      </h2>
      <h3 class="doc-subtitle">
        Props
      </h3>
      <div class="doc-table">
        <table>
          <thead>
            <tr>
              <th>属性名</th>
              <th>说明</th>
              <th>类型</th>
              <th>默认值</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>pdf-url</td>
              <td>PDF 文件地址</td>
              <td><code>string</code></td>
              <td><code>—</code></td>
            </tr>
            <tr>
              <td>signatures</td>
              <td>已添加的签名列表</td>
              <td><code>Signature[]</code></td>
              <td><code>[]</code></td>
            </tr>
            <tr>
              <td>readonly</td>
              <td>是否只读模式</td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
            </tr>
            <tr>
              <td>pen-color</td>
              <td>签名笔颜色</td>
              <td><code>string</code></td>
              <td><code>#1a1a2e</code></td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3 class="doc-subtitle">
        Events
      </h3>
      <div class="doc-table">
        <table>
          <thead>
            <tr>
              <th>事件名</th>
              <th>说明</th>
              <th>回调参数</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>add</td>
              <td>添加签名时触发</td>
              <td><code>(signature: Signature)</code></td>
            </tr>
            <tr>
              <td>remove</td>
              <td>删除签名时触发</td>
              <td><code>(index: number)</code></td>
            </tr>
            <tr>
              <td>move</td>
              <td>移动签名时触发</td>
              <td><code>(index, position)</code></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.pdf-sign-doc {
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
  .doc-section__title {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    color: var(--el-text-color-primary);
  }
  .doc-section__desc {
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
  .doc-preview__body {
    display: flex;
    padding: 20px;
    gap: 16px;
    align-items: flex-start;
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

// ===== 工作区 =====
.pdf-workspace {
  display: flex;
  gap: 16px;
  width: 100%;
}

.pdf-preview {
  flex: 1;
  overflow: auto;
  max-height: 700px;
}

.pdf-page {
  background: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
  padding: 40px;
  min-height: 680px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  .pdf-page__header {
    text-align: center;
    margin-bottom: 30px;
    h3 {
      margin: 0 0 4px;
      font-size: 14px;
      color: var(--el-text-color-secondary);
      font-weight: 400;
    }
    h4 {
      margin: 0;
      font-size: 22px;
      color: var(--el-text-color-primary);
    }
  }
  .pdf-page__body {
    p {
      font-size: 14px;
      line-height: 2;
      color: var(--el-text-color-regular);
      margin: 0;
    }
  }
}

.draw-canvas {
  border: 1px dashed var(--el-border-color);
  border-radius: 4px;
  margin: 8px;
  width: calc(100% - 16px);
  background: var(--el-bg-color);
  touch-action: none;
}

.sign-panel {
  width: 340px;
  flex-shrink: 0;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
  background: var(--el-bg-color);
}

.draw-canvas {
  border: 1px dashed var(--el-border-color);
  border-radius: 4px;
  margin: 8px;
  width: calc(100% - 16px);
  background: var(--el-bg-color);
  touch-action: none;
}

.draw-actions {
  display: flex;
  gap: 8px;
  padding: 0 8px 12px;
}

.stamp-list {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  padding: 12px;
}

.stamp-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  padding: 8px;
  border: 1px solid transparent;
  border-radius: 6px;
  transition: border-color 0.2s;
  &:hover {
    border-color: var(--el-color-primary);
    background: var(--el-color-primary-light-9);
  }
  span {
    font-size: 11px;
    color: var(--el-text-color-secondary);
  }
}

.stamp-thumb {
  width: 48px;
  height: 48px;
  object-fit: contain;
}

.signature-area {
  position: relative;
  min-height: 80px;
  border: 1px dashed transparent;
}

.signature-item {
  position: absolute;
  cursor: move;
  user-select: none;
  &:hover .signature-item__del {
    opacity: 1;
  }
  .signature-item__del {
    position: absolute;
    top: -10px;
    right: -10px;
    opacity: 0;
    transition: opacity 0.2s;
    z-index: 2;
  }
}

.signature-canvas-small {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 3px;
  background: transparent;
}

.signature-stamp {
  width: 72px;
  height: 72px;
  object-fit: contain;
  opacity: 0.85;
}
</style>
