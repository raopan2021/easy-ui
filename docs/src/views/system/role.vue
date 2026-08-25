<script setup lang="ts">
import type { TableColumn } from '@raopan/easy-ui'
import type { FormInstance, FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'

// ===== 类型 =====
interface Role {
  id: number
  name: string
  code: string
  description: string
  status: number
  userCount: number
  createTime: string
  menuIds: number[]
}

// ===== 菜单树 =====
const menuTree = [
  {
    id: 1,
    name: '首页',
  },
  {
    id: 2,
    name: '基础组件',
    children: [
      { id: 21, name: '按钮 Button' },
      { id: 22, name: '图标 Icon' },
      { id: 23, name: '水印 Watermark' },
      { id: 24, name: 'CRUD 完整示例' },
    ],
  },
  {
    id: 3,
    name: '数据展示',
    children: [
      { id: 31, name: '表格 Table' },
      { id: 32, name: '图表 Chart' },
      { id: 33, name: '甘特图 Gantt' },
      { id: 34, name: '部门树 DeptTree' },
    ],
  },
  {
    id: 4,
    name: '表单组件',
    children: [
      { id: 41, name: '输入框 Input' },
      { id: 42, name: '表单 Form' },
      { id: 43, name: '文件上传 FileUpload' },
    ],
  },
  {
    id: 5,
    name: '菜单演示',
    children: [
      { id: 51, name: '用户管理' },
      { id: 52, name: '角色管理' },
      { id: 53, name: '操作日志' },
    ],
  },
]

// ===== Mock 数据 =====
let idCounter = 10
function genRoles(): Role[] {
  return [
    {
      id: 1,
      name: '超级管理员',
      code: 'super_admin',
      description: '拥有系统全部权限',
      status: 1,
      userCount: 2,
      createTime: '2026-01-15 09:00:00',
      menuIds: [1, 2, 21, 22, 23, 24, 3, 31, 32, 33, 34, 4, 41, 42, 43, 5, 51, 52, 53],
    },
    {
      id: 2,
      name: '内容编辑',
      code: 'editor',
      description: '负责内容管理及发布',
      status: 1,
      userCount: 5,
      createTime: '2026-02-20 14:30:00',
      menuIds: [1, 2, 21, 22, 3, 31, 32],
    },
    {
      id: 3,
      name: '数据分析员',
      code: 'analyst',
      description: '查看数据报表与图表',
      status: 1,
      userCount: 3,
      createTime: '2026-03-10 11:00:00',
      menuIds: [1, 3, 31, 32, 33, 34],
    },
    {
      id: 4,
      name: '运营专员',
      code: 'operator',
      description: '日常运营操作',
      status: 1,
      userCount: 8,
      createTime: '2026-04-05 16:20:00',
      menuIds: [1, 2, 21, 4, 41, 42, 5, 51, 52],
    },
    {
      id: 5,
      name: '访客',
      code: 'visitor',
      description: '仅查看首页与公告',
      status: 0,
      userCount: 12,
      createTime: '2026-05-18 08:45:00',
      menuIds: [1],
    },
    {
      id: 6,
      name: '财务审批',
      code: 'finance',
      description: '财务相关审批流程',
      status: 1,
      userCount: 2,
      createTime: '2026-06-22 10:10:00',
      menuIds: [1, 4, 41, 42, 5, 51, 52, 53],
    },
    {
      id: 7,
      name: 'HR 管理',
      code: 'hr',
      description: '人力资源相关操作',
      status: 1,
      userCount: 1,
      createTime: '2026-07-08 13:40:00',
      menuIds: [1, 5, 51, 52, 53],
    },
  ]
}

let allRoles: Role[] = genRoles()

// ===== 搜索 =====
const searchKeyword = ref('')
function doSearch() {
  page.value = 1
  fetchData()
}
function resetSearch() {
  searchKeyword.value = ''
  page.value = 1
  fetchData()
}

// ===== 表格 =====
const loading = ref(false)
const tableData = ref<Role[]>([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const columns: TableColumn[] = [
  { prop: 'id', name: 'ID', width: 70 },
  { prop: 'name', name: '角色名称', minWidth: 130 },
  { prop: 'code', name: '角色编码', minWidth: 150 },
  { prop: 'description', name: '描述', minWidth: 200, ellipsis: true },
  { prop: 'status', name: '状态', width: 80, align: 'center' },
  { prop: 'userCount', name: '用户数', width: 80, align: 'center' },
  { prop: 'createTime', name: '创建时间', width: 170 },
]

function fetchData() {
  loading.value = true
  setTimeout(() => {
    let filtered = [...allRoles]
    if (searchKeyword.value) {
      const kw = searchKeyword.value.toLowerCase()
      filtered = filtered.filter(r => r.name.toLowerCase().includes(kw) || r.code.toLowerCase().includes(kw))
    }
    total.value = filtered.length
    const start = (page.value - 1) * pageSize.value
    tableData.value = filtered.slice(start, start + pageSize.value)
    loading.value = false
  }, 200)
}

// ===== 新增 / 编辑 =====
const formRef = ref<FormInstance>()
const dialog = reactive({
  visible: false,
  isEdit: false,
  loading: false,
  form: { id: 0, name: '', code: '', description: '', status: 1 },
})
const formRules: FormRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [
    { required: true, message: '请输入角色编码', trigger: 'blur' },
    { pattern: /^[a-z]\w{2,30}$/i, message: '字母开头，3-30位字母数字下划线', trigger: 'blur' },
  ],
}

function handleAdd() {
  dialog.isEdit = false
  dialog.visible = true
}
function handleEdit(row: Role) {
  dialog.isEdit = true
  dialog.form = { id: row.id, name: row.name, code: row.code, description: row.description, status: row.status }
  dialog.visible = true
}

function handleDialogClose() {
  formRef.value?.resetFields()
  dialog.form = { id: 0, name: '', code: '', description: '', status: 1 }
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid)
    return

  dialog.loading = true
  setTimeout(() => {
    if (dialog.isEdit) {
      const idx = allRoles.findIndex(r => r.id === dialog.form.id)
      if (idx !== -1) {
        allRoles[idx] = {
          ...allRoles[idx],
          name: dialog.form.name,
          description: dialog.form.description,
          status: dialog.form.status,
        }
      }
      ElMessage.success('编辑成功')
    }
    else {
      allRoles.unshift({
        id: ++idCounter,
        name: dialog.form.name,
        code: dialog.form.code,
        description: dialog.form.description,
        status: 1,
        userCount: 0,
        createTime: new Date().toLocaleString('zh-CN', { hour12: false }).replace(/\//g, '-'),
        menuIds: [],
      })
      ElMessage.success('新增成功')
    }
    dialog.visible = false
    dialog.loading = false
    fetchData()
  }, 400)
}

// ===== 删除 =====
function handleDelete(row: Role) {
  allRoles = allRoles.filter(r => r.id !== row.id)
  ElMessage.success('删除成功')
  fetchData()
}

// ===== 分配权限 =====
const treeRef = ref()
const permDialog = reactive({
  visible: false,
  roleId: 0,
  roleName: '',
  checkedKeys: [] as number[],
})

function handleAssignPermission(row: Role) {
  permDialog.roleId = row.id
  permDialog.roleName = row.name
  permDialog.checkedKeys = [...row.menuIds]
  permDialog.visible = true
}

function handlePermSubmit() {
  const checkedKeys = treeRef.value?.getCheckedKeys() ?? []
  const halfCheckedKeys = treeRef.value?.getHalfCheckedKeys() ?? []
  const allKeys = [...checkedKeys, ...halfCheckedKeys]
  const role = allRoles.find(r => r.id === permDialog.roleId)
  if (role)
    role.menuIds = allKeys
  ElMessage.success('权限保存成功')
  permDialog.visible = false
}

onMounted(() => fetchData())
</script>

<template>
  <div class="system-page">
    <div class="page-header">
      <h2 class="page-header__title">
        角色管理
      </h2>
      <p class="page-header__desc">
        管理角色及对应菜单权限，支持新增、编辑、删除及权限分配
      </p>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <EasyInput v-model="searchKeyword" placeholder="搜索角色名称" clearable style="width: 260px" @keyup.enter="doSearch" />
      <EasyButton type="primary" @click="doSearch">
        查询
      </EasyButton>
      <EasyButton @click="resetSearch">
        重置
      </EasyButton>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <EasyButton type="primary" @click="handleAdd">
        <el-icon><Plus /></el-icon>新增角色
      </EasyButton>
    </div>

    <!-- 数据表格 -->
    <EasyTable
      v-loading="loading" :data="tableData" :columns="columns" stripe border :pagination="true" :total="total"
      :page="page" :page-size="pageSize" :page-size-options="[10, 20, 50]" action-label="操作" :action-width="240"
      action-fixed="right" @page-change="(p: number) => { page.value = p; fetchData() }"
      @page-size-change="(s: number) => { pageSize.value = s; fetchData() }"
    >
      <template #col-status="{ row }">
        <EasyTag :type="row.status === 1 ? 'success' : 'info'" size="small">
          {{ row.status === 1 ? '启用' : '禁用' }}
        </EasyTag>
      </template>
      <template #action="{ row }">
        <EasyButton link type="primary" size="small" @click="handleEdit(row)">
          编辑
        </EasyButton>
        <EasyButton link type="primary" size="small" @click="handleAssignPermission(row)">
          分配权限
        </EasyButton>
        <el-popconfirm title="确定删除该角色？" @confirm="handleDelete(row)">
          <template #reference>
            <EasyButton link type="danger" size="small">
              删除
            </EasyButton>
          </template>
        </el-popconfirm>
      </template>
    </EasyTable>

    <!-- 新增 / 编辑弹窗 -->
    <el-dialog
      v-model="dialog.visible" :title="dialog.isEdit ? '编辑角色' : '新增角色'" width="500px"
      :close-on-click-modal="false" @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="dialog.form" :rules="formRules" label-width="90px">
        <el-form-item label="角色名称" prop="name">
          <EasyInput v-model="dialog.form.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <EasyInput v-model="dialog.form.code" placeholder="请输入角色编码" :disabled="dialog.isEdit" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <EasyInput v-model="dialog.form.description" type="textarea" :rows="3" placeholder="请输入角色描述" />
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

    <!-- 分配权限弹窗 -->
    <el-dialog
      v-model="permDialog.visible" :title="`分配权限 — ${permDialog.roleName}`" width="500px"
      :close-on-click-modal="false"
    >
      <el-tree
        ref="treeRef" :data="menuTree" show-checkbox node-key="id" :default-checked-keys="permDialog.checkedKeys"
        :props="{ label: 'name', children: 'children' }" default-expand-all style="max-height: 400px; overflow: auto"
      />
      <template #footer>
        <EasyButton @click="permDialog.visible = false">
          取消
        </EasyButton>
        <EasyButton type="primary" @click="handlePermSubmit">
          保存权限
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
