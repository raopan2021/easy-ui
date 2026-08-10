<script setup lang="ts">
defineOptions({ name: 'Home' })

// ──── 快速上手 代码示例 ────
const installCmd = `npm install easy-ui element-plus @element-plus/icons-vue`

const fullInstallCode = `// main.ts
import { createApp } from 'vue'
import EasyUI from 'easy-ui'
import App from './App.vue'

const app = createApp(App)
app.use(EasyUI)  // 自动注册 Element Plus + 全局 easy 服务
app.mount('#app')`

const lightInstallCode = `// main.ts
import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import { setupEasy, easyComponentResolver } from 'easy-ui'
import App from './App.vue'

const app = createApp(App)
app.use(ElementPlus)
setupEasy(app)
app.mount('#app')`

const autoImportCode = `// vite.config.ts
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  plugins: [
    Components({
      resolvers: [
        easyComponentResolver(),            // Easy* 自动导入
        ElementPlusResolver({ importStyle: 'css' }),
      ],
    }),
  ],
})`

const features = [
  { title: 'Tree-shaking', desc: '按需引入组件，只打包你实际使用的部分，不浪费 KB。' },
  { title: '暗色模式', desc: 'html.dark 一键切换，所有组件无缝适配，无需额外配置。' },
  { title: '自动导入', desc: 'easyComponentResolver 配合 unplugin-vue-components，组件即写即用。' },
  { title: '命令式 API', desc: 'easy.$msg / easy.$loading 一行代码调用，告别模板指令。' },
]

const componentGroups = [
  {
    name: '基础',
    prefix: '/basic',
    items: ['button', 'icon', 'tag', 'divider', 'avatar', 'card', 'watermark', 'carousel', 'empty', 'badge', 'list'],
  },
  {
    name: '数据展示',
    prefix: '/data',
    items: [
      'table',
      'chart',
      'statistic',
      'descriptions',
      'image',
      'timeline',
      'video',
      'china-map',
      'file-preview',
      'json-viewer',
      'dept-tree',
      'tree-chart',
      'gantt',
    ],
  },
  { name: '导航', prefix: '/nav', items: ['tabs', 'steps', 'dropdown'] },
  {
    name: '表单',
    prefix: '/form',
    items: [
      'input',
      'select',
      'radio',
      'cascader',
      'rate',
      'switch',
      'date-picker',
      'time-picker',
      'date-time-picker',
      'search-form',
      'range-picker',
      'image-upload',
      'file-upload',
      'upload',
      'dict-select',
    ],
  },
  { name: '反馈', prefix: '/feedback', items: ['modal', 'drawer', 'loading', 'message', 'tour', 'progress'] },
  { name: '布局', prefix: '/layout', items: ['grid', 'worktab'] },
  { name: '业务', prefix: '/business', items: ['permission', 'chat', 'user-picker', 'dict-tag'] },
]

/** 组件 key → 路由路径（个别路径不规则的在此修正） */
const pathOverrides: Record<string, string> = {
  'search-form': '/form/searchForm',
}

function compPath(group: (typeof componentGroups)[0], key: string) {
  return pathOverrides[key] || `${group.prefix}/${key}`
}
</script>

<template>
  <div class="home">
    <!-- Hero -->
    <section class="hero">
      <div class="container">
        <div class="hero-badge">
          <span class="badge-dot" />
          Vue 3 · Element Plus · TypeScript
        </div>
        <h1 class="hero-title">
          Vue 3 企业级<br>
          <span class="hero-accent">业务组件库</span>
        </h1>
        <p class="hero-desc">
          65+ 组件，覆盖表格、表单、图表、权限等业务场景。<br>
          基于 Element Plus 扩展，tree-shaking、暗色模式开箱即用。
        </p>
        <div class="hero-actions">
          <a href="https://gitee.com/yun_hua_admin/ease-ui" target="_blank" class="btn-primary">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M11.984 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 11.984 0zm6.09 5.333c.328 0 .593.266.592.593v1.482a.594.594 0 0 1-.593.592H9.777c-.982 0-1.778.796-1.778 1.778v5.926c0 .982.796 1.778 1.778 1.778h4.444a.593.593 0 0 0 .593-.593v-2.963a.593.593 0 0 0-.593-.593H11.63a.592.592 0 0 1-.592-.592v-1.482c0-.327.266-.592.592-.592h2.964a2.666 2.666 0 0 1 2.666 2.666v4.444a2.666 2.666 0 0 1-2.666 2.667H8.148a2.667 2.667 0 0 1-2.667-2.667V8.296a2.667 2.667 0 0 1 2.667-2.666h9.333a.594.594 0 0 1 .593.703z"
              />
            </svg>
            Gitee
          </a>
          <a href="https://github.com/Momingyun/ease-ui" target="_blank" class="btn-outline">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
              <path
                d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"
              />
            </svg>
            GitHub
          </a>
        </div>
      </div>
    </section>

    <!-- 特性 -->
    <section class="features">
      <div class="container">
        <div class="feature-grid">
          <div v-for="item in features" :key="item.title" class="feature-card">
            <h3>{{ item.title }}</h3>
            <p>{{ item.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- 组件 -->
    <section class="components">
      <div class="container">
        <h2 class="section-title">
          组件
        </h2>
        <p class="section-desc">
          覆盖中后台开发全场景，按需引入，只打包你用的。
        </p>
        <div class="comp-list">
          <div v-for="group in componentGroups" :key="group.name" class="comp-row">
            <span class="comp-cat">{{ group.name }}</span>
            <div class="comp-tags">
              <router-link v-for="tag in group.items" :key="tag" :to="compPath(group, tag)" class="comp-tag">
                {{
                  tag
                }}
              </router-link>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 上手 -->
    <section class="start">
      <div class="container">
        <h2 class="section-title">
          快速上手
        </h2>

        <div class="start-block">
          <h3 class="start-step">
            ① 安装
          </h3>
          <EasyDocCode :code="installCmd" lang="bash" />
        </div>

        <div class="start-block">
          <h3 class="start-step">
            ② 注册
          </h3>
          <p class="start-hint">
            方式一：完整安装（一行搞定）
          </p>
          <EasyDocCode :code="fullInstallCode" lang="js" />
          <p class="start-hint" style="margin-top: 16px">
            方式二：按需引入（tree-shaking 最佳）
          </p>
          <EasyDocCode :code="lightInstallCode" lang="js" />
        </div>

        <div class="start-block">
          <h3 class="start-step">
            ③ 自动导入（可选）
          </h3>
          <p class="start-hint">
            配置后组件即写即用，无需手动 import
          </p>
          <EasyDocCode :code="autoImportCode" lang="js" />
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
/* === Tokens === */
$black: var(--el-text-color-primary);
$text-1: var(--el-text-color-primary);
$text-2: var(--el-text-color-secondary);
$text-3: var(--el-text-color-placeholder);
$border: var(--el-border-color-lighter);
$bg-subtle: var(--el-fill-color-lighter);
$accent: var(--el-color-primary);

/* === Base === */
.home {
  color: $text-1;
  font-size: 14px;
  line-height: 1.7;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.container {
  max-width: 960px;
  margin: 0 auto;
  padding: 0 24px;
}

/* === Hero === */
.hero {
  padding: 100px 0 80px;
  background: $bg-subtle;
  border-bottom: 1px solid $border;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: $text-2;
  margin-bottom: 24px;
  background: var(--el-bg-color-overlay);
  border: 1px solid $border;
  padding: 5px 14px;
  border-radius: 100px;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--el-color-success);
}

.hero-title {
  font-size: 44px;
  font-weight: 700;
  line-height: 1.15;
  color: $black;
  margin: 0 0 20px;
  letter-spacing: -0.03em;
}

.hero-accent {
  background: linear-gradient(135deg, var(--el-text-color-primary) 0%, var(--el-text-color-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-desc {
  font-size: 16px;
  color: $text-2;
  line-height: 1.8;
  margin: 0 0 32px;
  max-width: 520px;
}

.hero-actions {
  display: flex;
  gap: 10px;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px;
  background: $accent;
  color: #fff;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  transition: opacity 0.15s;

  &:hover {
    opacity: 0.85;
  }
}

.btn-outline {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 9px 18px;
  background: var(--el-bg-color-overlay);
  color: $text-1;
  border: 1px solid $border;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  text-decoration: none;
  transition: background 0.15s;

  &:hover {
    background: $bg-subtle;
  }
}

/* === Features === */
.features {
  padding: 64px 0;
}

.feature-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1px;
  background: $border;
  border: 1px solid $border;
  border-radius: 12px;
  overflow: hidden;
}

.feature-card {
  background: var(--el-bg-color-overlay);
  padding: 28px 28px;

  h3 {
    font-size: 14px;
    font-weight: 600;
    color: $text-1;
    margin: 0 0 6px;
  }

  p {
    font-size: 13px;
    color: $text-2;
    margin: 0;
    line-height: 1.6;
  }
}

/* === Components === */
.components {
  padding: 64px 0;
  border-top: 1px solid $border;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: $text-2;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  margin: 0 0 6px;
}

.section-desc {
  font-size: 14px;
  color: $text-3;
  margin: 0 0 28px;
}

.comp-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comp-row {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.comp-cat {
  font-size: 12px;
  font-weight: 500;
  color: $text-3;
  min-width: 52px;
  padding-top: 4px;
  flex-shrink: 0;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.comp-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.comp-tag {
  font-size: 12.5px;
  color: $text-2;
  padding: 3px 10px;
  background: $bg-subtle;
  border: 1px solid transparent;
  border-radius: 6px;
  font-family: 'SF Mono', 'Cascadia Code', 'Consolas', monospace;
  transition: all 0.12s;
  cursor: pointer;
  text-decoration: none;

  &:hover {
    border-color: $border;
    background: var(--el-bg-color-overlay);
    color: $accent;
  }
}

/* === Start === */
.start {
  padding: 64px 0 80px;
  border-top: 1px solid $border;
}

.start-block {
  margin-top: 28px;

  &:first-child {
    margin-top: 20px;
  }
}

.start-step {
  font-size: 14px;
  font-weight: 600;
  color: $text-1;
  margin: 0 0 8px;
}

.start-hint {
  font-size: 13px;
  color: $text-3;
  margin: 0 0 6px;
}

/* === Responsive === */
@media (max-width: 768px) {
  .hero {
    padding: 64px 0 56px;
  }

  .hero-title {
    font-size: 32px;
  }

  .hero-desc br {
    display: none;
  }

  .feature-grid {
    grid-template-columns: 1fr;
  }

  .comp-row {
    flex-direction: column;
    gap: 4px;
  }
}
</style>
