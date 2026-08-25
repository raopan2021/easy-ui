<script setup lang="ts">
import type { DocCodeProps } from './types'

import { useDocCode } from './use-doc-code'

const props = withDefaults(defineProps<DocCodeProps>(), {
  lang: 'auto',
  collapseHeight: 100,
})

const {
  bodyRef,
  expanded,
  copied,
  needsCollapse,
  collapsed,
  effectiveLang,
  handleCopy,
  bodyStyle,
  wrappedHtml,
} = useDocCode(props)

// 保持对外类型导出兼容
export type { DocCodeProps } from './types'
</script>

<template>
  <div class="doc-code" :class="{ 'doc-code--collapsed': needsCollapse && collapsed && !expanded }">
    <div class="doc-code__toolbar">
      <span class="doc-code__toolbar__lang">{{ effectiveLang }}</span>

      <button class="doc-code__toolbar__btn" :class="{ 'doc-code__toolbar__btn--copied': copied }" @click="handleCopy">
        {{ copied ? '已复制' : '复制' }}
      </button>

      <button v-if="needsCollapse" class="doc-code__toolbar__btn" @click="expanded = !expanded">
        {{ expanded ? '收起' : '展开' }}
      </button>
    </div>

    <div ref="bodyRef" class="doc-code__body" :style="bodyStyle" v-html="wrappedHtml" />
  </div>
</template>

<!-- 非 scoped 全局样式：含 highlight.js 主题（基于 Element Plus CSS 变量），必须全局生效，故保持内联 -->
<style lang="scss">
.doc-code {
  position: relative;
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-light);

  .doc-code__toolbar {
    position: absolute;
    right: 0;
    top: 0;
    z-index: 1;
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 6px 16px;
    background: var(--el-fill-color-light);

    .doc-code__toolbar__lang {
      font-size: 12px;
      color: var(--el-text-color-placeholder);
      font-family: 'SF Mono', Consolas, monospace;
    }

    .doc-code__toolbar__btn {
      font-size: 12px;
      padding: 2px 10px;
      background: var(--el-bg-color-overlay);
      color: var(--el-text-color-secondary);
      border: 1px solid var(--el-border-color);
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;

      &:hover {
        color: var(--el-color-primary);
        border-color: var(--el-color-primary-light-5);
      }

      &.doc-code__toolbar__btn--copied,
      &.doc-code__toolbar__btn--copied:hover {
        color: var(--el-color-success);
        border-color: var(--el-color-success-light-5);
      }
    }
  }

  .doc-code__body {
    overflow-x: auto;
    padding: 10px;
    transition: max-height 0.3s ease;

    pre {
      margin: 0;
      padding: 0;
      background: none !important;
    }

    code {
      font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
      font-size: 13px;
      line-height: 1.7;
      color: var(--el-text-color-regular);
      white-space: pre;
    }
  }

  &.doc-code--collapsed .doc-code__body {
    position: relative;

    &::after {
      content: '';
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      height: 40px;
      background: linear-gradient(transparent, var(--el-fill-color-light));
      pointer-events: none;
    }
  }

  /* ---- highlight.js 主题（基于 Element Plus CSS 变量）---- */

  .hljs-comment {
    color: var(--el-text-color-placeholder);
    font-style: italic;
  }
  .hljs-quote {
    color: var(--el-text-color-placeholder);
    font-style: italic;
  }
  .hljs-keyword {
    color: var(--el-color-danger);
    font-weight: 500;
  }
  .hljs-type {
    color: var(--el-color-primary);
  }
  .hljs-string {
    color: var(--el-color-success);
  }
  .hljs-number {
    color: var(--el-color-success);
  }
  .hljs-literal {
    color: var(--el-color-primary);
  }
  .hljs-built_in {
    color: var(--el-color-info);
  }
  .hljs-title {
    color: var(--el-color-primary);
  }
  .hljs-params {
    color: var(--el-text-color-regular);
  }
  .hljs-tag {
    color: var(--el-color-primary);
  }
  .hljs-name {
    color: var(--el-color-primary);
  }
  .hljs-attr {
    color: #e6a23c;
  }
  .hljs-selector-tag {
    color: var(--el-color-primary);
  }
  .hljs-selector-class {
    color: #e6a23c;
  }
  .hljs-selector-id {
    color: var(--el-color-primary);
  }
  .hljs-template-variable {
    color: var(--el-color-warning);
  }
  .hljs-variable {
    color: var(--el-text-color-regular);
  }
  .hljs-meta {
    color: var(--el-color-info);
  }
  .hljs-section {
    color: var(--el-color-primary);
    font-weight: 600;
  }
  .hljs-addition {
    color: var(--el-color-success);
  }
  .hljs-deletion {
    color: var(--el-color-danger);
  }
  .hljs-emphasis {
    font-style: italic;
  }
  .hljs-strong {
    font-weight: 600;
  }
}

/* 深色模式微调 */
html.dark .doc-code {
  .hljs-attr {
    color: #e0a440;
  }
  .hljs-selector-class {
    color: #e0a440;
  }
  .hljs-comment {
    color: #6a9955;
  }
  .hljs-quote {
    color: #6a9955;
  }
}
</style>
