<script setup lang="ts">
import type { TableColumn } from '@raopan/easy-ui'
import type { FormInstance, FormRules } from 'element-plus'
import { Delete, Plus } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'

// ===== 类型 =====
interface User {
  id: number
  username: string
  nickname: string
  password?: string
  phone: string
  email: string
  deptId: number | null
  deptName: string
  status: number
  createTime: string
}

// ===== 部门选项 =====
const deptOptions = [
  { id: 1, name: '技术部' },
  { id: 2, name: '产品部' },
  { id: 3, name: '设计部' },
  { id: 4, name: '市场部' },
  { id: 5, name: '财务部' },
]

// ===== 搜索 =====
const searchForm = reactive({ keyword: '', status: null as number | null, deptId: null as number | null })

function handleSearch() {
  pagination.page = 1
  fetchData()
}

function handleReset() {
  searchForm.keyword = ''
  searchForm.status = null
  searchForm.deptId = null
  pagination.page = 1
  fetchData()
}

// ===== Mock 数据生成 =====
let idCounter = 20
function genMockUsers(): User[] {
  const list: User[] = []
  const names = [
    '张伟',
    '李娜',
    '王磊',
    '赵敏',
    '陈浩',
    '刘洋',
    '孙悦',
    '周强',
    '吴婷',
    '郑凯',
    '冯雪',
    '蒋涛',
    '沈丽',
    '韩明',
    '杨帆',
  ]
  const phones = [
    '13800138001',
    '13800138002',
    '13800138003',
    '13800138004',
    '13800138005',
    '13800138006',
    '13800138007',
    '13800138008',
    '13800138009',
    '13800138010',
    '13800138011',
    '13800138012',
    '13800138013',
    '13800138014',
    '13800138015',
  ]
  const statuses = [1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1]

  for (let i = 0; i < 15; i++) {
    const deptId = (i % 5) + 1
    list.push({
      id: i + 1,
      username: `user_${names[i].toLowerCase().replace(/\s/g, '')}`,
      nickname: names[i],
      phone: phones[i],
      email: `user${i + 1}@example.com`,
      deptId,
      deptName: deptOptions.find(d => d.id === deptId)!.name,
      status: statuses[i],
      createTime: `2026-0${(i % 6) + 1}-${String(i + 1).padStart(2, '0')} 10:30:00`,
    })
  }
  return list
}

// 全局数据存储
let allUsers: User[] = genMockUsers()

// ===== 表格 =====
const tableRef = ref()
const loading = ref(false)
const tableData = ref<User[]>([])
const selectedIds = ref<number[]>([])

const pagination = reactive({ page: 1, pageSize: 10, total: 0 })

const columns: TableColumn[] = [
  { prop: 'id', name: 'ID', width: 70 },
  { prop: 'username', name: '用户名', minWidth: 120 },
  { prop: 'nickname', name: '昵称', minWidth: 120 },
  { prop: 'phone', name: '手机号', minWidth: 130 },
  { prop: 'email', name: '邮箱', minWidth: 180 },
  { prop: 'deptName', name: '所属部门', minWidth: 130 },
  { prop: 'status', name: '状态', width: 80, align: 'center' },
  { prop: 'createTime', name: '创建时间', width: 170 },
]

function handleSelectionChange(rows: User[]) {
  selectedIds.value = rows.map(r => r.id)
}

function fetchData() {
  loading.value = true
  setTimeout(() => {
    let filtered = [...allUsers]

    if (searchForm.keyword) {
      const kw = searchForm.keyword.toLowerCase()
      filtered = filtered.filter(
        u =>
          u.username.toLowerCase().includes(kw)
          || u.nickname.toLowerCase().includes(kw)
          || u.phone.includes(kw)
          || u.email.toLowerCase().includes(kw),
      )
    }
    if (searchForm.status !== null) {
      filtered = filtered.filter(u => u.status === searchForm.status)
    }
    if (searchForm.deptId !== null) {
      filtered = filtered.filter(u => u.deptId === searchForm.deptId)
    }

    pagination.total = filtered.length
    const start = (pagination.page - 1) * pagination.pageSize
    tableData.value = filtered.slice(start, start + pagination.pageSize)
    loading.value = false
  }, 300)
}

// ===== 新增 / 编辑 =====
const formRef = ref<FormInstance>()
const dialog = reactive({
  visible: false,
  isEdit: false,
  loading: false,
  form: {
    id: 0,
    username: '',
    password: '',
    nickname: '',
    phone: '',
    email: '',
    deptId: null as number | null,
    status: 1,
  },
})

const formRules: FormRules = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { pattern: /^\w{3,20}$/, message: '3-20位字母数字下划线', trigger: 'blur' },
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码至少6位', trigger: 'blur' },
  ],
  nickname: [{ required: true, message: '请输入昵称', trigger: 'blur' }],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }],
  email: [{ type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }],
  deptId: [{ required: true, message: '请选择部门', trigger: 'change' }],
}

function handleAdd() {
  dialog.isEdit = false
  dialog.visible = true
}

function handleEdit(row: User) {
  dialog.isEdit = true
  dialog.form = {
    id: row.id,
    username: row.username,
    password: '',
    nickname: row.nickname,
    phone: row.phone,
    email: row.email,
    deptId: row.deptId,
    status: row.status,
  }
  dialog.visible = true
}

function handleDialogClose() {
  formRef.value?.resetFields()
  dialog.form = { id: 0, username: '', password: '', nickname: '', phone: '', email: '', deptId: null, status: 1 }
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid)
    return

  dialog.loading = true
  setTimeout(() => {
    const deptName = deptOptions.find(d => d.id === dialog.form.deptId)?.name ?? '-'

    if (dialog.isEdit) {
      const idx = allUsers.findIndex(u => u.id === dialog.form.id)
      if (idx !== -1) {
        allUsers[idx] = {
          ...allUsers[idx],
          nickname: dialog.form.nickname,
          phone: dialog.form.phone,
          email: dialog.form.email,
          deptId: dialog.form.deptId,
          deptName,
          status: dialog.form.status,
        }
      }
      ElMessage.success('编辑成功')
    }
    else {
      const newUser: User = {
        id: ++idCounter,
        username: dialog.form.username,
        nickname: dialog.form.nickname,
        phone: dialog.form.phone,
        email: dialog.form.email,
        deptId: dialog.form.deptId,
        deptName,
        status: dialog.form.status,
        createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
      }
      allUsers.unshift(newUser)
      ElMessage.success('新增成功')
    }

    dialog.visible = false
    dialog.loading = false
    fetchData()
  }, 400)
}

// ===== 删除 =====
function handleDelete(row: User) {
  allUsers = allUsers.filter(u => u.id !== row.id)
  ElMessage.success('删除成功')
  fetchData()
}

function handleBatchDelete() {
  if (!selectedIds.value.length)
    return
  ElMessageBox.confirm(`确定删除选中的 ${selectedIds.value.length} 个用户？`, '批量删除', {
    type: 'warning',
  }).then(() => {
    allUsers = allUsers.filter(u => !selectedIds.value.includes(u.id))
    selectedIds.value = []
    ElMessage.success('批量删除成功')
    fetchData()
  })
}

// ===== 状态切换 =====
function handleToggleStatus(row: User, val: boolean) {
  row.status = val ? 1 : 0
  const target = allUsers.find(u => u.id === row.id)
  if (target)
    target.status = row.status
  ElMessage.success(`已${val ? '启用' : '禁用'}用户「${row.nickname}」`)
}

// ===== 重置密码 =====
function handleResetPwd(row: User) {
  ElMessageBox.confirm(`确定重置用户「${row.nickname}」的密码？`, '重置密码', { type: 'warning' }).then(() => {
    ElMessage.success('密码已重置为默认密码')
  })
}

onMounted(() => {
  fetchData()
})
</script>

<template>
  <div class="system-page">
    <div class="page-header">
      <h2 class="page-header__title">
        用户管理
      </h2>
      <p class="page-header__desc">
        管理系统用户，支持新增、编辑、删除及状态切换
      </p>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <EasyInput
        v-model="searchForm.keyword" placeholder="搜索用户名 / 手机号 / 邮箱" clearable style="width: 260px"
        @keyup.enter="handleSearch"
      />
      <EasySelect
        v-model="searchForm.status" placeholder="用户状态" clearable
        :options="[{ label: '启用', value: 1 }, { label: '禁用', value: 0 }]" style="width: 140px"
      />
      <EasySelect
        v-model="searchForm.deptId" placeholder="所属部门" clearable :options="deptOptions" label-key="name"
        value-key="id" style="width: 160px"
      />
      <EasyButton type="primary" @click="handleSearch">
        查询
      </EasyButton>
      <EasyButton @click="handleReset">
        重置
      </EasyButton>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <EasyButton type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>新增用户
      </EasyButton>
      <EasyButton :disabled="!selectedIds.length" @click="handleBatchDelete">
        <el-icon><Delete /></el-icon>批量删除
      </EasyButton>
    </div>

    <!-- 数据表格 -->
    <EasyTable
      ref="tableRef" v-loading="loading" :data="tableData" :columns="columns" selection-mode="multiple" stripe
      border :pagination="true" :total="pagination.total" :page="pagination.page" :page-size="pagination.pageSize"
      :page-size-options="[10, 20, 50, 100]" action-label="操作" :action-width="200" action-fixed="right"
      @selection-change="handleSelectionChange" @page-change="(p: number) => { pagination.page = p; fetchData() }"
      @page-size-change="(s: number) => { pagination.pageSize = s; fetchData() }"
    >
      <template #col-status="{ row }">
        <EasySwitch
          :model-value="row.status === 1" active-text="启" inactive-text="禁"
          @change="(val: boolean) => handleToggleStatus(row, val)"
        />
      </template>
      <template #action="{ row }">
        <EasyButton link type="primary" size="small" @click="handleEdit(row)">
          编辑
        </EasyButton>
        <EasyButton link type="primary" size="small" @click="handleResetPwd(row)">
          重置密码
        </EasyButton>
        <el-popconfirm title="确定删除该用户？" @confirm="handleDelete(row)">
          <template #reference>
            <EasyButton link type="danger" size="small">
              删除
            </EasyButton>
          </template>
        </el-popconfirm>
      </template>
    </EasyTable>

    <!-- 新增 / 编辑 弹窗 -->
    <el-dialog
      v-model="dialog.visible" :title="dialog.isEdit ? '编辑用户' : '新增用户'" width="550px"
      :close-on-click-modal="false" @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="dialog.form" :rules="formRules" label-width="90px">
        <el-form-item label="用户名" prop="username">
          <EasyInput v-model="dialog.form.username" placeholder="请输入用户名" :disabled="dialog.isEdit" />
        </el-form-item>
        <el-form-item v-if="!dialog.isEdit" label="密码" prop="password">
          <el-input v-model="dialog.form.password" type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item label="昵称" prop="nickname">
          <EasyInput v-model="dialog.form.nickname" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <EasyInput v-model="dialog.form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <EasyInput v-model="dialog.form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="所属部门" prop="deptId">
          <EasySelect
            v-model="dialog.form.deptId" placeholder="请选择部门" :options="deptOptions" label-key="name"
            value-key="id" style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <EasyRadioGroup v-model="dialog.form.status">
            <EasyRadio :label="1">
              启用
            </EasyRadio>
            <EasyRadio :label="0">
              禁用
            </EasyRadio>
          </EasyRadioGroup>
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
  margin-bottom: 16px;
}
.action-bar {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}
.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>
