<script setup lang="ts">
import type { GatewayEmits, GatewayProps } from './gateway-types'

import EasyForm, { EasyFormItem } from '../../../../form'
import EasyInput from '../../../../input'
import { useGateway } from './use-gateway'

const props = withDefaults(defineProps<GatewayProps>(), {
  modelValue: () => ({}),
  disabled: false,
})

const emit = defineEmits<GatewayEmits>()

const { form, formRef, nodeInput, nodeNameChange } = useGateway(props, emit)

export type { GatewayEmits, GatewayProps } from './gateway-types'
</script>

<template>
  <div>
    <EasyForm ref="formRef" :model="form" label-width="120px" :disabled="disabled" class="gatewayForm">
      <EasyFormItem label="节点编码" prop="nodeCode">
        <EasyInput v-model="form.nodeCode" :disabled="disabled" />
      </EasyFormItem>
      <EasyFormItem label="节点名称" prop="nodeName">
        <EasyInput ref="nodeInput" v-model="form.nodeName" :disabled="disabled" @change="nodeNameChange" />
      </EasyFormItem>
    </EasyForm>
  </div>
</template>

<style scoped src="./gateway-style.scss" lang="scss"></style>
