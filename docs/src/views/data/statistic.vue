<script setup lang="ts">
import { EasyStatistic } from '@raopan/easy-ui'
</script>

<template>
  <div class="statistic-doc">
    <!-- 页面标题 -->
    <div class="doc-header">
      <h1 class="doc-title">
        Statistic 统计数值
      </h1>
      <p class="doc-desc">
        现代简约风格的统计数值组件，图标在标题左侧，优化了视觉层次和整体美感。
      </p>
    </div>

    <!-- 基础用法 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        基础用法
      </h2>
      <p class="doc-section__desc">
        通过 <code>variant</code> 属性设置样式变体，图标位于标题左侧，视觉层次更清晰。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyStatistic title="用户数量" :value="8925" suffix="人" variant="primary" />
          <EasyStatistic title="订单数量" :value="1284" suffix="单" variant="success" />
          <EasyStatistic title="营收金额" :value="324150" prefix="¥" suffix="元" variant="warning" />
          <EasyStatistic title="错误率" :value="2.4" suffix="%" variant="danger" />
        </div>
        <EasyDocCode
          code="<EasyStatistic title=&quot;用户数量&quot; :value=&quot;8925&quot; suffix=&quot;人&quot; variant=&quot;primary&quot; />
<EasyStatistic title=&quot;订单数量&quot; :value=&quot;1284&quot; suffix=&quot;单&quot; variant=&quot;success&quot; />
<EasyStatistic title=&quot;营收金额&quot; :value=&quot;324150&quot; prefix=&quot;¥&quot; suffix=&quot;元&quot; variant=&quot;warning&quot; />
<EasyStatistic title=&quot;错误率&quot; :value=&quot;2.4&quot; suffix=&quot;%&quot; variant=&quot;danger&quot; />"
        />
      </div>
    </section>

    <!-- 图标用法 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        图标用法
      </h2>
      <p class="doc-section__desc">
        通过 <code>icon</code> 属性添加图标，图标在标题左侧，图标背景色与变体颜色协调。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyStatistic title="用户统计" :value="12543" suffix="人" icon="el:User" variant="primary" />
          <EasyStatistic title="订单统计" :value="8925" suffix="单" icon="el:ShoppingCart" variant="success" />
          <EasyStatistic title="收入统计" :value="324150" prefix="¥" suffix="元" icon="el:DataLine" variant="warning" />
          <EasyStatistic title="错误统计" :value="12" suffix="个" icon="el:DataLine" variant="danger" />
        </div>
        <EasyDocCode
          code="<EasyStatistic title=&quot;用户统计&quot; :value=&quot;12543&quot; suffix=&quot;人&quot; icon=&quot;el:User&quot; variant=&quot;primary&quot; />
<EasyStatistic title=&quot;订单统计&quot; :value=&quot;8925&quot; suffix=&quot;单&quot; icon=&quot;el:ShoppingCart&quot; variant=&quot;success&quot; />
<EasyStatistic title=&quot;收入统计&quot; :value=&quot;324150&quot; prefix=&quot;¥&quot; suffix=&quot;元&quot; icon=&quot;el:DataLine&quot; variant=&quot;warning&quot; />
<EasyStatistic title=&quot;错误统计&quot; :value=&quot;12&quot; suffix=&quot;个&quot; icon=&quot;el:DataLine&quot; variant=&quot;danger&quot; />"
        />
      </div>
    </section>

    <!-- 前后缀 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        前后缀
      </h2>
      <p class="doc-section__desc">
        通过 <code>prefix</code> 和 <code>suffix</code> 属性设置数值的前缀和后缀。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyStatistic title="本月营收" :value="892500" prefix="¥" suffix="元" variant="primary" />
          <EasyStatistic title="用户增长" :value="24.8" suffix="%" variant="success" />
          <EasyStatistic title="响应时间" :value="2.4" suffix="秒" variant="info" />
        </div>
        <EasyDocCode
          code="<EasyStatistic title=&quot;本月营收&quot; :value=&quot;892500&quot; prefix=&quot;¥&quot; suffix=&quot;元&quot; variant=&quot;primary&quot; />
<EasyStatistic title=&quot;用户增长&quot; :value=&quot;24.8&quot; suffix=&quot;%&quot; variant=&quot;success&quot; />
<EasyStatistic title=&quot;响应时间&quot; :value=&quot;2.4&quot; suffix=&quot;秒&quot; variant=&quot;info&quot; />"
        />
      </div>
    </section>

    <!-- 尺寸 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        不同尺寸
      </h2>
      <p class="doc-section__desc">
        通过 <code>size</code> 属性设置组件尺寸，支持 sm / md / lg。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyStatistic title="今日新增" :value="324" suffix="人" size="sm" variant="primary" icon="el:User" />
          <EasyStatistic title="本月销售额" :value="892500" prefix="¥" suffix="元" size="md" variant="success"
            icon="el:DataLine" />
          <EasyStatistic title="年度目标" :value="12500000" prefix="¥" suffix="万元" size="lg" variant="warning"
            icon="el:Location" />
        </div>
        <EasyDocCode
          code="<EasyStatistic title=&quot;今日新增&quot; :value=&quot;324&quot; suffix=&quot;人&quot; size=&quot;sm&quot; variant=&quot;primary&quot; icon=&quot;el:User&quot; />
<EasyStatistic title=&quot;本月销售额&quot; :value=&quot;892500&quot; prefix=&quot;¥&quot; suffix=&quot;元&quot; size=&quot;md&quot; variant=&quot;success&quot; icon=&quot;el:DataLine&quot; />
<EasyStatistic title=&quot;年度目标&quot; :value=&quot;12500000&quot; prefix=&quot;¥&quot; suffix=&quot;万元&quot; size=&quot;lg&quot; variant=&quot;warning&quot; icon=&quot;el:Location&quot; />"
        />
      </div>
    </section>

    <!-- 趋势标签 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        趋势标签
      </h2>
      <p class="doc-section__desc">
        通过 <code>trend</code> 和 <code>trendLabel</code> 属性展示数据变化趋势。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyStatistic title="营收增长" :value="32.4" suffix="%" variant="success" trend="up" trend-label="环比 +5.2%"
            icon="el:DataLine" />
          <EasyStatistic title="用户流失" :value="8.6" suffix="%" variant="danger" trend="down" trend-label="环比 -1.8%"
            icon="el:DataLine" />
        </div>
        <EasyDocCode
          code="<EasyStatistic title=&quot;营收增长&quot; :value=&quot;32.4&quot; suffix=&quot;%&quot; variant=&quot;success&quot; trend=&quot;up&quot; trend-label=&quot;环比 +5.2%&quot; icon=&quot;el:DataLine&quot; />
<EasyStatistic title=&quot;用户流失&quot; :value=&quot;8.6&quot; suffix=&quot;%&quot; variant=&quot;danger&quot; trend=&quot;down&quot; trend-label=&quot;环比 -1.8%&quot; icon=&quot;el:DataLine&quot; />"
        />
      </div>
    </section>

    <!-- 说明文字 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        说明文字
      </h2>
      <p class="doc-section__desc">
        通过 <code>extra</code> 属性添加底部说明文字。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyStatistic title="本月收入" :value="892500" prefix="¥" suffix="元" variant="primary" icon="el:DataLine"
            extra="较上月增长 12.5%，完成季度目标的 85%" />
          <EasyStatistic title="用户满意度" :value="4.85" suffix="/5.0" variant="success" icon="el:DataLine"
            extra="基于 1,254 条用户评价，NPS 得分 +42" />
        </div>
        <EasyDocCode
          code="<EasyStatistic
  title=&quot;本月收入&quot;
  :value=&quot;892500&quot;
  prefix=&quot;¥&quot;
  suffix=&quot;元&quot;
  variant=&quot;primary&quot;
  icon=&quot;el:DataLine&quot;
  extra=&quot;较上月增长 12.5%，完成季度目标的 85%&quot;
/>
<EasyStatistic
  title=&quot;用户满意度&quot;
  :value=&quot;4.85&quot;
  suffix=&quot;/5.0&quot;
  variant=&quot;success&quot;
  icon=&quot;el:DataLine&quot;
  extra=&quot;基于 1,254 条用户评价，NPS 得分 +42&quot;
/>"
        />
      </div>
    </section>

    <!-- 组合展示 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        组合展示
      </h2>
      <p class="doc-section__desc">
        在实际业务场景中，统计数值常以组合形式出现，适合仪表盘等场景。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <div class="dashboard-grid">
            <EasyStatistic title="总用户数" :value="12543" suffix="人" variant="primary" icon="el:User" :bordered="true"
              :hoverable="true" />
            <EasyStatistic title="本月收入" :value="892500" prefix="¥" suffix="元" variant="success" icon="el:DataLine"
              :bordered="true" :hoverable="true" trend="up" trend-label="+12.5%" />
            <EasyStatistic title="订单数量" :value="1284" suffix="单" variant="warning" icon="el:DataLine" :bordered="true"
              :hoverable="true" />
            <EasyStatistic title="转化率" :value="24.8" suffix="%" variant="info" icon="el:DataLine" :bordered="true"
              :hoverable="true" extra="较上月提升 3.2%" />
          </div>
        </div>
        <EasyDocCode
          code="<div class=&quot;dashboard-grid&quot;>
  <EasyStatistic
    title=&quot;总用户数&quot;
    :value=&quot;12543&quot;
    suffix=&quot;人&quot;
    variant=&quot;primary&quot;
    icon=&quot;el:User&quot;
    :bordered=&quot;true&quot;
    :hoverable=&quot;true&quot;
  />
  <EasyStatistic
    title=&quot;本月收入&quot;
    :value=&quot;892500&quot;
    prefix=&quot;¥&quot;
    suffix=&quot;元&quot;
    variant=&quot;success&quot;
    icon=&quot;el:DataLine&quot;
    :bordered=&quot;true&quot;
    :hoverable=&quot;true&quot;
    trend=&quot;up&quot;
    trend-label=&quot;+12.5%&quot;
  />
  <EasyStatistic
    title=&quot;订单数量&quot;
    :value=&quot;1284&quot;
    suffix=&quot;单&quot;
    variant=&quot;warning&quot;
    icon=&quot;el:DataLine&quot;
    :bordered=&quot;true&quot;
    :hoverable=&quot;true&quot;
  />
</div>"
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
              <td>标题文字</td>
              <td><code>string</code></td>
              <td>-</td>
            </tr>
            <tr>
              <td><code>value</code></td>
              <td>数值</td>
              <td><code>number | string</code></td>
              <td>-</td>
            </tr>
            <tr>
              <td><code>precision</code></td>
              <td>小数精度</td>
              <td><code>number</code></td>
              <td><code>0</code></td>
            </tr>
            <tr>
              <td><code>prefix</code></td>
              <td>数值前缀</td>
              <td><code>string</code></td>
              <td>-</td>
            </tr>
            <tr>
              <td><code>suffix</code></td>
              <td>数值后缀</td>
              <td><code>string</code></td>
              <td>-</td>
            </tr>
            <tr>
              <td><code>variant</code></td>
              <td>样式变体：default / primary / success / warning / danger</td>
              <td><code>string</code></td>
              <td><code>'default'</code></td>
            </tr>
            <tr>
              <td><code>size</code></td>
              <td>尺寸：sm / md / lg</td>
              <td><code>string</code></td>
              <td><code>'md'</code></td>
            </tr>
            <tr>
              <td><code>trend</code></td>
              <td>趋势：up / down</td>
              <td><code>string</code></td>
              <td>-</td>
            </tr>
            <tr>
              <td><code>trendLabel</code></td>
              <td>趋势标签文字</td>
              <td><code>string</code></td>
              <td>-</td>
            </tr>
            <tr>
              <td><code>icon</code></td>
              <td>图标名称</td>
              <td><code>string</code></td>
              <td>-</td>
            </tr>
            <tr>
              <td><code>extra</code></td>
              <td>底部说明文字</td>
              <td><code>string</code></td>
              <td>-</td>
            </tr>
            <tr>
              <td><code>bordered</code></td>
              <td>是否启用边框样式</td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
            </tr>
            <tr>
              <td><code>hoverable</code></td>
              <td>是否启用悬浮效果</td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
            </tr>
            <tr>
              <td><code>animated</code></td>
              <td>是否启用数值增长动画</td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
            </tr>
            <tr>
              <td><code>animationDuration</code></td>
              <td>动画持续时间（毫秒）</td>
              <td><code>number</code></td>
              <td><code>1000</code></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.statistic-doc {
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
  gap: 24px;
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

.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 20px;
  width: 100%;
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

@media (max-width: 768px) {
  .doc-preview__body {
    flex-direction: column;
    align-items: stretch;
    gap: 20px;
  }

  .dashboard-grid {
    grid-template-columns: 1fr;
  }
}
</style>
