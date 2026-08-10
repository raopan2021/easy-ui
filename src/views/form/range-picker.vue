<script setup lang="ts">
import { EasyDateRangePicker, EasyDateTimeRangePicker, EasyTimeRangePicker } from 'easy-ui'
import { ref } from 'vue'

// 日期范围
const dateRange = ref({
  start: '',
  end: '',
})

// 日期时间范围
const dateTimeRange = ref({
  start: '',
  end: '',
})

// 时间范围
const timeRange = ref({
  start: '',
  end: '',
})

// 不同尺寸
const sizeRange = ref({
  largeStart: '',
  largeEnd: '',
  defaultStart: '',
  defaultEnd: '',
  smallStart: '',
  smallEnd: '',
})

// 自定义分隔符
const customRange = ref({
  start: '',
  end: '',
})

// 禁用状态
const disabledRange = ref({
  start: '',
  end: '',
})
</script>

<template>
  <div class="component-doc">
    <header class="doc-header">
      <h1 class="doc-title">
        范围选择器 Range Picker
      </h1>
      <p class="doc-desc">
        日期范围、日期时间范围、时间范围选择器，支持双向绑定两个独立属性。
      </p>
    </header>

    <!-- 日期范围选择器 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        日期范围选择器 DateRangePicker
      </h2>
      <p class="doc-section__desc">
        用于选择日期范围，直接双向绑定两个独立的日期属性。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyDateRangePicker
            v-model:start="dateRange.start"
            v-model:end="dateRange.end"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
          />
          <div class="doc-result">
            选中值：{{ dateRange.start }} 至 {{ dateRange.end }}
          </div>
        </div>
      </div>
      <EasyDocCode
        code="<template>
  <EasyDateRangePicker
    v-model:start=&quot;start&quot;
    v-model:end=&quot;end&quot;
    start-placeholder=&quot;开始日期&quot;
    end-placeholder=&quot;结束日期&quot;
  />
</template>

<script setup>
import { ref } from 'vue'

const dateRange = ref({
  start: '',
  end: ''
})
</script>"
      />
    </section>

    <!-- 日期时间范围选择器 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        日期时间范围选择器 DateTimeRangePicker
      </h2>
      <p class="doc-section__desc">
        用于选择日期时间范围，支持显示秒数。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyDateTimeRangePicker
            v-model:start="dateTimeRange.start"
            v-model:end="dateTimeRange.end"
            :show-seconds="true"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
          <div class="doc-result">
            选中值：{{ dateTimeRange.start }} 至 {{ dateTimeRange.end }}
          </div>
        </div>
      </div>
      <EasyDocCode
        code="<template>
  <EasyDateTimeRangePicker
    v-model:start=&quot;start&quot;
    v-model:end=&quot;end&quot;
    :show-seconds=&quot;true&quot;
    start-placeholder=&quot;开始时间&quot;
    end-placeholder=&quot;结束时间&quot;
  />
</template>

<script setup>
import { ref } from 'vue'

const dateTimeRange = ref({
  start: '',
  end: ''
})
</script>"
      />
    </section>

    <!-- 时间范围选择器 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        时间范围选择器 TimeRangePicker
      </h2>
      <p class="doc-section__desc">
        用于选择时间范围（时:分）。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyTimeRangePicker
            v-model:start="timeRange.start"
            v-model:end="timeRange.end"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
          />
          <div class="doc-result">
            选中值：{{ timeRange.start }} 至 {{ timeRange.end }}
          </div>
        </div>
      </div>
      <EasyDocCode
        code="<template>
  <EasyTimeRangePicker
    v-model:start=&quot;start&quot;
    v-model:end=&quot;end&quot;
    start-placeholder=&quot;开始时间&quot;
    end-placeholder=&quot;结束时间&quot;
  />
</template>

<script setup>
import { ref } from 'vue'

const timeRange = ref({
  start: '',
  end: ''
})
</script>"
      />
    </section>

    <!-- 不同尺寸 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        不同尺寸
      </h2>
      <p class="doc-section__desc">
        支持 <code>large</code>、<code>default</code>、<code>small</code> 三种尺寸。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <div class="size-demo">
            <div class="size-item">
              <span class="size-label">Large</span>
              <EasyDateRangePicker v-model:start="sizeRange.largeStart" v-model:end="sizeRange.largeEnd" size="large" />
            </div>
            <div class="size-item">
              <span class="size-label">Default</span>
              <EasyDateRangePicker
                v-model:start="sizeRange.defaultStart"
                v-model:end="sizeRange.defaultEnd"
                size="default"
              />
            </div>
            <div class="size-item">
              <span class="size-label">Small</span>
              <EasyDateRangePicker v-model:start="sizeRange.smallStart" v-model:end="sizeRange.smallEnd" size="small" />
            </div>
          </div>
        </div>
      </div>
      <EasyDocCode
        code="<EasyDateRangePicker size=&quot;large&quot; .../>
<EasyDateRangePicker size=&quot;default&quot; .../>
<EasyDateRangePicker size=&quot;small&quot; .../>"
      />
    </section>

    <!-- 自定义分隔符 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        自定义分隔符
      </h2>
      <p class="doc-section__desc">
        通过 <code>separator</code> 属性自定义分隔符。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyDateRangePicker v-model:start="customRange.start" v-model:end="customRange.end" separator="-" />
        </div>
      </div>
      <EasyDocCode
        code="<EasyDateRangePicker
  v-model:start=&quot;start&quot;
  v-model:end=&quot;end&quot;
  separator=&quot;-&quot;
/>"
      />
    </section>

    <!-- 禁用状态 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        禁用状态
      </h2>
      <p class="doc-section__desc">
        通过 <code>disabled</code> 属性设置禁用状态。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyDateRangePicker v-model:start="disabledRange.start" v-model:end="disabledRange.end" disabled />
        </div>
      </div>
      <EasyDocCode
        code="<EasyDateRangePicker
  v-model:start=&quot;start&quot;
  v-model:end=&quot;end&quot;
  disabled
/>"
      />
    </section>

    <!-- API 文档 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        API 文档
      </h2>
      <div class="doc-api">
        <h3 class="doc-api__title">
          DateRangePicker Props
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
                <td>start</td>
                <td>开始日期值</td>
                <td>string</td>
                <td>''</td>
              </tr>
              <tr>
                <td>end</td>
                <td>结束日期值</td>
                <td>string</td>
                <td>''</td>
              </tr>
              <tr>
                <td>startPlaceholder</td>
                <td>开始日期占位符</td>
                <td>string</td>
                <td>'开始日期'</td>
              </tr>
              <tr>
                <td>endPlaceholder</td>
                <td>结束日期占位符</td>
                <td>string</td>
                <td>'结束日期'</td>
              </tr>
              <tr>
                <td>clearable</td>
                <td>是否可清空</td>
                <td>boolean</td>
                <td>true</td>
              </tr>
              <tr>
                <td>disabled</td>
                <td>是否禁用</td>
                <td>boolean</td>
                <td>false</td>
              </tr>
              <tr>
                <td>readonly</td>
                <td>是否只读</td>
                <td>boolean</td>
                <td>false</td>
              </tr>
              <tr>
                <td>format</td>
                <td>日期格式</td>
                <td>string</td>
                <td>'YYYY-MM-DD'</td>
              </tr>
              <tr>
                <td>valueFormat</td>
                <td>日期值格式</td>
                <td>string</td>
                <td>''</td>
              </tr>
              <tr>
                <td>separator</td>
                <td>分隔符</td>
                <td>string</td>
                <td>'至'</td>
              </tr>
              <tr>
                <td>size</td>
                <td>组件尺寸</td>
                <td>'large' | 'default' | 'small'</td>
                <td>'default'</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 class="doc-api__title">
          DateTimeRangePicker Props
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
                <td>start</td>
                <td>开始时间值</td>
                <td>string</td>
                <td>''</td>
              </tr>
              <tr>
                <td>end</td>
                <td>结束时间值</td>
                <td>string</td>
                <td>''</td>
              </tr>
              <tr>
                <td>startPlaceholder</td>
                <td>开始时间占位符</td>
                <td>string</td>
                <td>'开始时间'</td>
              </tr>
              <tr>
                <td>endPlaceholder</td>
                <td>结束时间占位符</td>
                <td>string</td>
                <td>'结束时间'</td>
              </tr>
              <tr>
                <td>clearable</td>
                <td>是否可清空</td>
                <td>boolean</td>
                <td>true</td>
              </tr>
              <tr>
                <td>disabled</td>
                <td>是否禁用</td>
                <td>boolean</td>
                <td>false</td>
              </tr>
              <tr>
                <td>readonly</td>
                <td>是否只读</td>
                <td>boolean</td>
                <td>false</td>
              </tr>
              <tr>
                <td>format</td>
                <td>日期格式</td>
                <td>string</td>
                <td>''</td>
              </tr>
              <tr>
                <td>showSeconds</td>
                <td>是否显示秒</td>
                <td>boolean</td>
                <td>false</td>
              </tr>
              <tr>
                <td>separator</td>
                <td>分隔符</td>
                <td>string</td>
                <td>'至'</td>
              </tr>
              <tr>
                <td>size</td>
                <td>组件尺寸</td>
                <td>'large' | 'default' | 'small'</td>
                <td>'default'</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 class="doc-api__title">
          TimeRangePicker Props
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
                <td>start</td>
                <td>开始时间值</td>
                <td>string</td>
                <td>''</td>
              </tr>
              <tr>
                <td>end</td>
                <td>结束时间值</td>
                <td>string</td>
                <td>''</td>
              </tr>
              <tr>
                <td>startPlaceholder</td>
                <td>开始时间占位符</td>
                <td>string</td>
                <td>'开始时间'</td>
              </tr>
              <tr>
                <td>endPlaceholder</td>
                <td>结束时间占位符</td>
                <td>string</td>
                <td>'结束时间'</td>
              </tr>
              <tr>
                <td>clearable</td>
                <td>是否可清空</td>
                <td>boolean</td>
                <td>true</td>
              </tr>
              <tr>
                <td>disabled</td>
                <td>是否禁用</td>
                <td>boolean</td>
                <td>false</td>
              </tr>
              <tr>
                <td>readonly</td>
                <td>是否只读</td>
                <td>boolean</td>
                <td>false</td>
              </tr>
              <tr>
                <td>format</td>
                <td>时间格式</td>
                <td>string</td>
                <td>''</td>
              </tr>
              <tr>
                <td>separator</td>
                <td>分隔符</td>
                <td>string</td>
                <td>'至'</td>
              </tr>
              <tr>
                <td>size</td>
                <td>组件尺寸</td>
                <td>'large' | 'default' | 'small'</td>
                <td>'default'</td>
              </tr>
            </tbody>
          </table>
        </div>

        <h3 class="doc-api__title">
          Events
        </h3>
        <div class="doc-table">
          <table>
            <thead>
              <tr>
                <th>事件名</th>
                <th>说明</th>
                <th>回调参数</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>update:start</td>
                <td>开始值变化</td>
                <td>新的开始值</td>
              </tr>
              <tr>
                <td>update:end</td>
                <td>结束值变化</td>
                <td>新的结束值</td>
              </tr>
              <tr>
                <td>change</td>
                <td>值变化</td>
                <td>{ start, end }</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.component-doc {
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
  gap: 16px;
  padding: 24px;
  min-height: 80px;
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

.doc-result {
  padding: 8px 12px;
  background: var(--el-fill-color-light);
  border-radius: 6px;
  font-size: 14px;
  color: var(--el-text-color-regular);
  margin-top: 8px;
}

.size-demo {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;
}

.size-item {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.size-label {
  width: 80px;
  font-size: 13px;
  color: var(--el-text-color-placeholder);
  flex-shrink: 0;
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

.doc-api {
  .doc-api__title {
    font-size: 16px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    margin: 24px 0 12px;
  }
}
</style>
