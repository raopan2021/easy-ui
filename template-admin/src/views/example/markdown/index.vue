<script setup lang="ts">
/**
 * Markdown 编辑器示例
 *
 * EasyMarkdown 基于 markdown-it + highlight.js 构建，支持：
 * - 编辑 / 分屏 / 预览三种视图
 * - 默认 / GitHub / 简约 三套主题切换（实时作用于预览，导出时同步）
 * - 保存事件回调
 * - 导出下载 .md / .html / .pdf（pdf 通过浏览器打印对话框另存）
 */
import { ref } from 'vue'
import { easy } from '@/utils/xly'

defineOptions({ name: 'MarkdownExample' })

const content = ref(`# EasyMarkdown 编辑器示例

基于 **markdown-it** 与 **highlight.js** 构建的 Markdown 在线编辑、预览、保存下载组件。

## 功能特性

- 编辑 / 分屏 / 预览三种视图
- 代码块语法高亮
- 多主题预览与导出（默认 / GitHub / 简约）
- 导出下载 .md / .html / .pdf

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
| 主题 | 切换预览与导出样式 |
| 下载 | 导出 md / html / pdf |

> 试试在工具栏切换主题，或从「下载」下拉中选择「.pdf」体验导出。
`)

function onSave(value: string) {
  easy.$msg.success(`已保存，内容长度：${value.length}`)
}
</script>

<template>
  <div class="markdown-example">
    <EasyMarkdown v-model="content" :height="480" export-name="example" @save="onSave" />

    <!-- API 说明 -->
    <el-card class="markdown-example__api" shadow="never">
      <template #header>
        <span>API 说明</span>
      </template>
      <el-descriptions :column="1" border>
        <el-descriptions-item label="主题切换">
          <code>theme</code> prop / 工具栏下拉框，支持 <code>v-model:theme</code>；内置
          <code>default</code> / <code>github</code> / <code>clean</code>
        </el-descriptions-item>
        <el-descriptions-item label="自定义主题">
          <code>themes</code> prop 传入 <code>MarkdownTheme[]</code>（key / label / exportCss），与内置主题合并
        </el-descriptions-item>
        <el-descriptions-item label="下载 PDF">
          调用浏览器打印对话框，选择「另存为 PDF」即可生成，样式与当前主题一致
        </el-descriptions-item>
        <el-descriptions-item label="暴露方法">
          <code>setTheme(key)</code> / <code>getTheme()</code> / <code>downloadMd()</code> /
          <code>downloadHtml()</code> / <code>downloadPdf()</code>
        </el-descriptions-item>
      </el-descriptions>
    </el-card>
  </div>
</template>

<style scoped lang="scss">
.markdown-example {
  padding: 16px;

  &__api {
    margin-top: 16px;
    border: none;

    :deep(.el-descriptions__label) {
      width: 120px;
    }

    code {
      background: var(--el-fill-color-light);
      color: var(--el-color-primary);
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 12px;
    }
  }
}
</style>
