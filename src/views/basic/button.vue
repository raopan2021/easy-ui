<script setup lang="ts">
import { Check, Delete, Download, Edit, Plus, RefreshLeft, Search, Upload } from '@element-plus/icons-vue'
import { EasyButton } from '@raopan/easy-ui'
import { ref } from 'vue'

const loading = ref(false)

function handleLoad() {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 2000)
}
</script>

<template>
  <div class="button-doc">
    <!-- 页面标题 -->
    <div class="doc-header">
      <h1 class="doc-title">
        Button 按钮
      </h1>
      <p class="doc-desc">
        企业级操作按钮，支持多种类型、尺寸、形状，内置加载状态。
      </p>
    </div>

    <!-- 基础用法 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        基础用法
      </h2>
      <p class="doc-section__desc">
        通过 <code>type</code> 属性设置按钮类型，支持 primary / success / warning / danger / info 五种语义类型。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyButton>默认按钮</EasyButton>
          <EasyButton type="success">
            成功按钮
          </EasyButton>
          <EasyButton type="warning">
            警告按钮
          </EasyButton>
          <EasyButton type="danger">
            危险按钮
          </EasyButton>
          <EasyButton type="info">
            信息按钮
          </EasyButton>
        </div>
        <EasyDocCode
          code="<EasyButton>默认按钮</EasyButton>
<EasyButton type=&quot;success&quot;>成功按钮</EasyButton>
<EasyButton type=&quot;warning&quot;>警告按钮</EasyButton>
<EasyButton type=&quot;danger&quot;>危险按钮</EasyButton>
<EasyButton type=&quot;info&quot;>信息按钮</EasyButton>"
        />
      </div>
    </section>

    <!-- 朴素按钮 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        朴素按钮
      </h2>
      <p class="doc-section__desc">
        文字按钮（<code>type="text"</code>）和幽灵按钮（<code>type="ghost"</code>）用于次要操作场景，视觉层级更低。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyButton type="text">
            文字按钮
          </EasyButton>
          <EasyButton type="ghost">
            幽灵按钮
          </EasyButton>
        </div>
        <EasyDocCode
          code="<EasyButton type=&quot;text&quot;>文字按钮</EasyButton>
<EasyButton type=&quot;ghost&quot;>幽灵按钮</EasyButton>"
        />
      </div>
    </section>

    <!-- 链接按钮 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        链接按钮
      </h2>
      <p class="doc-section__desc">
        通过 <code>link</code> 属性设置链接样式按钮，类似原生
        <code>&lt;a&gt;</code> 标签，适用于需要跳转或操作的文字链接场景，hover 时显示下划线。可与
        <code>type</code> 属性组合控制颜色。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyButton link>
            链接按钮
          </EasyButton>
          <EasyButton link type="success">
            成功链接
          </EasyButton>
          <EasyButton link type="warning">
            警告链接
          </EasyButton>
          <EasyButton link type="danger">
            危险链接
          </EasyButton>
          <EasyButton link type="info">
            信息链接
          </EasyButton>
        </div>
        <EasyDocCode
          code="<EasyButton link>链接按钮</EasyButton>
<EasyButton link type=&quot;success&quot;>成功链接</EasyButton>
<EasyButton link type=&quot;warning&quot;>警告链接</EasyButton>
<EasyButton link type=&quot;danger&quot;>危险链接</EasyButton>
<EasyButton link type=&quot;info&quot;>信息链接</EasyButton>"
        />
      </div>
    </section>

    <!-- 不同尺寸 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        不同尺寸
      </h2>
      <p class="doc-section__desc">
        通过 <code>size</code> 属性设置按钮尺寸，提供 <code>large</code> / <code>default</code> /
        <code>small</code> 三种规格。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyButton size="large">
            大型按钮
          </EasyButton>
          <EasyButton>默认按钮</EasyButton>
          <EasyButton size="small">
            小型按钮
          </EasyButton>
        </div>
        <EasyDocCode
          code="<EasyButton size=&quot;large&quot;>大型按钮</EasyButton>
<EasyButton>默认按钮</EasyButton>
<EasyButton size=&quot;small&quot;>小型按钮</EasyButton>"
        />
      </div>
    </section>

    <!-- 圆角按钮 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        圆角按钮
      </h2>
      <p class="doc-section__desc">
        通过 <code>shape="round"</code> 设置圆角按钮，通过 <code>shape="circle"</code> 设置圆形按钮（圆形按钮需配合 icon
        使用）。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyButton shape="round">
            圆角按钮
          </EasyButton>
          <EasyButton shape="circle">
            <template #icon>
              <el-icon><Search /></el-icon>
            </template>
          </EasyButton>
          <EasyButton shape="circle" type="success">
            <template #icon>
              <el-icon><Plus /></el-icon>
            </template>
          </EasyButton>
          <EasyButton shape="circle" type="danger">
            <template #icon>
              <el-icon><Delete /></el-icon>
            </template>
          </EasyButton>
        </div>
        <EasyDocCode
          code="<EasyButton shape=&quot;round&quot;>圆角按钮</EasyButton>
<EasyButton shape=&quot;circle&quot;>
  <template #icon>
    <el-icon><Search /></el-icon>
  </template>
</EasyButton>
<EasyButton shape=&quot;circle&quot; type=&quot;success&quot;>
  <template #icon>
    <el-icon><Plus /></el-icon>
  </template>
</EasyButton>"
        />
      </div>
    </section>

    <!-- 加粗按钮 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        加粗按钮
      </h2>
      <p class="doc-section__desc">
        通过 <code>bold</code> 属性让按钮文字加粗，适用于需要更强视觉强调的场景，如主操作按钮。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyButton bold>
            加粗按钮
          </EasyButton>
          <EasyButton type="success" bold>
            加粗成功
          </EasyButton>
          <EasyButton>普通按钮</EasyButton>
        </div>
        <EasyDocCode
          code="<EasyButton bold>加粗按钮</EasyButton>
<EasyButton type=&quot;success&quot; bold>加粗成功</EasyButton>
<EasyButton>普通按钮</EasyButton>"
        />
      </div>
    </section>

    <!-- 加载状态 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        加载状态
      </h2>
      <p class="doc-section__desc">
        通过 <code>loading</code> 属性设置按钮加载状态，加载期间按钮不可点击。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyButton :loading="loading" @click="handleLoad">
            点击加载
          </EasyButton>
          <EasyButton loading>
            加载中
          </EasyButton>
          <EasyButton type="success" loading>
            加载中
          </EasyButton>
          <EasyButton type="danger" loading>
            加载中
          </EasyButton>
        </div>
        <EasyDocCode
          code="<EasyButton :loading=&quot;loading&quot; @click=&quot;handleLoad&quot;>点击加载</EasyButton>
<EasyButton loading>加载中</EasyButton>
<EasyButton type=&quot;success&quot; loading>加载中</EasyButton>
<EasyButton type=&quot;danger&quot; loading>加载中</EasyButton>"
        />
      </div>
    </section>

    <!-- 禁用状态 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        禁用状态
      </h2>
      <p class="doc-section__desc">
        通过 <code>disabled</code> 属性设置按钮禁用状态，禁用期间按钮不可点击。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyButton disabled>
            禁用按钮
          </EasyButton>
          <EasyButton type="success" disabled>
            禁用按钮
          </EasyButton>
          <EasyButton type="text" disabled>
            禁用文字
          </EasyButton>
          <EasyButton type="ghost" disabled>
            禁用幽灵
          </EasyButton>
          <EasyButton type="link" disabled>
            禁用链接
          </EasyButton>
        </div>
        <EasyDocCode
          code="<EasyButton disabled>禁用按钮</EasyButton>
<EasyButton type=&quot;success&quot; disabled>禁用按钮</EasyButton>
<EasyButton type=&quot;text&quot; disabled>禁用文字</EasyButton>
<EasyButton type=&quot;ghost&quot; disabled>禁用幽灵</EasyButton>
<EasyButton link disabled>禁用链接</EasyButton>"
        />
      </div>
    </section>

    <!-- 图标按钮 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        图标按钮
      </h2>
      <p class="doc-section__desc">
        通过 <code>#icon</code> 插槽添加图标，让按钮更具表现力。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyButton>
            <template #icon>
              <el-icon><Search /></el-icon>
            </template>
            搜索
          </EasyButton>
          <EasyButton type="success">
            <template #icon>
              <el-icon><Plus /></el-icon>
            </template>
            新增
          </EasyButton>
          <EasyButton type="danger">
            <template #icon>
              <el-icon><Delete /></el-icon>
            </template>
            删除
          </EasyButton>
          <EasyButton type="warning">
            <template #icon>
              <el-icon><Edit /></el-icon>
            </template>
            编辑
          </EasyButton>
        </div>
        <EasyDocCode
          code="<EasyButton>
  <template #icon><el-icon><Search /></el-icon></template>
  搜索
</EasyButton>
<EasyButton type=&quot;success&quot;>
  <template #icon><el-icon><Plus /></el-icon></template>
  新增
</EasyButton>"
        />
      </div>
    </section>

    <!-- 按钮组合 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        按钮组合
      </h2>
      <p class="doc-section__desc">
        在实际业务场景中，按钮常以组合形式出现。下面展示常见的业务操作场景。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <div class="button-group">
            <EasyButton bold type="primary">
              <template #icon>
                <el-icon><Check /></el-icon>
              </template>
              提交审核
            </EasyButton>
            <EasyButton type="ghost">
              <template #icon>
                <el-icon><RefreshLeft /></el-icon>
              </template>
              重置
            </EasyButton>
            <EasyButton type="text">
              取消
            </EasyButton>
          </div>
          <div class="button-group" style="margin-top: 12px">
            <EasyButton type="danger" size="small">
              <template #icon>
                <el-icon><Delete /></el-icon>
              </template>
              批量删除
            </EasyButton>
            <EasyButton type="primary" size="small">
              <template #icon>
                <el-icon><Download /></el-icon>
              </template>
              导出数据
            </EasyButton>
            <EasyButton type="success" size="small">
              <template #icon>
                <el-icon><Upload /></el-icon>
              </template>
              导入数据
            </EasyButton>
          </div>
        </div>
        <EasyDocCode
          code="<!-- 表单操作 -->
<EasyButton bold type=&quot;primary&quot;>
  <template #icon><el-icon><Check /></el-icon></template>
  提交审核
</EasyButton>
<EasyButton type=&quot;ghost&quot;>
  <template #icon><el-icon><RefreshLeft /></el-icon></template>
  重置
</EasyButton>
<EasyButton type=&quot;text&quot;>取消</EasyButton>

<!-- 工具栏操作 -->
<EasyButton type=&quot;danger&quot; size=&quot;small&quot;>
  <template #icon><el-icon><Delete /></el-icon></template>
  批量删除
</EasyButton>
<EasyButton type=&quot;primary&quot; size=&quot;small&quot;>
  <template #icon><el-icon><Download /></el-icon></template>
  导出数据
</EasyButton>"
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
              <td><code>type</code></td>
              <td>按钮类型</td>
              <td><code>'primary' | 'success' | 'warning' | 'danger' | 'info' | 'text' | 'ghost'</code></td>
              <td><code>'primary'</code></td>
            </tr>
            <tr>
              <td><code>link</code></td>
              <td>是否为链接样式按钮（hover 显示下划线）</td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
            </tr>
            <tr>
              <td><code>size</code></td>
              <td>按钮尺寸</td>
              <td><code>'large' | 'default' | 'small'</code></td>
              <td><code>'default'</code></td>
            </tr>
            <tr>
              <td><code>shape</code></td>
              <td>按钮形状</td>
              <td><code>'default' | 'round' | 'circle'</code></td>
              <td><code>'default'</code></td>
            </tr>
            <tr>
              <td><code>loading</code></td>
              <td>是否加载中</td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
            </tr>
            <tr>
              <td><code>disabled</code></td>
              <td>是否禁用</td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
            </tr>
            <tr>
              <td><code>bold</code></td>
              <td>是否加粗文字</td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
            </tr>
            <tr>
              <td><code>html-type</code></td>
              <td>原生 button type 属性</td>
              <td><code>'button' | 'submit' | 'reset'</code></td>
              <td><code>'button'</code></td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 class="doc-subtitle">
        Slots
      </h3>
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
              <td><code>default</code></td>
              <td>按钮文字内容</td>
            </tr>
            <tr>
              <td><code>icon</code></td>
              <td>按钮图标内容</td>
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
              <th>参数</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>click</code></td>
              <td>点击事件（loading / disabled 状态下不触发）</td>
              <td><code>(event: MouseEvent)</code></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.button-doc {
  padding: 8px 0 40px;
}

.doc-header {
  margin-bottom: 36px;
}
.doc-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin: 0 0 8px;
  letter-spacing: -0.3px;
}
.doc-desc {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0;
  line-height: 1.6;
}

.doc-section {
  margin-bottom: 32px;
}
.doc-section__title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.doc-section__desc {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0 0 16px;
  line-height: 1.6;
  code {
    background: var(--el-fill-color-light);
    color: var(--el-color-primary);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
    font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
  }
}

.doc-preview {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  overflow: hidden;
  background: var(--el-bg-color-overlay);
}
.doc-preview__body {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 24px;
}
.doc-code {
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-light);
  padding: 16px 20px;
  overflow-x: auto;
  pre {
    margin: 0;
    padding: 0;
  }
  code {
    font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
    font-size: 13px;
    line-height: 1.7;
    color: var(--el-text-color-regular);
    white-space: pre;
  }
}

.doc-subtitle {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 20px 0 10px;
}
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
    padding: 10px 14px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    white-space: nowrap;
  }
  th {
    background: var(--el-fill-color-light);
    font-weight: 600;
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
    font-size: 13px;
    font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
  }
}

.button-group {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
