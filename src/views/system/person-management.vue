<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { Delete, Plus, RefreshRight, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'

interface PersonItem {
  id: number
  name: string
  empNo: string
  deptId: number
  deptName: string
  postId: number
  postName: string
  phone: string
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

// 岗位按部门分组
const postsByDept: Record<number, { id: number, name: string }[]> = {
  1: [{ id: 7, name: '技术总监' }],
  11: [
    { id: 1, name: '高级前端工程师' },
    { id: 2, name: '中级前端工程师' },
  ],
  12: [{ id: 3, name: 'Java开发工程师' }],
  2: [{ id: 4, name: '产品经理' }],
  3: [{ id: 5, name: '市场专员' }],
  4: [{ id: 6, name: '销售代表' }],
}

let idCounter = 100
function genMockData(): PersonItem[] {
  return [
    {
      id: 1,
      name: '张伟',
      empNo: 'EMP001',
      deptId: 11,
      deptName: '前端组',
      postId: 1,
      postName: '高级前端工程师',
      phone: '13800138001',
      status: 1,
      createTime: '2025-03-01 09:00:00',
    },
    {
      id: 2,
      name: '李娜',
      empNo: 'EMP002',
      deptId: 11,
      deptName: '前端组',
      postId: 2,
      postName: '中级前端工程师',
      phone: '13800138002',
      status: 1,
      createTime: '2025-04-15 09:00:00',
    },
    {
      id: 3,
      name: '王强',
      empNo: 'EMP003',
      deptId: 12,
      deptName: '后端组',
      postId: 3,
      postName: 'Java开发工程师',
      phone: '13800138003',
      status: 1,
      createTime: '2025-05-10 09:00:00',
    },
    {
      id: 4,
      name: '赵敏',
      empNo: 'EMP004',
      deptId: 2,
      deptName: '产品部',
      postId: 4,
      postName: '产品经理',
      phone: '13800138004',
      status: 1,
      createTime: '2025-06-01 09:00:00',
    },
    {
      id: 5,
      name: '孙磊',
      empNo: 'EMP005',
      deptId: 4,
      deptName: '销售部',
      postId: 6,
      postName: '销售代表',
      phone: '13800138005',
      status: 1,
      createTime: '2025-07-15 09:00:00',
    },
    {
      id: 6,
      name: '周婷',
      empNo: 'EMP006',
      deptId: 3,
      deptName: '市场部',
      postId: 5,
      postName: '市场专员',
      phone: '13800138006',
      status: 0,
      createTime: '2025-08-01 09:00:00',
    },
  ]
}

let allData: PersonItem[] = genMockData()

// --- search ---
const searchForm = reactive({
  keyword: '',
  deptId: null as number | null,
  postId: null as number | null,
  status: null as number | null,
})
const filteredPosts = computed(() => {
  if (searchForm.deptId)
    return postsByDept[searchForm.deptId] || []
  return Object.values(postsByDept).flat()
})
function onDeptFilterChange() {
  searchForm.postId = null
  handleSearch()
}
function handleSearch() {
  pagination.page = 1
  fetchData()
}
function handleReset() {
  searchForm.keyword = ''
  searchForm.deptId = null
  searchForm.postId = null
  searchForm.status = null
  pagination.page = 1
  fetchData()
}

// --- table ---
const loading = ref(false)
const tableData = ref<PersonItem[]>([])
const selectedIds = ref<number[]>([])
const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

function handleSelectionChange(rows: PersonItem[]) {
  selectedIds.value = rows.map(r => r.id)
}

function fetchData() {
  loading.value = true
  setTimeout(() => {
    let filtered = [...allData]
    if (searchForm.keyword) {
      const kw = searchForm.keyword.toLowerCase()
      filtered = filtered.filter(r => r.name.includes(kw) || r.empNo.includes(kw) || r.phone.includes(kw))
    }
    if (searchForm.deptId)
      filtered = filtered.filter(r => r.deptId === searchForm.deptId)
    if (searchForm.postId)
      filtered = filtered.filter(r => r.postId === searchForm.postId)
    if (searchForm.status !== null)
      filtered = filtered.filter(r => r.status === searchForm.status)
    pagination.total = filtered.length
    tableData.value = filtered.slice((pagination.page - 1) * pagination.pageSize, pagination.page * pagination.pageSize)
    loading.value = false
  }, 200)
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
    empNo: string
    deptId: number
    deptName: string
    postId: number
    postName: string
    phone: string
    status: number
  },
})

const dialogPosts = computed(() => {
  if (dialog.form.deptId)
    return postsByDept[dialog.form.deptId] || []
  return Object.values(postsByDept).flat()
})

function onDeptChange() {
  dialog.form.postId = 0
  dialog.form.postName = ''
}

const formRules: FormRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  empNo: [{ required: true, message: '请输入工号', trigger: 'blur' }],
  deptId: [{ required: true, message: '请选择部门', trigger: 'change' }],
  postId: [{ required: true, message: '请选择岗位', trigger: 'change' }],
  phone: [
    { required: true, message: '请输入手机号', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' },
  ],
}

function getInitForm() {
  return { id: 0, name: '', empNo: '', deptId: 0, deptName: '', postId: 0, postName: '', phone: '', status: 1 }
}
function handleAdd() {
  dialog.isEdit = false
  dialog.form = getInitForm()
  dialog.visible = true
}
function handleEdit(row: PersonItem) {
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
    const post = Object.values(postsByDept)
      .flat()
      .find(p => p.id === dialog.form.postId)
    dialog.form.deptName = dept?.name || ''
    dialog.form.postName = post?.name || ''
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
      } as PersonItem)
      ElMessage.success('新增成功')
    }
    dialog.visible = false
    dialog.loading = false
    fetchData()
  }, 300)
}

function handleDelete(row: PersonItem) {
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
        人员管理
      </h2>
      <p class="page-header__desc">
        管理机构人员信息，支持按部门、岗位筛选
      </p>
    </div>

    <div class="search-bar">
      <el-input
        v-model="searchForm.keyword"
        placeholder="搜索姓名/工号/手机号"
        clearable
        style="width: 220px"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      />
      <el-select
        v-model="searchForm.deptId"
        placeholder="所属部门"
        clearable
        style="width: 160px"
        @change="onDeptFilterChange"
      >
        <el-option v-for="d in deptOptions" :key="d.id" :label="d.name" :value="d.id" />
      </el-select>
      <el-select v-model="searchForm.postId" placeholder="岗位" clearable style="width: 160px" @change="handleSearch">
        <el-option v-for="p in filteredPosts" :key="p.id" :label="p.name" :value="p.id" />
      </el-select>
      <el-select v-model="searchForm.status" placeholder="状态" clearable style="width: 120px" @change="handleSearch">
        <el-option label="在职" :value="1" />
        <el-option label="离职" :value="0" />
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
        <el-icon><Plus /></el-icon>新增人员
      </el-button>
      <el-button type="danger" :disabled="!selectedIds.length" @click="handleBatchDelete">
        <el-icon><Delete /></el-icon>批量删除
      </el-button>
    </div>

    <el-table v-loading="loading" :data="tableData" stripe border @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="50" />
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="name" label="姓名" width="100" />
      <el-table-column prop="empNo" label="工号" width="120" />
      <el-table-column prop="deptName" label="所属部门" width="130" />
      <el-table-column prop="postName" label="岗位" width="140" />
      <el-table-column prop="phone" label="手机号" width="130" />
      <el-table-column prop="status" label="状态" width="80">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
            {{ row.status === 1 ? '在职' : '离职' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="入职时间" width="170" />
      <el-table-column label="操作" width="160" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-popconfirm title="确定移除？" @confirm="handleDelete(row)">
            <template #reference>
              <el-button link type="danger" size="small">
                删除
              </el-button>
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
      :title="dialog.isEdit ? '编辑人员' : '新增人员'"
      width="520px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="dialog.form" :rules="formRules" label-width="90px">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="dialog.form.name" placeholder="请输入姓名" maxlength="20" />
        </el-form-item>
        <el-form-item label="工号" prop="empNo">
          <el-input v-model="dialog.form.empNo" placeholder="请输入工号" maxlength="20" />
        </el-form-item>
        <el-form-item label="所属部门" prop="deptId">
          <el-select v-model="dialog.form.deptId" placeholder="请选择部门" style="width: 100%" @change="onDeptChange">
            <el-option v-for="d in deptOptions" :key="d.id" :label="d.name" :value="d.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="岗位" prop="postId">
          <el-select v-model="dialog.form.postId" placeholder="请选择岗位" style="width: 100%">
            <el-option v-for="p in dialogPosts" :key="p.id" :label="p.name" :value="p.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="dialog.form.phone" placeholder="请输入手机号" maxlength="11" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch
            v-model="dialog.form.status"
            :active-value="1"
            :inactive-value="0"
            active-text="在职"
            inactive-text="离职"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialog.visible = false">
          取消
        </el-button>
        <el-button type="primary" :loading="dialog.loading" @click="handleSubmit">
          确定
        </el-button>
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
