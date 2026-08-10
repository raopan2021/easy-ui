<script setup lang="ts">
import { EasyButton, EasyQrcode } from 'easy-ui'
import { ElInput, ElMessage } from 'element-plus'
import { ref } from 'vue'

const qrRef = ref<InstanceType<typeof EasyQrcode>>()
const dynamicContent = ref('https://ease-ui.com')

function handleDownload() {
  qrRef.value?.download(`qrcode-${Date.now()}.png`)
  ElMessage.success('下载成功')
}

function handleGetDataUrl() {
  const dataUrl = qrRef.value?.toDataURL()
  if (dataUrl) {
    ElMessage.success('已复制到剪贴板')
    navigator.clipboard.writeText(dataUrl)
  }
}

// 事件日志
const eventLog = ref<Array<{ type: 'success' | 'error', message: string }>>([])

function onGenerated(dataUrl: string) {
  eventLog.value.unshift({
    type: 'success',
    message: `生成成功，Base64 长度: ${dataUrl.length}`,
  })
  if (eventLog.value.length > 3) {
    eventLog.value.pop()
  }
}

function onError(error: Error) {
  eventLog.value.unshift({
    type: 'error',
    message: `生成失败: ${error.message}`,
  })
}
</script>

<template>
  <div class="qrcode-doc">
    <!-- 页面标题 -->
    <div class="doc-header">
      <h1 class="doc-title">
        Qrcode 二维码生成器
      </h1>
      <p class="doc-desc">
        基于 <code>qrcode</code> 库实现的二维码生成器，支持自定义尺寸、颜色、纠错级别，可添加 Logo
        图标，支持下载为图片。
      </p>
      <div class="doc-requires">
        <span class="doc-requires__label">依赖安装</span>
        <code class="doc-requires__cmd">pnpm add qrcode</code>
      </div>
    </div>

    <!-- 基础用法 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        基础用法
      </h2>
      <p class="doc-section__desc">
        传入 <code>content</code> 属性即可生成二维码，默认尺寸 200px，纠错级别 M。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyQrcode content="https://ease-ui.com" />
        </div>
        <EasyDocCode code="<EasyQrcode content=&quot;https://ease-ui.com&quot; />" />
      </div>
    </section>

    <!-- 自定义尺寸和颜色 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        自定义尺寸和颜色
      </h2>
      <p class="doc-section__desc">
        通过 <code>size</code> 设置尺寸，<code>colorDark</code> 和 <code>colorLight</code> 设置前景色和背景色。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body qrcode-size-group">
          <div class="qrcode-size-item">
            <span class="qrcode-size-item__label">100px</span>
            <EasyQrcode content="小尺寸" :size="100" />
          </div>
          <div class="qrcode-size-item">
            <span class="qrcode-size-item__label">200px</span>
            <EasyQrcode content="中尺寸" :size="200" />
          </div>
          <div class="qrcode-size-item">
            <span class="qrcode-size-item__label">300px</span>
            <EasyQrcode content="大尺寸" :size="300" />
          </div>
        </div>
        <EasyDocCode
          code="<EasyQrcode content=&quot;小尺寸&quot; :size=&quot;100&quot; />
<EasyQrcode content=&quot;中尺寸&quot; :size=&quot;200&quot; />
<EasyQrcode content=&quot;大尺寸&quot; :size=&quot;300&quot; />"
        />
      </div>
    </section>

    <!-- 颜色主题 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        颜色主题
      </h2>
      <p class="doc-section__desc">
        通过 <code>colorDark</code> 和 <code>colorLight</code> 属性自定义二维码颜色。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body qrcode-color-group">
          <div class="qrcode-color-item">
            <EasyQrcode content="深色主题" color-dark="#000000" color-light="#ffffff" />
            <span>深色主题</span>
          </div>
          <div class="qrcode-color-item">
            <EasyQrcode content="蓝色主题" color-dark="#4F6EF7" color-light="#EEF2FF" />
            <span>蓝色主题</span>
          </div>
          <div class="qrcode-color-item">
            <EasyQrcode content="绿色主题" color-dark="#34C759" color-light="#E8F5E9" />
            <span>绿色主题</span>
          </div>
          <div class="qrcode-color-item">
            <EasyQrcode content="红色主题" color-dark="#FF3B30" color-light="#FFEBEE" />
            <span>红色主题</span>
          </div>
        </div>
        <EasyDocCode
          code="<EasyQrcode content=&quot;蓝色主题&quot; color-dark=&quot;#4F6EF7&quot; color-light=&quot;#EEF2FF&quot; />
<EasyQrcode content=&quot;绿色主题&quot; color-dark=&quot;#34C759&quot; color-light=&quot;#E8F5E9&quot; />"
        />
      </div>
    </section>

    <!-- 纠错级别 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        纠错级别
      </h2>
      <p class="doc-section__desc">
        通过
        <code>correctLevel</code>
        设置纠错级别，用于在二维码被遮挡或损坏时仍能正确解析。可选值：<code>L</code>(7%)、<code>M</code>(15%)、<code>Q</code>(25%)、<code>H</code>(30%)。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body qrcode-level-group">
          <div class="qrcode-level-item">
            <EasyQrcode content="低纠错 L" :size="120" correct-level="L" />
            <span>L (7%)</span>
          </div>
          <div class="qrcode-level-item">
            <EasyQrcode content="中纠错 M" :size="120" correct-level="M" />
            <span>M (15%)</span>
          </div>
          <div class="qrcode-level-item">
            <EasyQrcode content="高纠错 Q" :size="120" correct-level="Q" />
            <span>Q (25%)</span>
          </div>
          <div class="qrcode-level-item">
            <EasyQrcode content="最高 H" :size="120" correct-level="H" />
            <span>H (30%)</span>
          </div>
        </div>
        <EasyDocCode
          code="<EasyQrcode content=&quot;低纠错 L&quot; correct-level=&quot;L&quot; />
<EasyQrcode content=&quot;中纠错 M&quot; correct-level=&quot;M&quot; />
<EasyQrcode content=&quot;高纠错 Q&quot; correct-level=&quot;Q&quot; />
<EasyQrcode content=&quot;最高 H&quot; correct-level=&quot;H&quot; />"
        />
      </div>
    </section>

    <!-- 带 Logo -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        带 Logo
      </h2>
      <p class="doc-section__desc">
        通过 <code>logo</code> 属性添加 Logo 图片，<code>logoSize</code> 控制尺寸，<code>logoRadius</code>
        控制圆角，<code>logoBackgroundColor</code> 设置背景色。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyQrcode
            content="https://ease-ui.com"
            :size="200"
            logo="/logo.png"
            :logo-size="40"
            :logo-radius="8"
            logo-background-color="#ffffff"
          />
        </div>
        <EasyDocCode
          code="<EasyQrcode
  content=&quot;https://ease-ui.com&quot;
  :size=&quot;200&quot;
  logo=&quot;/logo.png&quot;
  :logo-size=&quot;40&quot;
  :logo-radius=&quot;8&quot;
  logo-background-color=&quot;#ffffff&quot;
/>"
        />
      </div>
    </section>

    <!-- 动态生成 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        动态生成与交互
      </h2>
      <p class="doc-section__desc">
        通过 <code>ref</code> 获取组件实例，调用 <code>download</code> 方法下载二维码图片。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <div class="qrcode-interactive">
            <div class="qrcode-interactive__left">
              <ElInput
                v-model="dynamicContent"
                type="textarea"
                :rows="3"
                placeholder="请输入要生成二维码的内容"
                style="margin-bottom: 16px"
              />
              <div class="qrcode-interactive__controls">
                <EasyButton type="primary" @click="handleDownload">
                  下载二维码
                </EasyButton>
                <EasyButton type="ghost" @click="handleGetDataUrl">
                  获取 Base64
                </EasyButton>
              </div>
            </div>
            <div class="qrcode-interactive__right">
              <EasyQrcode ref="qrRef" :content="dynamicContent" :size="160" />
            </div>
          </div>
        </div>
        <EasyDocCode
          code="const qrRef = ref()
const dynamicContent = ref('https://ease-ui.com')

// 下载二维码
function handleDownload() {
  qrRef.value?.download('my-qrcode.png')
}

// 获取 Base64
function handleGetDataUrl() {
  const dataUrl = qrRef.value?.toDataURL()
  console.log(dataUrl)
}"
        />
      </div>
    </section>

    <!-- 事件 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        事件
      </h2>
      <p class="doc-section__desc">
        二维码生成成功或失败时会触发相应事件。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyQrcode content="https://ease-ui.com" :size="200" @generated="onGenerated" @error="onError" />
          <div v-if="eventLog.length" class="qrcode-event-log">
            <div v-for="(log, index) in eventLog" :key="index" class="qrcode-event-log__item">
              <el-tag :type="log.type === 'success' ? 'success' : 'danger'" size="small">
                {{ log.type === 'success' ? 'success' : 'error' }}
              </el-tag>
              <span>{{ log.message }}</span>
            </div>
          </div>
        </div>
        <EasyDocCode
          code="<EasyQrcode
  content=&quot;https://ease-ui.com&quot;
  @generated=&quot;onGenerated&quot;
  @error=&quot;onError&quot;
/>

// generated: 生成成功时触发，返回 base64 数据 URL
function onGenerated(dataUrl: string) {
  console.log('二维码生成成功', dataUrl)
}

// error: 生成失败时触发
function onError(error: Error) {
  console.error('二维码生成失败', error)
}"
        />
      </div>
    </section>

    <!-- Props API -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        Props
      </h2>
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
              <td>二维码内容（文本、URL等）</td>
              <td><code>string</code></td>
              <td><code>''</code></td>
            </tr>
            <tr>
              <td><code>size</code></td>
              <td>二维码尺寸（宽度和高度），单位 px</td>
              <td><code>number</code></td>
              <td><code>200</code></td>
            </tr>
            <tr>
              <td><code>colorDark</code></td>
              <td>前景色（深色）</td>
              <td><code>string</code></td>
              <td><code>#000000</code></td>
            </tr>
            <tr>
              <td><code>colorLight</code></td>
              <td>背景色（浅色）</td>
              <td><code>string</code></td>
              <td><code>#ffffff</code></td>
            </tr>
            <tr>
              <td><code>correctLevel</code></td>
              <td>纠错级别</td>
              <td><code>'L' | 'M' | 'Q' | 'H'</code></td>
              <td><code>'M'</code></td>
            </tr>
            <tr>
              <td><code>logo</code></td>
              <td>Logo 图片 URL</td>
              <td><code>string</code></td>
              <td><code>''</code></td>
            </tr>
            <tr>
              <td><code>logoSize</code></td>
              <td>Logo 尺寸，单位 px</td>
              <td><code>number</code></td>
              <td><code>0</code></td>
            </tr>
            <tr>
              <td><code>logoRadius</code></td>
              <td>Logo 圆角，单位 px</td>
              <td><code>number</code></td>
              <td><code>8</code></td>
            </tr>
            <tr>
              <td><code>logoBackgroundColor</code></td>
              <td>Logo 背景色</td>
              <td><code>string</code></td>
              <td><code>#ffffff</code></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Methods API -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        Methods
      </h2>
      <div class="doc-table-wrapper">
        <table class="doc-table">
          <thead>
            <tr>
              <th>方法名</th>
              <th>说明</th>
              <th>参数</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>download</code></td>
              <td>下载二维码图片</td>
              <td><code>filename?: string</code>，默认 'qrcode.png'</td>
            </tr>
            <tr>
              <td><code>toDataURL</code></td>
              <td>获取 Base64 数据 URL</td>
              <td>-</td>
            </tr>
            <tr>
              <td><code>toBlob</code></td>
              <td>获取 Blob 对象</td>
              <td>-</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Events API -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        Events
      </h2>
      <div class="doc-table-wrapper">
        <table class="doc-table">
          <thead>
            <tr>
              <th>事件名</th>
              <th>说明</th>
              <th>回调参数</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>generated</code></td>
              <td>二维码生成成功时触发</td>
              <td><code>(dataUrl: string) => void</code></td>
            </tr>
            <tr>
              <td><code>error</code></td>
              <td>二维码生成失败时触发</td>
              <td><code>(error: Error) => void</code></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
/* ========== 文档页通用样式 ========== */
/* ========== 依赖说明 ========== */
.doc-requires {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 12px;
  padding: 12px 16px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  font-size: 14px;

  .doc-requires__label {
    color: var(--el-text-color-secondary);
    font-weight: 500;
  }

  .doc-requires__cmd {
    padding: 4px 12px;
    background: #1a1a2e;
    color: #a5d6a7;
    border-radius: 6px;
    font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
    font-size: 13px;
  }
}

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
  align-items: center;
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

/* ========== 二维码尺寸组 ========== */
.qrcode-size-group {
  flex-direction: row !important;
  justify-content: center;
  align-items: flex-end;
  gap: 32px;
}

.qrcode-size-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  .qrcode-size-item__label {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
}

/* ========== 二维码颜色组 ========== */
.qrcode-color-group {
  flex-direction: row !important;
  flex-wrap: wrap;
  justify-content: center;
  gap: 32px;
}

.qrcode-color-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  span {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
}

/* ========== 二维码纠错级别组 ========== */
.qrcode-level-group {
  flex-direction: row !important;
  justify-content: center;
  gap: 32px;
}

.qrcode-level-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  span {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
}

/* ========== 交互演示 ========== */
.qrcode-interactive {
  display: flex;
  gap: 32px;
  width: 100%;
  max-width: 600px;

  .qrcode-interactive__left {
    flex: 1;
    display: flex;
    flex-direction: column;
  }

  .qrcode-interactive__right {
    flex-shrink: 0;
  }

  .qrcode-interactive__controls {
    display: flex;
    gap: 8px;
  }
}

/* ========== 事件日志 ========== */
.qrcode-event-log {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
  max-width: 400px;

  .qrcode-event-log__item {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 13px;
    color: var(--el-text-color-regular);
  }
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
