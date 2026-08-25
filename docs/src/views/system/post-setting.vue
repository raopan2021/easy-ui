<script setup lang="ts">
import type { TableColumn } from '@raopan/easy-ui'
import type { FormInstance, FormRules } from 'element-plus'
import { Delete, Plus, RefreshRight, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'

interface PostItem {
  id: number
  name: string
  code: string
  deptId: number
  deptName: string
  remark: string
  status: number
  createTime: string
}

const deptOptions = [
  { id: 1, name: '技术部' },
  { id: 11, name: '前端组' },
  { id: 12, name: '后端组' },
  { id: 2, name: '产品部' },
  { id: 3, name: '市场部' },
  { id: 4, name: '销售部' },
]

let idCounter = 100
function genMockData(): PostItem[] {
  return [
    {
      id: 1,
      name: '高级前端工程师',
      code: 'senior_fe',
      deptId: 11,
      deptName: '前端组',
      remark: '负责核心产品前端架构',
      status: 1,
      createTime: '2025-08-01 09:00:00',
    },
    {
      id: 2,
      name: '中级前端工程师',
      code: 'mid_fe',
      deptId: 11,
      deptName: '前端组',
      remark: '',
      status: 1,
      createTime: '2025-08-01 09:30:00',
    },
    {
      id: 3,
      name: 'Java 开发工程师',
      code: 'java_dev',
      deptId: 12,
      deptName: '后端组',
      remark: '负责微服务开发',
      status: 1,
      createTime: '2025-08-01 10:00:00',
    },
    {
      id: 4,
      name: '产品经理',
      code: 'pm',
      deptId: 2,
      deptName: '产品部',
      remark: 'B端产品策划',
      status: 1,
      createTime: '2025-08-15 14:00:00',
    },
    {
      id: 5,
      name: '市场专员',
      code: 'market_specialist',
      deptId: 3,
      deptName: '市场部',
      remark: '',
      status: 0,
      createTime: '2025-09-01 11:00:00',
    },
    {
      id: 6,
      name: '销售代表',
      code: 'sales_rep',
      deptId: 4,
      deptName: '销售部',
      remark: '华东区域',
      status: 1,
      createTime: '2025-09-10 15:00:00',
    },
    {
      id: 7,
      name: '技术总监',
      code: 'tech_director',
      deptId: 1,
      deptName: '技术部',
      remark: '统筹技术战略',
      status: 1,
      createTime: '2025-10-01 09:00:00',
    },
  ]
}

let allData: PostItem[] = genMockData()

// --- search ---
const searchForm = reactive({ keyword: '', deptId: null as number | null, status: null as number | null })
function handleSearch() {
  pagination.page = 1
  fetchData()
}
function handleReset() {
  searchForm.keyword = ''
  searchForm.deptId = null
  searchForm.status = null
  pagination.page = 1
  fetchData()
}

// --- table ---
const loading = ref(false)
const tableData = ref<PostItem[]>([])
const selectedIds = ref<number[]>([])
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const columns: TableColumn[] = [
  { prop: 'id', name: 'ID', width: 70 },
  { prop: 'name', name: '岗位名称', minWidth: 150 },
  { prop: 'code', name: '编码', width: 150 },
  { prop: 'deptName', name: '所属部门', width: 140 },
  { prop: 'status', name: '状态', width: 90 },
  { prop: 'createTime', name: '创建时间', width: 170 },
]

function handleSelectionChange(rows: PostItem[]) {
  selectedIds.value = rows.map(r => r.id)
}

function fetchData() {
  loading.value = true
  setTimeout(() => {
    let filtered = [...allData]
    if (searchForm.keyword) {
      const kw = searchForm.keyword.toLowerCase()
      filtered = filtered.filter(r => r.name.includes(kw) || r.code.includes(kw))
    }
    if (searchForm.deptId)
      filtered = filtered.filter(r => r.deptId === searchForm.deptId)
    if (searchForm.status !== null)
      filtered = filtered.filter(r => r.status === searchForm.status)
    pagination.total = filtered.length
    tableData.value = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize)
    loading.value = false
  }, 200)
}

// --- status ---
function handleToggleStatus(row: PostItem, val: boolean) {
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
    name: string
    code: string
    deptId: number
    deptName: string
    remark: string
    status: number
  },
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入岗位名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入岗位编码', trigger: 'blur' }],
  deptId: [{ required: true, message: '请选择所属部门', trigger: 'change' }],
}

function getInitForm() {
  return { id: 0, name: '', code: '', deptId: 0, deptName: '', remark: '', status: 1 }
}
function handleAdd() {
  dialog.isEdit = false
  dialog.form = getInitForm()
  dialog.visible = true
}
function handleEdit(row: PostItem) {
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
    const dept = deptOptions.find(d => d.id === dialog.form.deptId)
    dialog.form.deptName = dept?.name || ''
    if (dialog.isEdit) {
      const idx = allData.findIndex(r => r.id === dialog.form.id)
      if (idx !== -1)
        allData[idx] = { ...allData[idx], ...dialog.form }
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
      } as PostItem)
      ElMessage.success('新增成功')
    }
    dialog.visible = false
    dialog.loading = false
    fetchData()
  }, 300)
}

function handleDelete(row: PostItem) {
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
        岗位设置
      </h2>
      <p class="page-header__desc">
        管理公司各级岗位，岗位需关联所属部门
      </p>
    </div>

    <div class="search-bar">
      <EasyInput v-model="searchForm.keyword" placeholder="搜索岗位名称/编码" clearable style="width: 220px"
        @keyup.enter="handleSearch" @clear="handleSearch" />
      <EasySelect v-model="searchForm.deptId" placeholder="所属部门" clearable :options="deptOptions" label-key="name"
        value-key="id" style="width: 180px" @change="handleSearch" />
      <EasySelect v-model="searchForm.status" placeholder="状态" clearable
        :options="[{ label: '启用', value: 1 }, { label: '禁用', value: 0 }]" style="width: 120px" @change="handleSearch" />
      <EasyButton type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon>查询
      </EasyButton>
      <EasyButton @click="handleReset">
        <el-icon><RefreshRight /></el-icon>重置
      </EasyButton>
    </div>

    <div class="action-bar">
      <EasyButton type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>新增岗位
      </EasyButton>
      <EasyButton type="danger" :disabled="!selectedIds.length" @click="handleBatchDelete">
        <el-icon><Delete /></el-icon>批量删除
      </EasyButton>
    </div>

    <EasyTable v-loading="loading" :data="tableData" :columns="columns" selection-mode="multiple" stripe border
      :pagination="true" :total="pagination.total" :page="pagination.page" :page-size="pagination.pageSize"
      :page-size-options="[10, 20, 50, 100]" action-label="操作" :action-width="160" action-fixed="right"
      @selection-change="handleSelectionChange" @page-change="(p: number) => { pagination.page = p; fetchData() }"
      @page-size-change="(s: number) => { pagination.pageSize = s; fetchData() }">
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

    <el-dialog v-model="dialog.visible" :title="dialog.isEdit ? '编辑岗位' : '新增岗位'" width="480px"
      :close-on-click-modal="false" @close="handleDialogClose">
      <el-form ref="formRef" :model="dialog.form" :rules="formRules" label-width="90px">
        <el-form-item label="岗位名称" prop="name">
          <EasyInput v-model="dialog.form.name" placeholder="如: 高级前端工程师" maxlength="30" />
        </el-form-item>
        <el-form-item label="岗位编码" prop="code">
          <EasyInput v-model="dialog.form.code" placeholder="如: senior_fe" maxlength="30" />
        </el-form-item>
        <el-form-item label="所属部门" prop="deptId">
          <EasySelect v-model="dialog.form.deptId" placeholder="请选择部门" :options="deptOptions" label-key="name"
            value-key="id" style="width: 100%" />
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <EasyInput v-model="dialog.form.remark" type="textarea" :rows="2" placeholder="岗位职责描述（选填）" />
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
