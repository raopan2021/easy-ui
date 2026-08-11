<script setup lang="ts">
import { EasyTabPane, EasyTabs } from '@raopan/easy-ui'
import { ref } from 'vue'

const activeTab1 = ref('user')
const activeTab2 = ref('overview')
const activeTab3 = ref('all')
const activeTab4 = ref('a')
const activeTab5 = ref('home')
const activeTab6 = ref('basic')
const activeTab7 = ref('tab1')
const activeTab8 = ref('g1')
const activeTab9 = ref('event1')

const eventLogs = ref<string[]>([])

function handleTabClick(pane: any) {
  eventLogs.value.push(`[tab-click] name: ${pane.name}, label: ${pane.label}`)
}

function handleTabChange(value: string | number) {
  eventLogs.value.push(`[tab-change] value: ${value}`)
}
</script>

<template>
  <div class="tabs-doc">
    <!-- 页面标题 -->
    <div class="doc-header">
      <h1 class="doc-title">
        Tabs 选项卡
      </h1>
      <p class="doc-desc">
        选项卡切换组件，支持 Line / Card / Segment 三种风格，多种尺寸，粘性头部和横向滚动。
      </p>
    </div>

    <!-- 基础用法 - Line -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        基础用法
      </h2>
      <p class="doc-section__desc">
        默认 <code>type="line"</code>，底部带有滑动指示条。通过 <code>v-model</code> 绑定当前激活的选项卡。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body" style="flex-direction: column; align-items: stretch">
          <EasyTabs v-model="activeTab1">
            <EasyTabPane name="user" label="用户管理">
              <div class="tab-demo-content">
                <p>这里是用户管理的内容区域。</p>
                <p>可以放置表格、表单等复杂内容。</p>
              </div>
            </EasyTabPane>
            <EasyTabPane name="role" label="角色管理">
              <div class="tab-demo-content">
                <p>这里是角色管理的内容区域。</p>
              </div>
            </EasyTabPane>
            <EasyTabPane name="perm" label="权限配置">
              <div class="tab-demo-content">
                <p>这里是权限配置的内容区域。</p>
              </div>
            </EasyTabPane>
          </EasyTabs>
        </div>
        <EasyDocCode
          code="<easy-tabs v-model=&quot;activeTab&quot;>
  <easy-tab-pane name=&quot;user&quot; label=&quot;用户管理&quot;>
    用户管理内容
  </easy-tab-pane>
  <easy-tab-pane name=&quot;role&quot; label=&quot;角色管理&quot;>
    角色管理内容
  </easy-tab-pane>
  <easy-tab-pane name=&quot;perm&quot; label=&quot;权限配置&quot;>
    权限配置内容
  </easy-tab-pane>
</easy-tabs>"
        />
      </div>
    </section>

    <!-- 卡片类型 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        卡片类型
      </h2>
      <p class="doc-section__desc">
        设置 <code>type="card"</code>，呈现卡片风格的选项卡。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body" style="flex-direction: column; align-items: stretch">
          <EasyTabs v-model="activeTab2" type="card">
            <EasyTabPane name="overview" label="概览">
              <div class="tab-demo-content">
                <p>系统运行概览数据。</p>
              </div>
            </EasyTabPane>
            <EasyTabPane name="monitor" label="监控">
              <div class="tab-demo-content">
                <p>系统监控信息。</p>
              </div>
            </EasyTabPane>
            <EasyTabPane name="alarm" label="告警">
              <div class="tab-demo-content">
                <p>告警记录与处理。</p>
              </div>
            </EasyTabPane>
            <EasyTabPane name="log" label="日志">
              <div class="tab-demo-content">
                <p>系统运行日志。</p>
              </div>
            </EasyTabPane>
          </EasyTabs>
        </div>
        <EasyDocCode
          code="<easy-tabs v-model=&quot;activeTab&quot; type=&quot;card&quot;>
  <easy-tab-pane name=&quot;overview&quot; label=&quot;概览&quot;>概览内容</easy-tab-pane>
  <easy-tab-pane name=&quot;monitor&quot; label=&quot;监控&quot;>监控内容</easy-tab-pane>
  <easy-tab-pane name=&quot;alarm&quot; label=&quot;告警&quot;>告警内容</easy-tab-pane>
  <easy-tab-pane name=&quot;log&quot; label=&quot;日志&quot;>日志内容</easy-tab-pane>
</easy-tabs>"
        />
      </div>
    </section>

    <!-- 分段控制器类型 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        分段控制器
      </h2>
      <p class="doc-section__desc">
        设置 <code>type="segment"</code>，呈现分段控制器风格，适合选项较少的切换场景。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body" style="flex-direction: column; align-items: stretch">
          <EasyTabs v-model="activeTab3" type="segment">
            <EasyTabPane name="all" label="全部">
              <div class="tab-demo-content">
                <p>显示全部内容。</p>
              </div>
            </EasyTabPane>
            <EasyTabPane name="active" label="进行中">
              <div class="tab-demo-content">
                <p>显示进行中的内容。</p>
              </div>
            </EasyTabPane>
            <EasyTabPane name="done" label="已完成">
              <div class="tab-demo-content">
                <p>显示已完成的内容。</p>
              </div>
            </EasyTabPane>
          </EasyTabs>
        </div>
        <EasyDocCode
          code="<easy-tabs v-model=&quot;activeTab&quot; type=&quot;segment&quot;>
  <easy-tab-pane name=&quot;all&quot; label=&quot;全部&quot;>全部内容</easy-tab-pane>
  <easy-tab-pane name=&quot;active&quot; label=&quot;进行中&quot;>进行中内容</easy-tab-pane>
  <easy-tab-pane name=&quot;done&quot; label=&quot;已完成&quot;>已完成内容</easy-tab-pane>
</easy-tabs>"
        />
      </div>
    </section>

    <!-- 不同尺寸 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        不同尺寸
      </h2>
      <p class="doc-section__desc">
        通过 <code>size</code> 属性设置选项卡尺寸，支持 <code>large</code> / <code>default</code> /
        <code>small</code> 三种规格。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body" style="flex-direction: column; align-items: stretch; gap: 32px">
          <div>
            <p class="size-label">
              Large
            </p>
            <EasyTabs v-model="activeTab4" size="large">
              <EasyTabPane name="a" label="选项一">
                <div class="tab-demo-content">
                  <p>Large 选项卡内容</p>
                </div>
              </EasyTabPane>
              <EasyTabPane name="b" label="选项二">
                <div class="tab-demo-content">
                  <p>Large 选项卡内容</p>
                </div>
              </EasyTabPane>
              <EasyTabPane name="c" label="选项三">
                <div class="tab-demo-content">
                  <p>Large 选项卡内容</p>
                </div>
              </EasyTabPane>
            </EasyTabs>
          </div>
          <div>
            <p class="size-label">
              Default
            </p>
            <EasyTabs v-model="activeTab4">
              <EasyTabPane name="a" label="选项一">
                <div class="tab-demo-content">
                  <p>Default 选项卡内容</p>
                </div>
              </EasyTabPane>
              <EasyTabPane name="b" label="选项二">
                <div class="tab-demo-content">
                  <p>Default 选项卡内容</p>
                </div>
              </EasyTabPane>
              <EasyTabPane name="c" label="选项三">
                <div class="tab-demo-content">
                  <p>Default 选项卡内容</p>
                </div>
              </EasyTabPane>
            </EasyTabs>
          </div>
          <div>
            <p class="size-label">
              Small
            </p>
            <EasyTabs v-model="activeTab4" size="small">
              <EasyTabPane name="a" label="选项一">
                <div class="tab-demo-content">
                  <p>Small 选项卡内容</p>
                </div>
              </EasyTabPane>
              <EasyTabPane name="b" label="选项二">
                <div class="tab-demo-content">
                  <p>Small 选项卡内容</p>
                </div>
              </EasyTabPane>
              <EasyTabPane name="c" label="选项三">
                <div class="tab-demo-content">
                  <p>Small 选项卡内容</p>
                </div>
              </EasyTabPane>
            </EasyTabs>
          </div>
        </div>
        <EasyDocCode
          code="<easy-tabs v-model=&quot;activeTab&quot; size=&quot;large&quot;>...</easy-tabs>
<easy-tabs v-model=&quot;activeTab&quot; size=&quot;default&quot;>...</easy-tabs>
<easy-tabs v-model=&quot;activeTab&quot; size=&quot;small&quot;>...</easy-tabs>"
        />
      </div>
    </section>

    <!-- 带图标 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        带图标
      </h2>
      <p class="doc-section__desc">
        通过 TabPane 的 <code>icon</code> 属性设置标题前缀图标，使用 Element Plus 图标名称。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body" style="flex-direction: column; align-items: stretch">
          <EasyTabs v-model="activeTab5">
            <EasyTabPane name="home" label="首页" icon="HomeFilled">
              <div class="tab-demo-content">
                <p>首页内容，包含常用功能和快捷入口。</p>
              </div>
            </EasyTabPane>
            <EasyTabPane name="setting" label="设置" icon="Setting">
              <div class="tab-demo-content">
                <p>系统设置与偏好配置。</p>
              </div>
            </EasyTabPane>
            <EasyTabPane name="user" label="用户" icon="User">
              <div class="tab-demo-content">
                <p>用户信息与账户管理。</p>
              </div>
            </EasyTabPane>
            <EasyTabPane name="bell" label="通知" icon="Bell">
              <div class="tab-demo-content">
                <p>消息通知与提醒。</p>
              </div>
            </EasyTabPane>
          </EasyTabs>
        </div>
        <EasyDocCode
          code="<easy-tabs v-model=&quot;activeTab&quot;>
  <easy-tab-pane name=&quot;home&quot; label=&quot;首页&quot; icon=&quot;HomeFilled&quot;>...</easy-tab-pane>
  <easy-tab-pane name=&quot;setting&quot; label=&quot;设置&quot; icon=&quot;Setting&quot;>...</easy-tab-pane>
  <easy-tab-pane name=&quot;user&quot; label=&quot;用户&quot; icon=&quot;User&quot;>...</easy-tab-pane>
  <easy-tab-pane name=&quot;bell&quot; label=&quot;通知&quot; icon=&quot;Bell&quot;>...</easy-tab-pane>
</easy-tabs>"
        />
      </div>
    </section>

    <!-- 禁用选项卡 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        禁用选项卡
      </h2>
      <p class="doc-section__desc">
        通过 TabPane 的 <code>disabled</code> 属性禁用某个选项卡，禁用后无法点击切换。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body" style="flex-direction: column; align-items: stretch">
          <EasyTabs v-model="activeTab6">
            <EasyTabPane name="basic" label="基本信息">
              <div class="tab-demo-content">
                <p>基本信息配置。</p>
              </div>
            </EasyTabPane>
            <EasyTabPane name="security" label="安全设置">
              <div class="tab-demo-content">
                <p>安全相关配置。</p>
              </div>
            </EasyTabPane>
            <EasyTabPane name="advanced" label="高级设置" disabled>
              <div class="tab-demo-content">
                <p>高级功能（需升级版本后解锁）。</p>
              </div>
            </EasyTabPane>
          </EasyTabs>
        </div>
        <EasyDocCode
          code="<easy-tabs v-model=&quot;activeTab&quot;>
  <easy-tab-pane name=&quot;basic&quot; label=&quot;基本信息&quot;>...</easy-tab-pane>
  <easy-tab-pane name=&quot;security&quot; label=&quot;安全设置&quot;>...</easy-tab-pane>
  <easy-tab-pane name=&quot;advanced&quot; label=&quot;高级设置&quot; disabled>...</easy-tab-pane>
</easy-tabs>"
        />
      </div>
    </section>

    <!-- 位置 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        选项卡位置
      </h2>
      <p class="doc-section__desc">
        通过 <code>tab-position</code> 属性设置选项卡位置，目前支持 <code>top</code>（默认）和 <code>bottom</code>。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body" style="flex-direction: column; align-items: stretch">
          <EasyTabs v-model="activeTab7" tab-position="bottom">
            <EasyTabPane name="tab1" label="选项一">
              <div class="tab-demo-content">
                <p>选项卡位于底部的示例内容。</p>
              </div>
            </EasyTabPane>
            <EasyTabPane name="tab2" label="选项二">
              <div class="tab-demo-content">
                <p>适合需要内容区域在上方展示的场景。</p>
              </div>
            </EasyTabPane>
            <EasyTabPane name="tab3" label="选项三">
              <div class="tab-demo-content">
                <p>底部选项卡内容。</p>
              </div>
            </EasyTabPane>
          </EasyTabs>
        </div>
        <EasyDocCode
          code="<easy-tabs v-model=&quot;activeTab&quot; tab-position=&quot;bottom&quot;>
  <easy-tab-pane name=&quot;tab1&quot; label=&quot;选项一&quot;>...</easy-tab-pane>
  <easy-tab-pane name=&quot;tab2&quot; label=&quot;选项二&quot;>...</easy-tab-pane>
  <easy-tab-pane name=&quot;tab3&quot; label=&quot;选项三&quot;>...</easy-tab-pane>
</easy-tabs>"
        />
      </div>
    </section>

    <!-- 自定义颜色 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        自定义激活色
      </h2>
      <p class="doc-section__desc">
        通过 <code>active-color</code> 属性自定义激活态颜色，适配不同业务场景的视觉风格。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body" style="flex-direction: column; align-items: stretch; gap: 24px">
          <EasyTabs v-model="activeTab8" active-color="#34c759">
            <EasyTabPane name="g1" label="绿色主题">
              <div class="tab-demo-content">
                <p>成功 / 绿色激活色</p>
              </div>
            </EasyTabPane>
            <EasyTabPane name="g2" label="选项二">
              <div class="tab-demo-content">
                <p>绿色主题内容</p>
              </div>
            </EasyTabPane>
            <EasyTabPane name="g3" label="选项三">
              <div class="tab-demo-content">
                <p>绿色主题内容</p>
              </div>
            </EasyTabPane>
          </EasyTabs>
          <EasyTabs v-model="activeTab8" active-color="#f5a623" type="card">
            <EasyTabPane name="o1" label="橙色主题">
              <div class="tab-demo-content">
                <p>警告 / 橙色激活色</p>
              </div>
            </EasyTabPane>
            <EasyTabPane name="o2" label="选项二">
              <div class="tab-demo-content">
                <p>橙色主题内容</p>
              </div>
            </EasyTabPane>
            <EasyTabPane name="o3" label="选项三">
              <div class="tab-demo-content">
                <p>橙色主题内容</p>
              </div>
            </EasyTabPane>
          </EasyTabs>
        </div>
        <EasyDocCode
          code="<easy-tabs v-model=&quot;activeTab&quot; active-color=&quot;#34c759&quot;>...</easy-tabs>
<easy-tabs v-model=&quot;activeTab&quot; active-color=&quot;#f5a623&quot; type=&quot;card&quot;>...</easy-tabs>"
        />
      </div>
    </section>

    <!-- 事件 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        事件回调
      </h2>
      <p class="doc-section__desc">
        监听 <code>tab-click</code> 和 <code>tab-change</code> 事件获取用户交互信息。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body" style="flex-direction: column; align-items: stretch">
          <EasyTabs v-model="activeTab9" @tab-click="handleTabClick" @tab-change="handleTabChange">
            <EasyTabPane name="event1" label="选项一">
              <div class="tab-demo-content">
                <p>点击或切换选项卡时，下方会显示事件日志。</p>
              </div>
            </EasyTabPane>
            <EasyTabPane name="event2" label="选项二">
              <div class="tab-demo-content">
                <p>事件日志面板。</p>
              </div>
            </EasyTabPane>
            <EasyTabPane name="event3" label="选项三">
              <div class="tab-demo-content">
                <p>事件日志面板。</p>
              </div>
            </EasyTabPane>
          </EasyTabs>
          <div v-if="eventLogs.length" class="event-logs">
            <p v-for="(log, i) in eventLogs" :key="i" class="event-log">
              {{ log }}
            </p>
          </div>
        </div>
        <EasyDocCode
          code="<easy-tabs
  v-model=&quot;activeTab&quot;
  @tab-click=&quot;handleTabClick&quot;
  @tab-change=&quot;handleTabChange&quot;
>
  ...
</easy-tabs>"
        />
      </div>
    </section>

    <!-- API 文档 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        API
      </h2>

      <h3 class="doc-subtitle">
        Tabs Props
      </h3>
      <div class="doc-table">
        <table>
          <thead>
            <tr>
              <th>属性</th>
              <th>说明</th>
              <th>类型</th>
              <th>默认值</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>v-model</code></td>
              <td>当前激活的选项卡标识</td>
              <td><code>string | number</code></td>
              <td>—</td>
            </tr>
            <tr>
              <td><code>type</code></td>
              <td>选项卡类型</td>
              <td><code>'line' | 'card' | 'segment'</code></td>
              <td><code>'line'</code></td>
            </tr>
            <tr>
              <td><code>size</code></td>
              <td>尺寸</td>
              <td><code>'large' | 'default' | 'small'</code></td>
              <td><code>'default'</code></td>
            </tr>
            <tr>
              <td><code>tab-position</code></td>
              <td>选项卡位置</td>
              <td><code>'top' | 'bottom'</code></td>
              <td><code>'top'</code></td>
            </tr>
            <tr>
              <td><code>active-color</code></td>
              <td>激活态颜色</td>
              <td><code>string</code></td>
              <td><code>'#4f6ef7'</code></td>
            </tr>
            <tr>
              <td><code>scrollable</code></td>
              <td>是否可滚动</td>
              <td><code>boolean</code></td>
              <td><code>true</code></td>
            </tr>
            <tr>
              <td><code>sticky</code></td>
              <td>是否开启粘性头部</td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
            </tr>
            <tr>
              <td><code>sticky-top</code></td>
              <td>粘性定位的 top 值</td>
              <td><code>string</code></td>
              <td><code>'0px'</code></td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 class="doc-subtitle">
        TabPane Props
      </h3>
      <div class="doc-table">
        <table>
          <thead>
            <tr>
              <th>属性</th>
              <th>说明</th>
              <th>类型</th>
              <th>默认值</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>name</code></td>
              <td>选项卡标识（必填）</td>
              <td><code>string | number</code></td>
              <td>—</td>
            </tr>
            <tr>
              <td><code>label</code></td>
              <td>选项卡标题（必填）</td>
              <td><code>string</code></td>
              <td>—</td>
            </tr>
            <tr>
              <td><code>disabled</code></td>
              <td>是否禁用</td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
            </tr>
            <tr>
              <td><code>icon</code></td>
              <td>标题前缀图标</td>
              <td><code>string</code></td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 class="doc-subtitle">
        Tabs Events
      </h3>
      <div class="doc-table">
        <table>
          <thead>
            <tr>
              <th>事件名</th>
              <th>说明</th>
              <th>参数</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>tab-click</code></td>
              <td>选项卡被点击时触发</td>
              <td><code>(pane: TabPaneInfo)</code></td>
            </tr>
            <tr>
              <td><code>tab-change</code></td>
              <td>激活选项卡切换时触发</td>
              <td><code>(value: string | number)</code></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.tabs-doc {
  padding: 8px 0 40px;
}

.doc-header {
  margin-bottom: 36px;
}
.doc-title {
  font-size: 26px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin: 0 0 8px;
  letter-spacing: -0.3px;
}
.doc-desc {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0;
  line-height: 1.6;
}

.doc-section {
  margin-bottom: 32px;
}
.doc-section__title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px;
  padding-bottom: 10px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}
.doc-section__desc {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0 0 16px;
  line-height: 1.6;
  code {
    background: var(--el-fill-color-light);
    color: var(--el-color-primary);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
    font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
  }
}

.doc-preview {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  overflow: hidden;
  background: var(--el-bg-color-overlay);
}
.doc-preview__body {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 24px;
}
.doc-code {
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-light);
  padding: 16px 20px;
  overflow-x: auto;
  pre {
    margin: 0;
    padding: 0;
  }
  code {
    font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
    font-size: 13px;
    line-height: 1.7;
    color: var(--el-text-color-regular);
    white-space: pre;
  }
}

.doc-subtitle {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 20px 0 10px;
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
    padding: 10px 14px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    white-space: nowrap;
  }
  th {
    background: var(--el-fill-color-light);
    font-weight: 600;
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
    font-size: 13px;
    font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
  }
}

.tab-demo-content {
  padding: 16px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  border: 1px dashed #e2e4ed;
  color: var(--el-text-color-regular);
  font-size: 14px;
  line-height: 1.6;

  p {
    margin: 0 0 8px;
  }
  p:last-child {
    margin: 0;
  }
}

.size-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin: 0 0 8px;
  font-weight: 500;
}

.event-logs {
  margin-top: 12px;
  padding: 12px 16px;
  background: #1a1a2e;
  border-radius: 8px;
  max-height: 120px;
  overflow-y: auto;
}

.event-log {
  font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
  font-size: 12px;
  color: #34c759;
  margin: 0 0 4px;
  line-height: 1.6;

  &:last-child {
    margin: 0;
  }
}
</style>
