<script setup lang="ts">
import type { DictSelectEmits, DictSelectProps } from './types'

import EasySelect from '../../select'
import { useDictSelect } from './use-dict-select'

defineOptions({ name: 'EasyDictSelect' })

const props = withDefaults(defineProps<DictSelectProps>(), {
  multiple: false,
  clearable: true,
  disabled: false,
  placeholder: '请选择',
  size: 'default',
  maxTagCount: 3,
  filterable: false,
  labelField: 'labelName',
  valueField: 'id',
  returnField: 'id',
  valueFormat: 'array',
  separator: ',',
})

const emit = defineEmits<DictSelectEmits>()

// ──── 字典加载 / 选项归一化 / 事件处理（抽离到 composable）────
const {
  dictList,
  loading,
  loadDict,
  normalizedOptions,
  valueType,
  handleChange,
  handleClear,
} = useDictSelect(props, emit)

// 暴露：外部可通过 ref 调用 reload 重新加载字典
defineExpose({ reload: loadDict, dictList })

// 保持对外类型导出兼容（原定义在 dict-select.vue）
export type { DictOption, DictSelectEmits, DictSelectProps } from './types'
</script>

<template>
  <EasySelect
    :model-value="modelValue as any" :options="normalizedOptions" :placeholder="placeholder"
    :disabled="disabled" :clearable="clearable" :filterable="filterable" :multiple="multiple" :size="size"
    :value-type="valueType" :separator="separator" :value-key="returnField" :label-key="labelField" :loading="loading"
    :max-tag-count="maxTagCount" class="easy-dict-select" v-bind="$attrs" @update:model-value="handleChange"
    @change="handleChange" @clear="handleClear"
  />
</template>

<!-- 组件核心样式（scoped，独立维护在 dict-select-style.scss） -->
<style scoped src="./dict-select-style.scss" lang="scss"></style>
