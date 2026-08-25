<script setup lang="ts">
import type { EndProps } from './end-types'

import EasyForm, { EasyFormItem } from '../../../../form'
import EasyInput from '../../../../input'
import { useEnd } from './use-end'

const props = withDefaults(defineProps<EndProps>(), {
  modelValue: () => ({}),
  disabled: false,
})

const { form, formRef } = useEnd(props)

export type { EndProps } from './end-types'
</script>

<template>
  <div>
    <EasyForm ref="formRef" :model="form" label-width="120px" :disabled="disabled" class="endForm">
      <EasyFormItem label="节点编码" prop="nodeCode">
        <EasyInput v-model="form.nodeCode" :disabled="disabled" />
      </EasyFormItem>
    </EasyForm>
  </div>
</template>

<style scoped src="./end-style.scss" lang="scss"></style>
