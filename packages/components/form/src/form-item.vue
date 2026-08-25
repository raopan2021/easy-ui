<script setup lang="ts">
import type { FormItemProps } from './types'
import { useFormItem } from './use-form-item'

// 保持对外类型导出兼容（原定义在 form-item.vue）
export type { FormItemProps } from './types'

const props = withDefaults(defineProps<FormItemProps>(), {
  label: '',
  prop: '',
  rules: undefined,
  required: false,
  msg: undefined,
})

// ──── 核心逻辑（必填规则合并 / 字段注册 / 错误态 / 栅格 / 懒校验 / provide）────
const { errorMessage, isRequired, labelWidth, labelPosition, itemStyle } = useFormItem(props)
</script>

<template>
  <div
    class="easy-form-item"
    :class="{
      'is-error': !!errorMessage,
      'is-required': isRequired,
      'is-label-top': labelPosition === 'top',
      'is-no-label': !label && labelPosition === 'top',
    }"
    :style="itemStyle"
  >
    <label v-if="label" class="easy-form-item__label" :style="{ width: labelWidth || undefined }">
      <span class="easy-form-item__label-text">{{ label }}</span>
    </label>
    <div class="easy-form-item__content">
      <div class="easy-form-item__control">
        <slot />
      </div>
      <Transition name="easy-form-error-fade">
        <div v-if="errorMessage" class="easy-form-item__error">
          {{ errorMessage }}
        </div>
      </Transition>
      <div v-if="$slots.tip && !errorMessage" class="easy-form-item__tip">
        <slot name="tip" />
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
$transition: all 0.2s ease;

.easy-form-item {
  display: flex;
  align-items: flex-start;
  width: 100%;
  margin-bottom: 20px;
  min-height: 32px;

  // label 在顶部模式
  &.is-label-top {
    flex-direction: column;

    .easy-form-item__label {
      width: 100% !important;
      padding-top: 0;
      padding-bottom: 8px;
      padding-right: 0;
      text-align: left;
    }

    .easy-form-item__content {
      width: 100%;
    }

    // 无 label 时，补上 label 占位高度，使控件与其他有 label 的表单项对齐
    &.is-no-label .easy-form-item__content {
      padding-top: calc(14px * 1.4 + 8px);
    }
  }

  &.is-error {
    :deep(.easy-input__wrapper) {
      border-color: var(--el-color-danger) !important;
      box-shadow: 0 0 0 1px var(--el-color-danger) inset !important;
    }
    :deep(.easy-select .easy-select__wrapper) {
      border-color: var(--el-color-danger) !important;
      box-shadow: 0 0 0 1px var(--el-color-danger) inset !important;
    }
  }

  &.is-required {
    .easy-form-item__label-text::before {
      content: '*';
      color: var(--el-color-danger);
      margin-right: 4px;
    }
  }
}

.easy-form-item__label {
  flex-shrink: 0;
  padding-top: 6px;
  text-align: right;
  padding-right: 12px;
  box-sizing: border-box;
}

.easy-form-item__label-text {
  font-size: 14px;
  color: var(--el-text-color-primary);
  font-weight: 500;
  line-height: 1.4;
}

.easy-form-item__content {
  flex: 1;
  min-width: 0;
  position: relative;
  padding-bottom: 0;
  display: flex;
  align-items: center;
  min-height: 36px;
}

.easy-form-item__control {
  width: 100%;
}

.easy-form-item__error {
  font-size: 12px;
  color: var(--el-color-danger);
  line-height: 1.4;
  margin-top: 4px;
  word-break: break-all;
  position: absolute;
  left: 0;
  top: 100%;
  z-index: 1;
}

.easy-form-item__tip {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  line-height: 1.4;
  margin-top: 4px;
}

.easy-form-error-fade-enter-active,
.easy-form-error-fade-leave-active {
  transition: opacity 0.2s ease;
}
.easy-form-error-fade-enter-from,
.easy-form-error-fade-leave-to {
  opacity: 0;
}
</style>

<style lang="scss">
/* ========== Dark Mode ========== */
html.dark .easy-form-item__label {
  color: var(--el-text-color-regular);
}
html.dark .easy-form-item .label-desc {
  color: var(--el-text-color-placeholder);
}
html.dark .is-required .easy-form-item__label::before {
  color: var(--el-color-danger);
}
</style>
