<script setup lang="ts">
import {
  easy,
  EasyButton,
  EasyDescriptions,
  EasyDescriptionsItem,
  EasyForm,
  EasyFormItem,
  EasyInput,
  EasyModal,
  EasySearchForm,
  EasySelect,
  EasyTable,
  email,
  min,
  minLength,
  required,
} from '@raopan/easy-ui'
import { onMounted, reactive, ref } from 'vue'

defineOptions({ name: 'CrudDemo' })

// ============ 搜索区域 ============
const searchFormRef = ref()
const searchData = reactive({
  name: '',
  status: null,
  beginDate: '',
  endDate: '',
})

const searchItems = [
  { prop: 'name', label: '用户名', type: 'input', placeholder: '请输入用户名', span: 4 },
  {
    prop: 'status',
    label: '状态',
    type: 'select',
    placeholder: '请选择状态',
    options: [
      { label: '启用', value: 1 },
      { label: '禁用', value: 0 },
    ],
    span: 4,
  },
  {
    prop: 'beginDate',
    endProp: 'endDate',
    label: '创建时间',
    type: 'daterange',
    startPlaceholder: '开始日期',
    endPlaceholder: '结束日期',
    span: 6,
  },
]

function handleSearch(_data: Record<string, any>) {
  pagination.page = 1
  fetchTableData()
}

function handleReset() {
  pagination.page = 1
  fetchTableData()
}

// ============ 表格区域 ============
const tableRef = ref()
const tableLoading = ref(false)
const tableData = ref<Record<string, any>[]>([])
const selectedRows = ref<Record<string, any>[]>([])
const total = ref(0)
const pagination = reactive({
  page: 1,
  pageSize: 10,
})

const tableColumns = [
  { prop: 'name', name: '用户名', minWidth: 120 },
  { prop: 'email', name: '邮箱', minWidth: 180 },
  { prop: 'phone', name: '手机号', width: 130 },
  { prop: 'deptName', name: '部门', minWidth: 120 },
  { prop: 'status', name: '状态', width: 100, align: 'center' as const },
  { prop: 'createTime', name: '创建时间', minWidth: 160 },
]

function handleSelectionChange(rows: Record<string, any>[]) {
  selectedRows.value = rows
}

function handlePageChange(page: number) {
  pagination.page = page
  fetchTableData()
}

function handleRefresh() {
  fetchTableData()
}

function handlePageSizeChange(pageSize: number) {
  pagination.pageSize = pageSize
  pagination.page = 1
  fetchTableData()
}

// ============ 新增/编辑弹窗 ============
const formModal = reactive({
  visible: false,
  isEdit: false,
  loading: false,
})
const formRef = ref()
const formData = reactive({
  id: '',
  name: '',
  email: '',
  phone: '',
  dept: null,
  status: 1,
  remark: '',
})

const formRules = {
  name: [required('请输入用户名'), minLength(2, '至少2个字符')],
  email: [required('请输入邮箱'), email()],
  phone: [required('请输入手机号'), min(11, '手机号至少11位')],
  dept: [required('请选择部门')],
}

const deptOptions = [
  { label: '技术部', value: 'tech' },
  { label: '产品部', value: 'product' },
  { label: '运营部', value: 'operation' },
  { label: '市场部', value: 'marketing' },
  { label: '财务部', value: 'finance' },
]

const statusOptions = [
  { label: '启用', value: 1 },
  { label: '禁用', value: 0 },
]

function openAddModal() {
  formModal.isEdit = false
  formModal.visible = true
  // 重置表单数据
  Object.assign(formData, {
    id: '',
    name: '',
    email: '',
    phone: '',
    dept: null,
    status: 1,
    remark: '',
  })
}

function openEditModal(row: Record<string, any>) {
  formModal.isEdit = true
  formModal.visible = true
  // 填充表单数据
  Object.assign(formData, {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    dept: row.dept,
    status: row.status,
    remark: row.remark || '',
  })
}

async function handleFormSubmit() {
  const isValid = await formRef.value?.validate().catch(() => false)
  if (!isValid)
    return

  formModal.loading = true
  try {
    // 模拟 API 调用
    await new Promise(resolve => setTimeout(resolve, 1000))

    if (formModal.isEdit) {
      // 编辑
      const index = tableData.value.findIndex(item => item.id === formData.id)
      if (index !== -1) {
        tableData.value[index] = {
          ...tableData.value[index],
          ...formData,
          deptName: deptOptions.find(d => d.value === formData.dept)?.label || '',
        }
      }
      easy.$msg.success('数据已成功保存', { title: '操作成功' })
    }
    else {
      // 新增
      const newRow = {
        id: Date.now().toString(),
        ...formData,
        deptName: deptOptions.find(d => d.value === formData.dept)?.label || '',
        createTime: new Date().toLocaleString('zh-CN'),
      }
      tableData.value.unshift(newRow)
      total.value++
      easy.$msg.success('数据已成功保存', { title: '操作成功' })
    }

    formModal.visible = false
  }
  catch {
    easy.$msg.success('数据保存失败', { title: '操作失败' })
  }
  finally {
    formModal.loading = false
  }
}

// ============ 查看详情弹窗 ============
const viewModal = reactive({
  visible: false,
})
const viewData = reactive<Record<string, any>>({})

function openViewModal(row: Record<string, any>) {
  viewModal.visible = true
  Object.assign(viewData, row)
}

// ============ 删除操作 ============
const deleteModal = reactive({
  visible: false,
})
const deleteData = reactive({
  id: '',
  name: '',
})

function handleDelete(row: Record<string, any>) {
  deleteModal.visible = true
  deleteData.id = row.id
  deleteData.name = row.name
}

async function confirmDelete() {
  try {
    // 从表格数据中移除
    const index = tableData.value.findIndex(item => item.id === deleteData.id)
    if (index !== -1) {
      tableData.value.splice(index, 1)
      total.value--
    }

    easy.$msg.success('数据已成功删除', { title: '操作成功' })
    deleteModal.visible = false
  }
  catch {
    // 用户取消
  }
}

// ============ 模拟数据 ============
function generateMockData() {
  const names = ['张伟', '李娜', '王芳', '刘洋', '陈静', '杨明', '赵雪', '黄磊', '周婷', '吴强']
  const depts = [
    { label: '技术部', value: 'tech' },
    { label: '产品部', value: 'product' },
    { label: '运营部', value: 'operation' },
    { label: '市场部', value: 'marketing' },
    { label: '财务部', value: 'finance' },
  ]

  return Array.from({ length: 55 }, (_, i) => {
    const name = names[i % names.length]
    const dept = depts[i % depts.length]
    return {
      id: (i + 1).toString(),
      name: `${name}${Math.floor(i / names.length) || ''}`,
      email: `${name.toLowerCase()}${i}@example.com`,
      phone: `138${String(100000000 + i).slice(-8)}`,
      dept: dept.value,
      deptName: dept.label,
      status: i % 5 === 0 ? 0 : 1,
      createTime: new Date(2024, 0, (i % 28) + 1).toLocaleString('zh-CN'),
      remark: i % 3 === 0 ? '备注信息' : '',
    }
  })
}

const allMockData = generateMockData()

async function fetchTableData() {
  tableLoading.value = true
  try {
    // 模拟 API 延迟
    await new Promise(resolve => setTimeout(resolve, 500))

    // 模拟搜索过滤
    let filtered = [...allMockData]
    if (searchData.name) {
      filtered = filtered.filter(item => item.name.includes(searchData.name))
    }
    if (searchData.status !== null && searchData.status !== '') {
      filtered = filtered.filter(item => item.status === searchData.status)
    }
    // 日期范围过滤
    if (searchData.beginDate || searchData.endDate) {
      filtered = filtered.filter((item) => {
        const createTime = new Date(item.createTime).getTime()
        const begin = searchData.beginDate ? new Date(searchData.beginDate).getTime() : 0
        const end = searchData.endDate ? new Date(searchData.endDate).getTime() : Infinity
        return createTime >= begin && createTime <= end
      })
    }

    // 分页
    const start = (pagination.page - 1) * pagination.pageSize
    const end = start + pagination.pageSize
    tableData.value = filtered.slice(start, end)
    total.value = filtered.length
  }
  finally {
    tableLoading.value = false
  }
}

// ============ 初始化 ============
onMounted(() => {
  fetchTableData()
})
</script>

<template>
  <div class="crud-demo">
    <!-- 搜索区域 -->
    <EasySearchForm
      ref="searchFormRef"
      :items="searchItems"
      :model-value="searchData"
      :show-expand-button="false"
      @search="handleSearch"
      @reset="handleReset"
    />

    <!-- 表格区域 -->
    <EasyTable
      ref="tableRef"
      :data="tableData"
      :columns="tableColumns"
      :loading="tableLoading"
      :total="total"
      :page="pagination.page"
      :page-size="pagination.pageSize"
      :show-index="true"
      :selectable="true"
      show-refresh
      show-export
      show-column-settings
      selection-mode="multiple"
      pagination-position="right"
      style="margin-top: 20px"
      @refresh="handleRefresh"
      @selection-change="handleSelectionChange"
      @page-change="handlePageChange"
      @page-size-change="handlePageSizeChange"
    >
      <template #toolbar>
        <EasyButton type="primary" size="small" @click="openAddModal">
          新增
        </EasyButton>
      </template>
      <!-- 状态列自定义 -->
      <template #col-status="{ row }">
        <EasyTag :type="row.status === 1 ? 'success' : 'info'" size="small">
          {{ row.status === 1 ? '启用' : '禁用' }}
        </EasyTag>
      </template>

      <!-- 操作列 -->
      <template #action="{ row }">
        <div class="action-buttons">
          <EasyButton link type="primary" size="small" @click="openViewModal(row)">
            查看
          </EasyButton>
          <EasyButton link type="primary" size="small" @click="openEditModal(row)">
            编辑
          </EasyButton>
          <EasyButton link size="small" type="danger" @click="handleDelete(row)">
            删除
          </EasyButton>
        </div>
      </template>
    </EasyTable>

    <!-- 新增/编辑弹窗 -->
    <EasyModal
      v-model="formModal.visible"
      :title="formModal.isEdit ? '编辑用户' : '新增用户'"
      width="520px"
      @confirm="handleFormSubmit"
      @cancel="formModal.visible = false"
    >
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
        <EasyFormItem label="备注" prop="remark">
          <EasyInput v-model="formData.remark" type="textarea" placeholder="请输入备注" :rows="3" />
        </EasyFormItem>
      </EasyForm>
    </EasyModal>

    <!-- 查看详情弹窗 -->
    <EasyModal
      v-model="viewModal.visible"
      title="用户详情"
      width="50%"
      :show-confirm="false"
      @cancel="viewModal.visible = false"
    >
      <EasyDescriptions :column="2" border>
        <EasyDescriptionsItem label="用户ID">
          {{ viewData.id }}
        </EasyDescriptionsItem>
        <EasyDescriptionsItem label="用户名">
          {{ viewData.name }}
        </EasyDescriptionsItem>
        <EasyDescriptionsItem label="邮箱">
          {{ viewData.email }}
        </EasyDescriptionsItem>
        <EasyDescriptionsItem label="手机号">
          {{ viewData.phone }}
        </EasyDescriptionsItem>
        <EasyDescriptionsItem label="部门">
          {{ viewData.deptName }}
        </EasyDescriptionsItem>
        <EasyDescriptionsItem label="状态">
          <EasyTag :type="viewData.status === 1 ? 'success' : 'info'" size="small">
            {{ viewData.status === 1 ? '启用' : '禁用' }}
          </EasyTag>
        </EasyDescriptionsItem>
        <EasyDescriptionsItem label="创建时间">
          {{ viewData.createTime }}
        </EasyDescriptionsItem>
        <EasyDescriptionsItem label="备注">
          {{ viewData.remark || '-' }}
        </EasyDescriptionsItem>
      </EasyDescriptions>
    </EasyModal>

    <!-- 删除确认弹窗 -->
    <EasyModal
      v-model="deleteModal.visible"
      title="确认删除"
      width="400px"
      @confirm="confirmDelete"
      @cancel="deleteModal.visible = false"
    >
      <div class="delete-tip">
        <EasyIcon name="el:WarningFilled" color="#ef4444" :size="24" />
        <p>
          确定要删除用户 <strong>{{ deleteData.name }}</strong> 吗？
        </p>
        <p class="delete-tip__sub">
          此操作不可恢复，请谨慎操作。
        </p>
      </div>
    </EasyModal>
  </div>
</template>

<style scoped lang="scss">
.crud-demo {
  padding: 24px;
  min-height: 100%;
  background: var(--el-fill-color-light);
}
</style>
