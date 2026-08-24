<script setup lang="ts">
import { EasyButton, EasyCard, EasyIcon } from '@raopan/easy-ui'
</script>

<template>
  <div class="card-doc">
    <!-- 页面标题 -->
    <div class="doc-header">
      <h1 class="doc-title">
        Card 卡片
      </h1>
      <p class="doc-desc">
        简洁现代的卡片组件，用于组织和展示内容区块，支持头部、内容区、底部的灵活结构。
      </p>
    </div>

    <!-- Card 基础用法 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        Card 基础用法
      </h2>
      <p class="doc-section__desc">
        包含头部、内容区和底部的卡片结构。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyCard style="width: 380px">
            <template #header>
              <div class="header-title">
                项目详情
              </div>
            </template>
            <p class="base-text">
              这是一个基于 Vue 3 + TypeScript 构建的管理系统，提供了丰富的企业级 UI 组件库，支持快速开发。
            </p>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">创建时间</span>
                <span class="info-value">2026-03-01</span>
              </div>
              <div class="info-item">
                <span class="info-label">项目状态</span>
                <span class="badge badge-success">进行中</span>
              </div>
            </div>
            <template #footer>
              <div class="footer-actions">
                <EasyButton type="primary" size="small">
                  确认
                </EasyButton>
                <EasyButton size="small">
                  取消
                </EasyButton>
              </div>
            </template>
          </EasyCard>
        </div>
        <EasyDocCode
          code="<EasyCard>
  <template #header>
    <div class=&quot;header-title&quot;>项目详情</div>
  </template>
  <p>卡片内容...</p>
  <template #footer>
    <div class=&quot;footer-actions&quot;>
      <EasyButton type=&quot;primary&quot; size=&quot;small&quot;>确认</EasyButton>
      <EasyButton size=&quot;small&quot;>取消</EasyButton>
    </div>
  </template>
</EasyCard>"
        />
      </div>
    </section>

    <!-- Card 带标题的卡片 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        Card 带标题的卡片
      </h2>
      <p class="doc-section__desc">
        使用 <code>title</code> 属性快速设置标题，或使用 <code>icon</code> 添加图标。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <div class="grid-2">
            <EasyCard title="基本信息" style="width: 260px">
              <div class="info-list">
                <div class="info-row">
                  <span class="label">姓名</span>
                  <span class="value">张明</span>
                </div>
                <div class="info-row">
                  <span class="label">工号</span>
                  <span class="value">EMP-2024001</span>
                </div>
                <div class="info-row">
                  <span class="label">部门</span>
                  <span class="value">技术研发部</span>
                </div>
                <div class="info-row">
                  <span class="label">职位</span>
                  <span class="value">高级工程师</span>
                </div>
              </div>
            </EasyCard>
            <EasyCard title="联系方式" icon="el:Message" style="width: 260px">
              <div class="info-list">
                <div class="info-row">
                  <span class="label">手机</span>
                  <span class="value">138-xxxx-xxxx</span>
                </div>
                <div class="info-row">
                  <span class="label">邮箱</span>
                  <span class="value">zhang@company.com</span>
                </div>
                <div class="info-row">
                  <span class="label">办公室</span>
                  <span class="value">A栋 8层 801</span>
                </div>
              </div>
            </EasyCard>
          </div>
        </div>
        <EasyDocCode
          code="<EasyCard title=&quot;基本信息&quot;>
  <div>内容...</div>
</EasyCard>

<EasyCard title=&quot;联系方式&quot; icon=&quot;el:Message&quot;>
  <div>内容...</div>
</EasyCard>"
        />
      </div>
    </section>

    <!-- Card 阴影效果 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        Card 阴影效果
      </h2>
      <p class="doc-section__desc">
        通过 <code>shadow</code> 属性设置阴影显示时机。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <div class="grid-3">
            <EasyCard title="始终显示" shadow="always" style="width: 160px">
              <div class="demo-text">
                默认带阴影
              </div>
            </EasyCard>
            <EasyCard title="悬浮显示" shadow="hover" style="width: 160px">
              <div class="demo-text">
                悬浮时显示
              </div>
            </EasyCard>
            <EasyCard title="无阴影" shadow="never" style="width: 160px">
              <div class="demo-text">
                始终无阴影
              </div>
            </EasyCard>
          </div>
        </div>
        <EasyDocCode
          code="<EasyCard shadow=&quot;always&quot;>...</EasyCard>
<EasyCard shadow=&quot;hover&quot;>...</EasyCard>
<EasyCard shadow=&quot;never&quot;>...</EasyCard>"
        />
      </div>
    </section>

    <!-- Card 悬浮效果 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        Card 悬浮效果
      </h2>
      <p class="doc-section__desc">
        使用 <code>hoverable</code> 属性使卡片可交互。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <div class="grid-3">
            <EasyCard hoverable title="用户管理" style="width: 160px">
              <div class="demo-text">
                点击查看详情
              </div>
            </EasyCard>
            <EasyCard hoverable title="订单管理" style="width: 160px">
              <div class="demo-text">
                点击查看详情
              </div>
            </EasyCard>
            <EasyCard hoverable title="系统设置" style="width: 160px">
              <div class="demo-text">
                点击查看详情
              </div>
            </EasyCard>
          </div>
        </div>
        <EasyDocCode
          code="<EasyCard hoverable title=&quot;用户管理&quot;>
  <div>点击查看详情</div>
</EasyCard>"
        />
      </div>
    </section>

    <!-- Card 业务场景 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        Card 业务场景
      </h2>

      <h3 class="doc-subtitle">
        数据统计
      </h3>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <div class="stat-grid">
            <EasyCard class="stat-card">
              <div class="stat-content">
                <div class="stat-top">
                  <span class="stat-label">总用户数</span>
                  <span class="trend up">↑ 12.5%</span>
                </div>
                <div class="stat-value">
                  12,846
                </div>
                <div class="stat-bottom">
                  较上月
                </div>
              </div>
            </EasyCard>
            <EasyCard class="stat-card">
              <div class="stat-content">
                <div class="stat-top">
                  <span class="stat-label">今日订单</span>
                  <span class="trend up">↑ 8.2%</span>
                </div>
                <div class="stat-value">
                  358
                </div>
                <div class="stat-bottom">
                  较昨日
                </div>
              </div>
            </EasyCard>
            <EasyCard class="stat-card">
              <div class="stat-content">
                <div class="stat-top">
                  <span class="stat-label">本月收入</span>
                  <span class="trend down">↓ 3.1%</span>
                </div>
                <div class="stat-value">
                  ¥89,230
                </div>
                <div class="stat-bottom">
                  较上月
                </div>
              </div>
            </EasyCard>
            <EasyCard class="stat-card">
              <div class="stat-content">
                <div class="stat-top">
                  <span class="stat-label">待处理事项</span>
                </div>
                <div class="stat-value">
                  24
                </div>
                <div class="stat-bottom">
                  本周
                </div>
              </div>
            </EasyCard>
          </div>
        </div>
      </div>

      <h3 class="doc-subtitle">
        任务列表
      </h3>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyCard style="width: 100%; max-width: 520px">
            <template #header>
              <div class="task-header">
                <span class="header-title">我的任务</span>
                <span class="task-count">5 项待办</span>
              </div>
            </template>
            <div class="task-list">
              <div class="task-item">
                <EasyIcon name="el:Check" :size="15" class="icon-success" />
                <span class="task-text">完成需求文档编写</span>
                <span class="badge badge-success">已完成</span>
              </div>
              <div class="task-item">
                <EasyIcon name="el:Clock" :size="15" class="icon-primary" />
                <span class="task-text">评审技术方案</span>
                <span class="badge badge-primary">进行中</span>
              </div>
              <div class="task-item">
                <EasyIcon name="el:Clock" :size="15" class="icon-muted" />
                <span class="task-text">开发用户模块</span>
                <span class="badge badge-muted">待开始</span>
              </div>
            </div>
          </EasyCard>
        </div>
      </div>
    </section>

    <!-- Card 禁用状态 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        Card 禁用状态
      </h2>
      <p class="doc-section__desc">
        使用 <code>disabled</code> 属性禁用卡片。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyCard disabled title="禁用卡片" style="width: 260px">
            <div class="demo-text muted">
              禁用状态下无法交互
            </div>
          </EasyCard>
        </div>
        <EasyDocCode code="<EasyCard disabled>...</EasyCard>" />
      </div>
    </section>

    <!-- Card 占满剩余空间 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        Card 占满剩余空间
      </h2>
      <p class="doc-section__desc">
        通过 <code>fill</code> 属性让卡片高度自适应占满父容器剩余空间（父容器需为 flex 布局或定高），内容区自动滚动。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body doc-preview__body--fill">
          <EasyCard fill title="占满剩余空间的卡片" style="width: 380px">
            <p class="base-text">
              该卡片设置了 <code>fill</code>，高度会自动撑满左侧灰色父容器剩余空间。
            </p>
            <p class="base-text">
              父容器使用 flex 纵向布局时，<code>fill</code> 等价于 <code>flex: 1 1 0%</code>；
              块级定高父容器中则使用 <code>height: 100%</code>。内容超出时 body 区域出现滚动条。
            </p>
            <p class="base-text muted">
              拖动浏览器窗口或调整父容器高度，可观察卡片实时自适应。
            </p>
          </EasyCard>
        </div>
        <EasyDocCode
          code="<div class=&quot;container&quot; style=&quot;display:flex; flex-direction:column; height:320px&quot;>
  <EasyCard fill title=&quot;占满剩余空间&quot;>
    <p>内容...</p>
  </EasyCard>
</div>"
        />
      </div>
    </section>

    <!-- Card 高度手动调整 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        Card 高度手动调整
      </h2>
      <p class="doc-section__desc">
        通过 <code>resizable</code> 属性开启底部拖拽手柄，可手动调整卡片高度；配合 <code>height</code>（支持 v-model:height）受控使用。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyCard resizable title="可拖拽调整高度" style="width: 380px">
            <p class="base-text">
              将鼠标悬停在卡片底部中央，出现拖拽手柄后按住上下拖动即可调整高度。
            </p>
            <p class="base-text">
              默认最小高度 <code>120px</code>，可通过 <code>min-height</code> / <code>max-height</code> 属性约束范围。
            </p>
          </EasyCard>
        </div>
        <EasyDocCode
          code="<EasyCard resizable title=&quot;可拖拽调整高度&quot;>
  <p>内容...</p>
</EasyCard>"
        />
      </div>
    </section>

    <!-- API 文档 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        API
      </h2>

      <h3 class="doc-subtitle">
        Props
      </h3>
      <div class="doc-table">
        <table>
          <thead>
            <tr>
              <th>属性名</th>
              <th>说明</th>
              <th>类型</th>
              <th>默认值</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>title</code></td>
              <td>卡片标题</td>
              <td><code>string</code></td>
              <td><code>''</code></td>
            </tr>
            <tr>
              <td><code>icon</code></td>
              <td>标题前的图标</td>
              <td><code>string</code></td>
              <td><code>''</code></td>
            </tr>
            <tr>
              <td><code>rounded</code></td>
              <td>是否圆角</td>
              <td><code>boolean</code></td>
              <td><code>true</code></td>
            </tr>
            <tr>
              <td><code>bordered</code></td>
              <td>是否边框</td>
              <td><code>boolean</code></td>
              <td><code>true</code></td>
            </tr>
            <tr>
              <td><code>shadow</code></td>
              <td>阴影时机</td>
              <td><code>'always' | 'hover' | 'never'</code></td>
              <td><code>'always'</code></td>
            </tr>
            <tr>
              <td><code>disabled</code></td>
              <td>是否禁用</td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
            </tr>
            <tr>
              <td><code>hoverable</code></td>
              <td>是否悬浮上浮</td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
            </tr>
            <tr>
              <td><code>fill</code></td>
              <td>高度占满父容器剩余空间（父容器建议 flex 布局或定高）</td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
            </tr>
            <tr>
              <td><code>resizable</code></td>
              <td>是否允许通过底部拖拽手柄手动调整高度</td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
            </tr>
            <tr>
              <td><code>height</code></td>
              <td>卡片高度（支持 v-model:height，拖拽时自动更新）</td>
              <td><code>number</code></td>
              <td><code>—</code></td>
            </tr>
            <tr>
              <td><code>minHeight</code></td>
              <td>拖拽调整高度的最小值（像素）</td>
              <td><code>number</code></td>
              <td><code>120</code></td>
            </tr>
            <tr>
              <td><code>maxHeight</code></td>
              <td>拖拽调整高度的最大值（像素）</td>
              <td><code>number</code></td>
              <td><code>—</code></td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 class="doc-subtitle">
        Slots
      </h3>
      <div class="doc-table">
        <table>
          <thead>
            <tr>
              <th>插槽名</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>default</code></td>
              <td>卡片内容</td>
            </tr>
            <tr>
              <td><code>header</code></td>
              <td>头部内容（优先级高于 title）</td>
            </tr>
            <tr>
              <td><code>icon</code></td>
              <td>标题图标</td>
            </tr>
            <tr>
              <td><code>extra</code></td>
              <td>头部右侧内容</td>
            </tr>
            <tr>
              <td><code>footer</code></td>
              <td>底部内容</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.card-doc {
  padding: 8px 0 40px;
}

.doc-header {
  margin-bottom: 32px;
}

.doc-title {
  font-size: 22px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px;
}

.doc-desc {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0;
}

.doc-section {
  margin-bottom: 28px;
}

.doc-section__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px;
  padding-bottom: 8px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

.doc-section__desc {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0 0 14px;

  code {
    background: var(--el-fill-color-light);
    color: var(--el-color-primary);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
  }
}

.doc-subtitle {
  font-size: 14px;
  font-weight: 500;
  color: var(--el-text-color-regular);
  margin: 24px 0 12px;
}

.doc-preview {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 10px;
  overflow: hidden;
  background: var(--el-bg-color-overlay);
}

.doc-preview__body {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  padding: 20px;

  &--fill {
    display: flex;
    flex-direction: column;
    height: 320px;
    align-items: flex-start;
  }
}

.doc-code {
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-light);
  padding: 12px 16px;

  pre {
    margin: 0;
  }

  code {
    font-family: 'SF Mono', Consolas, monospace;
    font-size: 13px;
    color: var(--el-text-color-regular);
  }
}

.doc-table {
  overflow-x: auto;

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 14px;
  }

  th,
  td {
    text-align: left;
    padding: 10px 12px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  th {
    background: var(--el-fill-color-light);
    font-weight: 500;
    color: var(--el-text-color-primary);
  }

  td {
    color: var(--el-text-color-regular);
  }

  code {
    background: var(--el-fill-color-light);
    color: var(--el-color-primary);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 12px;
  }
}

.grid-2 {
  display: flex;
  gap: 16px;
}

.grid-3 {
  display: flex;
  gap: 16px;
}

.header-title {
  font-weight: 600;
  font-size: 15px;
  color: var(--el-text-color-primary);
}

.base-text {
  margin: 0 0 16px;
  line-height: 1.6;
  color: var(--el-text-color-regular);
  font-size: 14px;
}

.info-grid {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.label {
  color: var(--el-text-color-placeholder);
}

.value {
  color: var(--el-text-color-regular);
}

.info-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.info-label {
  color: var(--el-text-color-placeholder);
}

.info-value {
  color: var(--el-text-color-regular);
}

.footer-actions {
  display: flex;
  gap: 8px;
}

.demo-text {
  font-size: 13px;
  color: var(--el-text-color-placeholder);
  text-align: center;

  &.muted {
    color: #d4d4d8;
  }
}

.badge {
  font-size: 11px;
  font-weight: 500;
  padding: 2px 8px;
  border-radius: 4px;

  &-success {
    background: var(--el-color-success-light-9);
    color: var(--el-color-success);
  }

  &-primary {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
  }

  &-warning {
    background: var(--el-color-warning-light-9);
    color: var(--el-color-warning);
  }

  &-danger {
    background: var(--el-color-danger-light-9);
    color: var(--el-color-danger);
  }

  &-muted {
    background: var(--el-fill-color-light);
    color: var(--el-text-color-secondary);
  }
}

.stat-grid {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.stat-card {
  width: 160px;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.stat-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.trend {
  font-size: 12px;
  font-weight: 500;

  &.up {
    color: var(--el-color-success);
  }

  &.down {
    color: var(--el-color-danger);
  }
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  font-variant-numeric: tabular-nums;
  line-height: 1.2;
  margin-top: 4px;
}

.stat-bottom {
  font-size: 12px;
  color: var(--el-text-color-placeholder);
  margin-top: 4px;
}

.task-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.task-count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  background: var(--el-fill-color-light);
  padding: 2px 10px;
  border-radius: 10px;
}

.task-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.task-item {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}

.task-text {
  flex: 1;
  color: var(--el-text-color-regular);
}

.icon-success {
  color: var(--el-color-success);
}

.icon-primary {
  color: var(--el-color-primary);
}

.icon-muted {
  color: var(--el-text-color-placeholder);
}
</style>
