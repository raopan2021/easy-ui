<script setup lang="ts">
import { ref } from 'vue'
import EasyForm, { EasyFormItem } from '../../../../form'
import EasyInput from '../../../../input'

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

const form = ref(props.modelValue)
const formRef = ref()
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

<style scoped lang="scss">
.endForm {
  padding: 15px;
}
</style>
