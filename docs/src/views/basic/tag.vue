<script setup lang="ts">
import { EasyTag } from '@raopan/easy-ui'
import { nextTick, ref } from 'vue'

// 可关闭标签数据
const closableTags1 = ref([
  { label: '用户管理', type: 'primary' as const },
  { label: '角色配置', type: 'success' as const },
  { label: '权限审批', type: 'warning' as const },
  { label: '系统日志', type: 'danger' as const },
  { label: '数据备份', type: 'info' as const },
])
const closableTags2 = ref([
  { label: 'Vue 3', type: 'primary' as const },
  { label: 'TypeScript', type: 'success' as const },
  { label: 'Vite', type: 'warning' as const },
  { label: 'Tailwind', type: 'info' as const },
])

function removeTag(list: { label: string, type: string }[], tag: { label: string, type: string }) {
  const idx = list.indexOf(tag)
  if (idx > -1)
    list.splice(idx, 1)
}

// 可点击标签
const clickableTags = [
  { label: '技术', type: 'primary' as const },
  { label: '设计', type: 'success' as const },
  { label: '运营', type: 'warning' as const },
  { label: '产品', type: 'danger' as const },
  { label: '数据', type: 'info' as const },
]
const selectedTag = ref<string>('')

// 动态编辑
const dynamicTags = ref(['前端开发', 'UI 设计', '后端接口'])
const inputVisible = ref(false)
const inputValue = ref('')
const inputRef = ref<HTMLInputElement>()

async function showInput() {
  inputVisible.value = true
  await nextTick()
  inputRef.value?.focus()
}

function addTag() {
  const val = inputValue.value.trim()
  if (val && !dynamicTags.value.includes(val)) {
    dynamicTags.value.push(val)
  }
  inputVisible.value = false
  inputValue.value = ''
}

function removeTagByValue(list: string[], tag: string) {
  const idx = list.indexOf(tag)
  if (idx > -1)
    list.splice(idx, 1)
}
</script>

<template>
  <div class="tag-doc">
    <!-- 页面标题 -->
    <div class="doc-header">
      <h1 class="doc-title">
        Tag 标签
      </h1>
      <p class="doc-desc">
        用于标记和分类，支持多种类型、尺寸、主题效果，以及可关闭、可点击、圆角、图标等丰富特性。
      </p>
    </div>

    <!-- 基础用法 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        基础用法
      </h2>
      <p class="doc-section__desc">
        通过 <code>type</code> 属性设置标签类型，支持
        <code>default</code>、<code>primary</code>、<code>success</code>、<code>warning</code>、<code>danger</code>、<code>info</code>
        六种类型。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyTag>默认</EasyTag>
          <EasyTag type="primary">
            主要
          </EasyTag>
          <EasyTag type="success">
            成功
          </EasyTag>
          <EasyTag type="warning">
            警告
          </EasyTag>
          <EasyTag type="danger">
            危险
          </EasyTag>
          <EasyTag type="info">
            信息
          </EasyTag>
        </div>
        <EasyDocCode
          code="<easy-tag>默认</easy-tag>
<easy-tag type=&quot;primary&quot;>主要</easy-tag>
<easy-tag type=&quot;success&quot;>成功</easy-tag>
<easy-tag type=&quot;warning&quot;>警告</easy-tag>
<easy-tag type=&quot;danger&quot;>危险</easy-tag>
<easy-tag type=&quot;info&quot;>信息</easy-tag>"
        />
      </div>
    </section>

    <!-- 主题效果 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        主题效果
      </h2>
      <p class="doc-section__desc">
        通过 <code>effect</code> 属性切换主题，支持
        <code>light</code>（浅色，默认）、<code>plain</code>（描边）、<code>dark</code>（深色）三种效果。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body" style="flex-direction: column; align-items: flex-start; gap: 12px">
          <div class="tag-row">
            <span class="effect-label">light</span>
            <EasyTag>默认</EasyTag>
            <EasyTag type="primary">
              主要
            </EasyTag>
            <EasyTag type="success">
              成功
            </EasyTag>
            <EasyTag type="warning">
              警告
            </EasyTag>
            <EasyTag type="danger">
              危险
            </EasyTag>
            <EasyTag type="info">
              信息
            </EasyTag>
          </div>
          <div class="tag-row">
            <span class="effect-label">plain</span>
            <EasyTag effect="plain">
              默认
            </EasyTag>
            <EasyTag type="primary" effect="plain">
              主要
            </EasyTag>
            <EasyTag type="success" effect="plain">
              成功
            </EasyTag>
            <EasyTag type="warning" effect="plain">
              警告
            </EasyTag>
            <EasyTag type="danger" effect="plain">
              危险
            </EasyTag>
            <EasyTag type="info" effect="plain">
              信息
            </EasyTag>
          </div>
          <div class="tag-row">
            <span class="effect-label">dark</span>
            <EasyTag effect="dark">
              默认
            </EasyTag>
            <EasyTag type="primary" effect="dark">
              主要
            </EasyTag>
            <EasyTag type="success" effect="dark">
              成功
            </EasyTag>
            <EasyTag type="warning" effect="dark">
              警告
            </EasyTag>
            <EasyTag type="danger" effect="dark">
              危险
            </EasyTag>
            <EasyTag type="info" effect="dark">
              信息
            </EasyTag>
          </div>
        </div>
        <EasyDocCode
          code="<!-- 浅色（默认）-->
<easy-tag effect=&quot;light&quot;>...</easy-tag>

<!-- 描边 -->
<easy-tag effect=&quot;plain&quot;>...</easy-tag>

<!-- 深色 -->
<easy-tag effect=&quot;dark&quot;>...</easy-tag>"
        />
      </div>
    </section>

    <!-- 不同尺寸 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        不同尺寸
      </h2>
      <p class="doc-section__desc">
        通过 <code>size</code> 属性设置标签大小，支持 <code>large</code>、<code>default</code>、<code>small</code>
        三种规格。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyTag type="primary" size="large">
            Large
          </EasyTag>
          <EasyTag type="primary">
            Default
          </EasyTag>
          <EasyTag type="primary" size="small">
            Small
          </EasyTag>
        </div>
        <EasyDocCode
          code="<easy-tag type=&quot;primary&quot; size=&quot;large&quot;>Large</easy-tag>
<easy-tag type=&quot;primary&quot;>Default</easy-tag>
<easy-tag type=&quot;primary&quot; size=&quot;small&quot;>Small</easy-tag>"
        />
      </div>
    </section>

    <!-- 圆角样式 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        圆角样式
      </h2>
      <p class="doc-section__desc">
        添加 <code>round</code> 属性，标签变为胶囊形圆角。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyTag round>
            默认
          </EasyTag>
          <EasyTag type="primary" round>
            主要
          </EasyTag>
          <EasyTag type="success" round>
            成功
          </EasyTag>
          <EasyTag type="warning" round>
            警告
          </EasyTag>
          <EasyTag type="danger" round>
            危险
          </EasyTag>
          <EasyTag type="info" round>
            信息
          </EasyTag>
        </div>
        <EasyDocCode
          code="<easy-tag type=&quot;primary&quot; round>主要</easy-tag>
<easy-tag type=&quot;success&quot; round>成功</easy-tag>"
        />
      </div>
    </section>

    <!-- 带图标 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        带图标
      </h2>
      <p class="doc-section__desc">
        通过 <code>icon</code> 属性为标签添加前置图标，使用 Element Plus 图标名称。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyTag type="primary" icon="User">
            用户
          </EasyTag>
          <EasyTag type="success" icon="CircleCheck">
            已通过
          </EasyTag>
          <EasyTag type="warning" icon="Warning">
            待审核
          </EasyTag>
          <EasyTag type="danger" icon="CircleClose">
            已拒绝
          </EasyTag>
          <EasyTag type="info" icon="Clock">
            处理中
          </EasyTag>
        </div>
        <EasyDocCode
          code="<easy-tag type=&quot;primary&quot; icon=&quot;User&quot;>用户</easy-tag>
<easy-tag type=&quot;success&quot; icon=&quot;CircleCheck&quot;>已通过</easy-tag>
<easy-tag type=&quot;warning&quot; icon=&quot;Warning&quot;>待审核</easy-tag>
<easy-tag type=&quot;danger&quot; icon=&quot;CircleClose&quot;>已拒绝</easy-tag>"
        />
      </div>
    </section>

    <!-- 可关闭 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        可关闭
      </h2>
      <p class="doc-section__desc">
        添加 <code>closable</code> 属性后，标签右侧出现关闭按钮，点击后触发 <code>close</code> 事件并隐藏标签。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body" style="flex-direction: column; align-items: flex-start; gap: 16px">
          <div class="tag-row">
            <EasyTag v-for="tag in closableTags1" :key="tag.label" :type="tag.type" closable
              @close="removeTag(closableTags1, tag)">
              {{ tag.label }}
            </EasyTag>
            <span v-if="closableTags1.length === 0" class="empty-hint">所有标签已关闭，刷新页面重置</span>
          </div>
          <div class="tag-row">
            <EasyTag v-for="tag in closableTags2" :key="tag.label" :type="tag.type" effect="plain" round closable
              @close="removeTag(closableTags2, tag)">
              {{ tag.label }}
            </EasyTag>
          </div>
        </div>
        <EasyDocCode code="<easy-tag type=&quot;primary&quot; closable @close=&quot;handleClose&quot;>可关闭</easy-tag>" />
      </div>
    </section>

    <!-- 可点击 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        可点击
      </h2>
      <p class="doc-section__desc">
        添加 <code>clickable</code> 属性后，标签具有点击 hover 效果，并触发 <code>click</code> 事件。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body" style="flex-direction: column; align-items: flex-start; gap: 16px">
          <div class="tag-row">
            <EasyTag v-for="tag in clickableTags" :key="tag.label"
              :type="selectedTag === tag.label ? tag.type : 'default'"
              :effect="selectedTag === tag.label ? 'dark' : 'light'" clickable @click="selectedTag = tag.label">
              {{ tag.label }}
            </EasyTag>
          </div>
          <div v-if="selectedTag" class="click-hint">
            已选中：<strong>{{ selectedTag }}</strong>
          </div>
        </div>
        <EasyDocCode code="<easy-tag type=&quot;primary&quot; clickable @click=&quot;handleClick&quot;>点击我</easy-tag>" />
      </div>
    </section>

    <!-- 禁用状态 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        禁用状态
      </h2>
      <p class="doc-section__desc">
        通过 <code>disabled</code> 属性禁用标签，禁用后标签半透明且无法交互。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyTag type="primary" disabled>
            禁用
          </EasyTag>
          <EasyTag type="success" disabled closable>
            禁用关闭
          </EasyTag>
          <EasyTag type="warning" disabled clickable>
            禁用点击
          </EasyTag>
          <EasyTag type="danger" disabled effect="dark">
            禁用深色
          </EasyTag>
        </div>
        <EasyDocCode code="<easy-tag type=&quot;primary&quot; disabled>禁用</easy-tag>" />
      </div>
    </section>

    <!-- 自定义颜色 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        自定义颜色
      </h2>
      <p class="doc-section__desc">
        通过 <code>color</code> 属性自定义标签颜色，结合 <code>effect</code> 属性可产生不同视觉效果。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body" style="flex-direction: column; align-items: flex-start; gap: 12px">
          <div class="tag-row">
            <span class="effect-label">light</span>
            <EasyTag color="#7c3aed">
              紫色
            </EasyTag>
            <EasyTag color="#0ea5e9">
              天蓝
            </EasyTag>
            <EasyTag color="#f43f5e">
              玫瑰
            </EasyTag>
            <EasyTag color="#10b981">
              翠绿
            </EasyTag>
            <EasyTag color="#f97316">
              橙色
            </EasyTag>
          </div>
          <div class="tag-row">
            <span class="effect-label">plain</span>
            <EasyTag color="#7c3aed" effect="plain">
              紫色
            </EasyTag>
            <EasyTag color="#0ea5e9" effect="plain">
              天蓝
            </EasyTag>
            <EasyTag color="#f43f5e" effect="plain">
              玫瑰
            </EasyTag>
            <EasyTag color="#10b981" effect="plain">
              翠绿
            </EasyTag>
            <EasyTag color="#f97316" effect="plain">
              橙色
            </EasyTag>
          </div>
          <div class="tag-row">
            <span class="effect-label">dark</span>
            <EasyTag color="#7c3aed" effect="dark">
              紫色
            </EasyTag>
            <EasyTag color="#0ea5e9" effect="dark">
              天蓝
            </EasyTag>
            <EasyTag color="#f43f5e" effect="dark">
              玫瑰
            </EasyTag>
            <EasyTag color="#10b981" effect="dark">
              翠绿
            </EasyTag>
            <EasyTag color="#f97316" effect="dark">
              橙色
            </EasyTag>
          </div>
        </div>
        <EasyDocCode
          code="<easy-tag color=&quot;#7c3aed&quot;>紫色</easy-tag>
<easy-tag color=&quot;#7c3aed&quot; effect=&quot;plain&quot;>紫色描边</easy-tag>
<easy-tag color=&quot;#7c3aed&quot; effect=&quot;dark&quot;>紫色深色</easy-tag>"
        />
      </div>
    </section>

    <!-- 动态编辑 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        动态编辑标签
      </h2>
      <p class="doc-section__desc">
        结合 <code>closable</code> 与输入框，实现动态添加/删除标签的交互。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body" style="flex-direction: column; align-items: flex-start; gap: 12px">
          <div class="tag-row" style="flex-wrap: wrap">
            <EasyTag v-for="tag in dynamicTags" :key="tag" type="primary" effect="plain" closable
              @close="removeTagByValue(dynamicTags, tag)">
              {{ tag }}
            </EasyTag>
            <div v-if="inputVisible" class="tag-input-wrap">
              <input ref="inputRef" v-model="inputValue" class="tag-input" placeholder="回车确认" @keyup.enter="addTag"
                @blur="addTag">
            </div>
            <EasyTag v-else type="primary" effect="plain" clickable @click="showInput">
              + 新增标签
            </EasyTag>
          </div>
        </div>
        <EasyDocCode
          code="<easy-tag
  v-for=&quot;tag in tags&quot;
  :key=&quot;tag&quot;
  closable
  @close=&quot;removeTag(tag)&quot;
>{{ tag }}</easy-tag>

<easy-tag clickable @click=&quot;showInput&quot;>+ 新增</easy-tag>"
        />
      </div>
    </section>

    <!-- API 文档 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        API
      </h2>

      <h3 class="doc-subtitle">
        Tag Props
      </h3>
      <div class="doc-table">
        <table>
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
              <td><code>type</code></td>
              <td>标签类型</td>
              <td><code>'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'</code></td>
              <td><code>'default'</code></td>
            </tr>
            <tr>
              <td><code>size</code></td>
              <td>标签尺寸</td>
              <td><code>'large' | 'default' | 'small'</code></td>
              <td><code>'default'</code></td>
            </tr>
            <tr>
              <td><code>effect</code></td>
              <td>主题效果</td>
              <td><code>'light' | 'plain' | 'dark'</code></td>
              <td><code>'light'</code></td>
            </tr>
            <tr>
              <td><code>closable</code></td>
              <td>是否可关闭</td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
            </tr>
            <tr>
              <td><code>round</code></td>
              <td>是否为圆角胶囊形</td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
            </tr>
            <tr>
              <td><code>clickable</code></td>
              <td>是否可点击（带 hover 效果）</td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
            </tr>
            <tr>
              <td><code>icon</code></td>
              <td>前置图标（Element Plus 图标名）</td>
              <td><code>string</code></td>
              <td>—</td>
            </tr>
            <tr>
              <td><code>color</code></td>
              <td>自定义颜色（覆盖 type）</td>
              <td><code>string</code></td>
              <td>—</td>
            </tr>
            <tr>
              <td><code>disabled</code></td>
              <td>是否禁用</td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 class="doc-subtitle">
        Tag Events
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
              <td><code>close</code></td>
              <td>点击关闭按钮时触发</td>
              <td><code>(event: MouseEvent)</code></td>
            </tr>
            <tr>
              <td><code>click</code></td>
              <td>点击标签时触发（需设置 clickable）</td>
              <td><code>(event: MouseEvent)</code></td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 class="doc-subtitle">
        Tag Methods
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
              <td><code>show()</code></td>
              <td>重置标签为显示状态（closable 关闭后可调用）</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.tag-doc {
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
  gap: 10px;
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
  }
  th {
    background: var(--el-fill-color-light);
    font-weight: 600;
    color: var(--el-text-color-primary);
    white-space: nowrap;
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

.tag-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.effect-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  font-weight: 500;
  min-width: 36px;
  font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
}

.empty-hint {
  font-size: 13px;
  color: var(--el-text-color-placeholder);
}

.click-hint {
  font-size: 13px;
  color: var(--el-text-color-regular);
  padding: 6px 12px;
  background: var(--el-fill-color-light);
  border-radius: 6px;

  strong {
    color: var(--el-color-primary);
  }
}

/* 动态编辑输入框 */
.tag-input-wrap {
  display: inline-flex;
}
.tag-input {
  height: 28px;
  padding: 0 10px;
  font-size: 13px;
  color: var(--el-text-color-primary);
  border: 1px solid #4f6ef7;
  border-radius: 6px;
  outline: none;
  width: 100px;
  background: var(--el-bg-color-overlay);
  transition: box-shadow 0.2s;

  &:focus {
    box-shadow: 0 0 0 3px rgba(79, 110, 247, 0.15);
  }
}
</style>
