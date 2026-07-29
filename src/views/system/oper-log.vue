<template>
  <div class="system-page">
    <div class="page-header">
      <h2 class="page-header__title">操作日志</h2>
      <p class="page-header__desc">查看系统操作日志，支持按人员、模块、时间等条件筛选</p>
    </div>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <el-input
        v-model="searchForm.keyword"
        placeholder="操作人 / 操作内容"
        clearable
        style="width: 220px"
        @keyup.enter="handleSearch"
      />
      <el-select v-model="searchForm.module" placeholder="操作模块" clearable style="width: 140px">
        <el-option v-for="m in moduleOptions" :key="m" :label="m" :value="m" />
      </el-select>
      <el-select v-model="searchForm.type" placeholder="操作类型" clearable style="width: 130px">
        <el-option label="新增" value="INSERT" />
        <el-option label="修改" value="UPDATE" />
        <el-option label="删除" value="DELETE" />
        <el-option label="导出" value="EXPORT" />
        <el-option label="登录" value="LOGIN" />
      </el-select>
      <el-date-picker
        v-model="searchForm.dateRange"
        type="daterange"
        range-separator="至"
        start-placeholder="开始日期"
        end-placeholder="结束日期"
        value-format="YYYY-MM-DD"
        style="width: 260px"
      />
      <el-button type="primary" @click="handleSearch">查询</el-button>
      <el-button @click="handleReset">重置</el-button>
    </div>

    <!-- 操作栏 -->
    <div class="action-bar">
      <el-button @click="handleExport">
        <el-icon><Download /></el-icon>导出日志
      </el-button>
      <el-button @click="handleClear">
        <el-icon><Delete /></el-icon>清空日志
      </el-button>
    </div>

    <!-- 数据表格 -->
    <el-table
      ref="tableRef"
      v-loading="loading"
      :data="tableData"
      stripe
      border
      style="width: 100%"
    >
      <el-table-column prop="id" label="ID" width="70" />
      <el-table-column prop="operator" label="操作人" min-width="110" />
      <el-table-column prop="module" label="操作模块" width="110" />
      <el-table-column label="操作类型" width="90" align="center">
        <template #default="{ row }">
          <el-tag
            :type="typeTagMap[row.type] || 'info'"
            size="small"
            effect="plain"
          >
            {{ row.type }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="content" label="操作内容" min-width="220" show-overflow-tooltip />
      <el-table-column prop="ip" label="IP 地址" width="140" />
      <el-table-column label="状态" width="80" align="center">
        <template #default="{ row }">
          <el-tag :type="row.success ? 'success' : 'danger'" size="small">
            {{ row.success ? '成功' : '失败' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="耗时" width="80" align="center">
        <template #default="{ row }">{{ row.duration }}ms</template>
      </el-table-column>
      <el-table-column label="操作时间" width="170">
        <template #default="{ row }">{{ row.createTime }}</template>
      </el-table-column>
      <el-table-column label="操作" width="80" fixed="right" align="center">
        <template #default="{ row }">
          <el-button link type="primary" size="small" @click="handleDetail(row)">详情</el-button>
        </template>
      </el-table-column>
    </el-table>

    <div class="pagination-wrap">
      <el-pagination
        v-model:current-page="page"
        v-model:page-size="pageSize"
        :total="total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="fetchData"
        @current-change="fetchData"
      />
    </div>

    <!-- 日志详情弹窗 -->
    <el-dialog v-model="detailVisible" title="日志详情" width="550px">
      <el-descriptions :column="1" border>
        <el-descriptions-item label="日志 ID">{{ detailData.id }}</el-descriptions-item>
        <el-descriptions-item label="操作人">{{ detailData.operator }}</el-descriptions-item>
        <el-descriptions-item label="操作模块">{{ detailData.module }}</el-descriptions-item>
        <el-descriptions-item label="操作类型">
          <el-tag :type="typeTagMap[detailData.type] || 'info'" size="small">{{ detailData.type }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="操作内容">{{ detailData.content }}</el-descriptions-item>
        <el-descriptions-item label="请求参数">
          <pre class="detail-json">{{ detailData.params }}</pre>
        </el-descriptions-item>
        <el-descriptions-item label="IP 地址">{{ detailData.ip }}</el-descriptions-item>
        <el-descriptions-item label="设备信息">{{ detailData.userAgent }}</el-descriptions-item>
        <el-descriptions-item label="状态">
          <el-tag :type="detailData.success ? 'success' : 'danger'" size="small">
            {{ detailData.success ? '成功' : '失败' }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item v-if="!detailData.success" label="错误信息">
          <span style="color: var(--el-color-danger)">{{ detailData.errorMsg }}</span>
        </el-descriptions-item>
        <el-descriptions-item label="操作时间">{{ detailData.createTime }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Download, Delete } from '@element-plus/icons-vue'

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
    case 'INSERT': return `新增了用户「user_${i + 10}」`
    case 'UPDATE': return `修改了角色「role_${i + 1}」信息`
    case 'DELETE': return `删除了部门「dept_${i + 5}」`
    case 'EXPORT': return `导出了报表数据（${
      (i % 3) + 1
    } 条记录）`
    case 'LOGIN': return `用户登录系统`
    default: return `执行了操作`
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

function fetchData() {
  loading.value = true
  setTimeout(() => {
    let filtered = [...allLogs]

    if (searchForm.keyword) {
      const kw = searchForm.keyword.toLowerCase()
      filtered = filtered.filter(
        (l) => l.operator.toLowerCase().includes(kw) || l.content.toLowerCase().includes(kw),
      )
    }
    if (searchForm.module) {
      filtered = filtered.filter((l) => l.module === searchForm.module)
    }
    if (searchForm.type) {
      filtered = filtered.filter((l) => l.type === searchForm.type)
    }
    if (searchForm.dateRange && searchForm.dateRange.length === 2) {
      const [start, end] = searchForm.dateRange
      filtered = filtered.filter((l) => l.createTime >= start && l.createTime <= end + ' 23:59:59')
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
  id: 0, operator: '', module: '', type: '', content: '', params: '',
  ip: '', userAgent: '', success: true, errorMsg: '', duration: 0, createTime: '',
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

<style scoped lang="scss">
.system-page {
  padding: 8px 0 40px;
}
.page-header {
  margin-bottom: 24px;
  &__title {
    font-size: 22px;
    font-weight: 700;
    margin: 0 0 6px;
    color: var(--el-text-color-primary);
  }
  &__desc {
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
