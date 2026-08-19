<script setup lang="ts">
import { ref } from 'vue'

defineOptions({ name: 'MarkdownDoc' })

const md1 = ref(`# EasyMarkdown 在线编辑器

基于 **markdown-it** 与 **highlight.js** 构建的 Markdown 在线编辑、预览、保存下载组件。

## 功能特性

- 实时分屏预览
- 代码块语法高亮
- 保存事件回调
- 导出下载 .md / .html

## 代码示例

\`\`\`ts
import { EasyMarkdown } from '@raopan/easy-ui/markdown'

function onSave(value: string) {
  console.log('保存内容:', value)
}
\`\`\`

## 表格支持

| 功能 | 说明 |
| ---- | ---- |
| 编辑 | 左侧源码编辑 |
| 预览 | 右侧实时渲染 |
| 下载 | 导出 md 或 html |

> 试试编辑左侧内容，右侧会实时更新。
`)

function onSave(value: string) {
  console.log('Markdown 保存:', value)
}
</script>

<template>
  <div class="markdown-doc">
    <!-- 页面标题 -->
    <div class="doc-header">
      <h1 class="doc-title">
        Markdown 编辑器
      </h1>
      <p class="doc-desc">
        开箱即用的 Markdown 在线编辑、实时预览、保存下载组件，支持导出 .md 与 .html 两种格式。
      </p>
    </div>

    <!-- 基础用法 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        基础用法（分屏模式）
      </h2>
      <p class="doc-section__desc">
        默认 <code>split</code> 分屏模式，左侧编辑、右侧实时预览。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyMarkdown v-model="md1" :height="420" @save="onSave" />
        </div>
        <EasyDocCode
          code="<EasyMarkdown v-model=&quot;md&quot; :height=&quot;420&quot; @save=&quot;onSave&quot; />"
        />
      </div>
    </section>

    <!-- 编辑模式 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        编辑 / 预览切换
      </h2>
      <p class="doc-section__desc">
        通过 <code>defaultView</code> 设置默认视图：<code>edit</code>、<code>preview</code>、<code>split</code>，顶部可随时切换。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyMarkdown default-view="edit" :height="300" placeholder="请输入 Markdown 内容..." />
        </div>
        <EasyDocCode
          code="<EasyMarkdown default-view=&quot;edit&quot; :height=&quot;300&quot; />"
        />
      </div>
    </section>

    <!-- 保存与下载 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        保存与下载
      </h2>
      <p class="doc-section__desc">
        点击「保存」触发 <code>save</code> 事件；「下载 .md」导出源码，「下载 .html」导出渲染后的完整 HTML 页面。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyMarkdown :height="260" export-name="readme" />
        </div>
        <EasyDocCode
          code="<EasyMarkdown :height=&quot;260&quot; export-name=&quot;readme&quot; />"
        />
      </div>
    </section>

    <!-- API -->
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
              <td><code>modelValue</code></td>
              <td>绑定值（Markdown 源码），支持 v-model</td>
              <td><code>string</code></td>
              <td><code>''</code></td>
            </tr>
            <tr>
              <td><code>placeholder</code></td>
              <td>占位提示文字</td>
              <td><code>string</code></td>
              <td><code>'请输入 Markdown 内容...'</code></td>
            </tr>
            <tr>
              <td><code>showToolbar</code></td>
              <td>是否显示工具栏</td>
              <td><code>boolean</code></td>
              <td><code>true</code></td>
            </tr>
            <tr>
              <td><code>defaultView</code></td>
              <td>默认视图：edit / preview / split</td>
              <td><code>string</code></td>
              <td><code>'split'</code></td>
            </tr>
            <tr>
              <td><code>height</code></td>
              <td>编辑/预览区高度（像素）</td>
              <td><code>number</code></td>
              <td><code>400</code></td>
            </tr>
            <tr>
              <td><code>disabled</code></td>
              <td>是否禁用</td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
            </tr>
            <tr>
              <td><code>exportName</code></td>
              <td>导出文件名（不含扩展名）</td>
              <td><code>string</code></td>
              <td><code>'document'</code></td>
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
              <td><code>update:modelValue</code></td>
              <td>内容变化时触发（v-model）</td>
              <td><code>value: string</code></td>
            </tr>
            <tr>
              <td><code>change</code></td>
              <td>内容变化时触发</td>
              <td><code>value: string</code></td>
            </tr>
            <tr>
              <td><code>save</code></td>
              <td>点击保存按钮时触发</td>
              <td><code>value: string</code></td>
            </tr>
            <tr>
              <td><code>download</code></td>
              <td>导出文件时触发</td>
              <td><code>type: 'md' \| 'html', value: string</code></td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 class="doc-subtitle">
        Expose 方法
      </h3>
      <div class="doc-table">
        <table>
          <thead>
            <tr>
              <th>方法名</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>setView(view)</code></td>
              <td>切换视图（edit / preview / split）</td>
            </tr>
            <tr>
              <td><code>getHtml()</code></td>
              <td>获取渲染后的 HTML 内容</td>
            </tr>
            <tr>
              <td><code>downloadMd()</code></td>
              <td>导出下载 .md 文件</td>
            </tr>
            <tr>
              <td><code>downloadHtml()</code></td>
              <td>导出下载 .html 文件</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.markdown-doc {
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

/* ========== 章节 ========== */
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
.doc-subtitle {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-regular);
  margin: 24px 0 12px;
}

/* ========== 预览区 ========== */
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
  width: 100%;
}
.doc-preview__body > :deep(*) {
  width: 100%;
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
</style>
