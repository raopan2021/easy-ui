<script setup lang="ts">
import type { SkipProps } from './skip-types'

import EasyForm, { EasyFormItem } from '../../../../form'
import EasyInput from '../../../../input'
import EasySelect from '../../../../select'
import { useSkip } from './use-skip'

const props = withDefaults(defineProps<SkipProps>(), {
  modelValue: () => ({}),
  disabled: false,
  skipConditionShow: true,
})

const { spelFlag, form, formRef, conditionTypeOptions, changeOper } = useSkip(props)

export type { SkipProps } from './skip-types'
</script>

<template>
  <div>
    <EasyForm ref="formRef" :model="form" label-width="80px" :disabled="disabled" class="skipForm">
      <EasyFormItem v-if="skipConditionShow" label="跳转名称" prop="skipName">
        <EasyInput v-model="form.skipName" placeholder="跳转名称" />
      </EasyFormItem>
      <EasyFormItem label="跳转类型" prop="skipType">
        <EasySelect
          v-model="form.skipType"
          :options="[
            { label: '审批通过', value: 'PASS' },
            { label: '退回', value: 'REJECT' },
          ]"
        />
      </EasyFormItem>
      <EasyFormItem v-if="skipConditionShow" label="跳转条件">
        <div class="conditionRow">
          <EasyInput v-if="!spelFlag" v-model="form.condition" placeholder="条件名" class="conditionName" />
          <EasySelect v-model="form.conditionType" placeholder="请选择条件方式" class="conditionType"
            :class="{ 'is-spel': spelFlag }" :options="conditionTypeOptions" @change="changeOper" />
          <EasyInput v-model="form.conditionValue" placeholder="条件值" class="conditionValue"
            :class="{ 'is-spel': spelFlag }" />
        </div>
        <div class="placeholder mt5">
          跳转条件字段需要与表单中字段名称一致,否则会出现流程异常
        </div>
      </EasyFormItem>
    </EasyForm>
  </div>
</template>

<style scoped src="./skip-style.scss" lang="scss"></style>
