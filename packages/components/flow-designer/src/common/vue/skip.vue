<script setup lang="ts">
import { ref, watch } from 'vue'
import EasyForm, { EasyFormItem } from '../../../../form'
import EasyInput from '../../../../input'
import EasySelect from '../../../../select'

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
  skipConditionShow: {
    type: Boolean,
    default: true,
  },
})

const spelFlag = ref(false)
const form = ref(props.modelValue)
const formRef = ref()

const conditionTypeOptions = [
  { label: '默认', value: 'default' },
  { label: 'spel', value: 'spel' },
  { label: '大于', value: 'gt' },
  { label: '大于等于', value: 'ge' },
  { label: '等于', value: 'eq' },
  { label: '不等于', value: 'ne' },
  { label: '小于', value: 'lt' },
  { label: '小于等于', value: 'le' },
  { label: '包含', value: 'like' },
  { label: '不包含', value: 'notLike' },
]

watch(
  () => form,
  (n) => {
    const v = n.value
    if (v.conditionType) {
      let skipCondition = `${v.conditionType}@@`
      if (!/^spel/.test(v.conditionType) && !/^default/.test(v.conditionType)) {
        skipCondition = `${skipCondition + (v.condition ? v.condition : '')}|`
      }
      v.skipCondition = skipCondition + (v.conditionValue ? v.conditionValue : '')
    }
  },
  { deep: true },
)

function changeOper(obj: string) {
  spelFlag.value = obj === 'spel' || obj === 'default'
}

if (props.modelValue?.conditionType === 'spel' || props.modelValue?.conditionType === 'default') {
  spelFlag.value = true
}
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
          <EasySelect
            v-model="form.conditionType"
            placeholder="请选择条件方式"
            class="conditionType"
            :class="{ 'is-spel': spelFlag }"
            :options="conditionTypeOptions"
            @change="changeOper"
          />
          <EasyInput
            v-model="form.conditionValue"
            placeholder="条件值"
            class="conditionValue"
            :class="{ 'is-spel': spelFlag }"
          />
        </div>
        <div class="placeholder mt5">
          跳转条件字段需要与表单中字段名称一致,否则会出现流程异常
        </div>
      </EasyFormItem>
    </EasyForm>
  </div>
</template>

<style scoped lang="scss">
.skipForm {
  padding: 15px;
}

.placeholder {
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}

.conditionRow {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;

  .conditionName {
    width: 30%;
  }

  .conditionType {
    width: 25%;
    &.is-spel {
      width: 18%;
    }
  }

  .conditionValue {
    flex: 1;
    min-width: 0;
    &.is-spel {
      flex: 2;
    }
  }
}
</style>
