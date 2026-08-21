<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import type { TableColumn } from '@raopan/easy-ui'
import { Delete, Plus, RefreshRight, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'

interface ParamItem {
  id: number
  key: string
  value: string
  type: 'text' | 'number' | 'boolean' | 'json'
  remark: string
  status: number
  createTime: string
}

const typeMap: Record<string, { label: string, tag: string }> = {
  text: { label: '文本', tag: 'info' },
  number: { label: '数字', tag: 'warning' },
  boolean: { label: '布尔', tag: 'success' },
  json: { label: 'JSON', tag: 'primary' },
}

let idCounter = 100
function genMockData(): ParamItem[] {
  return [
    {
      id: 1,
      key: 'upload.max_size',
      value: '50',
      type: 'number',
      remark: '文件上传大小限制(MB)',
      status: 1,
      createTime: '2026-01-10 09:00:00',
    },
    {
      id: 2,
      key: 'upload.allowed_types',
      value: 'jpg,png,gif,pdf,docx,xlsx',
      type: 'text',
      remark: '允许上传的文件类型',
      status: 1,
      createTime: '2026-01-10 09:30:00',
    },
    {
      id: 3,
      key: 'system.enable_register',
      value: 'false',
      type: 'boolean',
      remark: '是否开放注册',
      status: 1,
      createTime: '2026-01-15 10:00:00',
    },
    {
      id: 4,
      key: 'system.session_timeout',
      value: '1800',
      type: 'number',
      remark: '会话超时时间(秒)',
      status: 1,
      createTime: '2026-01-15 10:30:00',
    },
    {
      id: 5,
      key: 'mail.smtp_config',
      value: '{"host":"smtp.example.com","port":465,"ssl":true}',
      type: 'json',
      remark: '邮件服务器配置',
      status: 1,
      createTime: '2026-02-20 14:00:00',
    },
    {
      id: 6,
      key: 'system.maintenance_mode',
      value: 'false',
      type: 'boolean',
      remark: '维护模式开关',
      status: 0,
      createTime: '2026-03-01 08:00:00',
    },
    {
      id: 7,
      key: 'security.password_min_length',
      value: '8',
      type: 'number',
      remark: '密码最小长度',
      status: 1,
      createTime: '2026-03-15 11:00:00',
    },
    {
      id: 8,
      key: 'security.login_retry_limit',
      value: '5',
      type: 'number',
      remark: '登录重试次数上限',
      status: 1,
      createTime: '2026-04-10 09:00:00',
    },
  ]
}

let allData: ParamItem[] = genMockData()

// --- search ---
const searchForm = reactive({ keyword: '', type: '', status: null as number | null })
function handleSearch() {
  pagination.page = 1
  fetchData()
}
function handleReset() {
  searchForm.keyword = ''
  searchForm.type = ''
  searchForm.status = null
  pagination.page = 1
  fetchData()
}

// --- table ---
const loading = ref(false)
const tableData = ref<ParamItem[]>([])
const selectedIds = ref<number[]>([])
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const columns: TableColumn[] = [
  { prop: 'id', name: 'ID', width: 70 },
  { prop: 'key', name: '参数键', width: 200 },
  { prop: 'value', name: '参数值', minWidth: 180 },
  { prop: 'type', name: '类型', width: 90 },
  { prop: 'remark', name: '备注', minWidth: 150 },
  { prop: 'status', name: '状态', width: 90 },
  { prop: 'createTime', name: '创建时间', width: 170 },
]

function handleSelectionChange(rows: ParamItem[]) {
  selectedIds.value = rows.map(r => r.id)
}

function fetchData() {
  loading.value = true
  setTimeout(() => {
    let filtered = [...allData]
    if (searchForm.keyword) {
      const kw = searchForm.keyword.toLowerCase()
      filtered = filtered.filter(r => r.key.toLowerCase().includes(kw))
    }
    if (searchForm.type)
      filtered = filtered.filter(r => r.type === searchForm.type)
    if (searchForm.status !== null)
      filtered = filtered.filter(r => r.status === searchForm.status)
    pagination.total = filtered.length
    tableData.value = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize)
    loading.value = false
  }, 200)
}

function handleToggleStatus(row: ParamItem, val: boolean) {
  row.status = val ? 1 : 0
  const item = allData.find(r => r.id === row.id)
  if (item)
    item.status = row.status
  ElMessage.success(`${val ? '启用' : '禁用'}成功`)
}

// --- dialog ---
const formRef = ref<FormInstance>()
const dialog = reactive({
  visible: false,
  isEdit: false,
  loading: false,
  form: { id: 0, key: '', value: '', type: 'text', numberValue: 0, boolValue: false, remark: '', status: 1 },
})

const formRules: FormRules = {
  key: [{ required: true, message: '请输入参数键', trigger: 'blur' }],
  type: [{ required: true, message: '请选择类型', trigger: 'change' }],
  value: [{ required: true, message: '请输入参数值', trigger: 'blur' }],
}

function onTypeChange() {
  if (dialog.form.type === 'number')
    dialog.form.value = String(dialog.form.numberValue)
  else if (dialog.form.type === 'boolean')
    dialog.form.value = String(dialog.form.boolValue)
  else dialog.form.value = ''
}

function getInitForm() {
  return { id: 0, key: '', value: '', type: 'text' as const, numberValue: 0, boolValue: false, remark: '', status: 1 }
}

function handleAdd() {
  dialog.isEdit = false
  Object.assign(dialog.form, getInitForm())
  dialog.visible = true
}

function handleEdit(row: ParamItem) {
  dialog.isEdit = true
  dialog.form.id = row.id
  dialog.form.key = row.key
  dialog.form.type = row.type
  dialog.form.remark = row.remark
  dialog.form.status = row.status
  if (row.type === 'number') {
    dialog.form.value = row.value
    dialog.form.numberValue = Number(row.value)
  }
  else if (row.type === 'boolean') {
    dialog.form.value = row.value
    dialog.form.boolValue = row.value === 'true'
  }
  else {
    dialog.form.value = row.value
  }
  dialog.visible = true
}

function handleDialogClose() {
  formRef.value?.resetFields()
  Object.assign(dialog.form, getInitForm())
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid)
    return
  dialog.loading = true
  setTimeout(() => {
    // 根据类型转换 value
    let valueStr = dialog.form.value
    if (dialog.form.type === 'number')
      valueStr = String(dialog.form.numberValue)
    else if (dialog.form.type === 'boolean')
      valueStr = String(dialog.form.boolValue)

    const entry: ParamItem = {
      id: dialog.isEdit ? dialog.form.id : ++idCounter,
      key: dialog.form.key,
      value: valueStr,
      type: dialog.form.type as ParamItem['type'],
      remark: dialog.form.remark,
      status: dialog.form.status,
      createTime: dialog.isEdit
        ? allData.find(r => r.id === dialog.form.id)?.createTime || ''
        : new Date().toLocaleString('zh-CN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
          }),
    }

    if (dialog.isEdit) {
      const idx = allData.findIndex(r => r.id === dialog.form.id)
      if (idx !== -1)
        allData[idx] = entry
      ElMessage.success('编辑成功')
    }
    else {
      allData.unshift(entry)
      ElMessage.success('新增成功')
    }
    dialog.visible = false
    dialog.loading = false
    fetchData()
  }, 300)
}

function handleDelete(row: ParamItem) {
  allData = allData.filter(r => r.id !== row.id)
  ElMessage.success('删除成功')
  fetchData()
}

async function handleBatchDelete() {
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 条？`, '批量删除', { type: 'warning' })
  }
  catch {
    return
  }
  allData = allData.filter(r => !selectedIds.value.includes(r.id))
  ElMessage.success('批量删除成功')
  selectedIds.value = []
  fetchData()
}

onMounted(() => fetchData())
</script>

<template>
  <div class="system-page">
    <div class="page-header">
      <h2 class="page-header__title">
        参数配置
      </h2>
      <p class="page-header__desc">
        管理系统的全局参数配置，支持文本、数字、布尔、JSON 等多种类型
      </p>
    </div>

    <div class="search-bar">
      <EasyInput
        v-model="searchForm.keyword"
        placeholder="搜索参数键"
        clearable
        style="width: 220px"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      />
      <EasySelect
        v-model="searchForm.type"
        placeholder="参数类型"
        clearable
        :options="[{ label: '文本', value: 'text' }, { label: '数字', value: 'number' }, { label: '布尔', value: 'boolean' }, { label: 'JSON', value: 'json' }]"
        style="width: 130px"
        @change="handleSearch"
      />
      <EasySelect
        v-model="searchForm.status"
        placeholder="状态"
        clearable
        :options="[{ label: '启用', value: 1 }, { label: '禁用', value: 0 }]"
        style="width: 120px"
        @change="handleSearch"
      />
      <EasyButton type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon>查询
      </EasyButton>
      <EasyButton @click="handleReset">
        <el-icon><RefreshRight /></el-icon>重置
      </EasyButton>
    </div>

    <div class="action-bar">
      <EasyButton type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>新增参数
      </EasyButton>
      <EasyButton type="danger" :disabled="!selectedIds.length" @click="handleBatchDelete">
        <el-icon><Delete /></el-icon>批量删除
      </EasyButton>
    </div>

    <EasyTable
      v-loading="loading"
      :data="tableData"
      :columns="columns"
      selection-mode="multiple"
      stripe
      border
      :pagination="true"
      :total="pagination.total"
      :page="pagination.page"
      :page-size="pagination.pageSize"
      :page-size-options="[10, 20, 50, 100]"
      action-label="操作"
      :action-width="160"
      action-fixed="right"
      @selection-change="handleSelectionChange"
      @page-change="(p: number) => { pagination.page = p; fetchData() }"
      @page-size-change="(s: number) => { pagination.pageSize = s; fetchData() }"
    >
      <template #col-key="{ row }">
        <code class="param-key">{{ row.key }}</code>
      </template>
      <template #col-value="{ row }">
        <template v-if="row.type === 'boolean'">
          <EasyTag :type="row.value === 'true' ? 'success' : 'danger'" size="small">
            {{
              row.value === 'true' ? '是' : '否'
            }}
          </EasyTag>
        </template>
        <template v-else-if="row.type === 'json'">
          <el-tooltip :content="row.value" placement="top" :show-after="300">
            <span class="param-value">{{ row.value.slice(0, 40) }}{{ row.value.length > 40 ? '...' : '' }}</span>
          </el-tooltip>
        </template>
        <template v-else>
          <span>{{ row.value }}</span>
        </template>
      </template>
      <template #col-type="{ row }">
        <EasyTag :type="typeMap[row.type]?.tag" size="small">
          {{ typeMap[row.type]?.label }}
        </EasyTag>
      </template>
      <template #col-remark="{ row }">
        <span style="color: var(--el-text-color-secondary); font-size: 13px">{{ row.remark || '-' }}</span>
      </template>
      <template #col-status="{ row }">
        <EasySwitch :model-value="row.status === 1" @change="(val: boolean) => handleToggleStatus(row, val)" />
      </template>
      <template #action="{ row }">
        <EasyButton link type="primary" size="small" @click="handleEdit(row)">
          编辑
        </EasyButton>
        <el-popconfirm title="确定删除？" @confirm="handleDelete(row)">
          <template #reference>
            <EasyButton link type="danger" size="small">
              删除
            </EasyButton>
          </template>
        </el-popconfirm>
      </template>
    </EasyTable>

    <el-dialog
      v-model="dialog.visible"
      :title="dialog.isEdit ? '编辑参数' : '新增参数'"
      width="540px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="dialog.form" :rules="formRules" label-width="90px">
        <el-form-item label="参数键" prop="key">
          <EasyInput v-model="dialog.form.key" placeholder="如: upload.max_size" maxlength="50" />
        </el-form-item>
        <el-form-item label="参数类型" prop="type">
          <EasySelect
            v-model="dialog.form.type"
            placeholder="请选择类型"
            :options="[{ label: '文本', value: 'text' }, { label: '数字', value: 'number' }, { label: '布尔', value: 'boolean' }, { label: 'JSON', value: 'json' }]"
            @change="onTypeChange"
          />
        </el-form-item>
        <el-form-item label="参数值" prop="value">
          <template v-if="dialog.form.type === 'number'">
            <el-input-number v-model="dialog.form.numberValue" style="width: 100%" />
          </template>
          <template v-else-if="dialog.form.type === 'boolean'">
            <EasySwitch v-model="dialog.form.boolValue" active-text="true" inactive-text="false" />
          </template>
          <template v-else-if="dialog.form.type === 'json'">
            <EasyInput v-model="dialog.form.value" type="textarea" :rows="4" placeholder="{&quot;key&quot;: &quot;value&quot;}" />
          </template>
          <template v-else>
            <EasyInput v-model="dialog.form.value" placeholder="请输入参数值" />
          </template>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <EasyInput v-model="dialog.form.remark" type="textarea" :rows="2" placeholder="参数说明（选填）" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <EasySwitch v-model="dialog.form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <EasyButton @click="dialog.visible = false">
          取消
        </EasyButton>
        <EasyButton type="primary" :loading="dialog.loading" @click="handleSubmit">
          确定
        </EasyButton>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
.system-page {
  padding: 8px 0 40px;
}
.page-header {
  margin-bottom: 24px;
  .page-header__title {
    font-size: 22px;
    font-weight: 700;
    margin: 0 0 6px;
    color: var(--el-text-color-primary);
  }
  .page-header__desc {
    font-size: 14px;
    color: var(--el-text-color-secondary);
    margin: 0;
  }
}
.search-bar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  align-items: center;
  margin-bottom: 16px;
}
.action-bar {
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 16px;
}
.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
.param-key {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 13px;
  color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
  padding: 2px 6px;
  border-radius: 4px;
}
.param-value {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 12px;
  color: var(--el-text-color-regular);
}
</style>
