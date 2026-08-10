<script setup lang="ts">
import { EasyRadio, EasyRadioGroup } from 'easy-ui'
import { ref } from 'vue'

const val1 = ref<string | number | boolean>()
const val2 = ref<string | number | boolean>()
const val3 = ref<string | number | boolean>('1')
const sizeVal = ref<string | number | boolean>('default')
const borderVal = ref<string | number | boolean>('1')
const typeVal = ref<string | number | boolean>()
const boolVal = ref<string | number | boolean>()
</script>

<template>
  <div class="component-doc">
    <header class="doc-header">
      <h1 class="doc-title">
        单选框 Radio
      </h1>
      <p class="doc-desc">
        在一组备选项中进行单选，支持单独使用和配合 RadioGroup 使用。
      </p>
    </header>

    <!-- 基础用法 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        基础用法
      </h2>
      <p class="doc-section__desc">
        单独使用时，通过 <code>v-model</code> 绑定值，每个 <code>EasyRadio</code> 设置
        <code>label</code> 属性作为选中时的值。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body" style="flex-direction: column; align-items: flex-start; gap: 12px">
          <div style="display: flex; gap: 16px">
            <EasyRadio v-model="val1" label="1">
              选项一
            </EasyRadio>
            <EasyRadio v-model="val1" label="2">
              选项二
            </EasyRadio>
            <EasyRadio v-model="val1" label="3">
              选项三
            </EasyRadio>
          </div>
          <span style="font-size: 13px; color: var(--el-text-color-secondary)">当前值：{{ val1 ?? '未选择' }}</span>
        </div>
      </div>
      <EasyDocCode
        code="<EasyRadio v-model=&quot;value&quot; label=&quot;1&quot;>选项一</EasyRadio>
<EasyRadio v-model=&quot;value&quot; label=&quot;2&quot;>选项二</EasyRadio>
<EasyRadio v-model=&quot;value&quot; label=&quot;3&quot;>选项三</EasyRadio>"
      />
    </section>

    <!-- RadioGroup 用法 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        单选框组
      </h2>
      <p class="doc-section__desc">
        使用 <code>EasyRadioGroup</code> 包裹，只需在组上绑定 <code>v-model</code>，子项只需设置 <code>label</code>。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body" style="flex-direction: column; align-items: flex-start; gap: 12px">
          <EasyRadioGroup v-model="val2">
            <EasyRadio label="beijing">
              北京
            </EasyRadio>
            <EasyRadio label="shanghai">
              上海
            </EasyRadio>
            <EasyRadio label="guangzhou">
              广州
            </EasyRadio>
            <EasyRadio label="shenzhen">
              深圳
            </EasyRadio>
          </EasyRadioGroup>
          <span style="font-size: 13px; color: var(--el-text-color-secondary)">当前值：{{ val2 ?? '未选择' }}</span>
        </div>
      </div>
      <EasyDocCode
        code="<EasyRadioGroup v-model=&quot;value&quot;>
  <EasyRadio label=&quot;beijing&quot;>北京</EasyRadio>
  <EasyRadio label=&quot;shanghai&quot;>上海</EasyRadio>
  <EasyRadio label=&quot;guangzhou&quot;>广州</EasyRadio>
  <EasyRadio label=&quot;shenzhen&quot;>深圳</EasyRadio>
</EasyRadioGroup>"
      />
    </section>

    <!-- 禁用状态 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        禁用状态
      </h2>
      <p class="doc-section__desc">
        通过 <code>disabled</code> 属性禁用单选框，也可以在 <code>EasyRadioGroup</code> 上设置整体禁用。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body" style="flex-direction: column; align-items: flex-start; gap: 16px">
          <div style="display: flex; gap: 16px">
            <EasyRadio label="a" disabled>
              禁用
            </EasyRadio>
            <EasyRadio label="b" disabled model-value="b">
              选中且禁用
            </EasyRadio>
          </div>
          <EasyRadioGroup v-model="val3" disabled>
            <EasyRadio label="1">
              组内禁用一
            </EasyRadio>
            <EasyRadio label="2">
              组内禁用二
            </EasyRadio>
          </EasyRadioGroup>
        </div>
      </div>
      <EasyDocCode
        code="<EasyRadio label=&quot;a&quot; disabled>禁用</EasyRadio>
<EasyRadio label=&quot;b&quot; disabled model-value=&quot;b&quot;>选中且禁用</EasyRadio>

<EasyRadioGroup v-model=&quot;value&quot; disabled>
  <EasyRadio label=&quot;1&quot;>组内禁用一</EasyRadio>
  <EasyRadio label=&quot;2&quot;>组内禁用二</EasyRadio>
</EasyRadioGroup>"
      />
    </section>

    <!-- 不同尺寸 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        不同尺寸
      </h2>
      <p class="doc-section__desc">
        通过 <code>size</code> 属性设置尺寸，可选 <code>large</code>、<code>default</code>、<code>small</code>。 在
        <code>EasyRadioGroup</code> 上设置可统一控制子项尺寸。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body" style="flex-direction: column; align-items: flex-start; gap: 16px">
          <div style="display: flex; gap: 16px">
            <EasyRadio v-model="sizeVal" label="large" size="large">
              大号 Large
            </EasyRadio>
            <EasyRadio v-model="sizeVal" label="default" size="default">
              默认 Default
            </EasyRadio>
            <EasyRadio v-model="sizeVal" label="small" size="small">
              小号 Small
            </EasyRadio>
          </div>
        </div>
      </div>
      <EasyDocCode
        code="<EasyRadio v-model=&quot;value&quot; label=&quot;large&quot; size=&quot;large&quot;>大号</EasyRadio>
<EasyRadio v-model=&quot;value&quot; label=&quot;default&quot; size=&quot;default&quot;>默认</EasyRadio>
<EasyRadio v-model=&quot;value&quot; label=&quot;small&quot; size=&quot;small&quot;>小号</EasyRadio>"
      />
    </section>

    <!-- 带边框 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        带边框
      </h2>
      <p class="doc-section__desc">
        设置 <code>border</code> 属性可显示边框样式。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body" style="flex-direction: column; align-items: flex-start; gap: 16px">
          <div style="display: flex; gap: 12px">
            <EasyRadio v-model="borderVal" label="1" border>
              选项一
            </EasyRadio>
            <EasyRadio v-model="borderVal" label="2" border>
              选项二
            </EasyRadio>
            <EasyRadio v-model="borderVal" label="3" border>
              选项三
            </EasyRadio>
          </div>
        </div>
      </div>
      <EasyDocCode
        code="<EasyRadio v-model=&quot;value&quot; label=&quot;1&quot; border>选项一</EasyRadio>
<EasyRadio v-model=&quot;value&quot; label=&quot;2&quot; border>选项二</EasyRadio>
<EasyRadio v-model=&quot;value&quot; label=&quot;3&quot; border>选项三</EasyRadio>"
      />
    </section>

    <!-- 不同类型值 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        不同类型的值
      </h2>
      <p class="doc-section__desc">
        <code>label</code> 支持字符串、数字、布尔类型。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body" style="flex-direction: column; align-items: flex-start; gap: 16px">
          <div style="display: flex; gap: 16px">
            <EasyRadio v-model="typeVal" :label="1">
              数字 1
            </EasyRadio>
            <EasyRadio v-model="typeVal" :label="2">
              数字 2
            </EasyRadio>
          </div>
          <div style="display: flex; gap: 16px">
            <EasyRadio v-model="boolVal" :label="true">
              布尔 true
            </EasyRadio>
            <EasyRadio v-model="boolVal" :label="false">
              布尔 false
            </EasyRadio>
          </div>
          <span style="font-size: 13px; color: var(--el-text-color-secondary)">
            数字值：{{ typeVal ?? '未选择' }}，布尔值：{{ boolVal ?? '未选择' }}
          </span>
        </div>
      </div>
      <EasyDocCode
        code="<EasyRadio v-model=&quot;numValue&quot; :label=&quot;1&quot;>数字 1</EasyRadio>
<EasyRadio v-model=&quot;numValue&quot; :label=&quot;2&quot;>数字 2</EasyRadio>

<EasyRadio v-model=&quot;boolValue&quot; :label=&quot;true&quot;>布尔 true</EasyRadio>
<EasyRadio v-model=&quot;boolValue&quot; :label=&quot;false&quot;>布尔 false</EasyRadio>"
      />
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
</style>
