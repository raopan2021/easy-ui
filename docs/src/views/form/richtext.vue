<script setup lang="ts">
import { ref } from 'vue'

defineOptions({ name: 'RichTextDoc' })

const editorRef = ref()

const html1 = ref('<p>这是 <strong>EasyRichText</strong> 富文本编辑器的基础用法。</p><p>支持加粗、斜体、标题、列表、链接、图片、代码块等功能。</p>')
const html2 = ref('<h2>自定义高度</h2><p>通过 <code>height</code> 属性控制编辑区高度。</p>')
const readHtml = ref('<p>这是只读模式的富文本内容。</p><ul><li>支持标题</li><li>支持列表</li><li>支持加粗</li></ul>')

function onChange(value: string) {
  console.log('内容变化:', value)
}
</script>

<template>
  <div class="richtext-doc">
    <!-- 页面标题 -->
    <div class="doc-header">
      <h1 class="doc-title">
        RichText 富文本编辑器
      </h1>
      <p class="doc-desc">
        基于 wangEditor 封装的可视化富文本编辑器，开箱即用，支持 HTML 内容双向绑定、工具栏、图片/链接/代码插入。
      </p>
    </div>

    <!-- 基础用法 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        基础用法
      </h2>
      <p class="doc-section__desc">
        通过 <code>v-model</code> 双向绑定 HTML 内容。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyRichText v-model="html1" :height="300" @change="onChange" />
        </div>
        <EasyDocCode code="<EasyRichText v-model=&quot;html&quot; :height=&quot;300&quot; />" />
      </div>
    </section>

    <!-- 自定义高度 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        自定义高度
      </h2>
      <p class="doc-section__desc">
        通过 <code>height</code> / <code>minHeight</code> 控制编辑区尺寸。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyRichText v-model="html2" :height="200" :min-height="150" />
        </div>
        <EasyDocCode code="<EasyRichText v-model=&quot;html&quot; :height=&quot;200&quot; :min-height=&quot;150&quot; />" />
      </div>
    </section>

    <!-- 只读 / 禁用 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        只读 / 禁用
      </h2>
      <p class="doc-section__desc">
        通过 <code>readonly</code> 开启只读模式，<code>disabled</code> 完全禁用。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyRichText v-model="readHtml" readonly :height="180" />
        </div>
        <EasyDocCode code="<EasyRichText v-model=&quot;html&quot; readonly :height=&quot;180&quot; />" />
      </div>
    </section>

    <!-- 方法调用 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        方法调用
      </h2>
      <p class="doc-section__desc">
        通过 <code>ref</code> 调用 <code>getHtml()</code> / <code>getText()</code> / <code>clear()</code> / <code>focus()</code> 等方法。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <div class="richtext-demo">
            <EasyRichText ref="editorRef" :height="200" />
            <div class="richtext-actions">
              <button class="richtext-action-btn" @click="editorRef?.getHtml()">
                获取 HTML
              </button>
              <button class="richtext-action-btn" @click="editorRef?.getText()">
                获取文本
              </button>
              <button class="richtext-action-btn richtext-action-btn--primary" @click="editorRef?.focus()">
                聚焦
              </button>
              <button class="richtext-action-btn richtext-action-btn--danger" @click="editorRef?.clear()">
                清空
              </button>
            </div>
          </div>
        </div>
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
              <td>绑定值（HTML 字符串），支持 v-model</td>
              <td><code>string</code></td>
              <td><code>''</code></td>
            </tr>
            <tr>
              <td><code>placeholder</code></td>
              <td>占位提示文字</td>
              <td><code>string</code></td>
              <td><code>'请输入内容...'</code></td>
            </tr>
            <tr>
              <td><code>height</code></td>
              <td>编辑区高度（像素）</td>
              <td><code>number</code></td>
              <td><code>300</code></td>
            </tr>
            <tr>
              <td><code>minHeight</code></td>
              <td>编辑区最小高度（像素）</td>
              <td><code>number</code></td>
              <td><code>200</code></td>
            </tr>
            <tr>
              <td><code>disabled</code></td>
              <td>是否禁用</td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
            </tr>
            <tr>
              <td><code>readonly</code></td>
              <td>是否只读</td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
            </tr>
            <tr>
              <td><code>showToolbar</code></td>
              <td>是否显示工具栏</td>
              <td><code>boolean</code></td>
              <td><code>true</code></td>
            </tr>
            <tr>
              <td><code>toolbarConfig</code></td>
              <td>wangEditor 工具栏配置</td>
              <td><code>IToolbarConfig</code></td>
              <td><code>{}</code></td>
            </tr>
            <tr>
              <td><code>editorConfig</code></td>
              <td>wangEditor 编辑器配置</td>
              <td><code>IEditorConfig</code></td>
              <td><code>{}</code></td>
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
              <td><code>html: string</code></td>
            </tr>
            <tr>
              <td><code>change</code></td>
              <td>内容变化时触发</td>
              <td><code>html: string</code></td>
            </tr>
            <tr>
              <td><code>created</code></td>
              <td>编辑器创建完成</td>
              <td><code>editor: IDomEditor</code></td>
            </tr>
            <tr>
              <td><code>focus</code></td>
              <td>编辑器获得焦点</td>
              <td><code>editor: IDomEditor</code></td>
            </tr>
            <tr>
              <td><code>blur</code></td>
              <td>编辑器失去焦点</td>
              <td><code>editor: IDomEditor</code></td>
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
              <td><code>getHtml()</code></td>
              <td>获取 HTML 内容</td>
            </tr>
            <tr>
              <td><code>getText()</code></td>
              <td>获取纯文本内容</td>
            </tr>
            <tr>
              <td><code>setHtml(html)</code></td>
              <td>设置 HTML 内容</td>
            </tr>
            <tr>
              <td><code>clear()</code></td>
              <td>清空内容</td>
            </tr>
            <tr>
              <td><code>focus()</code></td>
              <td>聚焦编辑器</td>
            </tr>
            <tr>
              <td><code>blur()</code></td>
              <td>使编辑器失焦</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.richtext-doc {
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

/* ========== 方法演示 ========== */
.richtext-demo {
  width: 100%;
}
.richtext-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.richtext-action-btn {
  padding: 6px 14px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  background: var(--el-bg-color-overlay);
  color: var(--el-text-color-secondary);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #4f6ef7;
    color: var(--el-color-primary);
  }

  &.richtext-action-btn--primary {
    background: var(--el-color-primary);
    border-color: #4f6ef7;
    color: #fff;

    &:hover {
      background: #3b57d4;
      border-color: #3b57d4;
      color: #fff;
    }
  }

  &.richtext-action-btn--danger {
    &:hover {
      border-color: var(--el-color-danger);
      color: var(--el-color-danger);
    }
  }
}
</style>
