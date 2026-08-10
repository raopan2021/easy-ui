<script setup lang="ts">
import { ref, watch } from 'vue'
import EasyButton from '../../../../button'
import EasyForm, { EasyFormItem } from '../../../../form'
import EasyInput from '../../../../input'
import EasySelect from '../../../../select'
import EasyTable from '../../../../table'
import EasyTabs, { EasyTabPane } from '../../../../tabs'

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

const tabsValue = ref<string | number>('basic')
const form = ref(props.modelValue)
const formRef = ref()
const nodeInput = ref()

// 监听器表格列配置
const listenerColumns = [
  { prop: 'listenerType', name: '类型', width: 160 },
  { prop: 'listenerPath', name: '路径' },
]

// 监听器类型下拉选项
const listenerTypeOptions = [
  { label: '开始', value: 'start' },
  { label: '分派', value: 'assignment' },
  { label: '完成', value: 'finish' },
  { label: '创建', value: 'create' },
]

watch(
  () => form,
  (n) => {
    if (n) {
      emit('change', n)
    }
  },
  { deep: true },
)

function nodeNameChange() {
  nodeInput.value?.focus?.()
}

// 初始化监听器行数据
if (form.value.listenerType) {
  const listenerTypes = form.value.listenerType.split(',')
  const listenerPaths = form.value.listenerPath.split('@@')
  form.value.listenerRows = listenerTypes.map((type: string, index: number) => ({
    listenerType: type,
    listenerPath: listenerPaths[index],
  }))
}

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
              :data="form.listenerRows || []"
              :columns="listenerColumns"
              :pagination="false"
              :show-index="false"
              style="width: 100%"
            >
              <!-- 类型列 -->
              <template #col-listenerType="{ row }">
                <EasySelect
                  v-model="row.listenerType"
                  :options="listenerTypeOptions"
                  placeholder="请选择"
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

<style scoped lang="scss">
.startForm {
  padding: 15px;
}

.listenerPane {
  padding: 15px;
}
</style>
