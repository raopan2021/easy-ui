<script setup lang="ts">
import { EasyButton, EasyWatermark } from '@raopan/easy-ui'
import { ref } from 'vue'

/** 动态水印：显示/隐藏 */
const showDynamic = ref(true)
const dynamicContent = ref(['动态水印', '可修改'])

function toggleWatermark() {
  showDynamic.value = !showDynamic.value
}

/** 动态水印：切换颜色 */
const colors = [
  'rgba(0, 0, 0, 0.15)',
  'rgba(79, 110, 247, 0.15)',
  'rgba(245, 108, 108, 0.15)',
  'rgba(52, 199, 89, 0.15)',
  'rgba(245, 166, 35, 0.15)',
]
const colorIndex = ref(0)
const dynamicColor = ref(colors[0])

function cycleColor() {
  colorIndex.value = (colorIndex.value + 1) % colors.length
  dynamicColor.value = colors[colorIndex.value]
}

/** v-watermark 指令配置 */
const directiveOptions = {
  content: ['指令水印', 'v-watermark'],
  fontColor: 'rgba(79, 110, 247, 0.12)',
  rotate: -20,
  fontSize: 14,
  gapX: 100,
  gapY: 80,
  width: 110,
  height: 70,
}
</script>

<template>
  <div v-watermark="{ content: '指令水印' }" class="watermark-doc">
    <!-- 页面标题 -->
    <div class="doc-header">
      <h1 class="doc-title">
        Watermark 水印
      </h1>
      <p class="doc-desc">
        为页面或指定区域添加水印，支持文字水印、图片水印、多行内容、自定义样式、防篡改等功能。
        提供组件和指令两种使用方式。
      </p>
    </div>

    <!-- 基础文字水印 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        基础文字水印
      </h2>
      <p class="doc-section__desc">
        使用 <code>&lt;EasyWatermark&gt;</code> 组件包裹内容区域，通过 <code>content</code> 设置水印文字。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyWatermark content="内部机密" :gap-x="80" :gap-y="80" :width="100" :height="100">
            <div class="watermark-demo-box">
              <p>这是一段受水印保护的内容。水印默认以斜线平铺方式覆盖在内容之上。</p>
              <p>你可以在这里放置任何需要保护的文字、图片或数据。</p>
            </div>
          </EasyWatermark>
        </div>
        <EasyDocCode
          code="<EasyWatermark content=&quot;内部机密&quot;>
  <div>需要保护的区域</div>
</EasyWatermark>"
        />
      </div>
    </section>

    <!-- 多行文字水印 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        多行文字水印
      </h2>
      <p class="doc-section__desc">
        <code>content</code> 支持数组形式传入多行文字，适合同时显示公司名 + 日期等组合信息。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyWatermark
            :content="['XLY Admin', new Date().toLocaleDateString()]" :font-size="13"
            font-color="rgba(79, 110, 247, 0.12)" :rotate="-15" :gap-x="120" :gap-y="100" :width="120" :height="80"
          >
            <div class="watermark-demo-box">
              <p>多行水印常用于展示公司名称 + 日期、部门 + 人员等信息。</p>
              <p>日期会随当前时间动态变化。</p>
            </div>
          </EasyWatermark>
        </div>
        <EasyDocCode
          code="<EasyWatermark :content=&quot;['XLY Admin', '2026-03-21']&quot; :rotate=&quot;-15&quot;>
  <div>多行水印区域</div>
</EasyWatermark>"
        />
      </div>
    </section>

    <!-- 自定义样式 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        自定义样式
      </h2>
      <p class="doc-section__desc">
        通过 <code>fontColor</code>、<code>fontSize</code>、<code>rotate</code>、<code>opacity</code>
        等属性调整水印外观。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body watermark-style-group">
          <div class="watermark-style-item">
            <span class="watermark-style-item__label">浅色大字</span>
            <EasyWatermark
              content="浅色水印" font-color="rgba(0, 0, 0, 0.06)" :font-size="20" :width="160" :height="160"
              :gap-x="60" :gap-y="60"
            >
              <div class="watermark-demo-box watermark-demo-box--sm" />
            </EasyWatermark>
          </div>
          <div class="watermark-style-item">
            <span class="watermark-style-item__label">深色小字</span>
            <EasyWatermark
              content="深色水印" font-color="rgba(0, 0, 0, 0.25)" :font-size="12" :width="80" :height="80"
              :gap-x="60" :gap-y="60"
            >
              <div class="watermark-demo-box watermark-demo-box--sm" />
            </EasyWatermark>
          </div>
          <div class="watermark-style-item">
            <span class="watermark-style-item__label">彩色水印</span>
            <EasyWatermark
              content="彩色水印" font-color="rgba(245, 108, 108, 0.15)" :font-size="16" :width="100"
              :height="100" :gap-x="80" :gap-y="80"
            >
              <div class="watermark-demo-box watermark-demo-box--sm" />
            </EasyWatermark>
          </div>
          <div class="watermark-style-item">
            <span class="watermark-style-item__label">垂直排列</span>
            <EasyWatermark
              content="垂直水印" :rotate="-90" font-color="rgba(0, 0, 0, 0.1)" :font-size="14" :width="40"
              :height="120" :gap-x="60" :gap-y="60"
            >
              <div class="watermark-demo-box watermark-demo-box--sm" />
            </EasyWatermark>
          </div>
        </div>
        <EasyDocCode
          code="<!-- 浅色大字 -->
<EasyWatermark
  content=&quot;浅色水印&quot;
  font-color=&quot;rgba(0, 0, 0, 0.06)&quot;
  :font-size=&quot;20&quot;
  :width=&quot;160&quot; :height=&quot;160&quot;
  :gap-x=&quot;60&quot; :gap-y=&quot;60&quot;
>

<!-- 彩色水印 -->
<EasyWatermark
  content=&quot;彩色水印&quot;
  font-color=&quot;rgba(245, 108, 108, 0.15)&quot;
  :font-size=&quot;16&quot;
>"
        />
      </div>
    </section>

    <!-- 动态属性 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        动态属性修改
      </h2>
      <p class="doc-section__desc">
        水印属性支持响应式更新，修改后自动重绘。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <div class="watermark-controls">
            <EasyButton size="small" @click="toggleWatermark">
              {{ showDynamic ? '隐藏水印' : '显示水印' }}
            </EasyButton>
            <EasyButton size="small" type="ghost" @click="cycleColor">
              切换颜色
            </EasyButton>
          </div>
          <EasyWatermark
            v-if="showDynamic" :content="dynamicContent" :font-color="dynamicColor" :font-size="16"
            :gap-x="90" :gap-y="90" :width="110" :height="110"
          >
            <div class="watermark-demo-box">
              <p>水印内容、颜色等属性均可动态修改。</p>
              <p>点击上方按钮试试效果。</p>
            </div>
          </EasyWatermark>
          <div v-else class="watermark-demo-box">
            <p>水印已隐藏，点击按钮重新显示。</p>
          </div>
        </div>
        <EasyDocCode
          code="<EasyWatermark
  v-if=&quot;showWatermark&quot;
  :content=&quot;watermarkText&quot;
  :font-color=&quot;watermarkColor&quot;
>
  <div>动态水印区域</div>
</EasyWatermark>"
        />
      </div>
    </section>

    <!-- v-watermark 指令 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        v-watermark 指令
      </h2>
      <p class="doc-section__desc">
        使用
        <code>v-watermark</code>
        指令可直接在任意元素上添加水印，无需包裹组件。适合在已有容器上快速添加水印。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <div v-watermark="directiveOptions" class="watermark-demo-box">
            <p>这是通过 <code>v-watermark</code> 指令添加的水印。</p>
            <p>指令方式更简洁，适合快速添加。</p>
          </div>
        </div>
        <EasyDocCode
          code="<div v-watermark=&quot;{ content: '指令水印' }&quot;>
  内容区域
</div>

<div v-watermark=&quot;{
  content: ['公司名称', '2026-03-21'],
  fontColor: 'rgba(79, 110, 247, 0.1)',
  rotate: -20,
}&quot;>
  多行指令水印
</div>"
        />
      </div>
    </section>

    <!-- API 属性表格 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        API
      </h2>
      <p class="doc-section__desc">
        EasyWatermark 组件属性（v-watermark 指令参数相同）
      </p>
      <div class="doc-table-wrapper">
        <table class="doc-table">
          <thead>
            <tr>
              <th>属性</th>
              <th>说明</th>
              <th>类型</th>
              <th>默认值</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>content</code></td>
              <td>水印文字，支持多行（数组）</td>
              <td><code>string | string[]</code></td>
              <td><code>''</code></td>
            </tr>
            <tr>
              <td><code>image</code></td>
              <td>水印图片 URL</td>
              <td><code>string</code></td>
              <td><code>''</code></td>
            </tr>
            <tr>
              <td><code>rotate</code></td>
              <td>旋转角度（度）</td>
              <td><code>number</code></td>
              <td><code>-22</code></td>
            </tr>
            <tr>
              <td><code>width / height</code></td>
              <td>单个水印区域尺寸</td>
              <td><code>number</code></td>
              <td><code>120 / 64</code></td>
            </tr>
            <tr>
              <td><code>fontSize</code></td>
              <td>字体大小</td>
              <td><code>number</code></td>
              <td><code>14</code></td>
            </tr>
            <tr>
              <td><code>fontColor</code></td>
              <td>字体颜色</td>
              <td><code>string</code></td>
              <td><code>'rgba(0,0,0,0.15)'</code></td>
            </tr>
            <tr>
              <td><code>fontFamily</code></td>
              <td>字体族</td>
              <td><code>string</code></td>
              <td><code>'sans-serif'</code></td>
            </tr>
            <tr>
              <td><code>fontWeight</code></td>
              <td>字体粗细</td>
              <td><code>string</code></td>
              <td><code>'normal'</code></td>
            </tr>
            <tr>
              <td><code>opacity</code></td>
              <td>整体透明度</td>
              <td><code>number</code></td>
              <td><code>1</code></td>
            </tr>
            <tr>
              <td><code>gapX / gapY</code></td>
              <td>水印之间的间距</td>
              <td><code>number</code></td>
              <td><code>100</code></td>
            </tr>
            <tr>
              <td><code>offset</code></td>
              <td>水印偏移量</td>
              <td><code>{ x?: number, y?: number }</code></td>
              <td><code>{}</code></td>
            </tr>
            <tr>
              <td><code>imageWidth</code></td>
              <td>图片水印宽度</td>
              <td><code>number</code></td>
              <td><code>120</code></td>
            </tr>
            <tr>
              <td><code>preventDelete</code></td>
              <td>是否防篡改</td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
            </tr>
            <tr>
              <td><code>zIndex</code></td>
              <td>水印层 z-index</td>
              <td><code>number</code></td>
              <td><code>9</code></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
/* ========== 文档页通用样式 ========== */
.doc-header {
  margin-bottom: 32px;
}

.doc-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin: 0 0 8px;
}

.doc-desc {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  line-height: 1.6;
  margin: 0;

  code {
    padding: 2px 6px;
    background: var(--el-fill-color-light);
    border-radius: 4px;
    font-size: 13px;
    color: var(--el-color-primary);
    font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  }
}

.doc-section {
  margin-bottom: 40px;
}

.doc-section__title {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px;
}

.doc-section__desc {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  line-height: 1.6;
  margin: 0 0 16px;

  code {
    padding: 2px 6px;
    background: var(--el-fill-color-light);
    border-radius: 4px;
    font-size: 13px;
    color: var(--el-color-primary);
    font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  }
}

.doc-preview {
  border: 1px solid #e2e4ed;
  border-radius: 12px;
  overflow: hidden;
}

.doc-preview__body {
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 16px;
}

.doc-code {
  border-top: 1px solid #e2e4ed;
  padding: 16px;
  background: var(--el-fill-color-light);

  pre {
    margin: 0;
    overflow-x: auto;
  }

  code {
    font-size: 13px;
    line-height: 1.6;
    color: var(--el-text-color-regular);
    font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  }
}

/* ========== 水印演示区域 ========== */
.watermark-demo-box {
  background: var(--el-fill-color-lighter);
  border: 1px dashed #d0d5dd;
  border-radius: 8px;
  padding: 24px;
  min-height: 160px;
  position: relative;

  p {
    margin: 0 0 8px;
    font-size: 14px;
    color: var(--el-text-color-regular);
    line-height: 1.6;

    &:last-child {
      margin-bottom: 0;
    }

    code {
      padding: 2px 6px;
      background: #e8eaf0;
      border-radius: 4px;
      font-size: 13px;
      color: var(--el-color-primary);
      font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
    }
  }

  &.watermark-demo-box--sm {
    min-height: 120px;
  }
}

/* ========== 样式对比组 ========== */
.watermark-style-group {
  flex-direction: row !important;
  flex-wrap: wrap;
}

.watermark-style-item {
  flex: 1;
  min-width: 200px;
  display: flex;
  flex-direction: column;
  gap: 8px;

  .watermark-style-item__label {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    text-align: center;
  }
}

/* ========== 控制栏 ========== */
.watermark-controls {
  display: flex;
  gap: 8px;
}

/* ========== API 表格 ========== */
.doc-table-wrapper {
  overflow-x: auto;
}

.doc-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  th,
  td {
    padding: 10px 16px;
    text-align: left;
    border-bottom: 1px solid #e2e4ed;
  }

  th {
    background: var(--el-fill-color-lighter);
    font-weight: 600;
    color: var(--el-text-color-primary);
    white-space: nowrap;
  }

  td {
    color: var(--el-text-color-regular);
  }

  code {
    padding: 2px 6px;
    background: var(--el-fill-color-light);
    border-radius: 4px;
    font-size: 13px;
    color: var(--el-color-primary);
    font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  }
}
</style>
