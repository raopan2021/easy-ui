<script setup lang="ts">
import type { SuperFormEmits, SuperFormProps } from './types'

import EasyCol from '../../col'
import EasyRow from '../../row'
import { useSuperForm } from './use-super-form'

// 保持对外类型导出兼容（原定义在 super-form.vue）
export type { AnyObj, FieldRule, SuperFormProps as Props, SuperField, SuperFormEmits, SuperFormProps } from './types'

const props = withDefaults(defineProps<SuperFormProps>(), {
  layout: 'vertical',
  labelWidth: '100px',
  span: 24,
  size: 'default',
})

const emit = defineEmits<SuperFormEmits>()

// ──── 核心逻辑（数据同步 / 组件映射 / 校验 / 提交 / 重置）────
const {
  formData,
  defaultSpan,
  fieldList,
  errors,
  getFieldLabelWidth,
  getComponent,
  isDualBinding,
  getErrorKey,
  setFieldRef,
  getFieldProps,
  validate,
  validateField,
  handleReset,
  handleSubmit,
} = useSuperForm(props, emit)

// 暴露方法
defineExpose({
  validate,
  validateField,
  resetFields: handleReset,
  clearValidate: (props?: string[]) => {
    if (props) {
      props.forEach(p => delete errors.value[p])
    }
    else {
      errors.value = {}
    }
  },
  submit: handleSubmit,
  getFormData: () => formData.value,
})
</script>

<template>
  <form class="easy-super-form" :class="`easy-super-form--${size}`" @submit.prevent>
    <EasyRow :gutter="20">
      <EasyCol
        v-for="field in fieldList" :key="field.prop" :span="field.span ?? defaultSpan"
        class="easy-super-form__item" :class="[{ 'is-error': errors[getErrorKey(field)] }]"
      >
        <!-- 标签 -->
        <label
          v-if="field.showLabel !== false" class="easy-super-form__label"
          :style="{ width: getFieldLabelWidth(field) }"
        >
          <span v-if="field.required" class="easy-super-form__required">*</span>
          {{ field.label || field.prop }}
        </label>

        <!-- 控件 -->
        <div class="easy-super-form__control">
          <!-- 双绑定组件（如日期范围） -->
          <template v-if="isDualBinding(field)">
            <component
              :is="getComponent(field)" v-bind="getFieldProps(field)"
              :ref="(el: any) => setFieldRef(field.prop, el)" v-model:start="formData[field.startProp!]"
              v-model:end="formData[field.endProp!]"
            />
          </template>
          <!-- 普通组件 -->
          <template v-else>
            <component
              :is="getComponent(field)" v-bind="getFieldProps(field)"
              :ref="(el: any) => setFieldRef(field.prop, el)" v-model="formData[field.prop]"
            >
              <template v-if="field.props?.prefix" #prepend>
                {{ field.props?.prefix }}
              </template>
              <template v-if="field.props?.suffix" #append>
                {{ field.props?.suffix }}
              </template>
            </component>
          </template>

          <!-- 错误信息 -->
          <div v-if="errors[getErrorKey(field)]" class="easy-super-form__error">
            {{ errors[getErrorKey(field)] }}
          </div>
        </div>
      </EasyCol>
    </EasyRow>
  </form>
</template>

<style scoped lang="scss">
.easy-super-form {
  width: 100%;
}

/* 通用 item 样式 */
.easy-super-form__item {
  display: flex;
  flex-direction: row;
  align-items: center;
  margin-bottom: 18px;
  width: 100%;
  box-sizing: border-box;
}

/* 垂直布局 */
.easy-super-form__item--vertical {
  flex-direction: column;
  align-items: flex-start;

  .easy-super-form__label {
    text-align: left;
    margin-bottom: 4px;
  }
}

/* 标签样式 */
.easy-super-form__label {
  flex-shrink: 0;
  margin-right: 8px;
  text-align: right;
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.easy-super-form__required {
  color: var(--el-color-danger);
  margin-right: 2px;
}

.easy-super-form__control {
  flex: 1;
  min-width: 200px;
  max-width: 100%;
}

.easy-super-form__error {
  font-size: 12px;
  color: var(--el-color-danger);
  margin-top: 4px;
  line-height: 1.4;
}

/* 错误状态 */
.easy-super-form__item.is-error :deep(.el-input__wrapper),
.easy-super-form__item.is-error :deep(.el-select__wrapper) {
  box-shadow: 0 0 0 1px #f56c6c inset;
}
</style>
