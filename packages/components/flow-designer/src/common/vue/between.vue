<script setup lang="ts">
import type { BetweenEmits, BetweenProps } from './between-types'

import EasyButton from '../../../../button'
import EasyForm, { EasyFormItem } from '../../../../form'
import EasyInput from '../../../../input'
import EasyRadio, { EasyRadioGroup } from '../../../../radio'
import EasySelect from '../../../../select'
import EasyTable from '../../../../table'
import EasyTabs, { EasyTabPane } from '../../../../tabs'
import nodeExtList from './nodeExtList.vue'
import { useBetween } from './use-between'

const props = withDefaults(defineProps<BetweenProps>(), {
  modelValue: () => ({}),
  disabled: false,
  showWays: true,
  nodes: () => [],
  skips: () => [],
})

const emit = defineEmits<BetweenEmits>()

const {
  tabsValue,
  tabsList,
  form,
  buttonList,
  formRef,
  rules,
  listenerColumns,
  listenerTypeOptions,
  filteredNodes,
  setNodeExtRef,
  handleAddRow,
  handleDeleteRow,
  validate,
} = useBetween(props, emit)

defineExpose({ validate })

export type { BetweenEmits, BetweenProps } from './between-types'
</script>

<template>
  <div class="between">
    <EasyForm ref="formRef" class="betweenForm" :model="form" label-width="100px" :rules="rules" :disabled="disabled"
      label-position="left">
      <EasyTabs v-model="tabsValue" type="line">
        <!-- 基础设置 tab -->
        <EasyTabPane label="基础设置" name="1">
          <div class="tabPane">
            <EasyFormItem label="节点编码：" prop="nodeCode">
              <EasyInput v-model="form.nodeCode" :disabled="true" />
            </EasyFormItem>
            <EasyFormItem label="节点名称：" prop="nodeName">
              <EasyInput v-model="form.nodeName" :disabled="disabled" />
            </EasyFormItem>
            <EasyFormItem label="协作方式：" prop="collaborativeWay">
              <EasyRadioGroup v-model="form.collaborativeWay">
                <EasyRadio v-if="form.collaborativeWay === '1' || showWays" label="1">
                  <span class="flex-hc">
                    或签
                    <el-tooltip class="box-item" effect="dark" content="只需一个人审批">
                      <el-icon :size="14" class="ml5"><WarningFilled /></el-icon>
                    </el-tooltip>
                  </span>
                </EasyRadio>
                <EasyRadio v-if="form.collaborativeWay === '2' || showWays" label="2">
                  <span class="flex-hc">
                    票签
                    <el-tooltip class="box-item" effect="dark"
                      content="部分办理人审批，建议选择用户；如果选择角色或者部门等，需自行通过办理人表达式或者监听器，转成具体办理用户">
                      <el-icon :size="14" class="ml5"><WarningFilled /></el-icon>
                    </el-tooltip>
                  </span>
                </EasyRadio>
                <EasyRadio v-if="form.collaborativeWay === '3' || showWays" label="3">
                  <span class="flex-hc">
                    会签
                    <el-tooltip class="box-item" effect="dark"
                      content="所有办理都需要审批，建议选择用户；如果选择角色或者部门等，需自行通过办理人表达式或者监听器，转成具体办理用户">
                      <el-icon :size="14" class="ml5"><WarningFilled /></el-icon>
                    </el-tooltip>
                  </span>
                </EasyRadio>
              </EasyRadioGroup>
            </EasyFormItem>
            <EasyFormItem v-if="form.collaborativeWay === '2'" label="票签占比：" prop="nodeRatio">
              <EasyInput v-model="form.nodeRatio" type="number" placeholder="请输入" />
              <div class="placeholder mt5">
                票签比例范围：(0-100)的值
              </div>
            </EasyFormItem>
            <EasyFormItem label="办理人：" prop="permissionFlag">
              <!-- 自行更换为自己的人员选择组件 -->
              <EasyInput v-model="form.permissionFlag" placeholder="自行更换为自己的人员选择组件" />
              <div class="placeholder mt5">
                tips:自行更换为自己的人员选择组件
              </div>
            </EasyFormItem>
            <EasyFormItem label="驳回节点" prop="formCustom">
              <template #label>
                <span v-if="form.collaborativeWay === '2'" class="mr5" style="color: red">*</span>驳回节点
              </template>
              <EasySelect v-model="form.anyNodeSkip"
                :options="filteredNodes.map((d: any) => ({ label: d.text.value, value: d.id }))" clearable
                style="width: 80%" />
              <div class="placeholder mt5">
                【票签】必须选择驳到指定节点！
              </div>
            </EasyFormItem>
          </div>
        </EasyTabPane>

        <!-- 监听器 tab -->
        <EasyTabPane label="监听器" name="2">
          <div class="listenerItem tabPane">
            <EasyTable :data="form.listenerRows" :columns="listenerColumns" :pagination="false" :show-index="false"
              style="width: 100%">
              <template #col-listenerType="{ row, index }">
                <EasyFormItem :prop="`listenerRows.${index}.listenerType`" :rules="rules.listenerType">
                  <EasySelect v-model="row.listenerType" :options="listenerTypeOptions" placeholder="请选择" />
                </EasyFormItem>
              </template>
              <template #col-listenerPath="{ row, index }">
                <EasyFormItem :prop="`listenerRows.${index}.listenerPath`" :rules="rules.listenerPath">
                  <EasyInput v-model="row.listenerPath" placeholder="请输入" />
                </EasyFormItem>
              </template>
              <template v-if="!disabled" #action="{ index }">
                <EasyButton type="danger" size="small" @click="handleDeleteRow(index)">
                  删除
                </EasyButton>
              </template>
            </EasyTable>
            <EasyButton v-if="!disabled" type="primary" style="margin-top: 10px" @click="handleAddRow">
              增加行
            </EasyButton>
          </div>
        </EasyTabPane>

        <!-- 节点扩展属性 tab（动态生成） -->
        <EasyTabPane v-for="item in tabsList.slice(2)" :key="item.name" :label="item.label" :name="item.name">
          <div class="tabPane">
            <nodeExtList v-if="buttonList[item.name]?.length > 0" :ref="(el) => setNodeExtRef(el, item.name)"
              v-model="form.ext" :form-list="buttonList[item.name]" :disabled="disabled" />
          </div>
        </EasyTabPane>
      </EasyTabs>
    </EasyForm>
  </div>
</template>

<style scoped src="./between-style.scss" lang="scss"></style>
