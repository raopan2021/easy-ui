<script setup lang="ts">
import type { FormInstance, FormRules } from 'element-plus'
import { Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'

interface DictTypeItem {
  id: number
  name: string
  code: string
  status: number
}
interface DictDataItem {
  id: number
  typeCode: string
  label: string
  value: string
  tagType: string
  sort: number
  status: number
}

let typeIdCounter = 10
let dataIdCounter = 100

function genMockTypes(): DictTypeItem[] {
  return [
    { id: 1, name: '用户性别', code: 'sys_user_sex', status: 1 },
    { id: 2, name: '用户状态', code: 'sys_user_status', status: 1 },
    { id: 3, name: '通知类型', code: 'sys_notice_type', status: 1 },
    { id: 4, name: '操作类型', code: 'sys_oper_type', status: 0 },
    { id: 5, name: '订单状态', code: 'biz_order_status', status: 1 },
  ]
}

function genMockData(): DictDataItem[] {
  return [
    { id: 1, typeCode: 'sys_user_sex', label: '男', value: '0', tagType: 'primary', sort: 1, status: 1 },
    { id: 2, typeCode: 'sys_user_sex', label: '女', value: '1', tagType: 'danger', sort: 2, status: 1 },
    { id: 3, typeCode: 'sys_user_sex', label: '未知', value: '2', tagType: 'info', sort: 3, status: 1 },
    { id: 4, typeCode: 'sys_user_status', label: '正常', value: '0', tagType: 'success', sort: 1, status: 1 },
    { id: 5, typeCode: 'sys_user_status', label: '停用', value: '1', tagType: 'danger', sort: 2, status: 1 },
    { id: 6, typeCode: 'sys_user_status', label: '锁定', value: '2', tagType: 'warning', sort: 3, status: 1 },
    { id: 7, typeCode: 'sys_notice_type', label: '通知', value: '1', tagType: 'info', sort: 1, status: 1 },
    { id: 8, typeCode: 'sys_notice_type', label: '公告', value: '2', tagType: 'warning', sort: 2, status: 1 },
    { id: 9, typeCode: 'sys_oper_type', label: '新增', value: 'INSERT', tagType: 'success', sort: 1, status: 1 },
    { id: 10, typeCode: 'sys_oper_type', label: '修改', value: 'UPDATE', tagType: 'primary', sort: 2, status: 1 },
    { id: 11, typeCode: 'sys_oper_type', label: '删除', value: 'DELETE', tagType: 'danger', sort: 3, status: 1 },
    { id: 12, typeCode: 'biz_order_status', label: '待支付', value: '0', tagType: 'warning', sort: 1, status: 1 },
    { id: 13, typeCode: 'biz_order_status', label: '已支付', value: '1', tagType: 'success', sort: 2, status: 1 },
    { id: 14, typeCode: 'biz_order_status', label: '已发货', value: '2', tagType: 'primary', sort: 3, status: 1 },
    { id: 15, typeCode: 'biz_order_status', label: '已完成', value: '3', tagType: 'info', sort: 4, status: 1 },
    { id: 16, typeCode: 'biz_order_status', label: '已取消', value: '4', tagType: 'danger', sort: 5, status: 1 },
  ]
}

let allTypes: DictTypeItem[] = genMockTypes()
let allDataItems: DictDataItem[] = genMockData()

// ===== 左侧：字典类型 =====
const typeLoading = ref(false)
const typeData = ref<DictTypeItem[]>([])
const typeSearch = reactive({ keyword: '' })
const selectedType = ref<DictTypeItem | null>(null)

function fetchTypeData() {
  typeLoading.value = true
  setTimeout(() => {
    let filtered = [...allTypes]
    if (typeSearch.keyword) {
      const kw = typeSearch.keyword.toLowerCase()
      filtered = filtered.filter(t => t.name.includes(kw) || t.code.includes(kw))
    }
    typeData.value = filtered
    typeLoading.value = false
  }, 150)
}

function handleTypeSelect(row: DictTypeItem) {
  selectedType.value = row
  dataPagination.page = 1
  fetchDataData()
}
function handleTypeCurrentChange(row: DictTypeItem | null) {
  if (row)
    handleTypeSelect(row)
}

// 类型弹窗
const typeFormRef = ref<FormInstance>()
const typeDialog = reactive({
  visible: false,
  isEdit: false,
  loading: false,
  form: { id: 0, name: '', code: '', status: 1 },
})
const typeFormRules: FormRules = {
  name: [{ required: true, message: '请输入类型名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入类型编码', trigger: 'blur' }],
}

function getInitTypeForm() {
  return { id: 0, name: '', code: '', status: 1 }
}
function handleAddType() {
  typeDialog.isEdit = false
  typeDialog.form = getInitTypeForm()
  typeDialog.visible = true
}
function handleEditType(row: DictTypeItem) {
  typeDialog.isEdit = true
  typeDialog.form = { ...row }
  typeDialog.visible = true
}
function handleTypeDialogClose() {
  typeFormRef.value?.resetFields()
  typeDialog.form = getInitTypeForm()
}

async function handleTypeSubmit() {
  const valid = await typeFormRef.value?.validate().catch(() => false)
  if (!valid)
    return
  typeDialog.loading = true
  setTimeout(() => {
    if (typeDialog.isEdit) {
      const idx = allTypes.findIndex(t => t.id === typeDialog.form.id)
      if (idx !== -1) {
        const oldCode = allTypes[idx].code
        allTypes[idx] = { ...allTypes[idx], ...typeDialog.form }
        // 同步更新字典数据的 typeCode
        if (oldCode !== typeDialog.form.code) {
          allDataItems.forEach((d) => {
            if (d.typeCode === oldCode)
              d.typeCode = typeDialog.form.code
          })
        }
        // 更新选中项
        if (selectedType.value?.id === typeDialog.form.id) {
          selectedType.value = allTypes[idx]
        }
      }
      ElMessage.success('编辑成功')
    }
    else {
      allTypes.push({ ...typeDialog.form, id: ++typeIdCounter })
      ElMessage.success('新增成功')
    }
    typeDialog.visible = false
    typeDialog.loading = false
    fetchTypeData()
  }, 300)
}

function handleDeleteType(row: DictTypeItem) {
  allTypes = allTypes.filter(t => t.id !== row.id)
  allDataItems = allDataItems.filter(d => d.typeCode !== row.code)
  if (selectedType.value?.id === row.id)
    selectedType.value = null
  ElMessage.success('删除成功')
  fetchTypeData()
}

// ===== 右侧：字典数据 =====
const dataLoading = ref(false)
const dataTableData = ref<DictDataItem[]>([])
const dataSearch = reactive({ keyword: '' })
const dataPagination = reactive({ page: 1, pageSize: 10, total: 0 })

function fetchDataData() {
  if (!selectedType.value)
    return
  dataLoading.value = true
  setTimeout(() => {
    let filtered = allDataItems.filter(d => d.typeCode === selectedType.value!.code)
    if (dataSearch.keyword) {
      const kw = dataSearch.keyword.toLowerCase()
      filtered = filtered.filter(d => d.label.includes(kw) || d.value.includes(kw))
    }
    dataPagination.total = filtered.length
    dataTableData.value = filtered.slice(
      (dataPagination.page - 1) * dataPagination.pageSize,
      dataPagination.page * dataPagination.pageSize,
    )
    dataLoading.value = false
  }, 150)
}

// 数据弹窗
const dataFormRef = ref<FormInstance>()
const dataDialog = reactive({
  visible: false,
  isEdit: false,
  loading: false,
  form: { id: 0, typeCode: '', label: '', value: '', tagType: 'primary', sort: 0, status: 1 },
})
const dataFormRules: FormRules = {
  label: [{ required: true, message: '请输入字典标签', trigger: 'blur' }],
  value: [{ required: true, message: '请输入字典值', trigger: 'blur' }],
  tagType: [{ required: true, message: '请选择回显样式', trigger: 'change' }],
}

function getInitDataForm() {
  return { id: 0, typeCode: '', label: '', value: '', tagType: 'primary', sort: 0, status: 1 }
}

function handleAddData() {
  if (!selectedType.value)
    return
  dataDialog.isEdit = false
  dataDialog.form = getInitDataForm()
  dataDialog.form.typeCode = selectedType.value.code
  dataDialog.visible = true
}

function handleEditData(row: DictDataItem) {
  dataDialog.isEdit = true
  dataDialog.form = { ...row }
  dataDialog.visible = true
}
function handleDataDialogClose() {
  dataFormRef.value?.resetFields()
  dataDialog.form = getInitDataForm()
}

async function handleDataSubmit() {
  const valid = await dataFormRef.value?.validate().catch(() => false)
  if (!valid)
    return
  dataDialog.loading = true
  setTimeout(() => {
    if (dataDialog.isEdit) {
      const idx = allDataItems.findIndex(d => d.id === dataDialog.form.id)
      if (idx !== -1)
        allDataItems[idx] = { ...allDataItems[idx], ...dataDialog.form }
      ElMessage.success('编辑成功')
    }
    else {
      allDataItems.push({ ...dataDialog.form, id: ++dataIdCounter } as DictDataItem)
      ElMessage.success('新增成功')
    }
    dataDialog.visible = false
    dataDialog.loading = false
    fetchDataData()
  }, 300)
}

function handleDeleteData(row: DictDataItem) {
  allDataItems = allDataItems.filter(d => d.id !== row.id)
  ElMessage.success('删除成功')
  fetchDataData()
}

onMounted(() => {
  fetchTypeData()
  // 默认选中第一项
  setTimeout(() => {
    if (typeData.value.length)
      handleTypeSelect(typeData.value[0])
  }, 200)
})
</script>

<template>
  <div class="system-page">
    <div class="page-header">
      <h2 class="page-header__title">
        字典管理
      </h2>
      <p class="page-header__desc">
        管理系统字典类型及字典数据，左侧为字典类型，右侧为对应类型的字典数据
      </p>
    </div>

    <div class="dict-layout">
      <!-- 左侧：字典类型 -->
      <div class="dict-left">
        <div class="dict-panel-header">
          <span class="dict-panel-title">字典类型</span>
          <el-button type="primary" size="small" @click="handleAddType">
            <el-icon><Plus /></el-icon>新增
          </el-button>
        </div>
        <div class="dict-panel-search">
          <el-input
            v-model="typeSearch.keyword"
            placeholder="搜索类型"
            size="small"
            clearable
            @keyup.enter="fetchTypeData"
            @clear="fetchTypeData"
          />
        </div>
        <el-table
          v-loading="typeLoading"
          :data="typeData"
          stripe
          highlight-current-row
          size="small"
          max-height="calc(100vh - 360px)"
          @row-click="handleTypeSelect"
          @current-change="handleTypeCurrentChange"
        >
          <el-table-column prop="name" label="名称" min-width="100" />
          <el-table-column prop="code" label="编码" width="110" />
          <el-table-column prop="status" label="状态" width="60">
            <template #default="{ row }">
              <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
                {{
                  row.status === 1 ? '正常' : '停用'
                }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click.stop="handleEditType(row)">
                编辑
              </el-button>
              <el-popconfirm title="确定删除？" @confirm="handleDeleteType(row)">
                <template #reference>
                  <el-button link type="danger" size="small" @click.stop>
                    删除
                  </el-button>
                </template>
              </el-popconfirm>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 右侧：字典数据 -->
      <div class="dict-right">
        <div class="dict-panel-header">
          <span class="dict-panel-title">
            字典数据
            <template v-if="selectedType">
              <span style="color: var(--el-text-color-secondary); font-weight: 400; font-size: 13px">
                - {{ selectedType.name }}（{{ selectedType.code }}）
              </span>
            </template>
          </span>
          <el-button type="primary" size="small" :disabled="!selectedType" @click="handleAddData">
            <el-icon><Plus /></el-icon>新增
          </el-button>
        </div>
        <div class="dict-panel-search">
          <el-input
            v-model="dataSearch.keyword"
            placeholder="搜索标签/值"
            size="small"
            clearable
            @keyup.enter="fetchDataData"
            @clear="fetchDataData"
          />
        </div>
        <div v-if="!selectedType" class="dict-empty-hint">
          <el-empty description="请选择左侧字典类型" :image-size="80" />
        </div>
        <template v-else>
          <el-table v-loading="dataLoading" :data="dataTableData" stripe border size="small">
            <el-table-column prop="id" label="ID" width="60" />
            <el-table-column prop="label" label="字典标签" min-width="130" />
            <el-table-column prop="value" label="字典值" width="140" />
            <el-table-column prop="tagType" label="回显样式" width="100">
              <template #default="{ row }">
                <el-tag :type="row.tagType" size="small">
                  {{ row.label }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="sort" label="排序" width="70" align="center" />
            <el-table-column prop="status" label="状态" width="70">
              <template #default="{ row }">
                <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
                  {{ row.status === 1 ? '正常' : '停用' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="140" fixed="right">
              <template #default="{ row }">
                <el-button link type="primary" size="small" @click="handleEditData(row)">
                  编辑
                </el-button>
                <el-popconfirm title="确定删除？" @confirm="handleDeleteData(row)">
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
              v-model:current-page="dataPagination.page"
              v-model:page-size="dataPagination.pageSize"
              :total="dataPagination.total"
              :page-sizes="[10, 20, 50]"
              layout="total, sizes, prev, pager, next"
              small
              @size-change="fetchDataData"
              @current-change="fetchDataData"
            />
          </div>
        </template>
      </div>
    </div>

    <!-- 字典类型弹窗 -->
    <el-dialog
      v-model="typeDialog.visible"
      :title="typeDialog.isEdit ? '编辑字典类型' : '新增字典类型'"
      width="440px"
      :close-on-click-modal="false"
      @close="handleTypeDialogClose"
    >
      <el-form ref="typeFormRef" :model="typeDialog.form" :rules="typeFormRules" label-width="80px">
        <el-form-item label="类型名称" prop="name">
          <el-input v-model="typeDialog.form.name" placeholder="如: 用户性别" maxlength="20" />
        </el-form-item>
        <el-form-item label="类型编码" prop="code">
          <el-input v-model="typeDialog.form.code" placeholder="如: sys_user_sex" maxlength="30" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="typeDialog.form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="typeDialog.visible = false">
          取消
        </el-button>
        <el-button type="primary" :loading="typeDialog.loading" @click="handleTypeSubmit">
          确定
        </el-button>
      </template>
    </el-dialog>

    <!-- 字典数据弹窗 -->
    <el-dialog
      v-model="dataDialog.visible"
      :title="dataDialog.isEdit ? '编辑字典数据' : '新增字典数据'"
      width="460px"
      :close-on-click-modal="false"
      @close="handleDataDialogClose"
    >
      <el-form ref="dataFormRef" :model="dataDialog.form" :rules="dataFormRules" label-width="90px">
        <el-form-item label="字典标签" prop="label">
          <el-input v-model="dataDialog.form.label" placeholder="如: 男" maxlength="20" />
        </el-form-item>
        <el-form-item label="字典值" prop="value">
          <el-input v-model="dataDialog.form.value" placeholder="如: 0" maxlength="20" />
        </el-form-item>
        <el-form-item label="回显样式" prop="tagType">
          <el-select v-model="dataDialog.form.tagType" placeholder="请选择">
            <el-option value="primary">
              <el-tag type="primary" size="small">
                primary
              </el-tag>
            </el-option>
            <el-option value="success">
              <el-tag type="success" size="small">
                success
              </el-tag>
            </el-option>
            <el-option value="warning">
              <el-tag type="warning" size="small">
                warning
              </el-tag>
            </el-option>
            <el-option value="danger">
              <el-tag type="danger" size="small">
                danger
              </el-tag>
            </el-option>
            <el-option value="info">
              <el-tag type="info" size="small">
                info
              </el-tag>
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="排序号" prop="sort">
          <el-input-number v-model="dataDialog.form.sort" :min="0" :max="999" style="width: 140px" />
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="dataDialog.form.status" :active-value="1" :inactive-value="0" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dataDialog.visible = false">
          取消
        </el-button>
        <el-button type="primary" :loading="dataDialog.loading" @click="handleDataSubmit">
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

.dict-layout {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.dict-left {
  width: 360px;
  flex-shrink: 0;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  overflow: hidden;
  background: var(--el-bg-color);
}

.dict-right {
  flex: 1;
  min-width: 0;
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  overflow: hidden;
  background: var(--el-bg-color);
}

.dict-panel-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--el-border-color-light);
  background: var(--el-fill-color-lighter);
}
.dict-panel-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.dict-panel-search {
  padding: 8px 12px;
}

.dict-empty-hint {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  padding: 8px 12px;
}
</style>
