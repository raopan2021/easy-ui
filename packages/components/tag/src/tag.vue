<script setup lang="ts">
import type { TagEmits } from './tag'

import { computed, ref } from 'vue'

import { tagProps } from './tag'

defineOptions({ name: 'EasyTag' })

const props = defineProps(tagProps)
const emit = defineEmits<TagEmits>()

const visible = ref(true)

const tagClass = computed(() => [
  `easy-tag--${props.type}`,
  `easy-tag--${props.size}`,
  `easy-tag--${props.effect}`,
  {
    'is-round': props.round,
    'is-closable': props.closable,
    'is-clickable': props.clickable && !props.disabled,
    'is-disabled': props.disabled,
  },
])

const tagStyle = computed(() => {
  if (!props.color)
    return {}
  // 自定义颜色：根据 effect 生成相应样式
  const color = props.color
  if (props.effect === 'dark') {
    return {
      backgroundColor: color,
      borderColor: color,
      color: '#fff',
    }
  }
  if (props.effect === 'plain') {
    return {
      backgroundColor: 'transparent',
      borderColor: color,
      color,
    }
  }
  // light
  return {
    backgroundColor: `${color}1a`,
    borderColor: `${color}40`,
    color,
  }
})

function handleClick(e: MouseEvent) {
  if (props.disabled)
    return
  if (props.clickable) {
    emit('click', e)
  }
}

function handleClose(e: MouseEvent) {
  if (props.disabled)
    return
  emit('close', e)
  visible.value = false
}

/** 重置显示状态（外部调用） */
function show() {
  visible.value = true
}

defineExpose({ show })
</script>

<template>
  <span v-if="visible" class="easy-tag" :class="tagClass" :style="tagStyle" @click="handleClick">
    <!-- 前置图标 -->
    <span v-if="icon" class="easy-tag__icon">
      <el-icon>
        <component :is="icon" />
      </el-icon>
    </span>

    <!-- 标签文字 -->
    <span class="easy-tag__text">
      <slot />
    </span>

    <!-- 关闭按钮 -->
    <span v-if="closable" class="easy-tag__close" @click.stop="handleClose">
      <svg
        viewBox="0 0 24 24"
        width="1em"
        height="1em"
        fill="none"
        stroke="currentColor"
        stroke-width="2.5"
        stroke-linecap="round"
      >
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    </span>
  </span>
</template>

<style scoped lang="scss">
@use 'sass:color';
@use '../../../easy-ui/src/styles/tokens' as *;

/* ========== 设计令牌 ========== */
$radius: 6px;
$radius-round: 100px;
$transition: all 0.2s ease;

/* ========== 类型色板 ========== */
$default-text: $text-regular;
$default-bg: $tag-default-bg;
$default-dark-bg: $text-secondary;

/* ========== 基础样式 ========== */
.easy-tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0 10px;
  height: 28px;
  font-size: 13px;
  font-weight: 500;
  line-height: 1;
  border-radius: $radius;
  border: 1px solid transparent;
  transition: $transition;
  white-space: nowrap;
  vertical-align: middle;
  box-sizing: border-box;
  cursor: default;
  user-select: none;

  &.is-round {
    border-radius: $radius-round;
  }

  &.is-clickable {
    cursor: pointer;
  }

  &.is-disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* -------- 尺寸 -------- */
  &.easy-tag--large {
    height: 34px;
    font-size: 14px;
    padding: 0 14px;
    gap: 5px;
  }

  &.easy-tag--small {
    height: 22px;
    font-size: 12px;
    padding: 0 7px;
    gap: 3px;
  }

  /* ==================== default ==================== */
  &.easy-tag--default {
    &.easy-tag--light {
      color: $default-text;
      background-color: $default-bg;
      border-color: var(--el-border-color);

      &.is-clickable:hover {
        background-color: color.adjust($default-bg, $lightness: -4%);
      }
    }

    &.easy-tag--plain {
      color: $default-text;
      background-color: transparent;
      border-color: var(--el-border-color);

      &.is-clickable:hover {
        background-color: $default-bg;
      }
    }

    &.easy-tag--dark {
      color: var(--el-color-white);
      background-color: $default-dark-bg;
      border-color: $default-dark-bg;

      &.is-clickable:hover {
        background-color: color.adjust($default-dark-bg, $lightness: -8%);
        border-color: color.adjust($default-dark-bg, $lightness: -8%);
      }
    }

    .easy-tag__close {
      color: color.adjust($default-text, $lightness: 10%);

      &:hover {
        color: $default-text;
        background-color: var(--el-fill-color-light);
      }
    }
  }

  /* ==================== primary ==================== */
  &.easy-tag--primary {
    &.easy-tag--light {
      color: var(--el-color-primary);
      background-color: var(--el-fill-color-light);
      border-color: var(--el-border-color-lighter);

      &.is-clickable:hover {
        background-color: rgba(79, 110, 247, 0.18);
      }
    }

    &.easy-tag--plain {
      color: var(--el-color-primary);
      background-color: transparent;
      border-color: var(--el-color-primary);

      &.is-clickable:hover {
        background-color: var(--el-fill-color-light);
      }
    }

    &.easy-tag--dark {
      color: var(--el-color-white);
      background-color: var(--el-color-primary);
      border-color: var(--el-color-primary);

      &.is-clickable:hover {
        background-color: var(--el-color-primary-dark-2, #2e4cc7);
        border-color: var(--el-color-primary-dark-2, #2e4cc7);
      }
    }

    .easy-tag__close {
      color: color-mix(in srgb, var(--el-color-primary) 70%, transparent);

      &:hover {
        color: var(--el-color-primary);
        background-color: color-mix(in srgb, var(--el-color-primary) 12%, transparent);
      }
    }
  }

  /* ==================== success ==================== */
  &.easy-tag--success {
    &.easy-tag--light {
      color: var(--el-color-success);
      background-color: var(--el-fill-color-light);
      border-color: var(--el-border-color-lighter);

      &.is-clickable:hover {
        background-color: rgba(52, 199, 89, 0.18);
      }
    }

    &.easy-tag--plain {
      color: var(--el-color-success);
      background-color: transparent;
      border-color: var(--el-color-success);

      &.is-clickable:hover {
        background-color: var(--el-fill-color-light);
      }
    }

    &.easy-tag--dark {
      color: var(--el-color-white);
      background-color: var(--el-color-success);
      border-color: var(--el-color-success);

      &.is-clickable:hover {
        background-color: var(--el-color-success-dark-2, #067948);
        border-color: var(--el-color-success-dark-2, #067948);
      }
    }

    .easy-tag__close {
      color: color-mix(in srgb, var(--el-color-success) 70%, transparent);

      &:hover {
        color: var(--el-color-success);
        background-color: color-mix(in srgb, var(--el-color-success) 12%, transparent);
      }
    }
  }

  /* ==================== warning ==================== */
  &.easy-tag--warning {
    &.easy-tag--light {
      color: var(--el-color-warning);
      background-color: var(--el-fill-color-light);
      border-color: var(--el-border-color-lighter);

      &.is-clickable:hover {
        background-color: rgba(245, 166, 35, 0.18);
      }
    }

    &.easy-tag--plain {
      color: var(--el-color-warning);
      background-color: transparent;
      border-color: var(--el-color-warning);

      &.is-clickable:hover {
        background-color: var(--el-fill-color-light);
      }
    }

    &.easy-tag--dark {
      color: var(--el-color-white);
      background-color: var(--el-color-warning);
      border-color: var(--el-color-warning);

      &.is-clickable:hover {
        background-color: var(--el-color-warning-dark-2, #a77707);
        border-color: var(--el-color-warning-dark-2, #a77707);
      }
    }

    .easy-tag__close {
      color: color-mix(in srgb, var(--el-color-warning) 70%, transparent);

      &:hover {
        color: var(--el-color-warning);
        background-color: color-mix(in srgb, var(--el-color-warning) 12%, transparent);
      }
    }
  }

  /* ==================== danger ==================== */
  &.easy-tag--danger {
    &.easy-tag--light {
      color: var(--el-color-danger);
      background-color: var(--el-fill-color-light);
      border-color: var(--el-border-color-lighter);

      &.is-clickable:hover {
        background-color: rgba(255, 59, 48, 0.18);
      }
    }

    &.easy-tag--plain {
      color: var(--el-color-danger);
      background-color: transparent;
      border-color: var(--el-color-danger);

      &.is-clickable:hover {
        background-color: var(--el-fill-color-light);
      }
    }

    &.easy-tag--dark {
      color: var(--el-color-white);
      background-color: var(--el-color-danger);
      border-color: var(--el-color-danger);

      &.is-clickable:hover {
        background-color: var(--el-color-danger-dark-2, #b83125);
        border-color: var(--el-color-danger-dark-2, #b83125);
      }
    }

    .easy-tag__close {
      color: color-mix(in srgb, var(--el-color-danger) 70%, transparent);

      &:hover {
        color: var(--el-color-danger);
        background-color: color-mix(in srgb, var(--el-color-danger) 12%, transparent);
      }
    }
  }

  /* ==================== info ==================== */
  &.easy-tag--info {
    &.easy-tag--light {
      color: var(--el-color-info);
      background-color: var(--el-fill-color-light);
      border-color: var(--el-border-color-lighter);

      &.is-clickable:hover {
        background-color: rgba(142, 142, 160, 0.18);
      }
    }

    &.easy-tag--plain {
      color: var(--el-color-info);
      background-color: transparent;
      border-color: var(--el-color-info);

      &.is-clickable:hover {
        background-color: var(--el-fill-color-light);
      }
    }

    &.easy-tag--dark {
      color: var(--el-color-white);
      background-color: var(--el-color-info);
      border-color: var(--el-color-info);

      &.is-clickable:hover {
        background-color: var(--el-color-info-dark-2, #727279);
        border-color: var(--el-color-info-dark-2, #727279);
      }
    }

    .easy-tag__close {
      color: color-mix(in srgb, var(--el-color-info) 70%, transparent);

      &:hover {
        color: var(--el-color-info);
        background-color: color-mix(in srgb, var(--el-color-info) 12%, transparent);
      }
    }
  }
}

/* ========== 图标 ========== */
.easy-tag__icon {
  display: inline-flex;
  align-items: center;
  font-size: 1em;
  flex-shrink: 0;
}

/* ========== 文字 ========== */
.easy-tag__text {
  line-height: 1;
}

/* ========== 关闭按钮 ========== */
.easy-tag__close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  font-size: 10px;
  cursor: pointer;
  transition: $transition;
  flex-shrink: 0;
  margin-left: 2px;

  .easy-tag--small & {
    width: 14px;
    height: 14px;
    font-size: 9px;
  }

  .easy-tag--large & {
    width: 18px;
    height: 18px;
    font-size: 11px;
  }
}
</style>

<style lang="scss">
/* ========== Dark Mode ========== */
html.dark .easy-tag--default.easy-tag--light {
  color: var(--el-text-color-secondary);
  background-color: var(--el-fill-color);
  border-color: var(--el-border-color);
}
html.dark .easy-tag--default.easy-tag--dark {
  background-color: var(--el-fill-color);
  border-color: var(--el-fill-color);
}
html.dark .easy-tag--default.easy-tag--plain {
  color: var(--el-text-color-secondary);
  border-color: var(--el-border-color);
}
</style>
