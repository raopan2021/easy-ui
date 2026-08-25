<script setup lang="ts">
import type { JsonViewerProps } from './types'

import { JsonNode } from './json-node'
import { useJsonCopy } from './use-json-copy'
import { useJsonTheme } from './use-json-theme'
import { useJsonTree } from './use-json-tree'

// 保持对外类型导出兼容（原为 defineProps 内联定义）
export type { JsonNodeProps, JsonViewerProps } from './types'

defineOptions({ name: 'EasyJsonViewer' })

const props = withDefaults(defineProps<JsonViewerProps>(), {
  depth: 3,
  theme: 'auto',
  showToolbar: true,
  showCopy: true,
  showExpand: true,
})

// ──── 主题解析（auto 跟随 html.dark）────
const { resolvedTheme } = useJsonTheme(props)

// ──── 数据解析 + 展开 / 折叠状态 ────
const {
  currentDepth,
  expandedSet,
  collapsedSet,
  parsedData,
  handleExpandAll,
  handleCollapseAll,
  toggleNode,
} = useJsonTree(props)

// ──── 复制到剪贴板 ────
const { handleCopy } = useJsonCopy(parsedData)
</script>

<template>
  <div class="easy-json-viewer" :class="[`easy-json-viewer--${resolvedTheme}`]" :style="{ width }">
    <!-- 工具栏 -->
    <div v-if="showToolbar" class="easy-json-viewer__toolbar">
      <span class="easy-json-viewer__toolbar-left">
        <span v-if="showCopy" class="easy-json-viewer__btn" title="复制" @click="handleCopy">
          <EasyIcon name="el:CopyDocument" />
          <span>复制</span>
        </span>
      </span>
      <span class="easy-json-viewer__toolbar-right">
        <span v-if="showExpand" class="easy-json-viewer__btn" title="展开全部" @click="handleExpandAll">
          <EasyIcon name="el:ArrowDown" />
          <span>展开</span>
        </span>
        <span v-if="showExpand" class="easy-json-viewer__btn" title="折叠全部" @click="handleCollapseAll">
          <EasyIcon name="el:ArrowUp" />
          <span>折叠</span>
        </span>
      </span>
    </div>

    <!-- JSON 内容 -->
    <div class="easy-json-viewer__content" :style="{ maxHeight }">
      <pre v-if="parsedData !== null" class="easy-json-viewer__pre"><JsonNode :data="parsedData" path="root" :depth="0" :max-depth="currentDepth" :theme="resolvedTheme" :expanded-set="expandedSet" :collapsed-set="collapsedSet" @toggle="toggleNode" /></pre>
      <div v-else class="easy-json-viewer__empty">
        暂无数据
      </div>
    </div>
  </div>
</template>

<style lang="scss">
@use './index.scss';
</style>
