<script setup lang="ts">
import type { BaseNodeEmits, BaseNodeProps } from './base-node-types'

import { useBaseNode } from './use-base-node'

const props = withDefaults(defineProps<BaseNodeProps>(), {
  text: () => '',
  permissionFlag: () => '',
  chartStatusColor: () => [],
  status: () => null,
  type: () => '',
  fill: () => '',
  stroke: () => '',
})

const emit = defineEmits<BaseNodeEmits>()

const {
  showSpan,
  baseNodeDiv,
  nodeName,
  handler,
  nodeNameInput,
  editingNodeName,
  deleteNode,
  editNodeName,
  saveNodeName,
  editNode,
} = useBaseNode(props, emit)

export type { BaseNodeEmits, BaseNodeProps } from './base-node-types'
</script>

<template>
  <div
    ref="baseNodeDiv"
    class="base-node"
    :class="
      status == null ? '' : status === 0 ? 'base-node-not-done' : status === 1 ? 'base-node-todo' : 'base-node-done'
    "
  >
    <div class="top-section">
      <div class="node-header">
        <div class="header-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M8 14C11.3137 14 14 11.3137 14 8C14 4.68629 11.3137 2 8 2C4.68629 2 2 4.68629 2 8C2 11.3137 4.68629 14 8 14Z"
              stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M8 5V8L10 10" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <span v-show="showSpan" class="node-title" @click="editNodeName">
          {{ nodeName }}
        </span>
        <ElInput v-show="editingNodeName" ref="nodeNameInput" v-model="nodeName" size="small" class="node-name-input"
          @blur="saveNodeName" />
        <span v-show="props.type === 'between' && (!chartStatusColor || chartStatusColor.length === 0)"
          class="delete-btn" @click.stop="deleteNode">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.5 3.5L3.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
            <path d="M3.5 3.5L10.5 10.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          </svg>
        </span>
      </div>
    </div>
    <div class="bottom-section" :title="handler" @click="editNode">
      <div class="handler-container">
        <div class="handler-icon">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M11.3333 4.66666C11.3333 6.50761 9.84095 8 8 8C6.15905 8 4.66663 6.50761 4.66663 4.66666C4.66663 2.82571 6.15905 1.33333 8 1.33333C9.84095 1.33333 11.3333 2.82571 11.3333 4.66666Z"
              stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
            <path d="M8 10.6667C5.79086 10.6667 4 11.5617 4 12.6667V14H12V12.6667C12 11.5617 10.2091 10.6667 8 10.6667Z"
              stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          </svg>
        </div>
        <div class="handler-text">
          <!-- 可以自行更换为自己的人员信息展示组件 -->
          <span v-if="handler">{{ handler }}</span>
          <span v-else>所有人</span>
        </div>
      </div>
      <div class="edit-indicator">
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4.66669 9.33333L9.33335 4.66666L4.66669 3.33333L3.33335 8.66666L4.66669 9.33333Z"
            stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
          <path d="M9.33335 4.66666L8.00002 3.33333" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
            stroke-linejoin="round" />
          <path d="M5.66669 9.33333L4.33335 8.00002" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"
            stroke-linejoin="round" />
        </svg>
      </div>
    </div>
  </div>
</template>

<style scoped src="./base-node-style.scss" lang="scss"></style>
