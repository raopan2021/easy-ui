<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { Plus, RefreshRight, Search } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, onMounted, reactive, ref } from 'vue'

interface DeptItem {
  id: number
  name: string
  code: string
  leader: string
  parentId: number
  sort: number
  status: number
  createTime: string
  children?: DeptItem[]
}

let idCounter = 100
function genMockData(): DeptItem[] {
  return [
    {
      id: 1,
      name: '总公司',
      code: 'headquarters',
      leader: '张总',
      parentId: 0,
      sort: 1,
      status: 1,
      createTime: '2025-06-01 09:00:00',
      children: [
        {
          id: 11,
          name: '技术部',
          code: 'tech_dept',
          leader: '李经理',
          parentId: 1,
          sort: 1,
          status: 1,
          createTime: '2025-06-01 09:30:00',
          children: [
            {
              id: 111,
              name: '前端组',
              code: 'frontend',
              leader: '王组长',
              parentId: 11,
              sort: 1,
              status: 1,
              createTime: '2025-06-15 10:00:00',
            },
            {
              id: 112,
              name: '后端组',
              code: 'backend',
              leader: '赵组长',
              parentId: 11,
              sort: 2,
              status: 1,
              createTime: '2025-06-15 10:30:00',
            },
          ],
        },
        {
          id: 12,
          name: '产品部',
          code: 'product_dept',
          leader: '陈经理',
          parentId: 1,
          sort: 2,
          status: 1,
          createTime: '2025-06-01 09:30:00',
        },
        {
          id: 13,
          name: '市场部',
          code: 'market_dept',
          leader: '刘经理',
          parentId: 1,
          sort: 3,
          status: 0,
          createTime: '2025-06-01 10:00:00',
        },
      ],
    },
    {
      id: 2,
      name: '上海分公司',
      code: 'sh_branch',
      leader: '周总',
      parentId: 0,
      sort: 2,
      status: 1,
      createTime: '2025-08-01 09:00:00',
      children: [
        {
          id: 21,
          name: '销售部',
          code: 'sales_sh',
          leader: '孙经理',
          parentId: 2,
          sort: 1,
          status: 1,
          createTime: '2025-08-01 09:30:00',
        },
      ],
    },
  ]
}

let allData: DeptItem[] = genMockData()

// --- search ---
const searchForm = reactive({ keyword: '' })

function filterTree(list: DeptItem[], keyword: string): DeptItem[] {
  return list.reduce<DeptItem[]>((acc, node) => {
    const children = node.children ? filterTree(node.children, keyword) : []
    if (!keyword || node.name.includes(keyword) || node.code.includes(keyword) || children.length) {
      acc.push({ ...node, children: children.length ? children : node.children ? [] : undefined })
    }
    return acc
  }, [])
}

function deepCloneTree(list: DeptItem[]): DeptItem[] {
  return list.map(n => ({ ...n, children: n.children ? deepCloneTree(n.children) : undefined }))
}

function handleSearch() {
  fetchData()
}
function handleReset() {
  searchForm.keyword = ''
  fetchData()
}

// --- table ---
const tableRef = ref()
const loading = ref(false)
const treeData = ref<DeptItem[]>([])

function flattenTree(list: DeptItem[]): DeptItem[] {
  return list.reduce<DeptItem[]>((acc, n) => {
    acc.push(n)
    if (n.children?.length)
      acc.push(...flattenTree(n.children))
    return acc
  }, [])
}

function expandAll() {
  const flat = flattenTree(allData)
  flat.forEach(row => tableRef.value?.toggleRowExpansion(row, true))
}
function collapseAll() {
  const flat = flattenTree(allData)
  flat.forEach(row => tableRef.value?.toggleRowExpansion(row, false))
}

function fetchData() {
  loading.value = true
  setTimeout(() => {
    const cloned = deepCloneTree(allData)
    treeData.value = searchForm.keyword ? filterTree(cloned, searchForm.keyword) : cloned
    loading.value = false
  }, 200)
}

// --- dialog ---
const formRef = ref<FormInstance>()
const dialog = reactive({
  visible: false,
  isEdit: false,
  loading: false,
  form: {} as DeptItem,
})

const dialogTitle = computed(() => (dialog.isEdit ? '编辑部门' : '新增部门'))

const parentOptions = computed(() => {
  const flat = flattenTree(allData)
  return flat.filter(d => d.status === 1)
})

const formRules: FormRules = {
  name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入部门编码', trigger: 'blur' }],
  leader: [{ required: true, message: '请输入负责人', trigger: 'blur' }],
}

function getInitForm(parentId = 0) {
  return { id: 0, name: '', code: '', leader: '', parentId, sort: 0, status: 1, createTime: '' }
}

function handleAddRoot() {
  dialog.isEdit = false
  dialog.form = getInitForm(0) as DeptItem
  dialog.visible = true
}
function handleAddChild(parent: DeptItem) {
  dialog.isEdit = false
  dialog.form = getInitForm(parent.id) as DeptItem
  dialog.visible = true
}

function handleEdit(row: DeptItem) {
  dialog.isEdit = true
  dialog.form = { ...row, children: undefined }
  dialog.visible = true
}
function handleDialogClose() {
  formRef.value?.resetFields()
  dialog.form = getInitForm() as DeptItem
}

function findAndReplace(list: DeptItem[], id: number, replacer: (n: DeptItem) => DeptItem | null): DeptItem[] {
  return list.reduce<DeptItem[]>((acc, node) => {
    if (node.id === id) {
      const r = replacer(node)
      if (r)
        acc.push(r)
    }
    else {
      acc.push({ ...node, children: node.children ? findAndReplace(node.children, id, replacer) : undefined })
    }
    return acc
  }, [])
}

function gatherIds(list: DeptItem[]): number[] {
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
        leader: dialog.form.leader,
        parentId: dialog.form.parentId,
        sort: dialog.form.sort,
        status: dialog.form.status,
        children: node.children,
      }))
      ElMessage.success('编辑成功')
    }
    else {
      const newNode: DeptItem = {
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
        children: [],
      }
      if (dialog.form.parentId) {
        allData = findAndReplace(allData, dialog.form.parentId, p => ({
          ...p,
          children: [...(p.children || []), newNode],
        }))
      }
      else {
        allData.push(newNode)
      }
      ElMessage.success('新增成功')
    }
    dialog.visible = false
    dialog.loading = false
    fetchData()
  }, 300)
}

function handleDelete(row: DeptItem) {
  const ids = gatherIds([row])
  ids.forEach((id) => {
    allData = findAndReplace(allData, id, () => null)
  })
  ElMessage.success('删除成功')
  fetchData()
}

onMounted(() => fetchData())
</script>

<template>
  <div class="system-page">
    <div class="page-header">
      <h2 class="page-header__title">
        部门设置
      </h2>
      <p class="page-header__desc">
        管理机构组织架构，支持无限层级的部门树管理
      </p>
    </div>

    <div class="search-bar">
      <el-input
        v-model="searchForm.keyword"
        placeholder="搜索部门名称/编码"
        clearable
        style="width: 240px"
        @keyup.enter="handleSearch"
        @clear="handleSearch"
      />
      <el-button type="primary" @click="handleSearch">
        <el-icon><Search /></el-icon>查询
      </el-button>
      <el-button @click="handleReset">
        <el-icon><RefreshRight /></el-icon>重置
      </el-button>
    </div>

    <div class="action-bar">
      <el-button type="primary" @click="handleAddRoot">
        <el-icon><Plus /></el-icon>新增根部门
      </el-button>
      <el-button @click="expandAll">
        展开全部
      </el-button>
      <el-button @click="collapseAll">
        折叠全部
      </el-button>
    </div>

    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="treeData"
      row-key="id"
      stripe
      border
      default-expand-all
      :tree-props="{ children: 'children' }"
    >
      <el-table-column prop="name" label="部门名称" min-width="180">
        <template #default="{ row }">
          <el-icon :size="16" style="margin-right: 6px; vertical-align: middle; color: var(--el-color-primary)">
            <component :is="row.children?.length ? 'FolderOpened' : 'Document'" />
          </el-icon>
          <span :style="{ fontWeight: row.parentId === 0 ? 600 : 400 }">{{ row.name }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="code" label="编码" width="160" />
      <el-table-column prop="leader" label="负责人" width="120" />
      <el-table-column prop="sort" label="排序" width="80" align="center" />
      <el-table-column prop="status" label="状态" width="90">
        <template #default="{ row }">
          <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
            {{ row.status === 1 ? '正常' : '禁用' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" label="创建时间" width="170" />
      <el-table-column label="操作" width="200" fixed="right">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleEdit(row)">
            编辑
          </el-button>
          <el-button link type="success" size="small" @click="handleAddChild(row)">
            新增子部门
          </el-button>
          <el-popconfirm title="确定删除该部门及其子部门？" @confirm="handleDelete(row)">
            <template #reference>
              <el-button link type="danger" size="small">
                删除
              </el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <el-dialog
      v-model="dialog.visible"
      :title="dialogTitle"
      width="520px"
      :close-on-click-modal="false"
      @close="handleDialogClose"
    >
      <el-form ref="formRef" :model="dialog.form" :rules="formRules" label-width="100px">
        <el-form-item label="部门名称" prop="name">
          <el-input v-model="dialog.form.name" placeholder="请输入部门名称" maxlength="20" />
        </el-form-item>
        <el-form-item label="部门编码" prop="code">
          <el-input v-model="dialog.form.code" placeholder="如: tech_dept" maxlength="30" />
        </el-form-item>
        <el-form-item label="负责人" prop="leader">
          <el-input v-model="dialog.form.leader" placeholder="请输入负责人姓名" maxlength="20" />
        </el-form-item>
        <el-form-item label="上级部门" prop="parentId">
          <el-tree-select
            v-model="dialog.form.parentId"
            :data="parentOptions"
            :props="{ label: 'name', value: 'id', children: 'children' }"
            placeholder="请选择（空为根部门）"
            check-strictly
            clearable
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="排序号" prop="sort">
          <el-input-number v-model="dialog.form.sort" :min="0" :max="999" style="width: 140px" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-switch v-model="dialog.form.status" :active-value="1" :inactive-value="0" />
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
</style>
