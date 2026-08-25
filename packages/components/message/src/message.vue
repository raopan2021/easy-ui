<script setup lang="ts">
import { closeMessage, EasyMsg, groupedList, handleMouseEnter, handleMouseLeave, positions } from './message'

defineOptions({ name: 'EasyMessage' })

defineExpose(EasyMsg)
</script>

<template>
  <Teleport to="body">
    <template v-for="pos in positions" :key="pos">
      <TransitionGroup v-if="groupedList[pos]?.length" name="easy-message" tag="div" class="easy-message-container"
        :class="`easy-message-container--${pos}`">
        <div v-for="item in groupedList[pos]" :key="item.id" class="easy-message"
          :class="[`easy-message--${item.type}`, { 'easy-message--closable': item.closable }, item.customClass || '']"
          :style="item.customStyle" @mouseenter="handleMouseEnter(item)" @mouseleave="handleMouseLeave(item)">
          <!-- 图标 -->
          <div v-if="item.type !== 'text'" class="easy-message__icon">
            <svg v-if="item.type === 'success'" viewBox="0 0 24 24" width="1em" height="1em" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="8,12 11,15 16,9" />
            </svg>
            <svg v-else-if="item.type === 'warning'" viewBox="0 0 24 24" width="1em" height="1em" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M10.29 3.86L1.82 18a2 0 0 0 1.71 3h16.94a2 0 0 0 1.71-3L13.71 3.86a2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <svg v-else-if="item.type === 'danger'" viewBox="0 0 24 24" width="1em" height="1em" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <svg v-else-if="item.type === 'info'" viewBox="0 0 24 24" width="1em" height="1em" fill="none"
              stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          </div>

          <!-- 内容 -->
          <div class="easy-message__content">
            <span v-if="item.title" class="easy-message__title">{{ item.title }}</span>
            <span class="easy-message__text">{{ item.message }}</span>
          </div>

          <!-- 关闭按钮 -->
          <button v-if="item.closable" class="easy-message__close" @click="closeMessage(item.id)">
            <svg viewBox="0 0 24 24" width="1em" height="1em" fill="none" stroke="currentColor" stroke-width="2"
              stroke-linecap="round">
              <line x1="8" y1="8" x2="16" y2="16" />
              <line x1="16" y1="8" x2="8" y2="16" />
            </svg>
          </button>

          <!-- 进度条 -->
          <div v-if="item.showProgress" class="easy-message__progress">
            <div class="easy-message__progress-bar" :class="`easy-message__progress-bar--${item.type}`"
              :style="{ animationDuration: `${item.duration}ms` }" />
          </div>
        </div>
      </TransitionGroup>
    </template>
  </Teleport>
</template>

<!-- 组件核心样式（scoped，独立维护在 message-style.scss） -->
<style scoped src="./message-style.scss" lang="scss"></style>
