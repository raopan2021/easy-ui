<script setup lang="ts">
import type { StartEmits, StartProps } from './start-types'

import EasyButton from '../../../../button'
import EasyForm, { EasyFormItem } from '../../../../form'
import EasyInput from '../../../../input'
import EasySelect from '../../../../select'
import EasyTable from '../../../../table'
import EasyTabs, { EasyTabPane } from '../../../../tabs'
import { useStart } from './use-start'

const props = withDefaults(defineProps<StartProps>(), {
  modelValue: () => ({}),
  disabled: false,
})

const emit = defineEmits<StartEmits>()

const {
  tabsValue,
  form,
  formRef,
  nodeInput,
  listenerColumns,
  listenerTypeOptions,
  nodeNameChange,
  handleAddRow,
  handleDeleteRow,
} = useStart(props, emit)

export type { StartEmits, StartProps } from './start-types'
</script>

<template>
  <div>
    <EasyTabs v-model="tabsValue" type="line">
      <EasyTabPane name="basic" label="基础设置">
        <EasyForm ref="formRef" :model="form" label-width="100px" :disabled="disabled" class="startForm">
          <slot name="form-item-task-name" :model="form" field="nodeCode">
            <EasyFormItem label="节点编码" prop="nodeCode">
              <EasyInput v-model="form.nodeCode" :disabled="disabled" />
            </EasyFormItem>
          </slot>
          <slot name="form-item-task-name" :model="form" field="nodeName">
            <EasyFormItem label="节点名称" prop="nodeName">
              <EasyInput ref="nodeInput" v-model="form.nodeName" :disabled="disabled" @change="nodeNameChange" />
            </EasyFormItem>
          </slot>
        </EasyForm>
      </EasyTabPane>

      <EasyTabPane name="listener" label="监听器">
        <div class="listenerPane">
          <slot name="form-item-task-listenerType" :model="form" field="listenerType">
            <EasyTable
              :data="form.listenerRows || []" :columns="listenerColumns" :pagination="false"
              :show-index="false" style="width: 100%"
            >
              <!-- 类型列 -->
              <template #col-listenerType="{ row }">
                <EasySelect
                  v-model="row.listenerType" :options="listenerTypeOptions" placeholder="请选择"
                  :disabled="disabled"
                />
              </template>
              <!-- 路径列 -->
              <template #col-listenerPath="{ row }">
                <EasyInput v-model="row.listenerPath" placeholder="请输入" :disabled="disabled" />
              </template>
              <!-- 操作列 -->
              <template v-if="!disabled" #action="{ index }">
                <EasyButton type="danger" size="small" @click="handleDeleteRow(index)">
                  删除
                </EasyButton>
              </template>
            </EasyTable>
            <EasyButton v-if="!disabled" type="primary" style="margin-top: 10px" @click="handleAddRow">
              增加行
            </EasyButton>
          </slot>
        </div>
      </EasyTabPane>
    </EasyTabs>
  </div>
</template>

<style scoped src="./start-style.scss" lang="scss"></style>
