<script setup lang="ts">
import { closeMessage, EasyMsg, groupedList, handleMouseEnter, handleMouseLeave, positions } from './message'

defineOptions({ name: 'EasyMessage' })

defineExpose(EasyMsg)
</script>

<template>
  <Teleport to="body">
    <template v-for="pos in positions" :key="pos">
      <TransitionGroup
        v-if="groupedList[pos]?.length"
        name="easy-message"
        tag="div"
        class="easy-message-container"
        :class="`easy-message-container--${pos}`"
      >
        <div
          v-for="item in groupedList[pos]"
          :key="item.id"
          class="easy-message"
          :class="[`easy-message--${item.type}`, { 'easy-message--closable': item.closable }, item.customClass || '']"
          :style="item.customStyle"
          @mouseenter="handleMouseEnter(item)"
          @mouseleave="handleMouseLeave(item)"
        >
          <!-- 图标 -->
          <div v-if="item.type !== 'text'" class="easy-message__icon">
            <svg
              v-if="item.type === 'success'"
              viewBox="0 0 24 24"
              width="1em"
              height="1em"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <polyline points="8,12 11,15 16,9" />
            </svg>
            <svg
              v-else-if="item.type === 'warning'"
              viewBox="0 0 24 24"
              width="1em"
              height="1em"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            <svg
              v-else-if="item.type === 'danger'"
              viewBox="0 0 24 24"
              width="1em"
              height="1em"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            <svg
              v-else-if="item.type === 'info'"
              viewBox="0 0 24 24"
              width="1em"
              height="1em"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
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
            <svg
              viewBox="0 0 24 24"
              width="1em"
              height="1em"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
            >
              <line x1="8" y1="8" x2="16" y2="16" />
              <line x1="16" y1="8" x2="8" y2="16" />
            </svg>
          </button>

          <!-- 进度条 -->
          <div v-if="item.showProgress" class="easy-message__progress">
            <div
              class="easy-message__progress-bar"
              :class="`easy-message__progress-bar--${item.type}`"
              :style="{ animationDuration: `${item.duration}ms` }"
            />
          </div>
        </div>
      </TransitionGroup>
    </template>
  </Teleport>
</template>

<style scoped lang="scss">
@use '../../../easy-ui/src/styles/tokens' as *;

/* ========== 设计令牌 ========== */
$radius: 10px;
$shadow-sm:
  0 2px 8px rgba(0, 0, 0, 0.06),
  0 0 1px rgba(0, 0, 0, 0.04);
$shadow-md:
  0 4px 16px rgba(0, 0, 0, 0.08),
  0 0 1px rgba(0, 0, 0, 0.04);
$transition-fast: 0.2s ease;

/* ========== 容器 ========== */
.easy-message-container {
  position: fixed;
  z-index: 3000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  pointer-events: none;
  max-width: 420px;

  &.easy-message-container--top {
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
  }

  &.easy-message-container--top-left {
    top: 20px;
    left: 20px;
  }

  &.easy-message-container--top-right {
    top: 20px;
    right: 20px;
  }

  &.easy-message-container--bottom {
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
  }

  &.easy-message-container--bottom-left {
    bottom: 20px;
    left: 20px;
  }

  &.easy-message-container--bottom-right {
    bottom: 20px;
    right: 20px;
  }
}

/* ========== 消息项 ========== */
.easy-message {
  position: relative;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: 12px 16px;
  border-radius: $radius;
  background-color: var(--el-bg-color);
  box-shadow: $shadow-md;
  border: 1px solid transparent;
  pointer-events: auto;
  overflow: hidden;
  box-sizing: border-box;
  min-width: 280px;
  max-width: 100%;
}

/* ========== 类型样式 ========== */
.easy-message--success {
  background-color: var(--el-color-success-light-9);
  border-color: var(--el-color-success-light-5);

  .easy-message__icon {
    color: var(--el-color-success);
  }

  .easy-message__title {
    color: var(--el-color-success);
  }
}

.easy-message--warning {
  background-color: var(--el-color-warning-light-9);
  border-color: var(--el-color-warning-light-5);

  .easy-message__icon {
    color: var(--el-color-warning);
  }

  .easy-message__title {
    color: var(--el-color-warning);
  }
}

.easy-message--danger {
  background-color: var(--el-color-danger-light-9);
  border-color: var(--el-color-danger-light-5);

  .easy-message__icon {
    color: var(--el-color-danger);
  }

  .easy-message__title {
    color: var(--el-color-danger);
  }
}

.easy-message--info {
  background-color: var(--el-color-info-light-9);
  border-color: var(--el-color-info-light-5);

  .easy-message__icon {
    color: var(--el-color-info);
  }

  .easy-message__title {
    color: var(--el-color-info);
  }
}

.easy-message--text {
  background-color: var(--el-bg-color);
  border-color: #ebedf2;
}

/* ========== 图标 ========== */
.easy-message__icon {
  flex-shrink: 0;
  font-size: 18px;
  line-height: 1.4;
  margin-top: 1px;
}

/* ========== 内容 ========== */
.easy-message__content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.easy-message__title {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--el-text-color-primary);
}

.easy-message__text {
  font-size: 13px;
  line-height: 1.6;
  color: var(--el-text-color-secondary);
  word-break: break-word;
}

/* ========== 关闭按钮 ========== */
.easy-message__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  background: transparent;
  border-radius: 6px;
  cursor: pointer;
  color: #b0b0c0;
  flex-shrink: 0;
  margin-top: 1px;
  transition: all $transition-fast;

  &:hover {
    background-color: var(--el-fill-color-light);
    color: var(--el-text-color-secondary);
  }
}

/* ========== 进度条 ========== */
.easy-message__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  border-radius: 0 0 $radius $radius;
  overflow: hidden;
}

.easy-message__progress-bar {
  height: 100%;
  width: 100%;
  transform-origin: left;
  animation: easy-progress-shrink linear forwards;
  border-radius: 0 0 $radius $radius;

  &.easy-message__progress-bar--success {
    background-color: $color-success;
  }

  &.easy-message__progress-bar--warning {
    background-color: $progress-warning;
  }

  &.easy-message__progress-bar--danger {
    background-color: $color-danger;
  }

  &.easy-message__progress-bar--info {
    background-color: $brand-blue;
  }

  &.easy-message__progress-bar--text {
    background-color: #c0c0d0;
  }
}

@keyframes easy-progress-shrink {
  from {
    transform: scaleX(1);
  }

  to {
    transform: scaleX(0);
  }
}

/* ========== 过渡动画 ========== */
.easy-message-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.3, 0.64, 1);
}

.easy-message-leave-active {
  transition: all 0.2s ease;
}

.easy-message-enter-from {
  opacity: 0;
  transform: translateY(-12px) scale(0.95);
}

.easy-message-leave-to {
  opacity: 0;
  transform: translateX(30px) scale(0.95);
}

.easy-message-move {
  transition: transform 0.25s ease;
}
</style>
