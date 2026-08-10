<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from 'vue'
import XlyButton from '../../../xly-button/index'
import XlyForm from '../../../xly-form/index'
import XlyFormItem from '../../../xly-form/xly-form-item'
import XlyInput from '../../../xly-input/index'
import XlyRadio from '../../../xly-radio/index'
import XlyRadioGroup from '../../../xly-radio/radio-group'
import XlySelect from '../../../xly-select/index'
import XlyTable from '../../../xly-table/index'
import XlyTabs from '../../../xly-tabs/index'
import XlyTabPane from '../../../xly-tabs/xly-tab-pane'
import { getPreviousNodes } from '../js/tool'
import nodeExtList from './nodeExtList.vue'

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
  showWays: {
    type: Boolean,
    default: true,
  },
  nodes: {
    type: Array,
    default() {
      return []
    },
  },
  skips: {
    type: Array,
    default() {
      return []
    },
  },
})

const emit = defineEmits(['update:modelValue'])
const tabsValue = ref('1')
// tabsList 只存动态扩展属性 tab（基础/监听已在模板中硬编码）
const tabsList = ref<{ label: string, name: string }[]>([])
const form = ref(props.modelValue)
const buttonList = ref<Record<string, any[]>>({})
const formRef = ref()

// 用 Map 管理动态 ref
const nodeExtRefs = new Map<string, any>()
function setNodeExtRef(el: any, name: string) {
  if (el)
    nodeExtRefs.set(name, el)
  else nodeExtRefs.delete(name)
}

const rules = reactive({
  nodeRatio: [
    { required: false, message: '请输入', trigger: 'change' },
    {
      pattern: /^(?:[1-9]\d?|0\.\d{1,3}|[1-9]\d?\.\d{1,3})$/,
      message: '请输入(0, 100)的值，最多保留三位小数',
      trigger: ['change', 'blur'],
    },
  ],
  listenerType: [{ required: true, message: '监听器类型不能为空', trigger: 'change' }],
  listenerPath: [{ required: true, message: '监听器路径不能为空', trigger: 'blur' }],
})

// 表格列配置
const listenerColumns = [
  { prop: 'listenerType', name: '类型', width: 160 },
  { prop: 'listenerPath', name: '路径' },
]

// 监听器类型选项
const listenerTypeOptions = [
  { label: '开始', value: 'start' },
  { label: '分派', value: 'assignment' },
  { label: '完成', value: 'finish' },
  { label: '创建', value: 'create' },
]

watch(
  () => form.value,
  (n) => {
    if (n)
      emit('update:modelValue', n)
  },
  { deep: true },
)

// 增加行
function handleAddRow() {
  if (!form.value.listenerRows) {
    form.value.listenerRows = []
  }
  form.value.listenerRows.push({ listenerType: '', listenerPath: '' })
}

// 删除行
function handleDeleteRow(index: number) {
  form.value.listenerRows.splice(index, 1)
}

const filteredNodes = computed(() => {
  const previousNodes = getPreviousNodes(props.nodes, props.skips, form.value.nodeCode)
  return previousNodes.filter((node: any) => !['start', 'serial', 'parallel'].includes(node.type))
})

// 表单必填校验
async function validate(): Promise<void> {
  tabsValue.value = '1'
  await nextTick()
  await new Promise<void>((resolve, reject) => {
    formRef.value?.validate((valid: boolean) => {
      if (valid)
        resolve()
      else reject(new Error('表单校验未通过'))
    })
  })
  await tabsValidate()
}

async function tabsValidate(): Promise<void> {
  const addTabsList = tabsList.value
  if (addTabsList.length === 0)
    return
  for (const e of addTabsList) {
    tabsValue.value = e.name
    await nextTick()
    const extRef = nodeExtRefs.get(e.name)
    if (extRef && !(await extRef.validate())) {
      throw new Error('扩展属性校验未通过')
    }
  }
}

defineExpose({ validate })
</script>

<template>
  <div class="between">
    <XlyForm
      ref="formRef"
      class="betweenForm"
      :model="form"
      label-width="100px"
      :rules="rules"
      :disabled="disabled"
      label-position="left"
    >
      <XlyTabs v-model="tabsValue" type="line">
        <!-- 基础设置 tab -->
        <XlyTabPane label="基础设置" name="1">
          <div class="tabPane">
            <XlyFormItem label="节点编码：" prop="nodeCode">
              <XlyInput v-model="form.nodeCode" :disabled="true" />
            </XlyFormItem>
            <XlyFormItem label="节点名称：" prop="nodeName">
              <XlyInput v-model="form.nodeName" :disabled="disabled" />
            </XlyFormItem>
            <XlyFormItem label="协作方式：" prop="collaborativeWay">
              <XlyRadioGroup v-model="form.collaborativeWay">
                <XlyRadio v-if="form.collaborativeWay === '1' || showWays" label="1">
                  <span class="flex-hc">
                    或签
                    <el-tooltip class="box-item" effect="dark" content="只需一个人审批">
                      <el-icon :size="14" class="ml5"><WarningFilled /></el-icon>
                    </el-tooltip>
                  </span>
                </XlyRadio>
                <XlyRadio v-if="form.collaborativeWay === '2' || showWays" label="2">
                  <span class="flex-hc">
                    票签
                    <el-tooltip
                      class="box-item"
                      effect="dark"
                      content="部分办理人审批，建议选择用户；如果选择角色或者部门等，需自行通过办理人表达式或者监听器，转成具体办理用户"
                    >
                      <el-icon :size="14" class="ml5"><WarningFilled /></el-icon>
                    </el-tooltip>
                  </span>
                </XlyRadio>
                <XlyRadio v-if="form.collaborativeWay === '3' || showWays" label="3">
                  <span class="flex-hc">
                    会签
                    <el-tooltip
                      class="box-item"
                      effect="dark"
                      content="所有办理都需要审批，建议选择用户；如果选择角色或者部门等，需自行通过办理人表达式或者监听器，转成具体办理用户"
                    >
                      <el-icon :size="14" class="ml5"><WarningFilled /></el-icon>
                    </el-tooltip>
                  </span>
                </XlyRadio>
              </XlyRadioGroup>
            </XlyFormItem>
            <XlyFormItem v-if="form.collaborativeWay === '2'" label="票签占比：" prop="nodeRatio">
              <XlyInput v-model="form.nodeRatio" type="number" placeholder="请输入" />
              <div class="placeholder mt5">
                票签比例范围：(0-100)的值
              </div>
            </XlyFormItem>
            <XlyFormItem label="办理人：" prop="permissionFlag">
              <!-- 自行更换为自己的人员选择组件 -->
              <XlyInput v-model="form.permissionFlag" placeholder="自行更换为自己的人员选择组件" />
              <div class="placeholder mt5">
                tips:自行更换为自己的人员选择组件
              </div>
            </XlyFormItem>
            <XlyFormItem label="驳回节点" prop="formCustom">
              <template #label>
                <span v-if="form.collaborativeWay === '2'" class="mr5" style="color: red">*</span>驳回节点
              </template>
              <XlySelect
                v-model="form.anyNodeSkip"
                :options="filteredNodes.map((d) => ({ label: d.text.value, value: d.id }))"
                clearable
                style="width: 80%"
              />
              <div class="placeholder mt5">
                【票签】必须选择驳到指定节点！
              </div>
            </XlyFormItem>
          </div>
        </XlyTabPane>

        <!-- 监听器 tab -->
        <XlyTabPane label="监听器" name="2">
          <div class="listenerItem tabPane">
            <XlyTable
              :data="form.listenerRows"
              :columns="listenerColumns"
              :pagination="false"
              :show-index="false"
              style="width: 100%"
            >
              <template #col-listenerType="{ row, index }">
                <XlyFormItem :prop="`listenerRows.${index}.listenerType`" :rules="rules.listenerType">
                  <XlySelect v-model="row.listenerType" :options="listenerTypeOptions" placeholder="请选择" />
                </XlyFormItem>
              </template>
              <template #col-listenerPath="{ row, index }">
                <XlyFormItem :prop="`listenerRows.${index}.listenerPath`" :rules="rules.listenerPath">
                  <XlyInput v-model="row.listenerPath" placeholder="请输入" />
                </XlyFormItem>
              </template>
              <template v-if="!disabled" #action="{ index }">
                <XlyButton type="danger" size="small" @click="handleDeleteRow(index)">
                  删除
                </XlyButton>
              </template>
            </XlyTable>
            <XlyButton v-if="!disabled" type="primary" style="margin-top: 10px" @click="handleAddRow">
              增加行
            </XlyButton>
          </div>
        </XlyTabPane>

        <!-- 节点扩展属性 tab（动态生成） -->
        <XlyTabPane v-for="item in tabsList.slice(2)" :key="item.name" :label="item.label" :name="item.name">
          <div class="tabPane">
            <nodeExtList
              v-if="buttonList[item.name]?.length > 0"
              :ref="(el) => setNodeExtRef(el, item.name)"
              v-model="form.ext"
              :form-list="buttonList[item.name]"
              :disabled="disabled"
            />
          </div>
        </XlyTabPane>
      </XlyTabs>
    </XlyForm>
  </div>
</template>

<style scoped lang="scss">
.placeholder {
  color: var(--el-text-color-placeholder);
  font-size: 12px;
}

.tabPane {
  padding: 15px;
}

.betweenForm {
  border-top: 0;
}

:deep(.listenerItem) {
  display: inline-block;
  width: 100%;

  .el-form-item__label {
    float: none;
    display: inline-block;
    text-align: left;
  }

  .el-form-item__content {
    margin-left: 0 !important;
  }
}
</style>
