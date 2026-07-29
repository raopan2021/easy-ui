<template>
  <div class="system-page">
    <div class="page-header">
      <h2 class="page-header__title">数据权限</h2>
      <p class="page-header__desc">配置数据级的权限规则，控制不同角色的数据访问范围</p>
    </div>

    <div class="search-bar">
      <el-input
        v-model="searchForm.keyword"
        placeholder="搜索规则名称/数据表"
        clearable
        style="width: 240px"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      />
      <el-select v-model="searchForm.scope" placeholder="适用范围" clearable style="width: 140px" @change="handleSearch">
        <el-option label="全部" value="all" />
        <el-option label="部门" value="dept" />
        <el-option label="个人" value="self" />
      </el-select>
      <el-select v-model="searchForm.status" placeholder="状态" clearable style="width: 120px" @change="handleSearch">
        <el-option label="启用" :value="1" />
        <el-option label="禁用" :value="0" />
      </el-select>
      <el-button type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon>查询
      </el-button>
      <el-button @click="handleReset">
        <el-icon><RefreshRight /></el-icon>重置
      </el-button>
    </div>

    <div class="action-bar">
      <el-button type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>新增规则
      </el-button>
      <el-button type="danger" :disabled="!selectedIds.length" @click="handleBatchDelete">
        <el-icon><Delete /></el-icon>批量删除
      </el-button>
    </div>

    <el-table
      v-loading="loading"
      :data="tableData"
      stripe
      border
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="name" label="规则名称" min-width="160" />
      <el-table-column prop="scope" label="适用范围" width="100">
        <template #default="{ row }">
          <el-tag :type="scopeMap[row.scope]?.tag" size="small">{{ scopeMap[row.scope]?.label }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="tableName" label="数据表" width="160" />
      <el-table-column prop="filterExpr" label="过滤条件" min-width="220">
        <template #default="{ row }">
          <el-tooltip :content="row.filterExpr" placement="top" :show-after="300">
            <span class="filter-expr">{{ row.filterExpr }}</span>
          </el-tooltip>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="90">
        <template #default="{ row }">
          <el-switch
            :model-value="row.status === 1"
            @change="(val: boolean) => handleToggleStatus(row, val)"
          />
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="170" />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row)">编辑</el-button>
          <el-popconfirm title="确定删除？" @confirm="handleDelete(row)">
            <template #reference>
              <el-button link type="danger" size="small">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrap">
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.pageSize"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchData"
        @current-change="fetchData"
      />
    </div>

    <el-dialog
      v-model="dialog.visible"
      :title="dialog.isEdit ? '编辑规则' : '新增规则'"
      width="560px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="dialog.form" :rules="formRules" label-width="100px">
        <el-form-item label="规则名称" prop="name">
          <el-input v-model="dialog.form.name" placeholder="请输入规则名称" maxlength="30" />
        </el-form-item>
        <el-form-item label="适用范围" prop="scope">
          <el-radio-group v-model="dialog.form.scope">
            <el-radio value="all">全部数据</el-radio>
            <el-radio value="dept">本部门及子部门</el-radio>
            <el-radio value="self">仅本人数据</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="数据表" prop="tableName">
          <el-select v-model="dialog.form.tableName" placeholder="请选择" style="width: 100%">
            <el-option v-for="t in tableOptions" :key="t.value" :label="t.label" :value="t.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="过滤条件" prop="filterExpr">
          <el-input v-model="dialog.form.filterExpr" type="textarea" :rows="3" placeholder="如: dept_id = #{user.deptId}" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="dialog.form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">取消</el-button>
        <el-button type="primary" :loading="dialog.loading" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus, Delete, Search, RefreshRight } from '@element-plus/icons-vue'

interface DataRuleItem {
  id: number
  name: string
  scope: 'all' | 'dept' | 'self'
  tableName: string
  filterExpr: string
  status: number
  createTime: string
}

const scopeMap: Record<string, { label: string; tag: string }> = {
  all: { label: '全部', tag: 'primary' },
  dept: { label: '部门', tag: 'warning' },
  self: { label: '个人', tag: 'info' },
}

const tableOptions = [
  { label: 'sys_user (用户表)', value: 'sys_user' },
  { label: 'sys_role (角色表)', value: 'sys_role' },
  { label: 'sys_dept (部门表)', value: 'sys_dept' },
  { label: 'sys_menu (菜单表)', value: 'sys_menu' },
  { label: 'biz_order (订单表)', value: 'biz_order' },
  { label: 'biz_customer (客户表)', value: 'biz_customer' },
]

let idCounter = 100
function genMockData(): DataRuleItem[] {
  return [
    { id: 1, name: '用户数据隔离', scope: 'dept', tableName: 'sys_user', filterExpr: 'dept_id IN (#{user.deptIds})', status: 1, createTime: '2026-01-10 09:00:00' },
    { id: 2, name: '个人订单可见', scope: 'self', tableName: 'biz_order', filterExpr: 'create_by = #{user.id}', status: 1, createTime: '2026-01-12 14:30:00' },
    { id: 3, name: '部门客户池', scope: 'dept', tableName: 'biz_customer', filterExpr: 'owner_dept = #{user.deptId}', status: 1, createTime: '2026-02-18 11:20:00' },
    { id: 4, name: '角色数据全量', scope: 'all', tableName: 'sys_role', filterExpr: '1=1', status: 0, createTime: '2026-03-05 16:45:00' },
    { id: 5, name: '部门级角色过滤', scope: 'dept', tableName: 'sys_role', filterExpr: 'dept_id = #{user.deptId} OR dept_id IS NULL', status: 1, createTime: '2026-04-22 08:15:00' },
    { id: 6, name: '本人日志查询', scope: 'self', tableName: 'sys_log', filterExpr: 'user_id = #{user.id}', status: 1, createTime: '2026-05-10 10:00:00' },
  ]
}

let allData: DataRuleItem[] = genMockData()

// --- search ---
const searchForm = reactive({ keyword: '', scope: '', status: null as number | null })
function handleSearch() { pagination.page = 1; fetchData() }
function handleReset() { searchForm.keyword = ''; searchForm.scope = ''; searchForm.status = null; pagination.page = 1; fetchData() }

// --- table ---
const loading = ref(false)
const tableData = ref<DataRuleItem[]>([])
const selectedIds = ref<number[]>([])
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

function handleSelectionChange(rows: DataRuleItem[]) { selectedIds.value = rows.map(r => r.id) }

function fetchData() {
  loading.value = true
  setTimeout(() => {
    let filtered = [...allData]
    if (searchForm.keyword) {
      const kw = searchForm.keyword.toLowerCase()
      filtered = filtered.filter(r => r.name.includes(kw) || r.tableName.includes(kw))
    }
    if (searchForm.scope) filtered = filtered.filter(r => r.scope === searchForm.scope)
    if (searchForm.status !== null) filtered = filtered.filter(r => r.status === searchForm.status)
    pagination.total = filtered.length
    tableData.value = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize)
    loading.value = false
  }, 200)
}

// --- status toggle ---
function handleToggleStatus(row: DataRuleItem, val: boolean) {
  row.status = val ? 1 : 0
  const item = allData.find(r => r.id === row.id)
  if (item) item.status = row.status
  ElMessage.success(`${val ? '启用' : '禁用'}成功`)
}

// --- dialog ---
const formRef = ref<FormInstance>()
const dialog = reactive({
  visible: false,
  isEdit: false,
  loading: false,
  form: {} as { id: number; name: string; scope: string; tableName: string; filterExpr: string; status: number },
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入规则名称', trigger: 'blur' }],
  scope: [{ required: true, message: '请选择适用范围', trigger: 'change' }],
  tableName: [{ required: true, message: '请选择数据表', trigger: 'change' }],
  filterExpr: [{ required: true, message: '请输入过滤条件', trigger: 'blur' }],
}

function getInitForm() { return { id: 0, name: '', scope: 'dept', tableName: '', filterExpr: '', status: 1 } }

function handleAdd() { dialog.isEdit = false; dialog.form = getInitForm(); dialog.visible = true }
function handleEdit(row: DataRuleItem) { dialog.isEdit = true; dialog.form = { ...row }; dialog.visible = true }
function handleDialogClose() { formRef.value?.resetFields(); dialog.form = getInitForm() }

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid) return
  dialog.loading = true
  setTimeout(() => {
    if (dialog.isEdit) {
      const idx = allData.findIndex(r => r.id === dialog.form.id)
      if (idx !== -1) allData[idx] = { ...allData[idx], ...dialog.form }
      ElMessage.success('编辑成功')
    } else {
      allData.unshift({
        ...dialog.form,
        id: ++idCounter,
        createTime: new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      })
      ElMessage.success('新增成功')
    }
    dialog.visible = false
    dialog.loading = false
    fetchData()
  }, 300)
}

function handleDelete(row: DataRuleItem) {
  allData = allData.filter(r => r.id !== row.id)
  ElMessage.success('删除成功')
  fetchData()
}

async function handleBatchDelete() {
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 条？`, '批量删除', { type: 'warning' })
  } catch { return }
  allData = allData.filter(r => !selectedIds.value.includes(r.id))
  ElMessage.success('批量删除成功')
  selectedIds.value = []
  fetchData()
}

onMounted(() => fetchData())
</script>

<style scoped lang="scss">
.system-page { padding: 8px 0 40px; }
.page-header { margin-bottom: 24px;
  &__title { font-size: 22px; font-weight: 700; margin: 0 0 6px; color: var(--el-text-color-primary); }
  &__desc { font-size: 14px; color: var(--el-text-color-secondary); margin: 0; }
}
.search-bar { display: flex; gap: 12px; flex-wrap: wrap; align-items: center; margin-bottom: 16px; }
.action-bar { display: flex; gap: 12px; align-items: center; margin-bottom: 16px; }
.pagination-wrap { display: flex; justify-content: flex-end; margin-top: 16px; }
.filter-expr { font-family: 'Consolas', 'Monaco', monospace; font-size: 12px; color: var(--el-text-color-secondary); }
</style>
