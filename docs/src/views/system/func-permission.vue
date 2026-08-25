<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { Delete, FolderAdd, Plus, RefreshRight, Search } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'

interface PermissionNode {
  id: number
  name: string
  code: string
  type: 'module' | 'menu' | 'button' | 'api'
  parentId: number
  sort: number
  status: number
  createTime: string
  children?: PermissionNode[]
}

const typeMap: Record<string, { label: string, tag: string }> = {
  menu: { label: '菜单', tag: 'primary' },
  button: { label: '按钮', tag: 'warning' },
  api: { label: '接口', tag: 'info' },
}

let idCounter = 100
function genMockData(): PermissionNode[] {
  return [
    {
      id: 1,
      name: '系统管理',
      code: 'system',
      type: 'module',
      parentId: 0,
      sort: 1,
      status: 1,
      createTime: '2026-01-15 10:00:00',
      children: [
        {
          id: 11,
          name: '用户管理-查看',
          code: 'system:user:list',
          type: 'menu',
          parentId: 1,
          sort: 1,
          status: 1,
          createTime: '2026-01-15 10:00:00',
        },
        {
          id: 12,
          name: '用户管理-新增',
          code: 'system:user:add',
          type: 'button',
          parentId: 1,
          sort: 2,
          status: 1,
          createTime: '2026-01-15 10:00:00',
        },
        {
          id: 13,
          name: '用户管理-编辑',
          code: 'system:user:edit',
          type: 'button',
          parentId: 1,
          sort: 3,
          status: 1,
          createTime: '2026-01-15 10:00:00',
        },
        {
          id: 14,
          name: '用户管理-删除',
          code: 'system:user:delete',
          type: 'button',
          parentId: 1,
          sort: 4,
          status: 1,
          createTime: '2026-01-15 10:00:00',
        },
      ],
    },
    {
      id: 2,
      name: '内容管理',
      code: 'content',
      type: 'module',
      parentId: 0,
      sort: 2,
      status: 1,
      createTime: '2026-01-15 10:00:00',
      children: [
        {
          id: 21,
          name: '文章列表',
          code: 'content:article:list',
          type: 'menu',
          parentId: 2,
          sort: 1,
          status: 1,
          createTime: '2026-01-15 10:00:00',
        },
        {
          id: 22,
          name: '文章管理',
          code: 'content:article:manage',
          type: 'button',
          parentId: 2,
          sort: 2,
          status: 1,
          createTime: '2026-01-15 10:00:00',
        },
      ],
    },
    {
      id: 3,
      name: '数据分析',
      code: 'analytics',
      type: 'module',
      parentId: 0,
      sort: 3,
      status: 0,
      createTime: '2026-01-15 10:00:00',
      children: [
        {
          id: 31,
          name: '数据导出',
          code: 'analytics:export',
          type: 'api',
          parentId: 3,
          sort: 1,
          status: 1,
          createTime: '2026-01-15 10:00:00',
        },
      ],
    },
    {
      id: 4,
      name: '设置中心',
      code: 'settings',
      type: 'module',
      parentId: 0,
      sort: 4,
      status: 1,
      createTime: '2026-01-15 10:00:00',
      children: [],
    },
  ]
}

let allData: PermissionNode[] = genMockData()

// --- search ---
const searchForm = reactive({ keyword: '', type: '' })

function filterTree(list: PermissionNode[], keyword: string, type: string): PermissionNode[] {
  return list.reduce<PermissionNode[]>((acc, node) => {
    const children = node.children ? filterTree(node.children, keyword, type) : []
    const kwMatch = !keyword || node.name.includes(keyword) || node.code.includes(keyword)
    const typeMatch = !type || node.type === type || (node.type === 'module' && children.length > 0)
    if (kwMatch && typeMatch) {
      acc.push({ ...node, children })
    }
    else if (children.length) {
      acc.push({ ...node, children })
    }
    return acc
  }, [])
}

// --- table ---
const loading = ref(false)
const treeData = ref<PermissionNode[]>([])
const selectedRows = ref<PermissionNode[]>([])

function flattenTree(list: PermissionNode[]): PermissionNode[] {
  return list.reduce<PermissionNode[]>((acc, node) => {
    acc.push(node)
    if (node.children?.length)
      acc.push(...flattenTree(node.children))
    return acc
  }, [])
}

function deepCloneTree(list: PermissionNode[]): PermissionNode[] {
  return list.map(n => ({ ...n, children: n.children ? deepCloneTree(n.children) : [] }))
}

function handleSearch() {
  fetchData()
}
function handleReset() {
  searchForm.keyword = ''
  searchForm.type = ''
  fetchData()
}

function handleSelectionChange(rows: PermissionNode[]) {
  selectedRows.value = rows
}

function fetchData() {
  loading.value = true
  setTimeout(() => {
    const cloned = deepCloneTree(allData)
    treeData.value = filterTree(cloned, searchForm.keyword, searchForm.type)
    loading.value = false
  }, 200)
}

// --- dialog ---
const formRef = ref<FormInstance>()
const dialog = reactive({
  visible: false,
  isEdit: false,
  loading: false,
  parentNode: null as PermissionNode | null,
  form: {} as { id: number, name: string, code: string, type: string, parentId: number, sort: number, status: number },
})

const dialogTitle = computed(() => {
  if (dialog.isEdit)
    return dialog.form.type === 'module' ? '编辑模块' : '编辑权限点'
  if (dialog.form.type === 'module')
    return '新增模块'
  return '新增权限点'
})

const parentName = computed(() => {
  const flat = flattenTree(allData)
  const p = flat.find(n => n.id === dialog.form.parentId)
  return p?.name || ''
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入编码', trigger: 'blur' }],
  type: [{ required: true, message: '请选择权限类型', trigger: 'change' }],
}

function getInitForm(type: string, parentId = 0) {
  return { id: 0, name: '', code: '', type, parentId, sort: 0, status: 1 }
}

function handleAddModule() {
  dialog.isEdit = false
  dialog.parentNode = null
  dialog.form = getInitForm('module', 0)
  dialog.visible = true
}

function handleAddPermission() {
  dialog.isEdit = false
  dialog.parentNode = null
  dialog.form = getInitForm('menu', 0)
  dialog.visible = true
}

function handleAddChild(parent: PermissionNode) {
  dialog.isEdit = false
  dialog.parentNode = parent
  dialog.form = getInitForm('menu', parent.id)
  dialog.visible = true
}

function handleEdit(row: PermissionNode) {
  dialog.isEdit = true
  dialog.parentNode = null
  dialog.form = {
    id: row.id,
    name: row.name,
    code: row.code,
    type: row.type,
    parentId: row.parentId,
    sort: row.sort,
    status: row.status,
  }
  dialog.visible = true
}

function handleDialogClose() {
  formRef.value?.resetFields()
  dialog.parentNode = null
  dialog.form = getInitForm('module', 0)
}

function findAndReplace(
  list: PermissionNode[],
  id: number,
  replacer: (node: PermissionNode) => PermissionNode | null,
): PermissionNode[] {
  return list.reduce<PermissionNode[]>((acc, node) => {
    if (node.id === id) {
      const replaced = replacer(node)
      if (replaced)
        acc.push(replaced)
    }
    else {
      acc.push({ ...node, children: node.children ? findAndReplace(node.children, id, replacer) : [] })
    }
    return acc
  }, [])
}

function gatherIds(list: PermissionNode[]): number[] {
  return list.reduce<number[]>((acc, n) => {
    acc.push(n.id)
    if (n.children?.length)
      acc.push(...gatherIds(n.children))
    return acc
  }, [])
}

async function handleSubmit() {
  const valid = await formRef.value?.validate().catch(() => false)
  if (!valid)
    return
  dialog.loading = true
  setTimeout(() => {
    if (dialog.isEdit) {
      allData = findAndReplace(allData, dialog.form.id, node => ({
        ...node,
        name: dialog.form.name,
        code: dialog.form.code,
        type: dialog.form.type as PermissionNode['type'],
        parentId: dialog.form.parentId,
        sort: dialog.form.sort,
        status: dialog.form.status,
        children: node.children,
      }))
      ElMessage.success('编辑成功')
    }
    else {
      const newNode: PermissionNode = {
        id: ++idCounter,
        name: dialog.form.name,
        code: dialog.form.code,
        type: dialog.form.type as PermissionNode['type'],
        parentId: dialog.form.parentId,
        sort: dialog.form.sort,
        status: dialog.form.status,
        createTime: new Date().toLocaleString('zh-CN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
        children: dialog.form.type === 'module' ? [] : undefined,
      }
      if (dialog.form.parentId) {
        allData = findAndReplace(allData, dialog.form.parentId, parent => ({
          ...parent,
          children: [...(parent.children || []), newNode],
        }))
      }
      else {
        allData.unshift(newNode)
      }
      ElMessage.success('新增成功')
    }
    dialog.visible = false
    dialog.loading = false
    fetchData()
  }, 300)
}

function handleDelete(row: PermissionNode) {
  const ids = gatherIds([row])
  allData = findAndReplace(allData, row.id, () => null)
  // also remove from children if it's a leaf
  if (row.parentId) {
    allData = findAndReplace(allData, row.parentId, parent => ({
      ...parent,
      children: (parent.children || []).filter(c => !ids.includes(c.id)),
    }))
  }
  ElMessage.success('删除成功')
  fetchData()
}

async function handleBatchDelete() {
  try {
    await ElMessageBox.confirm(`确定删除选中的 ${selectedRows.value.length} 项？`, '批量删除', { type: 'warning' })
  }
  catch {
    return
  }
  const ids = new Set<number>()
  selectedRows.value.forEach(r => gatherIds([r]).forEach(id => ids.add(id)))
  ids.forEach((id) => {
    allData = findAndReplace(allData, id, () => null)
  })
  // removal from parent arrays already handled by findAndReplace returning null
  const flat = flattenTree(selectedRows.value)
  flat.forEach((r) => {
    if (r.parentId) {
      allData = findAndReplace(allData, r.parentId, parent => ({
        ...parent,
        children: (parent.children || []).filter(c => !ids.has(c.id)),
      }))
    }
  })
  ElMessage.success(`成功删除 ${selectedRows.value.length} 项`)
  selectedRows.value = []
  fetchData()
}

onMounted(() => fetchData())
</script>

<template>
  <div class="system-page">
    <div class="page-header">
      <h2 class="page-header__title">
        功能权限
      </h2>
      <p class="page-header__desc">
        管理系统的功能权限点，支持模块和权限点的两级树形结构
      </p>
    </div>

    <div class="search-bar">
      <EasyInput
        v-model="searchForm.keyword" placeholder="搜索权限名称/编码" clearable style="width: 240px"
        @keyup.enter="handleSearch" @clear="handleSearch"
      />
      <EasySelect
        v-model="searchForm.type" placeholder="权限类型" clearable
        :options="[{ label: '菜单', value: 'menu' }, { label: '按钮', value: 'button' }, { label: '接口', value: 'api' }]"
        style="width: 140px" @change="handleSearch"
      />
      <EasyButton type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon>查询
      </EasyButton>
      <EasyButton @click="handleReset">
        <el-icon><RefreshRight /></el-icon>重置
      </EasyButton>
    </div>

    <div class="action-bar">
      <EasyButton type="primary" @click="handleAddModule">
        <el-icon><FolderAdd /></el-icon>新增模块
      </EasyButton>
      <EasyButton type="success" @click="handleAddPermission">
        <el-icon><Plus /></el-icon>新增权限点
      </EasyButton>
      <EasyButton type="danger" :disabled="!selectedRows.length" @click="handleBatchDelete">
        <el-icon><Delete /></el-icon>批量删除
      </EasyButton>
      <span v-if="selectedRows.length" style="color: var(--el-text-color-secondary); font-size: 13px; margin-left: 8px">
        已选 {{ selectedRows.length }} 项
      </span>
    </div>

    <el-table
      v-loading="loading" :data="treeData" row-key="id" stripe border default-expand-all
      :tree-props="{ children: 'children', hasChildren: 'hasChildren' }" @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" width="50" />
      <el-table-column prop="name" label="名称" min-width="180">
        <template #default="{ row }">
          <span :style="{ fontWeight: row.type === 'module' ? 600 : 400 }">{{ row.name }}</span>
          <EasyTag v-if="row.type === 'module'" size="small" type="info" style="margin-left: 8px">
            模块
          </EasyTag>
        </template>
      </el-table-column>
      <el-table-column prop="code" label="编码" width="200" />
      <el-table-column prop="type" label="类型" width="100">
        <template #default="{ row }">
          <EasyTag v-if="row.type !== 'module'" :type="typeMap[row.type]?.tag" size="small">
            {{ typeMap[row.type]?.label || row.type }}
          </EasyTag>
        </template>
      </el-table-column>
      <el-table-column prop="sort" label="排序" width="80" align="center" />
      <el-table-column prop="status" label="状态" width="90">
        <template #default="{ row }">
          <EasyTag :type="row.status === 1 ? 'success' : 'danger'" size="small">
            {{ row.status === 1 ? '启用' : '禁用' }}
          </EasyTag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="170" />
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <EasyButton link type="primary" size="small" @click="handleEdit(row)">
            编辑
          </EasyButton>
          <EasyButton v-if="row.type === 'module'" link type="success" size="small" @click="handleAddChild(row)">
            添加子权限
          </EasyButton>
          <el-popconfirm title="确定删除该项及其子项？" @confirm="handleDelete(row)">
            <template #reference>
              <EasyButton link type="danger" size="small">
                删除
              </EasyButton>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialog.visible" :title="dialogTitle" width="520px" :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="dialog.form" :rules="formRules" label-width="90px">
        <el-form-item v-if="dialog.form.type === 'module'" label="模块名称" prop="name">
          <EasyInput v-model="dialog.form.name" placeholder="请输入模块名称" maxlength="30" />
        </el-form-item>
        <el-form-item v-else label="权限名称" prop="name">
          <EasyInput v-model="dialog.form.name" placeholder="请输入权限名称" maxlength="30" />
        </el-form-item>
        <el-form-item label="权限编码" prop="code">
          <EasyInput v-model="dialog.form.code" placeholder="如 system:user:add" maxlength="50" />
        </el-form-item>
        <el-form-item v-if="dialog.form.type !== 'module'" label="权限类型" prop="type">
          <EasySelect
            v-model="dialog.form.type" placeholder="请选择"
            :options="[{ label: '菜单', value: 'menu' }, { label: '按钮', value: 'button' }, { label: '接口', value: 'api' }]"
          />
        </el-form-item>
        <el-form-item v-if="dialog.form.parentId" label="上级模块">
          <EasyInput :model-value="parentName" disabled />
        </el-form-item>
        <el-form-item label="排序号" prop="sort">
          <el-input-number v-model="dialog.form.sort" :min="0" :max="999" style="width: 140px" />
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
</style>
