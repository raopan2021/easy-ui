<script setup lang="ts">
import {
  DataLine,
  Document,
  EditPen,
  Grid,
  List,
  Setting,
  Switch,
} from '@element-plus/icons-vue'
/**
 * 首页 - 模板欢迎页
 *
 * 纯静态页面：问候语 + 快速入口 + 技术栈介绍，不依赖任何接口。
 * 可直接替换为业务仪表盘。
 */
import { useRouter } from 'vue-router'
import { useUserStoreHook } from '@/store/modules/user'

defineOptions({ name: 'HomeDashboard' })

const router = useRouter()

// ==================== 问候语 ====================
const name
  = useUserStoreHook()?.nickname || useUserStoreHook()?.username || ''
const greeting = ref('')
const currentTime = ref('')
const currentDate = ref('')

const GREETINGS = ['早上好', '下午好', '晚上好']

function updateDateTime() {
  const now = new Date()
  const hour = now.getHours()
  const greetIndex = hour < 12 ? 0 : hour < 18 ? 1 : 2
  greeting.value = `${GREETINGS[greetIndex]}，`
  currentTime.value = now.toLocaleTimeString('zh-CN', { hour12: false })
  currentDate.value = now.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
}

let clockTimer: ReturnType<typeof setInterval>

onMounted(() => {
  updateDateTime()
  clockTimer = setInterval(updateDateTime, 1000)
})

onUnmounted(() => {
  clearInterval(clockTimer)
})

// ==================== 快速入口 ====================
const cards = [
  {
    title: 'CRUD 示例',
    desc: 'SearchForm + Table + 新增编辑弹窗 + 删除',
    icon: List,
    color: '#409eff',
    route: '/example/crud',
  },
  {
    title: 'Markdown 编辑器',
    desc: '主题切换 + 导出 md / html / pdf',
    icon: EditPen,
    color: '#67c23a',
    route: '/example/markdown',
  },
  {
    title: '菜单配置',
    desc: '路由模块位于 src/router/modules',
    icon: Grid,
    color: '#e6a23c',
    route: '',
  },
  {
    title: 'API Mock',
    desc: '接口示例位于 src/api/example',
    icon: DataLine,
    color: '#f56c6c',
    route: '',
  },
  {
    title: '系统设置',
    desc: '点击右上角齿轮打开布局配置',
    icon: Setting,
    color: '#909399',
    route: '',
  },
]

// ==================== 技术栈 ====================
const stackList = [
  { name: 'Vue 3', desc: 'Composition API + <script setup>', icon: Document },
  { name: 'TypeScript', desc: '类型安全的开发体验', icon: Switch },
  { name: 'Element Plus', desc: '基础 UI 组件库', icon: Grid },
  { name: 'EasyUI', desc: '扩展组件库（表格/搜索表单等）', icon: DataLine },
]
</script>

<template>
  <div class="home">
    <!-- 欢迎横幅 -->
    <div class="hero">
      <div class="hero-text">
        <h1>{{ greeting }}，{{ name }}</h1>
        <p>欢迎使用 EasyUI 管理后台模板，开始搭建属于你的业务系统吧。</p>
      </div>
      <div class="hero-time">
        <div class="time">
          {{ currentTime }}
        </div>
        <div class="date">
          {{ currentDate }}
        </div>
      </div>
    </div>

    <!-- 快速入口 -->
    <div class="section-title">
      快速开始
    </div>
    <div class="cards">
      <div v-for="card in cards" :key="card.title" class="card" @click="card.route && router.push(card.route)">
        <el-icon :size="26" :color="card.color">
          <component :is="card.icon" />
        </el-icon>
        <div class="card-title">
          {{ card.title }}
        </div>
        <div class="card-desc">
          {{ card.desc }}
        </div>
      </div>
    </div>

    <!-- 技术栈说明 -->
    <div class="section-title">
      技术栈
    </div>
    <div class="stack">
      <div v-for="(item, index) in stackList" :key="index" class="stack-item">
        <el-icon :size="18" color="#409eff">
          <component :is="item.icon" />
        </el-icon>
        <div>
          <div class="stack-name">
            {{ item.name }}
          </div>
          <div class="stack-desc">
            {{ item.desc }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.home {
  display: flex;
  flex-direction: column;
  gap: 20px;

  .hero {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 28px 32px;
    border-radius: 12px;
    background: linear-gradient(120deg, #1a73e8, #4285f4);
    color: white;
    box-shadow: var(--app-card-shadow-sm);

    h1 {
      margin: 0 0 8px;
      font-size: 24px;
      font-weight: 600;
    }

    p {
      margin: 0;
      font-size: 14px;
      opacity: 0.92;
    }

    .hero-time {
      text-align: right;

      .time {
        font-size: 26px;
        font-weight: bold;
        line-height: 1.2;
      }

      .date {
        font-size: 14px;
        opacity: 0.9;
      }
    }
  }

  .section-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--app-text-primary);
  }

  .cards {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 16px;

    .card {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 20px;
      border-radius: 12px;
      background: var(--app-card-bg);
      box-shadow: var(--app-card-shadow-sm);
      cursor: pointer;
      transition: all 0.3s ease;

      &:hover {
        transform: translateY(-4px);
        box-shadow: var(--app-card-shadow-lg);
      }

      .card-title {
        font-size: 15px;
        font-weight: 600;
        color: var(--app-text-primary);
      }

      .card-desc {
        font-size: 13px;
        color: var(--app-text-secondary);
        line-height: 1.5;
      }
    }
  }

  .stack {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;

    .stack-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 16px 20px;
      border-radius: 10px;
      background: var(--app-card-bg);
      box-shadow: var(--app-card-shadow-sm);

      .stack-name {
        font-size: 14px;
        font-weight: 600;
        color: var(--app-text-primary);
      }

      .stack-desc {
        font-size: 13px;
        color: var(--app-text-secondary);
      }
    }
  }
}
</style>
