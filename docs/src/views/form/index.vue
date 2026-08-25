<script setup lang="ts">
import {
  easy,
  EasyButton,
  EasyDatePicker,
  EasyForm,
  EasyFormItem,
  EasyInput,
  EasyRate,
  EasySelect,
  EasyTimePicker,
  email,
  minLength,
  phone,
  required,
} from '@raopan/easy-ui'
import { reactive, ref } from 'vue'

/** ===== 基础表单 ===== */
const basicFormRef = ref<InstanceType<typeof EasyForm> | null>(null)
const basicForm = reactive({
  name: '',
  email: '',
  phone: '',
  department: '',
})

const basicRules = {
  name: [required('请输入姓名'), minLength(2, '姓名至少2个字符')],
  email: [required('请输入邮箱'), email('请输入正确的邮箱地址')],
  phone: [required('请输入手机号'), phone('请输入正确的手机号')],
  department: [required('请选择部门')],
}

const departmentOptions = [
  { label: '技术部', value: 'tech' },
  { label: '产品部', value: 'product' },
  { label: '设计部', value: 'design' },
  { label: '市场部', value: 'marketing' },
  { label: '运营部', value: 'operation' },
]

async function submitBasicForm() {
  const valid = await basicFormRef.value?.validate()
  if (valid) {
    easy.$msg.success('表单校验通过！')
    console.log('表单数据:', { ...basicForm })
  }
  else {
    easy.$msg.danger('请检查表单填写是否正确')
  }
}

function resetBasicForm() {
  basicFormRef.value?.resetFields()
  easy.$msg.info('表单已重置')
}

/** ===== 日期时间 ===== */
const dateForm = reactive({
  date: '',
  month: '',
  year: '',
  time: '',
  timeWithSeconds: '',
})

/** ===== 评分 ===== */
const rate1 = ref(3)
const rate2 = ref(2.5)
const rate3 = ref(4)
const rate4 = ref(3)
const rate5 = ref(4)
const rate6 = ref(5)

/** ===== 输入框 ===== */
const inputVal = ref('')
const inputVal2 = ref('')
const inputVal3 = ref('')
const inputPwd = ref('')
const inputUrl = ref('')

/** ===== 下拉选择 ===== */
const fruitOptions = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
  { label: '橙子', value: 'orange' },
  { label: '葡萄', value: 'grape' },
  { label: '西瓜', value: 'watermelon' },
  { label: '草莓', value: 'strawberry' },
]
const selectVal = ref<string | number>()
const selectVal2 = ref<string | number>()
const selectMulti = ref<(string | number)[]>([])
</script>

<template>
  <div class="form-doc">
    <div class="doc-header">
      <h1 class="doc-title">
        Form 表单
      </h1>
      <p class="doc-desc">
        完整的表单组件集，包含输入框、下拉选择、评分、日期选择器、时间选择器等，并支持表单校验。
      </p>
    </div>

    <!-- 基础表单 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        基础表单 + 校验
      </h2>
      <p class="doc-section__desc">
        使用 <code>EasyForm</code> + <code>EasyFormItem</code> 包裹表单项，传入 <code>rules</code> 配置校验规则。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <div class="form-demo-card">
            <EasyForm ref="basicFormRef" v-model="basicForm" :rules="basicRules" :label-width="100">
              <EasyFormItem label="姓名" prop="name">
                <EasyInput v-model="basicForm.name" placeholder="请输入姓名" clearable />
              </EasyFormItem>
              <EasyFormItem label="邮箱" prop="email">
                <EasyInput v-model="basicForm.email" placeholder="请输入邮箱" clearable />
              </EasyFormItem>
              <EasyFormItem label="手机号" prop="phone">
                <EasyInput v-model="basicForm.phone" placeholder="请输入手机号" maxlength="11" clearable />
              </EasyFormItem>
              <EasyFormItem label="部门" prop="department">
                <EasySelect v-model="basicForm.department" :options="departmentOptions" placeholder="请选择部门" clearable />
              </EasyFormItem>
              <EasyFormItem>
                <div class="form-demo-actions">
                  <EasyButton @click="submitBasicForm">
                    提交
                  </EasyButton>
                  <EasyButton type="ghost" @click="resetBasicForm">
                    重置
                  </EasyButton>
                </div>
              </EasyFormItem>
            </EasyForm>
          </div>
        </div>
        <EasyDocCode
          code="<EasyForm ref=&quot;formRef&quot; v-model=&quot;form&quot; :rules=&quot;rules&quot; :label-width=&quot;100&quot;>
  <EasyFormItem label=&quot;姓名&quot; prop=&quot;name&quot;>
    <EasyInput v-model=&quot;form.name&quot; placeholder=&quot;请输入姓名&quot; />
  </EasyFormItem>
  <EasyFormItem>
    <EasyButton @click=&quot;submit&quot;>提交</EasyButton>
  </EasyFormItem>
</EasyForm>

const rules = {
  name: [required('请输入姓名'), minLength(2)],
  email: [required('请输入邮箱'), email()],
}
const valid = await formRef.value.validate()"
        />
      </div>
    </section>

    <!-- 日期和时间 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        日期 & 时间选择
      </h2>
      <p class="doc-section__desc">
        日期选择器支持 date / month / year 三种模式，时间选择器支持 showSeconds 控制是否显示秒。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <div class="form-demo-card">
            <EasyForm v-model="dateForm" :label-width="100">
              <EasyFormItem label="日期">
                <EasyDatePicker v-model="dateForm.date" placeholder="选择日期" />
              </EasyFormItem>
              <EasyFormItem label="月份">
                <EasyDatePicker v-model="dateForm.month" type="month" placeholder="选择月份" />
              </EasyFormItem>
              <EasyFormItem label="年份">
                <EasyDatePicker v-model="dateForm.year" type="year" placeholder="选择年份" />
              </EasyFormItem>
              <EasyFormItem label="时间">
                <EasyTimePicker v-model="dateForm.time" placeholder="选择时间" />
              </EasyFormItem>
              <EasyFormItem label="时分秒">
                <EasyTimePicker v-model="dateForm.timeWithSeconds" placeholder="精确到秒" show-seconds />
              </EasyFormItem>
            </EasyForm>
          </div>
        </div>
        <EasyDocCode
          code="<EasyDatePicker v-model=&quot;date&quot; placeholder=&quot;选择日期&quot; />
<EasyDatePicker v-model=&quot;month&quot; type=&quot;month&quot; placeholder=&quot;选择月份&quot; />
<EasyTimePicker v-model=&quot;time&quot; placeholder=&quot;选择时间&quot; />
<EasyTimePicker v-model=&quot;time&quot; show-seconds />"
        />
      </div>
    </section>

    <!-- 评分 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        评分 Rate
      </h2>
      <p class="doc-section__desc">
        支持半星、自定义颜色、文字提示、禁用等。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <div class="rate-demo-group">
            <div class="rate-demo-item">
              <span class="rate-demo-label">基础评分</span>
              <EasyRate v-model="rate1" />
            </div>
            <div class="rate-demo-item">
              <span class="rate-demo-label">半星</span>
              <EasyRate v-model="rate2" allow-half />
            </div>
            <div class="rate-demo-item">
              <span class="rate-demo-label">文字提示</span>
              <EasyRate v-model="rate3" show-text :texts="['很差', '一般', '不错', '很好', '极佳']" />
            </div>
            <div class="rate-demo-item">
              <span class="rate-demo-label">自定义颜色</span>
              <EasyRate v-model="rate4" color="#f56c6c" />
            </div>
            <div class="rate-demo-item">
              <span class="rate-demo-label">禁用</span>
              <EasyRate v-model="rate5" disabled />
            </div>
            <div class="rate-demo-item">
              <span class="rate-demo-label">大号</span>
              <EasyRate v-model="rate6" size="large" />
            </div>
          </div>
        </div>
        <EasyDocCode
          code="<EasyRate v-model=&quot;value&quot; />
<EasyRate v-model=&quot;value&quot; allow-half />
<EasyRate v-model=&quot;value&quot; show-text :texts=&quot;['很差','一般','不错']&quot; />
<EasyRate v-model=&quot;value&quot; color=&quot;#f56c6c&quot; />
<EasyRate v-model=&quot;value&quot; disabled />"
        />
      </div>
    </section>

    <!-- 输入框 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        输入框 Input
      </h2>
      <p class="doc-section__desc">
        支持前后缀、密码切换、清除、字数统计、不同尺寸等。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <div class="input-demo-group">
            <div class="input-demo-item">
              <span class="input-demo-label">默认</span>
              <EasyInput v-model="inputVal" placeholder="请输入" clearable />
            </div>
            <div class="input-demo-item">
              <span class="input-demo-label">密码</span>
              <EasyInput v-model="inputPwd" type="password" placeholder="请输入密码" />
            </div>
            <div class="input-demo-item">
              <span class="input-demo-label">前缀</span>
              <EasyInput v-model="inputVal2" placeholder="搜索" prefix-icon="el:Search" />
            </div>
            <div class="input-demo-item">
              <span class="input-demo-label">字数限制</span>
              <EasyInput v-model="inputVal3" placeholder="最多20字" :maxlength="20" show-word-limit />
            </div>
            <div class="input-demo-item">
              <span class="input-demo-label">复合输入</span>
              <EasyInput v-model="inputUrl" placeholder="请输入网址">
                <template #prepend>
                  https://
                </template>
                <template #append>
                  .com
                </template>
              </EasyInput>
            </div>
          </div>
        </div>
        <EasyDocCode
          code="<EasyInput v-model=&quot;value&quot; placeholder=&quot;请输入&quot; clearable />
<EasyInput v-model=&quot;value&quot; type=&quot;password&quot; />
<EasyInput v-model=&quot;value&quot; prefix-icon=&quot;el:Search&quot; />
<EasyInput v-model=&quot;value&quot; :maxlength=&quot;20&quot; show-word-limit />
<EasyInput v-model=&quot;value&quot;>
  <template #prepend>https://</template>
  <template #append>.com</template>
</EasyInput>"
        />
      </div>
    </section>

    <!-- 下拉选择 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        下拉选择 Select
      </h2>
      <p class="doc-section__desc">
        支持单选、多选、搜索过滤、清除等。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <div class="input-demo-group">
            <div class="input-demo-item">
              <span class="input-demo-label">单选</span>
              <EasySelect v-model="selectVal" :options="fruitOptions" placeholder="请选择" clearable />
            </div>
            <div class="input-demo-item">
              <span class="input-demo-label">可搜索</span>
              <EasySelect v-model="selectVal2" :options="fruitOptions" placeholder="搜索选择" filterable clearable />
            </div>
            <div class="input-demo-item">
              <span class="input-demo-label">多选</span>
              <EasySelect v-model="selectMulti" :options="fruitOptions" placeholder="可多选" multiple />
            </div>
          </div>
        </div>
        <EasyDocCode
          code="<EasySelect v-model=&quot;value&quot; :options=&quot;options&quot; clearable />
<EasySelect v-model=&quot;value&quot; :options=&quot;options&quot; filterable />
<EasySelect v-model=&quot;value&quot; :options=&quot;options&quot; multiple />

const options = [
  { label: '苹果', value: 'apple' },
  { label: '香蕉', value: 'banana' },
]"
        />
      </div>
    </section>

    <!-- 校验规则 API -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        校验规则 API
      </h2>
      <p class="doc-section__desc">
        内置常用校验规则，从 <code>easy-form/utils</code> 引入。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <div class="doc-table-wrapper">
            <table class="doc-table">
              <thead>
                <tr>
                  <th>规则</th>
                  <th>说明</th>
                  <th>示例</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><code>required(msg?)</code></td>
                  <td>必填</td>
                  <td><code>required('请输入姓名')</code></td>
                </tr>
                <tr>
                  <td><code>email(msg?)</code></td>
                  <td>邮箱格式</td>
                  <td><code>email('邮箱格式错误')</code></td>
                </tr>
                <tr>
                  <td><code>phone(msg?)</code></td>
                  <td>手机号</td>
                  <td><code>phone()</code></td>
                </tr>
                <tr>
                  <td><code>minLength(n, msg?)</code></td>
                  <td>最小长度</td>
                  <td><code>minLength(2, '至少2字')</code></td>
                </tr>
                <tr>
                  <td><code>maxLength(n, msg?)</code></td>
                  <td>最大长度</td>
                  <td><code>maxLength(20)</code></td>
                </tr>
                <tr>
                  <td><code>min(n, msg?)</code></td>
                  <td>最小值</td>
                  <td><code>min(0)</code></td>
                </tr>
                <tr>
                  <td><code>max(n, msg?)</code></td>
                  <td>最大值</td>
                  <td><code>max(100)</code></td>
                </tr>
                <tr>
                  <td><code>pattern(reg, msg?)</code></td>
                  <td>正则匹配</td>
                  <td><code>pattern(/^\d+$/)</code></td>
                </tr>
                <tr>
                  <td><code>url(msg?)</code></td>
                  <td>URL 格式</td>
                  <td><code>url()</code></td>
                </tr>
                <tr>
                  <td><code>custom(fn, trigger?)</code></td>
                  <td>自定义校验</td>
                  <td><code>custom(v => v > 0 || '需大于0')</code></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.doc-header {
  margin-bottom: 32px;
}
.doc-title {
  font-size: 28px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  margin: 0 0 8px;
}
.doc-desc {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  line-height: 1.6;
  margin: 0;
  code {
    padding: 2px 6px;
    background: var(--el-fill-color-light);
    border-radius: 4px;
    font-size: 13px;
    color: var(--el-color-primary);
    font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  }
}
.doc-section {
  margin-bottom: 40px;
}
.doc-section__title {
  font-size: 20px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px;
}
.doc-section__desc {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  line-height: 1.6;
  margin: 0 0 16px;
  code {
    padding: 2px 6px;
    background: var(--el-fill-color-light);
    border-radius: 4px;
    font-size: 13px;
    color: var(--el-color-primary);
    font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  }
}
.doc-preview {
  border: 1px solid #e2e4ed;
  border-radius: 12px;
  overflow: hidden;
}
.doc-preview__body {
  padding: 24px;
}
.doc-code {
  border-top: 1px solid #e2e4ed;
  padding: 16px;
  background: var(--el-fill-color-light);
  pre {
    margin: 0;
    overflow-x: auto;
  }
  code {
    font-size: 13px;
    line-height: 1.6;
    color: var(--el-text-color-regular);
    font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  }
}

.form-demo-card {
  max-width: 520px;
  background: var(--el-bg-color-overlay);
  border: 1px solid #e2e4ed;
  border-radius: 12px;
  padding: 24px;
}

.form-demo-actions {
  display: flex;
  gap: 10px;
}

/* ========== 演示组 ========== */
.rate-demo-group,
.input-demo-group {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.rate-demo-item,
.input-demo-item {
  display: flex;
  align-items: center;
  gap: 16px;
}

.rate-demo-label,
.input-demo-label {
  flex-shrink: 0;
  width: 80px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  text-align: right;
}

.input-demo-item {
  .easy-input,
  .easy-select {
    flex: 1;
    max-width: 320px;
  }
}

/* ========== 表格 ========== */
.doc-table-wrapper {
  overflow-x: auto;
}
.doc-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  th,
  td {
    padding: 10px 16px;
    text-align: left;
    border-bottom: 1px solid #e2e4ed;
  }
  th {
    background: var(--el-fill-color-lighter);
    font-weight: 600;
    color: var(--el-text-color-primary);
    white-space: nowrap;
  }
  td {
    color: var(--el-text-color-regular);
  }
  code {
    padding: 2px 6px;
    background: var(--el-fill-color-light);
    border-radius: 4px;
    font-size: 13px;
    color: var(--el-color-primary);
    font-family: 'Menlo', 'Monaco', 'Courier New', monospace;
  }
}
</style>
