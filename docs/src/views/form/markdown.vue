<script setup lang="ts">
import { ref } from 'vue'

defineOptions({ name: 'MarkdownDoc' })

const md1 = ref(`# EasyMarkdown 在线编辑器

基于 **markdown-it** 与 **highlight.js** 构建的 Markdown 在线编辑、预览、保存下载组件。

## 功能特性

- 实时分屏预览 + 滚动联动
- 代码块语法高亮与行号
- Tab 缩进 / Shift+Tab 反缩进 / Ctrl+S 保存
- GitHub 任务列表与 callout 提示
- Mermaid 图表渲染（可选，需要安装 mermaid）
- 多主题预览与导出（默认 / GitHub / 简约）
- 导出下载 .md / .html / .pdf

## 任务列表

- [x] 支持 GitHub 任务列表
- [ ] 支持 callout 提示

> [!NOTE] 这是一条提示
> 参考 solomd 项目的渲染能力沉淀。

## 代码示例

\`\`\`ts
import { EasyMarkdown } from '@raopan/easy-ui/markdown'

function onSave(value: string) {
  console.log('保存内容:', value)
}
\`\`\`

## 表格支持（AI 导出容错）

| 功能 | 说明 |
| ---- | ---- |
| 编辑 | 左侧源码编辑 |
| 预览 | 右侧实时渲染 |
| 主题 | 切换预览与导出样式 |
| 下载 | 导出 md / html / pdf |

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
        基础用法
      </h2>
      <p class="doc-section__desc">
        默认 <code>split</code> 分屏模式，左侧编辑、右侧实时预览。
      </p>
      <p class="doc-section__desc">
        通过 <code>defaultView</code> 设置默认视图：<code>edit</code>、<code>preview</code>、<code>split</code>，顶部可随时切换。
      </p>
      <p class="doc-section__desc">
        工具栏内置「默认 / GitHub / 简约」三套主题，通过 <code>theme</code> 控制默认值，切换后实时作用于预览区，导出 .pdf / .html 时使用同一套主题样式。
      </p>
      <p class="doc-section__desc">
        点击「保存」触发 <code>save</code> 事件；
      </p>
      <p class="doc-section__desc">
        「下载」下拉支持多种格式：.md 源码、.html 完整页面、.docx Word 文档、.pdf 直接生成文件（html2pdf.js）、打印 PDF（浏览器打印对话框另存）、.png / .jpg / .webp 图片。
      </p>
      <p class="doc-section__desc">
        Word 导出由 docx 库直接生成（无需打开浏览器对话框）；直接生成 PDF 依赖 html2pdf.js；图片导出依赖 html2canvas。以上均为可选依赖，未安装时对应格式自动忽略。
      </p>
      <p class="doc-section__desc">
        编辑区支持 <code>Tab</code> / <code>Shift+Tab</code> 缩进、<code>Ctrl+S</code> 保存、Enter 自动续行缩进；通过 <code>line-numbers</code> 显示行号，<code>code-block-line-numbers</code> 为预览代码块加行号。
      </p>
      <p class="doc-section__desc">
        预览层内置 GitHub 任务列表、callout 提示（<code>[!NOTE]</code> 等）、表格分隔行修复等容错渲染；设置 <code>mermaid</code> 后可渲染 Mermaid 图表；<code>fill</code> 让组件高度自适应占满容器。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyMarkdown v-model="md1" :height="420" line-numbers code-block-line-numbers @save="onSave" />
        </div>
        <EasyDocCode
          code="<EasyMarkdown
  v-model=&quot;md&quot;
  :height=&quot;420&quot;
  line-numbers
  code-block-line-numbers
  @save=&quot;onSave&quot;
/>"
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
              <td>编辑/预览区高度（像素），fill 为 true 时忽略</td>
              <td><code>number</code></td>
              <td><code>400</code></td>
            </tr>
            <tr>
              <td><code>fill</code></td>
              <td>高度占满父容器剩余空间（父容器建议 flex 布局或定高）</td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
            </tr>
            <tr>
              <td><code>lineNumbers</code></td>
              <td>编辑区显示行号</td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
            </tr>
            <tr>
              <td><code>codeBlockLineNumbers</code></td>
              <td>预览区代码块显示行号</td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
            </tr>
            <tr>
              <td><code>mermaid</code></td>
              <td>渲染 Mermaid 图表（需要安装 mermaid，未安装自动降级为代码块）</td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
            </tr>
            <tr>
              <td><code>softWrap</code></td>
              <td>编辑区是否软换行</td>
              <td><code>boolean</code></td>
              <td><code>true</code></td>
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
            <tr>
              <td><code>theme</code></td>
              <td>当前主题 key（default / github / clean）</td>
              <td><code>string</code></td>
              <td><code>'default'</code></td>
            </tr>
            <tr>
              <td><code>themes</code></td>
              <td>自定义主题列表，与内置主题合并，同名 key 覆盖</td>
              <td><code>MarkdownTheme[]</code></td>
              <td><code>[]</code></td>
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
              <td><code>type: 'md' \| 'html' \| 'docx' \| 'pdf' \| 'pdf-file' \| 'png' \| 'jpeg' \| 'webp', value: string</code></td>
            </tr>
            <tr>
              <td><code>update:theme</code></td>
              <td>切换主题时触发（v-model:theme）</td>
              <td><code>value: string</code></td>
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
            <tr>
              <td><code>downloadPdf()</code></td>
              <td>通过浏览器打印对话框另存为 PDF</td>
            </tr>
            <tr>
              <td><code>downloadPdfFile()</code></td>
              <td>直接生成 PDF 文件（需安装 html2pdf.js）</td>
            </tr>
            <tr>
              <td><code>downloadDocx()</code></td>
              <td>直接生成 Word .docx 文件（需安装 docx）</td>
            </tr>
            <tr>
              <td><code>downloadImage(type)</code></td>
              <td>导出图片（png / jpeg / webp，需安装 html2canvas）</td>
            </tr>
            <tr>
              <td><code>setTheme(key)</code></td>
              <td>切换主题</td>
            </tr>
            <tr>
              <td><code>getTheme()</code></td>
              <td>获取当前主题 key</td>
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
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}
.doc-preview__body > :deep(*) {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
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
