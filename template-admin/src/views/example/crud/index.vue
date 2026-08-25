<script setup lang="ts">
import type { ExampleItem } from '@/api/example'
import {
  createExample,
  deleteExample,
  getExamplePage,
  updateExample,
} from '@/api/example'
/**
 * 基础 CRUD 示例
 *
 * 模板演示页面：SearchForm（搜索）+ Table（列表）+ 新增/编辑弹窗 + 删除。
 * 数据来自 src/api/example 的本地 Mock 接口，无需后端即可体验完整流程。
 */
import { easy } from '@/utils/xly'

defineOptions({ name: 'CrudExample' })

// ==================== 搜索区域 ====================
const searchData = reactive({
  search: '',
  status: null as number | null,
})

const searchItems = [
  { prop: 'search', label: '关键字', type: 'input' as const, placeholder: '用户名 / 邮箱', span: 6 },
  {
    prop: 'status',
    label: '状态',
    type: 'select' as const,
    placeholder: '请选择状态',
    options: [
      { label: '启用', value: 1 },
      { label: '禁用', value: 0 },
    ],
    span: 6,
  },
]

// ==================== 表格区域 ====================
const tableLoading = ref(false)
const tableData = ref<ExampleItem[]>([])
const total = ref(0)
const pagination = reactive({ page: 1, pageSize: 10 })

function handleSearch() {
  pagination.page = 1
  fetchTableData()
}

function handleReset() {
  pagination.page = 1
  fetchTableData()
}

const tableColumns = [
  { prop: 'name', name: '用户名', minWidth: 120 },
  { prop: 'email', name: '邮箱', minWidth: 180 },
  { prop: 'phone', name: '手机号', width: 130 },
  { prop: 'dept', name: '部门', minWidth: 100 },
  { prop: 'status', name: '状态', width: 100, align: 'center' as const },
  { prop: 'createTime', name: '创建时间', minWidth: 140 },
]

function handlePageChange(page: number) {
  pagination.page = page
  fetchTableData()
}

function handlePageSizeChange(pageSize: number) {
  pagination.pageSize = pageSize
  pagination.page = 1
  fetchTableData()
}

async function fetchTableData() {
  tableLoading.value = true
  try {
    const res = await getExamplePage({
      currentPage: pagination.page,
      pageNum: pagination.pageSize,
      search: searchData.search || undefined,
      status: searchData.status ?? undefined,
    })
    if (res.retCode === 0) {
      tableData.value = res.data?.records ?? []
      total.value = res.data?.totalRecordsNum ?? 0
    }
    else {
      ElMessage.error(res.msg || '加载失败')
    }
  }
  catch {
    ElMessage.error('加载失败，请稍后重试')
  }
  finally {
    tableLoading.value = false
  }
}

// ==================== 新增/编辑弹窗 ====================
const formModal = reactive({ visible: false, isEdit: false, loading: false })
const formRef = ref()
const formData = reactive({
  id: '',
  name: '',
  email: '',
  phone: '',
  dept: '',
  status: 1,
})

const formRules = {
  name: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '邮箱格式不正确', trigger: 'blur' },
  ],
  phone: [{ required: true, message: '请输入手机号', trigger: 'blur' }],
  dept: [{ required: true, message: '请选择部门', trigger: 'change' }],
} as Record<string, any>

const deptOptions = [
  { label: '技术部', value: '技术部' },
  { label: '产品部', value: '产品部' },
  { label: '运营部', value: '运营部' },
  { label: '市场部', value: '市场部' },
  { label: '财务部', value: '财务部' },
]

const statusOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
]

function openAddModal() {
  formModal.isEdit = false
  formModal.visible = true
  Object.assign(formData, { id: '', name: '', email: '', phone: '', dept: '', status: 1 })
}

function openEditModal(row: ExampleItem | Record<string, any>) {
  formModal.isEdit = true
  formModal.visible = true
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    dept: row.dept,
    status: row.status,
  })
}

async function handleFormSubmit() {
  const isValid = await formRef.value?.validate().catch(() => false)
  if (!isValid)
    return

  formModal.loading = true
  try {
    const payload = {
      id: formData.id,
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      dept: formData.dept,
      status: formData.status,
    }
    const res = formModal.isEdit
      ? await updateExample(payload)
      : await createExample(payload)
    if (res.retCode === 0) {
      easy.$msg.success(formModal.isEdit ? '更新成功' : '新增成功')
      formModal.visible = false
      fetchTableData()
    }
    else {
      easy.$msg.danger(res.msg || '保存失败')
    }
  }
  catch {
    easy.$msg.danger('保存失败，请稍后重试')
  }
  finally {
    formModal.loading = false
  }
}

// ==================== 删除操作 ====================
const deleteLoading = ref(false)

async function handleDelete(row: ExampleItem | Record<string, any>) {
  const confirmed = await ElMessageBox.confirm(
    `确定要删除用户「${row.name}」吗？`,
    '删除确认',
    { type: 'warning', confirmButtonText: '删除', cancelButtonText: '取消' },
  ).catch(() => false)
  if (!confirmed)
    return

  deleteLoading.value = true
  try {
    const res = await deleteExample(row.id)
    if (res.retCode === 0) {
      easy.$msg.success('删除成功')
      // 删除最后一页最后一条时回退页码
      if (tableData.value.length === 1 && pagination.page > 1)
        pagination.page--
      fetchTableData()
    }
    else {
      easy.$msg.danger(res.msg || '删除失败')
    }
  }
  catch {
    easy.$msg.danger('删除失败，请稍后重试')
  }
  finally {
    deleteLoading.value = false
  }
}

// ==================== 初始化 ====================
onMounted(fetchTableData)
</script>

<template>
  <div class="crud-example">
    <!-- 搜索区域 -->
    <EasySearchForm :items="searchItems" :model-value="searchData" :show-expand-button="false" @search="handleSearch"
      @reset="handleReset" />

    <!-- 表格区域 -->
    <EasyTable :data="tableData" :columns="tableColumns" :loading="tableLoading" :total="total" :page="pagination.page"
      :page-size="pagination.pageSize" show-index show-refresh show-page-size pagination-position="right"
      style="margin-top: 16px" @refresh="fetchTableData" @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange">
      <template #toolbar>
        <EasyButton type="primary" size="small" @click="openAddModal">
          新增
        </EasyButton>
      </template>

      <!-- 状态列自定义 -->
      <template #col-status="{ row }">
        <EasyTag :type="row.status === 1 ? 'success' : 'info'" size="small">
          {{ row.status === 1 ? "启用" : "禁用" }}
        </EasyTag>
      </template>

      <!-- 操作列 -->
      <template #action="{ row }">
        <EasyButton link type="primary" size="small" @click="openEditModal(row)">
          编辑
        </EasyButton>
        <EasyButton link type="danger" size="small" :loading="deleteLoading" @click="handleDelete(row)">
          删除
        </EasyButton>
      </template>
    </EasyTable>

    <!-- 新增/编辑弹窗 -->
    <EasyModal v-model="formModal.visible" :title="formModal.isEdit ? '编辑用户' : '新增用户'" width="520px"
      :confirm-loading="formModal.loading" @confirm="handleFormSubmit" @cancel="formModal.visible = false">
      <EasyForm ref="formRef" :model="formData" :rules="formRules" label-width="80px">
        <EasyFormItem label="用户名" prop="name">
          <EasyInput v-model="formData.name" placeholder="请输入用户名" />
        </EasyFormItem>
        <EasyFormItem label="邮箱" prop="email">
          <EasyInput v-model="formData.email" placeholder="请输入邮箱" />
        </EasyFormItem>
        <EasyFormItem label="手机号" prop="phone">
          <EasyInput v-model="formData.phone" placeholder="请输入手机号" />
        </EasyFormItem>
        <EasyFormItem label="部门" prop="dept">
          <EasySelect v-model="formData.dept" placeholder="请选择部门" :options="deptOptions" />
        </EasyFormItem>
        <EasyFormItem label="状态" prop="status">
          <EasySelect v-model="formData.status" placeholder="请选择状态" :options="statusOptions" />
        </EasyFormItem>
      </EasyForm>
    </EasyModal>
  </div>
</template>

<style scoped lang="scss">
.crud-example {
  padding: 16px;
}
</style>
