<script setup lang="ts">
import { ref } from 'vue'
import XlyForm, { EasyFormItem as XlyFormItem } from '../../../../form'
import XlyInput from '../../../../input'
import XlyRadio, { EasyRadioGroup as XlyRadioGroup } from '../../../../radio'
import XlySelect from '../../../../select'

const props = defineProps({
  modelValue: {
    type: Object,
    default() {
      return {}
    },
  },
  formList: {
    type: Array,
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
  <XlyForm
    ref="nodeExtRef"
    class="nodeExtForm"
    :model="form"
    label-width="100px"
    :disabled="disabled"
    label-position="left"
  >
    <XlyFormItem
      v-for="(item, index) in formList"
      :key="index"
      :label="`${item.label}：`"
      :prop="item.code"
      :rules="[{ required: item.must, message: `${item.label}不能为空`, trigger: ['blur', 'change'] }]"
    >
      <!-- 单行文本 -->
      <XlyInput v-if="item.type === 1" v-model="form[item.code]" placeholder="请输入" />
      <!-- 多行文本 -->
      <XlyInput v-else-if="item.type === 2" v-model="form[item.code]" :rows="2" type="textarea" placeholder="请输入" />
      <!-- 下拉选择 -->
      <XlySelect
        v-else-if="item.type === 3"
        v-model="form[item.code]"
        clearable
        :multiple="item.multiple || false"
        :options="item.dict.map((d: any) => ({ label: d.label, value: d.value }))"
      />
      <!-- Radio / Checkbox -->
      <div v-else-if="item.type === 4">
        <XlyRadioGroup v-if="!item.multiple" v-model="form[item.code]">
          <el-row :gutter="20">
            <el-col v-for="(dItem, dIndex) in item.dict" :key="dIndex" :span="item.dict.length < 3 ? undefined : 8">
              <XlyRadio :label="String(dItem.value)">
                {{ dItem.label }}
              </XlyRadio>
            </el-col>
          </el-row>
        </XlyRadioGroup>
        <el-checkbox-group v-else v-model="form[item.code]">
          <el-row :gutter="20">
            <el-col v-for="(dItem, dIndex) in item.dict" :key="dIndex" :span="item.dict.length < 3 ? undefined : 8">
              <el-checkbox :label="String(dItem.value)">
                {{ dItem.label }}
              </el-checkbox>
            </el-col>
          </el-row>
        </el-checkbox-group>
      </div>
    </XlyFormItem>
  </XlyForm>
</template>

<style scoped lang="scss"></style>
