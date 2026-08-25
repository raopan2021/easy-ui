<script setup lang="ts">
import { EasyInfoCard } from '@raopan/easy-ui'
import { ElMessage } from 'element-plus'

const demoImage = 'https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=200&h=150&fit=crop'
const demoImage2 = 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=200&h=150&fit=crop'
const demoImage3 = 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=200&h=150&fit=crop'

function handleClick() {
  ElMessage.success('卡片被点击')
}
</script>

<template>
  <div class="info-card-doc">
    <!-- 页面标题 -->
    <div class="doc-header">
      <h1 class="doc-title">
        InfoCard 信息卡片
      </h1>
      <p class="doc-desc">
        专为信息展示场景设计，支持左侧图片/图标、标题、描述列表和状态标签，可完全自定义配色方案。
      </p>
    </div>

    <!-- InfoCard 基础用法 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        基础用法
      </h2>
      <p class="doc-section__desc">
        传入 <code>image</code> 或 <code>icon</code>、<code>title</code>、<code>description</code>、<code>status</code>
        即可渲染一张信息卡片。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body info-card-demo">
          <EasyInfoCard :image="demoImage" icon="el:WarningFilled" title="人员闯入"
            :description="['1号门口', '2024-05-20 14:32:21']" status="未处理" status-type="danger" />
          <EasyInfoCard :image="demoImage2" icon="el:MapLocation" title="区域入侵"
            :description="['周界东侧', '2024-05-20 14:31:02']" status="未处理" status-type="danger" />
          <EasyInfoCard :image="demoImage3" icon="el:FirstAidKit" title="安全帽未戴"
            :description="['生产车间1', '2024-05-20 14:30:11']" status="处理中" status-type="warning" />
        </div>
        <EasyDocCode
          code="<EasyInfoCard
  :image=&quot;demoImage&quot;
  icon=&quot;el:WarningFilled&quot;
  title=&quot;人员闯入&quot;
  :description=&quot;['1号门口', '2024-05-20 14:32:21']&quot;
  status=&quot;未处理&quot;
  status-type=&quot;danger&quot;
/>"
        />
      </div>
    </section>

    <!-- InfoCard 白色背景 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        浅色背景
      </h2>
      <p class="doc-section__desc">
        通过 <code>backgroundColor</code>、<code>textColor</code> 等属性切换为浅色主题。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body info-card-demo-light">
          <EasyInfoCard :image="demoImage" icon="el:WarningFilled" title="人员闯入"
            :description="['1号门口', '2024-05-20 14:32:21']" status="未处理" status-type="danger" background-color="#ffffff"
            text-color="#1a1a2e" description-color="#6b7280" :bordered="true" />
          <EasyInfoCard :image="demoImage2" icon="el:MapLocation" title="区域入侵"
            :description="['周界东侧', '2024-05-20 14:31:02']" status="处理中" status-type="warning" background-color="#f8fafc"
            text-color="#1e293b" description-color="#64748b" />
          <EasyInfoCard :image="demoImage3" icon="el:FirstAidKit" title="安全帽未戴"
            :description="['生产车间1', '2024-05-20 14:30:11']" status="已处理" status-type="success" background-color="#ffffff"
            text-color="#1a1a2e" description-color="#6b7280" />
        </div>
        <EasyDocCode
          code="<EasyInfoCard
  background-color=&quot;#ffffff&quot;
  text-color=&quot;#1a1a2e&quot;
  description-color=&quot;#6b7280&quot;
  :bordered=&quot;true&quot;
  ...
/>"
        />
      </div>
    </section>

    <!-- InfoCard 自定义颜色 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        自定义颜色
      </h2>
      <p class="doc-section__desc">
        通过配色属性精细控制背景、整体文字、标题、描述、状态标签的颜色。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body info-card-demo">
          <EasyInfoCard :image="demoImage" icon="el:WarningFilled" title="人员闯入"
            :description="['1号门口', '2024-05-20 14:32:21']" status="未处理" status-type="danger" background-color="#0f172a"
            text-color="#e2e8f0" title-color="#f8fafc" description-color="#94a3b8"
            status-background-color="rgba(239, 68, 68, 0.2)" status-text-color="#fca5a5" />
          <EasyInfoCard icon="el:Notification" title="系统通知" :description="['服务器将于今晚 02:00 进行维护', '预计耗时 30 分钟']"
            status="重要" status-type="primary" background-color="#1e3a5f" text-color="#bfdbfe" title-color="#ffffff"
            description-color="#93c5fd" status-background-color="rgba(59, 130, 246, 0.25)" status-text-color="#93c5fd" />
        </div>
        <EasyDocCode
          code="<EasyInfoCard
  background-color=&quot;#0f172a&quot;
  text-color=&quot;#e2e8f0&quot;
  title-color=&quot;#f8fafc&quot;
  description-color=&quot;#94a3b8&quot;
  status-background-color=&quot;rgba(239, 68, 68, 0.2)&quot;
  status-text-color=&quot;#fca5a5&quot;
  ...
/>"
        />
      </div>
    </section>

    <!-- InfoCard 可点击 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        可点击
      </h2>
      <p class="doc-section__desc">
        使用 <code>clickable</code> 属性使卡片可交互，点击时触发 <code>click</code> 事件。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body info-card-demo">
          <EasyInfoCard :image="demoImage" icon="el:WarningFilled" title="人员闯入"
            :description="['1号门口', '2024-05-20 14:32:21']" status="未处理" status-type="danger" clickable
            @click="handleClick" />
        </div>
        <EasyDocCode code="<EasyInfoCard clickable @click=&quot;handleClick&quot; .../>" />
      </div>
    </section>

    <!-- Props -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        Props
      </h2>
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
              <td><code>image</code></td>
              <td>左侧图片地址</td>
              <td><code>string</code></td>
              <td><code>''</code></td>
            </tr>
            <tr>
              <td><code>icon</code></td>
              <td>标题前的图标（EasyIcon 格式，如 el:WarningFilled）</td>
              <td><code>string</code></td>
              <td><code>''</code></td>
            </tr>
            <tr>
              <td><code>iconSize</code></td>
              <td>图标尺寸</td>
              <td><code>number</code></td>
              <td><code>16</code></td>
            </tr>
            <tr>
              <td><code>title</code></td>
              <td>卡片标题（必填）</td>
              <td><code>string</code></td>
              <td><code>-</code></td>
            </tr>
            <tr>
              <td><code>description</code></td>
              <td>描述信息，支持字符串、字符串数组或对象数组</td>
              <td><code>string / string[] / InfoCardDescItem[]</code></td>
              <td><code>[]</code></td>
            </tr>
            <tr>
              <td><code>status</code></td>
              <td>状态标签文字</td>
              <td><code>string</code></td>
              <td><code>''</code></td>
            </tr>
            <tr>
              <td><code>statusType</code></td>
              <td>状态标签类型</td>
              <td><code>'default' | 'primary' | 'success' | 'warning' | 'danger'</code></td>
              <td><code>'default'</code></td>
            </tr>
            <tr>
              <td><code>backgroundColor</code></td>
              <td>自定义背景色</td>
              <td><code>string</code></td>
              <td><code>''</code></td>
            </tr>
            <tr>
              <td><code>textColor</code></td>
              <td>自定义整体文字颜色</td>
              <td><code>string</code></td>
              <td><code>''</code></td>
            </tr>
            <tr>
              <td><code>titleColor</code></td>
              <td>自定义标题颜色</td>
              <td><code>string</code></td>
              <td><code>''</code></td>
            </tr>
            <tr>
              <td><code>descriptionColor</code></td>
              <td>自定义描述文字颜色</td>
              <td><code>string</code></td>
              <td><code>''</code></td>
            </tr>
            <tr>
              <td><code>statusBackgroundColor</code></td>
              <td>自定义状态标签背景色</td>
              <td><code>string</code></td>
              <td><code>''</code></td>
            </tr>
            <tr>
              <td><code>statusTextColor</code></td>
              <td>自定义状态标签文字颜色</td>
              <td><code>string</code></td>
              <td><code>''</code></td>
            </tr>
            <tr>
              <td><code>clickable</code></td>
              <td>是否可点击（悬浮上浮效果）</td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
            </tr>
            <tr>
              <td><code>bordered</code></td>
              <td>是否显示边框</td>
              <td><code>boolean</code></td>
              <td><code>true</code></td>
            </tr>
            <tr>
              <td><code>radius</code></td>
              <td>圆角大小</td>
              <td><code>number / string</code></td>
              <td><code>10</code></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Events -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        Events
      </h2>
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
              <td><code>click</code></td>
              <td>点击卡片时触发（需设置 clickable）</td>
              <td><code>event: MouseEvent</code></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- Slots -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        Slots
      </h2>
      <div class="doc-table">
        <table>
          <thead>
            <tr>
              <th>插槽名</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>action</code></td>
              <td>卡片右侧操作区</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.info-card-doc {
  padding: 8px 0 40px;
}

/* ========== 页面头部 ========== */
.doc-header {
  margin-bottom: 32px;
}

.doc-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px;
}

.doc-desc {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0;
}

/* ========== 章节样式 ========== */
.doc-section {
  margin-bottom: 28px;
}

.doc-section__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.doc-section__desc {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0 0 14px;

  code {
    background: var(--el-fill-color-light);
    color: var(--el-color-primary);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
  }
}

/* ========== 预览区域 ========== */
.doc-preview {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;
  background: var(--el-bg-color-overlay);
}

.doc-preview__body {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 20px;
}

.doc-code {
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-light);
  padding: 12px 16px;

  pre {
    margin: 0;
  }

  code {
    font-family: 'SF Mono', Consolas, monospace;
    font-size: 13px;
    color: var(--el-text-color-regular);
  }
}

/* ========== 表格 ========== */
.doc-table {
  overflow-x: auto;

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }

  th,
  td {
    text-align: left;
    padding: 10px 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  th {
    background: var(--el-fill-color-light);
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  td {
    color: var(--el-text-color-regular);
  }

  code {
    background: var(--el-fill-color-light);
    color: var(--el-color-primary);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
  }
}

/* ========== InfoCard 演示区 ========== */
.info-card-demo {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: #0f0f1a;
  padding: 20px;
  border-radius: 10px;
}

.info-card-demo-light {
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--el-fill-color-light);
  padding: 20px;
  border-radius: 10px;
}
</style>
