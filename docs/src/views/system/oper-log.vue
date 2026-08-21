<script setup lang="ts">
import type { TableColumn } from '@raopan/easy-ui'
import { Delete, Download } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { onMounted, reactive, ref } from 'vue'

// ===== 类型 =====
interface LogItem {
  id: number
  operator: string
  module: string
  type: string
  content: string
  params: string
  ip: string
  userAgent: string
  success: boolean
  errorMsg: string
  duration: number
  createTime: string
}

// ===== 常量 =====
const moduleOptions = ['用户管理', '角色管理', '部门管理', '菜单管理', '系统设置', '数据报表']
const typeTagMap: Record<string, string> = {
  INSERT: 'success',
  UPDATE: 'warning',
  DELETE: 'danger',
  EXPORT: 'info',
  LOGIN: '',
}

// ===== Mock 数据 =====
function genLogs(): LogItem[] {
  const operators = ['张伟', '李娜', '王磊', '赵敏', '陈浩']
  const modules = ['用户管理', '角色管理', '部门管理', '菜单管理', '系统设置', '数据报表']
  const types = ['INSERT', 'UPDATE', 'DELETE', 'EXPORT', 'LOGIN']
  const items: LogItem[] = []
  for (let i = 0; i < 35; i++) {
    const type = types[i % types.length]
    const success = i % 10 !== 7
    items.push({
      id: i + 1,
      operator: operators[i % operators.length],
      module: modules[i % modules.length],
      type,
      content: contentMap(type, i),
      params: JSON.stringify({ id: i + 1, name: `record_${i + 1}`, timestamp: Date.now() }, null, 2),
      ip: `192.168.${(i % 4) + 1}.${(i % 255) + 1}`,
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120.0.0.0',
      success,
      errorMsg: success ? '' : '权限不足，操作被拒绝',
      duration: Math.floor(Math.random() * 500) + 50,
      createTime: `2026-07-${String(27 - (i % 27)).padStart(2, '0')} ${String(8 + (i % 14)).padStart(2, '0')}:${String(i % 60).padStart(2, '0')}:${String((i * 7) % 60).padStart(2, '0')}`,
    })
  }
  return items
}

function contentMap(type: string, i: number): string {
  switch (type) {
    case 'INSERT':
      return `新增了用户「user_${i + 10}」`
    case 'UPDATE':
      return `修改了角色「role_${i + 1}」信息`
    case 'DELETE':
      return `删除了部门「dept_${i + 5}」`
    case 'EXPORT':
      return `导出了报表数据（${(i % 3) + 1} 条记录）`
    case 'LOGIN':
      return `用户登录系统`
    default:
      return `执行了操作`
  }
}

let allLogs: LogItem[] = genLogs()

// ===== 搜索 =====
const searchForm = reactive({
  keyword: '',
  module: '',
  type: '',
  dateRange: null as string[] | null,
})

function handleSearch() {
  page.value = 1
  fetchData()
}

function handleReset() {
  searchForm.keyword = ''
  searchForm.module = ''
  searchForm.type = ''
  searchForm.dateRange = null
  page.value = 1
  fetchData()
}

// ===== 表格 =====
const tableRef = ref()
const loading = ref(false)
const tableData = ref<LogItem[]>([])
const page = ref(1)
const pageSize = ref(10)
const total = ref(0)

const columns: TableColumn[] = [
  { prop: 'id', name: 'ID', width: 70 },
  { prop: 'operator', name: '操作人', minWidth: 110 },
  { prop: 'module', name: '操作模块', width: 110 },
  { prop: 'type', name: '操作类型', width: 90, align: 'center' },
  { prop: 'content', name: '操作内容', minWidth: 220, ellipsis: true },
  { prop: 'ip', name: 'IP 地址', width: 140 },
  { prop: 'success', name: '状态', width: 80, align: 'center' },
  { prop: 'duration', name: '耗时', width: 80, align: 'center' },
  { prop: 'createTime', name: '操作时间', width: 170 },
]

function fetchData() {
  loading.value = true
  setTimeout(() => {
    let filtered = [...allLogs]

    if (searchForm.keyword) {
      const kw = searchForm.keyword.toLowerCase()
      filtered = filtered.filter(l => l.operator.toLowerCase().includes(kw) || l.content.toLowerCase().includes(kw))
    }
    if (searchForm.module) {
      filtered = filtered.filter(l => l.module === searchForm.module)
    }
    if (searchForm.type) {
      filtered = filtered.filter(l => l.type === searchForm.type)
    }
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      const [start, end] = searchForm.dateRange
      filtered = filtered.filter(l => l.createTime >= start && l.createTime <= `${end} 23:59:59`)
    }

    total.value = filtered.length
    const start = (page.value - 1) * pageSize.value
    tableData.value = filtered.slice(start, start + pageSize.value)
    loading.value = false
  }, 200)
}

// ===== 详情 =====
const detailVisible = ref(false)
const detailData = reactive<LogItem>({
  id: 0,
  operator: '',
  module: '',
  type: '',
  content: '',
  params: '',
  ip: '',
  userAgent: '',
  success: true,
  errorMsg: '',
  duration: 0,
  createTime: '',
})

function handleDetail(row: LogItem) {
  Object.assign(detailData, row)
  detailVisible.value = true
}

// ===== 导出 =====
function handleExport() {
  ElMessage.success('已触发日志导出，请在通知中心查看下载链接')
}

// ===== 清空 =====
function handleClear() {
  ElMessageBox.confirm('确定清空所有操作日志？此操作不可恢复。', '清空日志', {
    type: 'warning',
  }).then(() => {
    allLogs = []
    ElMessage.success('日志已清空')
    fetchData()
  })
}

onMounted(() => fetchData())
</script>

<template>
  <div class="system-page">
    <div class="page-header">
      <h2 class="page-header__title">
        操作日志
      </h2>
      <p class="page-header__desc">
        查看系统操作日志，支持按人员、模块、时间等条件筛选
      </p>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <EasyInput
        v-model="searchForm.keyword"
        placeholder="操作人 / 操作内容"
        clearable
        style="width: 220px"
        @keyup.enter="handleSearch"
      />
      <EasySelect v-model="searchForm.module" placeholder="操作模块" clearable :options="moduleOptions" style="width: 140px" />
      <EasySelect
        v-model="searchForm.type"
        placeholder="操作类型"
        clearable
        :options="[{ label: '新增', value: 'INSERT' }, { label: '修改', value: 'UPDATE' }, { label: '删除', value: 'DELETE' }, { label: '导出', value: 'EXPORT' }, { label: '登录', value: 'LOGIN' }]"
        style="width: 130px"
      />
      <el-date-picker
        v-model="searchForm.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
        style="width: 260px"
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
      <EasyButton @click="handleExport">
        <el-icon><Download /></el-icon>导出日志
      </EasyButton>
      <EasyButton @click="handleClear">
        <el-icon><Delete /></el-icon>清空日志
      </EasyButton>
    </div>

    <!-- 数据表格 -->
    <EasyTable
      ref="tableRef"
      v-loading="loading"
      :data="tableData"
      :columns="columns"
      stripe
      border
      :pagination="true"
      :total="total"
      :page="page"
      :page-size="pageSize"
      :page-size-options="[10, 20, 50, 100]"
      action-label="操作"
      :action-width="80"
      action-fixed="right"
      @page-change="(p: number) => { page.value = p; fetchData() }"
      @page-size-change="(s: number) => { pageSize.value = s; fetchData() }"
    >
      <template #col-type="{ row }">
        <EasyTag :type="typeTagMap[row.type] || 'info'" size="small" effect="plain">
          {{ row.type }}
        </EasyTag>
      </template>
      <template #col-success="{ row }">
        <EasyTag :type="row.success ? 'success' : 'danger'" size="small">
          {{ row.success ? '成功' : '失败' }}
        </EasyTag>
      </template>
      <template #col-duration="{ row }">
        {{ row.duration }}ms
      </template>
      <template #col-createTime="{ row }">
        {{ row.createTime }}
      </template>
      <template #action="{ row }">
        <EasyButton link type="primary" size="small" @click="handleDetail(row)">
          详情
        </EasyButton>
      </template>
    </EasyTable>

    <!-- 日志详情弹窗 -->
    <el-dialog v-model="detailVisible" title="日志详情" width="550px">
      <EasyDescriptions :column="1" :bordered="true">
        <EasyDescriptionsItem label="日志 ID">
          {{ detailData.id }}
        </EasyDescriptionsItem>
        <EasyDescriptionsItem label="操作人">
          {{ detailData.operator }}
        </EasyDescriptionsItem>
        <EasyDescriptionsItem label="操作模块">
          {{ detailData.module }}
        </EasyDescriptionsItem>
        <EasyDescriptionsItem label="操作类型">
          <EasyTag :type="typeTagMap[detailData.type] || 'info'" size="small">
            {{ detailData.type }}
          </EasyTag>
        </EasyDescriptionsItem>
        <EasyDescriptionsItem label="操作内容">
          {{ detailData.content }}
        </EasyDescriptionsItem>
        <EasyDescriptionsItem label="请求参数">
          <pre class="detail-json">{{ detailData.params }}</pre>
        </EasyDescriptionsItem>
        <EasyDescriptionsItem label="IP 地址">
          {{ detailData.ip }}
        </EasyDescriptionsItem>
        <EasyDescriptionsItem label="设备信息">
          {{ detailData.userAgent }}
        </EasyDescriptionsItem>
        <EasyDescriptionsItem label="状态">
          <EasyTag :type="detailData.success ? 'success' : 'danger'" size="small">
            {{ detailData.success ? '成功' : '失败' }}
          </EasyTag>
        </EasyDescriptionsItem>
        <EasyDescriptionsItem v-if="!detailData.success" label="错误信息">
          <span style="color: var(--el-color-danger)">{{ detailData.errorMsg }}</span>
        </EasyDescriptionsItem>
        <EasyDescriptionsItem label="操作时间">
          {{ detailData.createTime }}
        </EasyDescriptionsItem>
      </EasyDescriptions>
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
.detail-json {
  margin: 0;
  padding: 8px 12px;
  background: var(--el-fill-color-light);
  border-radius: 4px;
  font-size: 13px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
</style>
