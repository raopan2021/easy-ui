<script setup lang="ts">
import { XlyList } from 'easy-ui'
import { ref } from 'vue'

const listData = ref([
  { id: 1, title: '列表内容一' },
  { id: 2, title: '列表内容二' },
  { id: 3, title: '列表内容三' },
])

const userListData = ref([
  { id: 1, name: '张三', desc: '这是一段描述文字', avatar: '' },
  { id: 2, name: '李四', desc: '这是一段描述文字', avatar: '' },
  { id: 3, name: '王五', desc: '这是一段描述文字', avatar: '' },
])

const customListData = ref([
  { id: 1, name: '张小明', email: 'zhang@example.com', status: 'success', statusText: '已完成' },
  { id: 2, name: '李小红', email: 'li@example.com', status: 'warning', statusText: '进行中' },
  { id: 3, name: '王小强', email: 'wang@example.com', status: 'danger', statusText: '已取消' },
])
</script>

<template>
  <div class="component-doc">
    <header class="doc-header">
      <h1 class="doc-title">
        列表 List
      </h1>
      <p class="doc-desc">
        列表展示组件，支持自定义渲染、加载状态、空状态等功能。
      </p>
    </header>

    <!-- 基础用法 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        基础用法
      </h2>
      <p class="doc-section__desc">
        最简单的列表用法，通过 <code>list</code> 传入数据数组。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body" style="width: 100%">
          <XlyList :list="listData" />
        </div>
      </div>
      <XlyDocCode code="<XlyList :list=&quot;listData&quot; />" />
    </section>

    <!-- 带边框 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        带边框
      </h2>
      <p class="doc-section__desc">
        设置 <code>bordered</code> 属性显示边框。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body" style="width: 100%">
          <XlyList :list="listData" bordered />
        </div>
      </div>
      <XlyDocCode code="<XlyList :list=&quot;listData&quot; bordered />" />
    </section>

    <!-- 带头像和描述 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        带头像和描述
      </h2>
      <p class="doc-section__desc">
        通过 <code>avatar</code>、<code>description-field</code> 属性配置头像和描述字段。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body" style="width: 100%">
          <XlyList :list="userListData" avatar="avatar" title="name" description="desc" bordered />
        </div>
      </div>
      <XlyDocCode
        code="<XlyList
  :list=&quot;userListData&quot;
  avatar=&quot;avatar&quot;
  title=&quot;name&quot;
  description=&quot;desc&quot;
  bordered
/>"
      />
    </section>

    <!-- 带头部和底部 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        带头部和底部
      </h2>
      <p class="doc-section__desc">
        使用 <code>header</code> 和 <code>footer</code> 属性或插槽添加头部和底部内容。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body" style="width: 100%">
          <XlyList :list="listData" header="头部标题" footer="共 3 条记录" bordered />
        </div>
      </div>
      <XlyDocCode
        code="<XlyList
  :list=&quot;listData&quot;
  header=&quot;头部标题&quot;
  footer=&quot;共 3 条记录&quot;
  bordered
/>"
      />
    </section>

    <!-- 悬停效果 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        悬停效果
      </h2>
      <p class="doc-section__desc">
        设置 <code>hoverable</code> 属性使鼠标悬停时高亮行。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body" style="width: 100%">
          <XlyList :list="listData" bordered hoverable />
        </div>
      </div>
      <XlyDocCode code="<XlyList :list=&quot;listData&quot; bordered hoverable />" />
    </section>

    <!-- 加载状态 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        加载状态
      </h2>
      <p class="doc-section__desc">
        设置 <code>loading</code> 属性显示加载状态。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body" style="width: 100%">
          <XlyList :list="[]" loading bordered />
        </div>
      </div>
      <XlyDocCode code="<XlyList :list=&quot;[]&quot; loading bordered />" />
    </section>

    <!-- 空状态 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        空状态
      </h2>
      <p class="doc-section__desc">
        通过 <code>empty-text</code> 属性自定义空状态文字，设置 <code>show-empty</code> 为
        <code>false</code> 可隐藏空状态组件。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body" style="width: 100%">
          <XlyList :list="[]" empty-text="暂无列表数据" bordered />
        </div>
      </div>
      <XlyDocCode code="<XlyList :list=&quot;[]&quot; empty-text=&quot;暂无列表数据&quot; bordered />" />
    </section>

    <!-- 自定义渲染 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        自定义渲染
      </h2>
      <p class="doc-section__desc">
        使用默认插槽自定义列表项的渲染内容，通过 <code>#default</code> 插槽获取 <code>item</code> 和
        <code>index</code>。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body" style="width: 100%">
          <XlyList :list="customListData" bordered>
            <template #default="{ item, index }">
              <div class="custom-list-item">
                <div class="custom-list-item__left">
                  <span class="custom-list-item__index">{{ index + 1 }}</span>
                  <div class="custom-list-item__info">
                    <span class="custom-list-item__title">{{ item.name }}</span>
                    <span class="custom-list-item__desc">{{ item.email }}</span>
                  </div>
                </div>
                <span class="custom-list-item__badge" :class="`custom-list-item__badge--${item.status}`">
                  {{ item.statusText }}
                </span>
              </div>
            </template>
          </XlyList>
        </div>
      </div>
      <XlyDocCode
        code="<XlyList :list=&quot;customListData&quot; bordered>
  <template #default=&quot;{ item, index }&quot;>
    <div class=&quot;custom-list-item&quot;>
      <span>{{ index + 1 }}</span>
      <span>{{ item.name }}</span>
      <span>{{ item.email }}</span>
    </div>
  </template>
</XlyList>"
      />
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
              <td>list</td>
              <td>数据源数组</td>
              <td><code>any[]</code></td>
              <td><code>[]</code></td>
            </tr>
            <tr>
              <td>title</td>
              <td>标题字段名</td>
              <td><code>string</code></td>
              <td><code>'title'</code></td>
            </tr>
            <tr>
              <td>description</td>
              <td>描述字段名</td>
              <td><code>string</code></td>
              <td>-</td>
            </tr>
            <tr>
              <td>avatar</td>
              <td>头像字段名或固定值</td>
              <td><code>string</code></td>
              <td>-</td>
            </tr>
            <tr>
              <td>extra</td>
              <td>额外内容字段名</td>
              <td><code>string</code></td>
              <td>-</td>
            </tr>
            <tr>
              <td>rowKey</td>
              <td>唯一标识字段名</td>
              <td><code>string</code></td>
              <td><code>'id'</code></td>
            </tr>
            <tr>
              <td>bordered</td>
              <td>是否显示边框</td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
            </tr>
            <tr>
              <td>hoverable</td>
              <td>是否启用悬停效果</td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
            </tr>
            <tr>
              <td>loading</td>
              <td>加载状态</td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
            </tr>
            <tr>
              <td>show-empty</td>
              <td>是否显示空状态组件</td>
              <td><code>boolean</code></td>
              <td><code>true</code></td>
            </tr>
            <tr>
              <td>empty-text</td>
              <td>空状态文字</td>
              <td><code>string</code></td>
              <td><code>'暂无数据'</code></td>
            </tr>
            <tr>
              <td>max-height</td>
              <td>最大高度</td>
              <td><code>string</code></td>
              <td>-</td>
            </tr>
            <tr>
              <td>header</td>
              <td>头部内容</td>
              <td><code>string</code></td>
              <td>-</td>
            </tr>
            <tr>
              <td>footer</td>
              <td>底部内容</td>
              <td><code>string</code></td>
              <td>-</td>
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
              <th>参数</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>default</td>
              <td>自定义列表项渲染</td>
              <td><code>{ item, index }</code></td>
            </tr>
            <tr>
              <td>header</td>
              <td>自定义头部内容</td>
              <td>-</td>
            </tr>
            <tr>
              <td>footer</td>
              <td>自定义底部内容</td>
              <td>-</td>
            </tr>
            <tr>
              <td>empty</td>
              <td>自定义空状态内容</td>
              <td>-</td>
            </tr>
            <tr>
              <td>extra</td>
              <td>自定义额外内容</td>
              <td><code>{ item, index }</code></td>
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
              <td>item-click</td>
              <td>点击列表项时触发</td>
              <td><code>(item: any, index: number) =&gt; void</code></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style>
.component-doc {
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
}

/* 自定义列表项样式 */
.custom-list-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 4px 0;
}

.custom-list-item__left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.custom-list-item__index {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: var(--el-fill-color-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.custom-list-item__info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.custom-list-item__title {
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.custom-list-item__desc {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.custom-list-item__badge {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 12px;
  margin-right: 20px;
}

.custom-list-item__badge--success {
  background: #e6f7e6;
  color: var(--el-color-success);
}

.custom-list-item__badge--warning {
  background: #fdf6ec;
  color: var(--el-color-warning);
}

.custom-list-item__badge--danger {
  background: #fef0f0;
  color: var(--el-color-danger);
}
</style>
