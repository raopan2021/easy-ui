<script setup lang="ts">
import { EasyButton, EasyDescriptions, EasyDescriptionsItem, EasyIcon } from 'easy-ui'
</script>

<template>
  <div class="descriptions-doc">
    <div class="doc-header">
      <h1 class="doc-title">
        Descriptions 描述列表
      </h1>
      <p class="doc-desc">
        以键值对形式结构化展示信息，适用于详情页、信息确认等场景。
      </p>
    </div>

    <!-- 基础用法 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        基础用法
      </h2>
      <p class="doc-section__desc">
        通过 <code>EasyDescriptionsItem</code> 配置每一项内容，默认水平排列（label 左，内容右）。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyDescriptions title="用户信息">
            <EasyDescriptionsItem label="姓名">
              张明
            </EasyDescriptionsItem>
            <EasyDescriptionsItem label="工号">
              EMP-2026001
            </EasyDescriptionsItem>
            <EasyDescriptionsItem label="部门">
              技术研发部
            </EasyDescriptionsItem>
            <EasyDescriptionsItem label="职位">
              高级工程师
            </EasyDescriptionsItem>
            <EasyDescriptionsItem label="手机">
              138-xxxx-xxxx
            </EasyDescriptionsItem>
            <EasyDescriptionsItem label="邮箱">
              zhang@company.com
            </EasyDescriptionsItem>
          </EasyDescriptions>
        </div>
        <EasyDocCode
          code="<EasyDescriptions title=&quot;用户信息&quot;>
  <EasyDescriptionsItem label=&quot;姓名&quot;>张明</EasyDescriptionsItem>
  <EasyDescriptionsItem label=&quot;工号&quot;>EMP-2026001</EasyDescriptionsItem>
  <EasyDescriptionsItem label=&quot;部门&quot;>技术研发部</EasyDescriptionsItem>
</EasyDescriptions>"
        />
      </div>
    </section>

    <!-- 垂直布局 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        垂直布局
      </h2>
      <p class="doc-section__desc">
        设置 <code>layout="vertical"</code>，label 显示在上方，内容在下方，适合卡片式展示。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body flex-col">
          <div>
            <div class="sub-label">
              无边框
            </div>
            <EasyDescriptions title="项目概况" layout="vertical">
              <EasyDescriptionsItem label="项目名称">
                EaseUI 企业级组件库
              </EasyDescriptionsItem>
              <EasyDescriptionsItem label="负责人">
                张明
              </EasyDescriptionsItem>
              <EasyDescriptionsItem label="创建时间">
                2026-01-01
              </EasyDescriptionsItem>
              <EasyDescriptionsItem label="当前版本">
                v2.4.0
              </EasyDescriptionsItem>
              <EasyDescriptionsItem label="开源协议">
                MIT
              </EasyDescriptionsItem>
              <EasyDescriptionsItem label="当前状态">
                <span class="status-badge status-active"><span class="status-dot" />进行中</span>
              </EasyDescriptionsItem>
            </EasyDescriptions>
          </div>
          <div>
            <div class="sub-label">
              有边框
            </div>
            <EasyDescriptions title="订单信息" layout="vertical" bordered>
              <EasyDescriptionsItem label="订单编号">
                ORD-20260325-001
              </EasyDescriptionsItem>
              <EasyDescriptionsItem label="下单时间">
                2026-03-25 14:30:00
              </EasyDescriptionsItem>
              <EasyDescriptionsItem label="支付方式">
                微信支付
              </EasyDescriptionsItem>
              <EasyDescriptionsItem label="商品名称">
                Vue3 企业级组件库
              </EasyDescriptionsItem>
              <EasyDescriptionsItem label="数量">
                1
              </EasyDescriptionsItem>
              <EasyDescriptionsItem label="订单金额">
                ¥ 299.00
              </EasyDescriptionsItem>
            </EasyDescriptions>
          </div>
        </div>
        <EasyDocCode
          code="<!-- 上下布局 -->
<EasyDescriptions layout=&quot;vertical&quot;>
  <EasyDescriptionsItem label=&quot;项目名称&quot;>EaseUI</EasyDescriptionsItem>
  ...
</EasyDescriptions>

<!-- 上下布局 + 边框 -->
<EasyDescriptions layout=&quot;vertical&quot; bordered>
  ...
</EasyDescriptions>"
        />
      </div>
    </section>

    <!-- 有边框 (水平) -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        有边框（水平）
      </h2>
      <p class="doc-section__desc">
        使用 <code>bordered</code> 属性展示更清晰的网格结构，同时支持 <code>span</code> 跨列。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyDescriptions title="订单详情" bordered>
            <EasyDescriptionsItem label="订单编号">
              ORD-20260325-001
            </EasyDescriptionsItem>
            <EasyDescriptionsItem label="下单时间">
              2026-03-25 14:30:00
            </EasyDescriptionsItem>
            <EasyDescriptionsItem label="支付方式">
              微信支付
            </EasyDescriptionsItem>
            <EasyDescriptionsItem label="商品名称">
              Vue3 企业级组件库
            </EasyDescriptionsItem>
            <EasyDescriptionsItem label="商品数量">
              1
            </EasyDescriptionsItem>
            <EasyDescriptionsItem label="订单金额">
              ¥ 299.00
            </EasyDescriptionsItem>
            <EasyDescriptionsItem label="收货地址" :span="3">
              广东省深圳市南山区科技园南区 A 栋 8 楼 801 室
            </EasyDescriptionsItem>
          </EasyDescriptions>
        </div>
        <EasyDocCode
          code="<EasyDescriptions title=&quot;订单详情&quot; bordered>
  <EasyDescriptionsItem label=&quot;订单编号&quot;>ORD-001</EasyDescriptionsItem>
  <!-- span 属性实现跨列 -->
  <EasyDescriptionsItem label=&quot;收货地址&quot; :span=&quot;3&quot;>
    广东省深圳市...
  </EasyDescriptionsItem>
</EasyDescriptions>"
        />
      </div>
    </section>

    <!-- 自定义列数 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        自定义列数
      </h2>
      <p class="doc-section__desc">
        通过 <code>column</code> 属性设置每行显示的列数，默认为 3。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body flex-col">
          <div>
            <div class="sub-label">
              column = 2
            </div>
            <EasyDescriptions :column="2" bordered>
              <EasyDescriptionsItem label="项目名称">
                EaseUI 企业级组件库
              </EasyDescriptionsItem>
              <EasyDescriptionsItem label="创建时间">
                2026-01-01
              </EasyDescriptionsItem>
              <EasyDescriptionsItem label="负责人">
                张明
              </EasyDescriptionsItem>
              <EasyDescriptionsItem label="当前状态">
                进行中
              </EasyDescriptionsItem>
            </EasyDescriptions>
          </div>
          <div>
            <div class="sub-label">
              column = 4
            </div>
            <EasyDescriptions :column="4" bordered>
              <EasyDescriptionsItem label="CPU">
                Intel Core i9
              </EasyDescriptionsItem>
              <EasyDescriptionsItem label="内存">
                64 GB DDR5
              </EasyDescriptionsItem>
              <EasyDescriptionsItem label="硬盘">
                2 TB NVMe SSD
              </EasyDescriptionsItem>
              <EasyDescriptionsItem label="显卡">
                NVIDIA RTX 4090
              </EasyDescriptionsItem>
              <EasyDescriptionsItem label="操作系统">
                macOS Sequoia
              </EasyDescriptionsItem>
              <EasyDescriptionsItem label="序列号">
                MAC-2026-00128
              </EasyDescriptionsItem>
              <EasyDescriptionsItem label="购买日期">
                2026-01-15
              </EasyDescriptionsItem>
              <EasyDescriptionsItem label="保修期至">
                2029-01-15
              </EasyDescriptionsItem>
            </EasyDescriptions>
          </div>
        </div>
        <EasyDocCode
          code="<EasyDescriptions :column=&quot;2&quot; bordered>...</EasyDescriptions>
<EasyDescriptions :column=&quot;4&quot; bordered>...</EasyDescriptions>"
        />
      </div>
    </section>

    <!-- 富内容 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        富文本内容
      </h2>
      <p class="doc-section__desc">
        描述项内容支持任意 HTML 和 Vue 组件，包括标签、按钮、评分等。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyDescriptions title="员工档案" bordered>
            <EasyDescriptionsItem label="姓名">
              李雯
            </EasyDescriptionsItem>
            <EasyDescriptionsItem label="在职状态">
              <span class="status-badge status-active"> <span class="status-dot" /> 在职 </span>
            </EasyDescriptionsItem>
            <EasyDescriptionsItem label="入职日期">
              2023-06-01
            </EasyDescriptionsItem>
            <EasyDescriptionsItem label="技能标签">
              <div class="tag-group">
                <span class="tech-tag blue">Vue 3</span>
                <span class="tech-tag green">TypeScript</span>
                <span class="tech-tag orange">Node.js</span>
                <span class="tech-tag purple">Go</span>
              </div>
            </EasyDescriptionsItem>
            <EasyDescriptionsItem label="绩效评级">
              <div class="rating-row">
                <EasyIcon
                  v-for="i in 5"
                  :key="i"
                  name="el:StarFilled"
                  :size="15"
                  :class="i <= 4 ? 'star-on' : 'star-off'"
                />
                <span class="rating-text">4.0 / 5.0</span>
              </div>
            </EasyDescriptionsItem>
            <EasyDescriptionsItem label="操作">
              <div class="action-group">
                <EasyButton type="primary" size="small">
                  编辑
                </EasyButton>
                <EasyButton size="small">
                  查看档案
                </EasyButton>
              </div>
            </EasyDescriptionsItem>
          </EasyDescriptions>
        </div>
        <EasyDocCode
          code="<EasyDescriptionsItem label=&quot;在职状态&quot;>
  <span class=&quot;status-badge&quot;>在职</span>
</EasyDescriptionsItem>
<EasyDescriptionsItem label=&quot;技能标签&quot;>
  <span v-for=&quot;s in skills&quot; :key=&quot;s&quot;>{{ s }}</span>
</EasyDescriptionsItem>"
        />
      </div>
    </section>

    <!-- 垂直布局富内容 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        垂直布局 · 富内容
      </h2>
      <p class="doc-section__desc">
        垂直布局同样支持任意内容插槽，适合仪表盘数据卡片展示。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyDescriptions title="运营数据" layout="vertical" :column="4" bordered>
            <EasyDescriptionsItem label="今日新增用户">
              <div class="metric-value">
                1,280
              </div>
            </EasyDescriptionsItem>
            <EasyDescriptionsItem label="月活跃用户">
              <div class="metric-value">
                42,680
              </div>
            </EasyDescriptionsItem>
            <EasyDescriptionsItem label="累计订单量">
              <div class="metric-value">
                158,092
              </div>
            </EasyDescriptionsItem>
            <EasyDescriptionsItem label="今日营收">
              <div class="metric-value revenue">
                ¥ 86,420
              </div>
            </EasyDescriptionsItem>
            <EasyDescriptionsItem label="系统状态">
              <span class="status-badge status-active"><span class="status-dot" />正常运行</span>
            </EasyDescriptionsItem>
            <EasyDescriptionsItem label="最后同步">
              2026-03-26 13:00:00
            </EasyDescriptionsItem>
            <EasyDescriptionsItem label="数据版本">
              v20260326-003
            </EasyDescriptionsItem>
            <EasyDescriptionsItem label="操作">
              <div class="action-group">
                <EasyButton size="small" type="primary">
                  刷新
                </EasyButton>
                <EasyButton size="small">
                  导出
                </EasyButton>
              </div>
            </EasyDescriptionsItem>
          </EasyDescriptions>
        </div>
        <EasyDocCode
          code="<EasyDescriptions layout=&quot;vertical&quot; :column=&quot;4&quot; bordered>
  <EasyDescriptionsItem label=&quot;今日新增用户&quot;>
    <div class=&quot;metric-value&quot;>1,280</div>
  </EasyDescriptionsItem>
  ...
</EasyDescriptions>"
        />
      </div>
    </section>

    <!-- 标题 extra 插槽 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        标题与额外操作
      </h2>
      <p class="doc-section__desc">
        使用 <code>#title</code> 和 <code>#extra</code> 插槽自定义头部。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyDescriptions bordered>
            <template #title>
              <div class="custom-title">
                <EasyIcon name="el:Document" :size="15" class="custom-title__icon" />
                合同基本信息
              </div>
            </template>
            <template #extra>
              <div class="extra-group">
                <EasyButton size="small">
                  打印
                </EasyButton>
                <EasyButton size="small" type="primary">
                  编辑
                </EasyButton>
              </div>
            </template>
            <EasyDescriptionsItem label="合同编号">
              HT-2026-00128
            </EasyDescriptionsItem>
            <EasyDescriptionsItem label="签署日期">
              2026-03-01
            </EasyDescriptionsItem>
            <EasyDescriptionsItem label="合同状态">
              <span class="status-badge status-active"> <span class="status-dot" /> 生效中 </span>
            </EasyDescriptionsItem>
            <EasyDescriptionsItem label="甲方">
              深圳市云华科技有限公司
            </EasyDescriptionsItem>
            <EasyDescriptionsItem label="乙方">
              北京易代码信息技术有限公司
            </EasyDescriptionsItem>
            <EasyDescriptionsItem label="合同金额">
              ¥ 1,280,000.00
            </EasyDescriptionsItem>
          </EasyDescriptions>
        </div>
        <EasyDocCode
          code="<EasyDescriptions bordered>
  <template #title>
    <EasyIcon name=&quot;el:Document&quot; /> 合同信息
  </template>
  <template #extra>
    <EasyButton size=&quot;small&quot; type=&quot;primary&quot;>编辑</EasyButton>
  </template>
  ...
</EasyDescriptions>"
        />
      </div>
    </section>

    <!-- 尺寸 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        尺寸
      </h2>
      <p class="doc-section__desc">
        支持 <code>small</code>、<code>default</code>、<code>large</code> 三种尺寸，水平/垂直布局均可用。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body flex-col">
          <div>
            <div class="sub-label">
              size = small
            </div>
            <EasyDescriptions size="small" bordered>
              <EasyDescriptionsItem label="姓名">
                张明
              </EasyDescriptionsItem>
              <EasyDescriptionsItem label="工号">
                EMP-001
              </EasyDescriptionsItem>
              <EasyDescriptionsItem label="部门">
                技术研发部
              </EasyDescriptionsItem>
            </EasyDescriptions>
          </div>
          <div>
            <div class="sub-label">
              size = default
            </div>
            <EasyDescriptions size="default" bordered>
              <EasyDescriptionsItem label="姓名">
                张明
              </EasyDescriptionsItem>
              <EasyDescriptionsItem label="工号">
                EMP-001
              </EasyDescriptionsItem>
              <EasyDescriptionsItem label="部门">
                技术研发部
              </EasyDescriptionsItem>
            </EasyDescriptions>
          </div>
          <div>
            <div class="sub-label">
              size = large
            </div>
            <EasyDescriptions size="large" bordered>
              <EasyDescriptionsItem label="姓名">
                张明
              </EasyDescriptionsItem>
              <EasyDescriptionsItem label="工号">
                EMP-001
              </EasyDescriptionsItem>
              <EasyDescriptionsItem label="部门">
                技术研发部
              </EasyDescriptionsItem>
            </EasyDescriptions>
          </div>
        </div>
        <EasyDocCode
          code="<EasyDescriptions size=&quot;small&quot; bordered>...</EasyDescriptions>
<EasyDescriptions size=&quot;default&quot; bordered>...</EasyDescriptions>
<EasyDescriptions size=&quot;large&quot; bordered>...</EasyDescriptions>"
        />
      </div>
    </section>

    <!-- API -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        API
      </h2>

      <h3 class="doc-subtitle">
        Descriptions Props
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
              <td>标题</td>
              <td><code>string</code></td>
              <td><code>''</code></td>
            </tr>
            <tr>
              <td><code>layout</code></td>
              <td>布局方向</td>
              <td><code>'horizontal' | 'vertical'</code></td>
              <td><code>'horizontal'</code></td>
            </tr>
            <tr>
              <td><code>column</code></td>
              <td>每行列数</td>
              <td><code>number</code></td>
              <td><code>3</code></td>
            </tr>
            <tr>
              <td><code>bordered</code></td>
              <td>是否边框</td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
            </tr>
            <tr>
              <td><code>size</code></td>
              <td>尺寸</td>
              <td><code>'small' | 'default' | 'large'</code></td>
              <td><code>'default'</code></td>
            </tr>
            <tr>
              <td><code>labelWidth</code></td>
              <td>标签列宽度（水平布局有效）</td>
              <td><code>string | number</code></td>
              <td><code>''</code></td>
            </tr>
            <tr>
              <td><code>labelAlign</code></td>
              <td>标签对齐（水平布局有效）</td>
              <td><code>'left' | 'right' | 'center'</code></td>
              <td><code>'left'</code></td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 class="doc-subtitle">
        Descriptions Slots
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
              <td>放置 EasyDescriptionsItem 子项</td>
            </tr>
            <tr>
              <td><code>title</code></td>
              <td>自定义标题内容</td>
            </tr>
            <tr>
              <td><code>extra</code></td>
              <td>标题右侧操作区</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 class="doc-subtitle">
        DescriptionsItem Props
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
              <td><code>label</code></td>
              <td>标签文字</td>
              <td><code>string</code></td>
              <td><code>''</code></td>
            </tr>
            <tr>
              <td><code>icon</code></td>
              <td>标签图标</td>
              <td><code>string</code></td>
              <td><code>''</code></td>
            </tr>
            <tr>
              <td><code>span</code></td>
              <td>跨列数</td>
              <td><code>number</code></td>
              <td><code>1</code></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
// 统一文档样式 - 与 Statistic 组件保持一致
.descriptions-doc {
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
  line-height: 1.6;
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
  line-height: 1.6;

  code {
    background: var(--el-fill-color-light);
    color: var(--el-color-primary);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
    font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
    border: 1px solid var(--el-border-color-lighter);
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
  border-radius: 12px;
  overflow: hidden;
  background: var(--el-bg-color-overlay);
}

.doc-preview__body {
  padding: 24px;

  &.flex-col {
    display: flex;
    flex-direction: column;
    gap: 20px;
  }
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

.doc-table {
  overflow-x: auto;

  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13.5px;
  }

  th,
  td {
    text-align: left;
    padding: 10px 14px;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }

  th {
    background: var(--el-fill-color-light);
    font-weight: 600;
    color: var(--el-text-color-primary);
    font-size: 13px;
  }

  td {
    color: var(--el-text-color-regular);
  }

  code {
    background: var(--el-fill-color-light);
    color: var(--el-color-primary);
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 12px;
    font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
    border: 1px solid var(--el-border-color-lighter);
  }
}

/* ── 小标签 ── */
.sub-label {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  color: var(--el-text-color-secondary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background: var(--el-fill-color-light);
  border: 1px solid var(--el-border-color-lighter);
  padding: 1px 8px;
  border-radius: 20px;
  margin-bottom: 10px;
}

/* ── 状态徽章 ── */
.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 500;
  padding: 2px 10px;
  border-radius: 20px;

  .status-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &.status-active {
    background: #e6fffb;
    color: #00b96b;
    border: 1px solid #b7eb8f;

    .status-dot {
      background: #00b96b;
    }
  }
}

/* ── 技术标签 ── */
.tag-group {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.tech-tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 4px;
  letter-spacing: 0.02em;

  &.blue {
    background: #e6f4ff;
    color: var(--el-color-primary);
    border: 1px solid #91caff;
  }
  &.green {
    background: #f6ffed;
    color: #389e0d;
    border: 1px solid #b7eb8f;
  }
  &.orange {
    background: #fff7e6;
    color: #d46b08;
    border: 1px solid #ffd591;
  }
  &.purple {
    background: #f9f0ff;
    color: #531dab;
    border: 1px solid #d3adf7;
  }
}

/* ── 评分 ── */
.rating-row {
  display: flex;
  align-items: center;
  gap: 3px;
}

.star-on {
  color: var(--el-color-warning);
}
.star-off {
  color: #d9d9d9;
}

.rating-text {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-left: 6px;
  font-weight: 500;
}

/* ── 操作按钮组 ── */
.action-group {
  display: flex;
  gap: 8px;
}

/* ── 自定义标题 ── */
.custom-title {
  display: flex;
  align-items: center;
  gap: 7px;
  font-weight: 600;
  font-size: 15px;
  color: var(--el-text-color-primary);
}

.custom-title__icon {
  color: var(--el-color-primary);
}

.extra-group {
  display: flex;
  gap: 8px;
}

/* ── 指标数值 ── */
.metric-value {
  font-size: 20px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  letter-spacing: -0.5px;
  line-height: 1.3;

  &.revenue {
    color: var(--el-color-primary);
  }
}
</style>
