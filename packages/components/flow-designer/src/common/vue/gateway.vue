<script setup lang="ts">
import { ref, watch } from 'vue'
import XlyForm, { EasyFormItem as XlyFormItem } from '../../../../form'
import XlyInput from '../../../../input'

const props = defineProps({
  modelValue: {
    type: Object,
    default() {
      return {}
    },
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['change'])

const form = ref(props.modelValue)
const formRef = ref()
const nodeInput = ref()

watch(
  () => form,
  (n) => {
    if (n)
      emit('change', n)
  },
  { deep: true },
)

function nodeNameChange() {
  nodeInput.value?.focus?.()
}
</script>

<template>
  <div>
    <XlyForm ref="formRef" :model="form" label-width="120px" :disabled="disabled" class="gatewayForm">
      <XlyFormItem label="节点编码" prop="nodeCode">
        <XlyInput v-model="form.nodeCode" :disabled="disabled" />
      </XlyFormItem>
      <XlyFormItem label="节点名称" prop="nodeName">
        <XlyInput ref="nodeInput" v-model="form.nodeName" :disabled="disabled" @change="nodeNameChange" />
      </XlyFormItem>
    </XlyForm>
  </div>
</template>

<style scoped lang="scss">
.gatewayForm {
  padding: 15px;
}
</style>
