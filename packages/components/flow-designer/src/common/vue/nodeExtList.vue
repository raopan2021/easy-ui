<script setup lang="ts">
import { ref } from 'vue'
import EasyForm, { EasyFormItem } from '../../../../form'
import EasyInput from '../../../../input'
import EasyRadio, { EasyRadioGroup } from '../../../../radio'
import EasySelect from '../../../../select'

interface ExtField {
  label: string
  code: string
  must: boolean
  type: number
  multiple?: boolean
  dict?: Array<{ label: string, value: string }>
}

const props = defineProps({
  modelValue: {
    type: Object,
    default() {
      return {}
    },
  },
  formList: {
    type: Array as () => ExtField[],
    default() {
      return []
    },
  },
  disabled: {
    type: Boolean,
    default: false,
  },
})

const form = ref(props.modelValue)
const nodeExtRef = ref()

// 表单必填校验
async function validate() {
  let isValid: boolean | null = null
  await nodeExtRef.value?.validate((valid: boolean) => {
    isValid = valid
  })
  return isValid
}

defineExpose({ validate })
</script>

<template>
  <EasyForm
    ref="nodeExtRef"
    class="nodeExtForm"
    :model="form"
    label-width="100px"
    :disabled="disabled"
    label-position="left"
  >
    <EasyFormItem
      v-for="(item, index) in formList"
      :key="index"
      :label="`${item.label}：`"
      :prop="item.code"
      :rules="[{ required: item.must, message: `${item.label}不能为空`, trigger: ['blur', 'change'] }] as any"
    >
      <!-- 单行文本 -->
      <EasyInput v-if="item.type === 1" v-model="form[item.code]" placeholder="请输入" />
      <!-- 多行文本 -->
      <EasyInput v-else-if="item.type === 2" v-model="form[item.code]" :rows="2" type="textarea" placeholder="请输入" />
      <!-- 下拉选择 -->
      <EasySelect
        v-else-if="item.type === 3"
        v-model="form[item.code]"
        clearable
        :multiple="item.multiple || false"
        :options="item.dict!.map((d: any) => ({ label: d.label, value: d.value }))"
      />
      <!-- Radio / Checkbox -->
      <div v-else-if="item.type === 4">
        <EasyRadioGroup v-if="!item.multiple" v-model="form[item.code]">
          <el-row :gutter="20">
            <el-col v-for="(dItem, dIndex) in item.dict!" :key="dIndex" :span="item.dict!.length < 3 ? undefined : 8">
              <EasyRadio :label="String(dItem.value)">
                {{ dItem.label }}
              </EasyRadio>
            </el-col>
          </el-row>
        </EasyRadioGroup>
        <el-checkbox-group v-else v-model="form[item.code]">
          <el-row :gutter="20">
            <el-col v-for="(dItem, dIndex) in item.dict!" :key="dIndex" :span="item.dict!.length < 3 ? undefined : 8">
              <el-checkbox :label="String(dItem.value)">
                {{ dItem.label }}
              </el-checkbox>
            </el-col>
          </el-row>
        </el-checkbox-group>
      </div>
    </EasyFormItem>
  </EasyForm>
</template>

<style scoped lang="scss"></style>
