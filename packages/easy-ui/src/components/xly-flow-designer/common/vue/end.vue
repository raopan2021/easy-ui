<script setup lang="ts">
import { ref } from 'vue'
import XlyForm from '../../../xly-form/index'
import XlyFormItem from '../../../xly-form/xly-form-item'
import XlyInput from '../../../xly-input/index'

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
    <XlyForm ref="formRef" :model="form" label-width="120px" :disabled="disabled" class="endForm">
      <XlyFormItem label="节点编码" prop="nodeCode">
        <XlyInput v-model="form.nodeCode" :disabled="disabled" />
      </XlyFormItem>
    </XlyForm>
  </div>
</template>

<style scoped lang="scss">
.endForm {
  padding: 15px;
}
</style>
