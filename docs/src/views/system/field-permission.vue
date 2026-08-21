<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import type { TableColumn } from '@raopan/easy-ui'
import { Delete, Plus, RefreshRight, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'

interface FieldRuleItem {
  id: number
  tableName: string
  fieldName: string
  fieldLabel: string
  permType: 'visible' | 'editable' | 'hidden'
  status: number
  createTime: string
}

const permTypeMap: Record<string, { label: string, tag: string }> = {
  visible: { label: '可见', tag: 'primary' },
  editable: { label: '可编辑', tag: 'warning' },
  hidden: { label: '隐藏', tag: 'danger' },
}

const tableOptions = ['sys_user', 'sys_role', 'sys_dept', 'sys_menu', 'biz_order', 'biz_customer']

let idCounter = 100
function genMockData(): FieldRuleItem[] {
  return [
    {
      id: 1,
      tableName: 'sys_user',
      fieldName: 'password',
      fieldLabel: '密码',
      permType: 'hidden',
      status: 1,
      createTime: '2026-01-15 09:00:00',
    },
    {
      id: 2,
      tableName: 'sys_user',
      fieldName: 'phone',
      fieldLabel: '手机号',
      permType: 'visible',
      status: 1,
      createTime: '2026-01-15 09:30:00',
    },
    {
      id: 3,
      tableName: 'sys_user',
      fieldName: 'email',
      fieldLabel: '邮箱',
      permType: 'editable',
      status: 1,
      createTime: '2026-01-15 10:00:00',
    },
    {
      id: 4,
      tableName: 'sys_user',
      fieldName: 'salary',
      fieldLabel: '薪资',
      permType: 'hidden',
      status: 1,
      createTime: '2026-01-20 14:00:00',
    },
    {
      id: 5,
      tableName: 'biz_order',
      fieldName: 'total_amount',
      fieldLabel: '订单总额',
      permType: 'visible',
      status: 1,
      createTime: '2026-02-10 11:00:00',
    },
    {
      id: 6,
      tableName: 'biz_order',
      fieldName: 'cost_price',
      fieldLabel: '成本价',
      permType: 'hidden',
      status: 1,
      createTime: '2026-02-10 11:30:00',
    },
    {
      id: 7,
      tableName: 'biz_customer',
      fieldName: 'id_card',
      fieldLabel: '身份证号',
      permType: 'hidden',
      status: 1,
      createTime: '2026-03-05 15:00:00',
    },
    {
      id: 8,
      tableName: 'biz_customer',
      fieldName: 'contact_name',
      fieldLabel: '联系人',
      permType: 'editable',
      status: 0,
      createTime: '2026-03-05 15:30:00',
    },
  ]
}

let allData: FieldRuleItem[] = genMockData()

// --- search ---
const searchForm = reactive({ keyword: '', tableName: '', permType: '' })
function handleSearch() {
  pagination.page = 1
  fetchData()
}
function handleReset() {
  searchForm.keyword = ''
  searchForm.tableName = ''
  searchForm.permType = ''
  pagination.page = 1
  fetchData()
}

// --- table ---
const loading = ref(false)
const tableData = ref<FieldRuleItem[]>([])
const selectedIds = ref<number[]>([])
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const columns: TableColumn[] = [
  { prop: 'id', name: 'ID', width: 70 },
  { prop: 'tableName', name: '数据表', width: 180 },
  { prop: 'fieldName', name: '字段名', width: 160 },
  { prop: 'fieldLabel', name: '字段说明', minWidth: 140 },
  { prop: 'permType', name: '权限类型', width: 110 },
  { prop: 'status', name: '状态', width: 90 },
  { prop: 'createTime', name: '创建时间', width: 170 },
]

function handleSelectionChange(rows: FieldRuleItem[]) {
  selectedIds.value = rows.map(r => r.id)
}

function fetchData() {
  loading.value = true
  setTimeout(() => {
    let filtered = [...allData]
    if (searchForm.keyword) {
      const kw = searchForm.keyword.toLowerCase()
      filtered = filtered.filter(r => r.fieldName.includes(kw) || r.fieldLabel.includes(kw))
    }
    if (searchForm.tableName)
      filtered = filtered.filter(r => r.tableName === searchForm.tableName)
    if (searchForm.permType)
      filtered = filtered.filter(r => r.permType === searchForm.permType)
    pagination.total = filtered.length
    tableData.value = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize)
    loading.value = false
  }, 200)
}

// --- status ---
function handleToggleStatus(row: FieldRuleItem, val: boolean) {
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
  form: {} as {
    id: number
    tableName: string
    fieldName: string
    fieldLabel: string
    permType: string
    status: number
  },
})

const formRules: FormRules = {
  tableName: [{ required: true, message: '请选择数据表', trigger: 'change' }],
  fieldName: [{ required: true, message: '请输入字段名', trigger: 'blur' }],
  fieldLabel: [{ required: true, message: '请输入字段说明', trigger: 'blur' }],
  permType: [{ required: true, message: '请选择权限类型', trigger: 'change' }],
}

function getInitForm() {
  return { id: 0, tableName: '', fieldName: '', fieldLabel: '', permType: 'visible', status: 1 }
}

function handleAdd() {
  dialog.isEdit = false
  dialog.form = getInitForm()
  dialog.visible = true
}
function handleEdit(row: FieldRuleItem) {
  dialog.isEdit = true
  dialog.form = { ...row }
  dialog.visible = true
}
function handleDialogClose() {
  formRef.value?.resetFields()
  dialog.form = getInitForm()
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid)
    return
  dialog.loading = true
  setTimeout(() => {
    if (dialog.isEdit) {
      const idx = allData.findIndex(r => r.id === dialog.form.id)
      if (idx !== -1)
        allData[idx] = { ...allData[idx], ...dialog.form } as FieldRuleItem
      ElMessage.success('编辑成功')
    }
    else {
      allData.unshift({
        ...dialog.form,
        id: ++idCounter,
        createTime: new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      } as FieldRuleItem)
      ElMessage.success('新增成功')
    }
    dialog.visible = false
    dialog.loading = false
    fetchData()
  }, 300)
}

function handleDelete(row: FieldRuleItem) {
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
        字段权限
      </h2>
      <p class="page-header__desc">
        配置字段级别的访问控制，控制各角色对数据表字段的可见、编辑、隐藏权限
      </p>
    </div>

    <div class="search-bar">
      <EasyInput
        v-model="searchForm.keyword"
        placeholder="搜索字段名"
        clearable
        style="width: 200px"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      />
      <EasySelect
        v-model="searchForm.tableName"
        placeholder="数据表"
        clearable
        :options="tableOptions"
        style="width: 180px"
        @change="handleSearch"
      />
      <EasySelect
        v-model="searchForm.permType"
        placeholder="权限类型"
        clearable
        :options="[{ label: '可见', value: 'visible' }, { label: '可编辑', value: 'editable' }, { label: '隐藏', value: 'hidden' }]"
        style="width: 130px"
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
        <el-icon><Plus /></el-icon>新增规则
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
      <template #col-permType="{ row }">
        <EasyTag :type="permTypeMap[row.permType]?.tag" size="small">
          {{ permTypeMap[row.permType]?.label || row.permType }}
        </EasyTag>
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
      :title="dialog.isEdit ? '编辑字段权限' : '新增字段权限'"
      width="500px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="dialog.form" :rules="formRules" label-width="90px">
        <el-form-item label="数据表" prop="tableName">
          <EasySelect v-model="dialog.form.tableName" placeholder="请选择" :options="tableOptions" style="width: 100%" />
        </el-form-item>
        <el-form-item label="字段名" prop="fieldName">
          <EasyInput v-model="dialog.form.fieldName" placeholder="如: phone_number" maxlength="50" />
        </el-form-item>
        <el-form-item label="字段说明" prop="fieldLabel">
          <EasyInput v-model="dialog.form.fieldLabel" placeholder="如: 手机号码" maxlength="30" />
        </el-form-item>
        <el-form-item label="权限类型" prop="permType">
          <EasyRadioGroup v-model="dialog.form.permType">
            <EasyRadio label="visible">
              可见
            </EasyRadio>
            <EasyRadio label="editable">
              可编辑
            </EasyRadio>
            <EasyRadio label="hidden">
              隐藏
            </EasyRadio>
          </EasyRadioGroup>
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
</style>
