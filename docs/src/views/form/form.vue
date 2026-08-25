<script setup lang="ts">
import {
  custom,
  easy,
  EasyButton,
  EasyCascader,
  EasyDatePicker,
  EasyDateTimePicker,
  EasyForm,
  EasyFormItem,
  EasyInput,
  EasyRadio,
  EasyRadioGroup,
  EasyRate,
  EasySelect,
  EasyTimePicker,
  email,
  max,
  min,
  minLength,
  required,
} from '@raopan/easy-ui'
import { reactive, ref } from 'vue'

// ========== 完整表单 ==========
const fullFormRef = ref()
const fullForm = reactive({
  username: '',
  email: '',
  gender: '' as string | number | boolean,
  city: '' as string | number | boolean,
  department: [] as (string | number)[],
  birthday: '',
  interviewTime: '',
  onboardTime: '',
  satisfaction: 0,
  remark: '',
})
const fullRules = {
  username: [required('请输入用户名'), minLength(2, '至少2个字符')],
  email: [required('请输入邮箱'), email()],
}

const cityOptions = [
  { label: '北京', value: 'beijing' },
  { label: '上海', value: 'shanghai' },
  { label: '广州', value: 'guangzhou' },
  { label: '深圳', value: 'shenzhen' },
  { label: '杭州', value: 'hangzhou' },
  { label: '成都', value: 'chengdu' },
]

const departmentOptions = [
  {
    label: '技术部',
    value: 'tech',
    children: [
      { label: '前端组', value: 'frontend' },
      { label: '后端组', value: 'backend' },
      { label: '测试组', value: 'qa' },
    ],
  },
  {
    label: '产品部',
    value: 'product',
    children: [
      { label: '产品设计', value: 'design' },
      { label: '用户研究', value: 'research' },
    ],
  },
  {
    label: '运营部',
    value: 'operation',
    children: [
      { label: '内容运营', value: 'content' },
      { label: '用户运营', value: 'user' },
    ],
  },
]

async function submitFull() {
  const valid = await fullFormRef.value?.validate()
  if (valid)
    easy.$msg.success('提交成功')
}

function resetFull() {
  fullFormRef.value?.resetFields()
}

// ========== 行内表单 ==========
const inlineForm = reactive({
  keyword: '',
  category: '' as string | number,
  date: '',
})
const categoryOptions = [
  { label: '技术', value: 'tech' },
  { label: '设计', value: 'design' },
  { label: '产品', value: 'product' },
]

// ========== 表单尺寸 ==========
const sizeForm = reactive({ val: '' })

// ========== 自定义校验 ==========
const customFormRef = ref()
const customForm = reactive({ password: '', confirmPassword: '', age: '' })
const customRules = {
  password: [required('请输入密码'), minLength(6, '至少6位')],
  confirmPassword: [required('请确认密码'), custom((v: string) => (v !== customForm.password ? '两次密码不一致' : ''))],
  age: [required('请输入年龄'), min(18, '不能小于18'), max(60, '不能大于60')],
}

async function submitCustom() {
  const valid = await customFormRef.value?.validate()
  if (valid)
    easy.$msg.success('自定义校验通过')
}

// ========== 简化规则示例 ==========
const simpleFormRef = ref()
const simpleForm = reactive({
  username: '',
  email: '',
  phone: '',
  age: '',
  website: '',
})
const simpleRules = {
  username: ['required', 'min:2'],
  email: ['required', 'email'],
  phone: ['phone'],
  age: ['minVal:18', 'maxVal:60'],
  website: ['url'],
}

async function submitSimple() {
  const valid = await simpleFormRef.value?.validate()
  if (valid)
    easy.$msg.success('简化规则校验通过')
}

function resetSimple() {
  simpleFormRef.value?.resetFields()
}

// ========== 最简单方式示例 ==========
const simplestFormRef = ref()
const simplestForm = reactive({
  username: '',
  email: '',
  phone: '',
  remark: '',
})

async function submitSimplest() {
  const valid = await simplestFormRef.value?.validate()
  if (valid)
    easy.$msg.success('校验通过')
}

function resetSimplest() {
  simplestFormRef.value?.resetFields()
}
</script>

<template>
  <div class="component-doc">
    <header class="doc-header">
      <h1 class="doc-title">
        表单 Form
      </h1>
      <p class="doc-desc">
        表单容器组件，配合 <code>EasyFormItem</code> 实现表单布局和字段校验。
        支持行内模式、三种尺寸，内置常用校验规则，可集成所有表单组件。
      </p>
    </header>

    <!-- 完整表单示例 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        完整表单
      </h2>
      <p class="doc-section__desc">
        在一个表单中集成
        <code>EasyInput</code>、<code>EasySelect</code>、<code>EasyRadioGroup</code>、<code>EasyRate</code>、<code>EasyDatePicker</code>、<code>EasyTimePicker</code>、<code>EasyDateTimePicker</code>、<code>EasyCascader</code>
        等全部表单组件，并展示校验功能。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <div style="width: 100%; max-width: 580px">
            <EasyForm ref="fullFormRef" :model="fullForm" :rules="fullRules" label-width="120px">
              <EasyFormItem label="用户名" prop="username">
                <EasyInput v-model="fullForm.username" placeholder="请输入用户名" />
              </EasyFormItem>
              <EasyFormItem label="邮箱" prop="email">
                <EasyInput v-model="fullForm.email" placeholder="请输入邮箱" />
              </EasyFormItem>
              <EasyFormItem label="性别">
                <EasyRadioGroup v-model="fullForm.gender">
                  <EasyRadio label="male">
                    男
                  </EasyRadio>
                  <EasyRadio label="female">
                    女
                  </EasyRadio>
                  <EasyRadio label="other">
                    其他
                  </EasyRadio>
                </EasyRadioGroup>
              </EasyFormItem>
              <EasyFormItem label="城市">
                <EasySelect v-model="fullForm.city" :options="cityOptions" placeholder="请选择城市" clearable />
              </EasyFormItem>
              <EasyFormItem label="所属部门">
                <EasyCascader v-model="fullForm.department" :options="departmentOptions" placeholder="请选择部门" clearable />
              </EasyFormItem>
              <EasyFormItem label="出生日期">
                <EasyDatePicker v-model="fullForm.birthday" placeholder="请选择日期" />
              </EasyFormItem>
              <EasyFormItem label="面试时间">
                <EasyTimePicker v-model="fullForm.interviewTime" placeholder="请选择时间" />
              </EasyFormItem>
              <EasyFormItem label="入职日期">
                <EasyDateTimePicker v-model="fullForm.onboardTime" placeholder="请选择日期时间" show-seconds />
              </EasyFormItem>
              <EasyFormItem label="满意度">
                <EasyRate v-model="fullForm.satisfaction" show-text />
              </EasyFormItem>
              <EasyFormItem label="备注">
                <EasyInput v-model="fullForm.remark" type="textarea" placeholder="请输入备注信息" :maxlength="200"
                  show-word-limit />
              </EasyFormItem>
              <EasyFormItem>
                <div style="display: flex; gap: 8px">
                  <EasyButton type="primary" @click="submitFull">
                    提交
                  </EasyButton>
                  <EasyButton @click="resetFull">
                    重置
                  </EasyButton>
                </div>
              </EasyFormItem>
            </EasyForm>
          </div>
        </div>
      </div>
      <EasyDocCode
        code="<EasyForm ref=&quot;formRef&quot; :model=&quot;form&quot; :rules=&quot;rules&quot; label-width=&quot;90px&quot;>
  <EasyFormItem label=&quot;用户名&quot; prop=&quot;username&quot;>
    <EasyInput v-model=&quot;form.username&quot; placeholder=&quot;请输入用户名&quot; />
  </EasyFormItem>
  <EasyFormItem label=&quot;性别&quot;>
    <EasyRadioGroup v-model=&quot;form.gender&quot;>
      <EasyRadio label=&quot;male&quot;>男</EasyRadio>
      <EasyRadio label=&quot;female&quot;>女</EasyRadio>
    </EasyRadioGroup>
  </EasyFormItem>
  <EasyFormItem label=&quot;城市&quot;>
    <EasySelect v-model=&quot;form.city&quot; :options=&quot;cityOptions&quot; clearable />
  </EasyFormItem>
  <EasyFormItem label=&quot;所属部门&quot;>
    <EasyCascader v-model=&quot;form.department&quot; :options=&quot;deptOptions&quot; />
  </EasyFormItem>
  <EasyFormItem label=&quot;出生日期&quot;>
    <EasyDatePicker v-model=&quot;form.birthday&quot; />
  </EasyFormItem>
  <EasyFormItem label=&quot;面试时间&quot;>
    <EasyTimePicker v-model=&quot;form.interviewTime&quot; />
  </EasyFormItem>
  <EasyFormItem label=&quot;入职日期&quot;>
    <EasyDateTimePicker v-model=&quot;form.onboardTime&quot; show-seconds />
  </EasyFormItem>
  <EasyFormItem label=&quot;满意度&quot;>
    <EasyRate v-model=&quot;form.satisfaction&quot; show-text />
  </EasyFormItem>
  <EasyFormItem label=&quot;备注&quot;>
    <EasyInput v-model=&quot;form.remark&quot; type=&quot;textarea&quot; :maxlength=&quot;200&quot; show-word-limit />
  </EasyFormItem>
  <EasyFormItem>
    <EasyButton type=&quot;primary&quot; @click=&quot;submit&quot;>提交</EasyButton>
    <EasyButton @click=&quot;reset&quot;>重置</EasyButton>
  </EasyFormItem>
</EasyForm>"
      />
    </section>

    <!-- 行内表单 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        行内表单
      </h2>
      <p class="doc-section__desc">
        设置 <code>inline</code> 属性让表单项水平排列，常用于搜索筛选场景。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyForm :model="inlineForm" inline>
            <EasyFormItem label="关键词">
              <EasyInput v-model="inlineForm.keyword" placeholder="关键词" prefix-icon="el:Search" />
            </EasyFormItem>
            <EasyFormItem label="分类">
              <EasySelect v-model="inlineForm.category" :options="categoryOptions" placeholder="分类" />
            </EasyFormItem>
            <EasyFormItem label="日期" :span="24">
              <EasyDatePicker v-model="inlineForm.date" placeholder="日期" />
            </EasyFormItem>
            <EasyFormItem>
              <EasyButton type="primary">
                搜索
              </EasyButton>
            </EasyFormItem>
          </EasyForm>
        </div>
      </div>
      <EasyDocCode
        code="<EasyForm :model=&quot;form&quot; inline>
  <EasyFormItem label=&quot;关键词&quot;>
    <EasyInput v-model=&quot;form.keyword&quot; placeholder=&quot;关键词&quot; />
  </EasyFormItem>
  <EasyFormItem label=&quot;分类&quot;>
    <EasySelect v-model=&quot;form.category&quot; :options=&quot;options&quot; />
  </EasyFormItem>
  <EasyFormItem label=&quot;日期&quot; :span=&quot;24&quot; >
    <EasyDatePicker v-model=&quot;form.date&quot; />
  </EasyFormItem>
  <EasyFormItem>
    <EasyButton type=&quot;primary&quot;>搜索</EasyButton>
  </EasyFormItem>
</EasyForm>"
      />
    </section>

    <!-- 表单尺寸 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        表单尺寸
      </h2>
      <p class="doc-section__desc">
        通过 <code>size</code> 属性统一控制表单内所有组件的尺寸。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body" style="flex-direction: column; align-items: flex-start; gap: 16px">
          <div style="width: 400px">
            <EasyForm :model="sizeForm" size="large" label-width="60px">
              <EasyFormItem label="大尺寸">
                <EasyInput v-model="sizeForm.val" placeholder="large" />
              </EasyFormItem>
            </EasyForm>
          </div>
          <div style="width: 400px">
            <EasyForm :model="sizeForm" label-width="60px">
              <EasyFormItem label="默认">
                <EasyInput v-model="sizeForm.val" placeholder="default" />
              </EasyFormItem>
            </EasyForm>
          </div>
          <div style="width: 400px">
            <EasyForm :model="sizeForm" size="small" label-width="60px">
              <EasyFormItem label="小尺寸">
                <EasyInput v-model="sizeForm.val" placeholder="small" />
              </EasyFormItem>
            </EasyForm>
          </div>
        </div>
      </div>
      <EasyDocCode
        code="<EasyForm :model=&quot;form&quot; size=&quot;large&quot; label-width=&quot;60px&quot;>...</EasyForm>
<EasyForm :model=&quot;form&quot; label-width=&quot;60px&quot;>...</EasyForm>
<EasyForm :model=&quot;form&quot; size=&quot;small&quot; label-width=&quot;60px&quot;>...</EasyForm>"
      />
    </section>

    <!-- 最简单方式：required 属性 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        最简单方式：required 属性
      </h2>
      <p class="doc-section__desc">
        对于简单的必填校验，直接在 <code>EasyFormItem</code> 上设置 <code>required</code> 属性即可，无需编写 rules。<br>
        默认提示文字为"请填写{label}"，也可以通过 <code>msg</code> 自定义。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <div style="width: 100%; max-width: 500px">
            <EasyForm ref="simplestFormRef" :model="simplestForm" label-width="100px">
              <EasyFormItem label="用户名" prop="username" required>
                <EasyInput v-model="simplestForm.username" placeholder="默认提示：请填写用户名" />
              </EasyFormItem>
              <EasyFormItem label="邮箱" prop="email" required msg="邮箱不能为空">
                <EasyInput v-model="simplestForm.email" placeholder="自定义提示：邮箱不能为空" />
              </EasyFormItem>
              <EasyFormItem label="手机号" prop="phone">
                <EasyInput v-model="simplestForm.phone" placeholder="选填" />
              </EasyFormItem>
              <EasyFormItem label="备注" prop="remark">
                <EasyInput v-model="simplestForm.remark" type="textarea" placeholder="选填" />
              </EasyFormItem>
              <EasyFormItem>
                <EasyButton type="primary" @click="submitSimplest">
                  提交
                </EasyButton>
                <EasyButton @click="resetSimplest">
                  重置
                </EasyButton>
              </EasyFormItem>
            </EasyForm>
          </div>
        </div>
      </div>
      <EasyDocCode
        code="<EasyForm ref=&quot;formRef&quot; :model=&quot;form&quot;>
  <!-- 默认提示：请填写{label} -->
  <EasyFormItem label=&quot;用户名&quot; prop=&quot;username&quot; required>
    <EasyInput v-model=&quot;form.username&quot; />
  </EasyFormItem>

  <!-- 自定义提示文字 -->
  <EasyFormItem label=&quot;邮箱&quot; prop=&quot;email&quot; required msg=&quot;邮箱不能为空&quot;>
    <EasyInput v-model=&quot;form.email&quot; />
  </EasyFormItem>

  <!-- 选填字段，不设置 required -->
  <EasyFormItem label=&quot;备注&quot; prop=&quot;remark&quot;>
    <EasyInput v-model=&quot;form.remark&quot; type=&quot;textarea&quot; />
  </EasyFormItem>

  <EasyFormItem>
    <EasyButton type=&quot;primary&quot; @click=&quot;handleSubmit&quot;>提交</EasyButton>
  </EasyFormItem>
</EasyForm>"
      />
    </section>

    <!-- 自定义校验 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        自定义校验
      </h2>
      <p class="doc-section__desc">
        使用 <code>custom()</code> 规则实现任意自定义校验逻辑。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <div style="width: 100%; max-width: 500px">
            <EasyForm ref="customFormRef" :model="customForm" :rules="customRules" label-width="80px">
              <EasyFormItem label="密码" prop="password">
                <EasyInput v-model="customForm.password" type="password" placeholder="请输入密码" />
              </EasyFormItem>
              <EasyFormItem label="确认密码" prop="confirmPassword">
                <EasyInput v-model="customForm.confirmPassword" type="password" placeholder="请再次输入" />
              </EasyFormItem>
              <EasyFormItem label="年龄" prop="age">
                <EasyInput v-model="customForm.age" placeholder="请输入年龄（18-60）" />
              </EasyFormItem>
              <EasyFormItem>
                <EasyButton type="primary" @click="submitCustom">
                  校验
                </EasyButton>
              </EasyFormItem>
            </EasyForm>
          </div>
        </div>
      </div>
      <EasyDocCode
        code="import {  required, custom, min, max  } from '@raopan/easy-ui'

const rules = {
  password: [required('请输入密码')],
  confirmPassword: [
    required('请确认密码'),
    custom((value) => {
      if (value !== form.password) return '两次密码不一致'
    }),
  ],
  age: [required('请输入年龄'), min(18), max(60)],
}"
      />
    </section>

    <!-- 简化规则示例 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        简化规则
      </h2>
      <p class="doc-section__desc">
        支持使用字符串形式的简化规则，代码更简洁，同时兼容函数式规则。两种方式可以混合使用。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <div style="width: 100%; max-width: 500px">
            <EasyForm ref="simpleFormRef" :model="simpleForm" :rules="simpleRules" label-width="80px">
              <EasyFormItem label="用户名" prop="username">
                <EasyInput v-model="simpleForm.username" placeholder="必填，至少2个字符" />
              </EasyFormItem>
              <EasyFormItem label="邮箱" prop="email">
                <EasyInput v-model="simpleForm.email" placeholder="必填，邮箱格式" />
              </EasyFormItem>
              <EasyFormItem label="手机号" prop="phone">
                <EasyInput v-model="simpleForm.phone" placeholder="手机号格式" />
              </EasyFormItem>
              <EasyFormItem label="年龄" prop="age">
                <EasyInput v-model="simpleForm.age" placeholder="18-60岁" />
              </EasyFormItem>
              <EasyFormItem label="个人网站" prop="website">
                <EasyInput v-model="simpleForm.website" placeholder="URL 格式" />
              </EasyFormItem>
              <EasyFormItem>
                <EasyButton type="primary" @click="submitSimple">
                  提交
                </EasyButton>
                <EasyButton @click="resetSimple">
                  重置
                </EasyButton>
              </EasyFormItem>
            </EasyForm>
          </div>
        </div>
      </div>
      <EasyDocCode
        code="// 简化规则写法（字符串）
const rules = {
  username: ['required', 'min:2'],
  email: ['required', 'email'],
  phone: ['phone'],
  age: ['minVal:18', 'maxVal:60'],
  website: ['url'],
}

// 混合使用（字符串 + 函数）
const mixedRules = {
  username: ['required', 'min:2'],
  email: ['required', email()],
  password: ['required', 'min:6', custom((v) => {
    return /[A-Z]/.test(v) || '必须包含大写字母'
  })],
}"
      />
    </section>

    <!-- API -->
    <section class="doc-section">
      <h3 class="doc-subtitle">
        API
      </h3>

      <h3 class="doc-subtitle">
        EasyForm Props
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
              <td><code>model</code></td>
              <td>表单数据对象</td>
              <td><code>Record&lt;string, unknown&gt;</code></td>
              <td>必填</td>
            </tr>
            <tr>
              <td><code>rules</code></td>
              <td>校验规则</td>
              <td><code>Record&lt;string, FormRule[]&gt;</code></td>
              <td>—</td>
            </tr>
            <tr>
              <td><code>labelWidth</code></td>
              <td>标签宽度</td>
              <td><code>string</code></td>
              <td><code>'100px'</code></td>
            </tr>
            <tr>
              <td><code>labelPosition</code></td>
              <td>标签位置</td>
              <td><code>'left' | 'top' | 'right'</code></td>
              <td><code>'right'</code></td>
            </tr>
            <tr>
              <td><code>inline</code></td>
              <td>行内模式</td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
            </tr>
            <tr>
              <td><code>size</code></td>
              <td>表单尺寸（子组件继承）</td>
              <td><code>'large' | 'default' | 'small'</code></td>
              <td><code>'default'</code></td>
            </tr>
            <tr>
              <td><code>disabled</code></td>
              <td>是否禁用所有子组件</td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
            </tr>
            <tr>
              <td><code>span</code></td>
              <td>栅格占位（共 24 栏），所有 FormItem 的默认值</td>
              <td><code>number</code></td>
              <td>inline 时 <code>6</code>，否则 —</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 class="doc-subtitle">
        EasyForm Methods
      </h3>
      <div class="doc-table">
        <table>
          <thead>
            <tr>
              <th>方法名</th>
              <th>说明</th>
              <th>参数</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>validate()</code></td>
              <td>校验全部字段</td>
              <td><code>() =&gt; Promise&lt;boolean&gt;</code></td>
            </tr>
            <tr>
              <td><code>validateField(props)</code></td>
              <td>校验指定字段</td>
              <td><code>(props: string | string[]) =&gt; Promise&lt;boolean&gt;</code></td>
            </tr>
            <tr>
              <td><code>resetFields()</code></td>
              <td>重置所有字段值和校验状态</td>
              <td>—</td>
            </tr>
            <tr>
              <td><code>clearValidate()</code></td>
              <td>清除所有校验信息</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 class="doc-subtitle">
        EasyFormItem Props
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
              <td><code>label</code></td>
              <td>标签文本</td>
              <td><code>string</code></td>
              <td>—</td>
            </tr>
            <tr>
              <td><code>prop</code></td>
              <td>对应 model 中的字段名（用于校验）</td>
              <td><code>string</code></td>
              <td>—</td>
            </tr>
            <tr>
              <td><code>rules</code></td>
              <td>单个字段的校验规则</td>
              <td><code>Rule[]</code></td>
              <td>—</td>
            </tr>
            <tr>
              <td><code>required</code></td>
              <td>是否必填，无需写规则</td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
            </tr>
            <tr>
              <td><code>msg</code></td>
              <td>必填错误提示，默认"请填写{label}"</td>
              <td><code>string</code></td>
              <td>—</td>
            </tr>
            <tr>
              <td><code>labelWidth</code></td>
              <td>覆盖表单的标签宽度</td>
              <td><code>string</code></td>
              <td>—</td>
            </tr>
            <tr>
              <td><code>span</code></td>
              <td>栅格占位（共 24 栏），优先级高于 Form 的 span</td>
              <td><code>number</code></td>
              <td>跟随 Form</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 class="doc-subtitle">
        EasyFormItem Slots
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
              <td>表单控件内容</td>
            </tr>
            <tr>
              <td><code>label</code></td>
              <td>自定义标签内容</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 class="doc-subtitle">
        校验规则 (utils.ts)
      </h3>
      <div class="doc-table">
        <table>
          <thead>
            <tr>
              <th>规则名</th>
              <th>说明</th>
              <th>函数式用法</th>
              <th>简化写法</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>required</code></td>
              <td>必填</td>
              <td><code>required('请输入')</code></td>
              <td><code>'required'</code></td>
            </tr>
            <tr>
              <td><code>email</code></td>
              <td>邮箱格式</td>
              <td><code>email('邮箱格式不正确')</code></td>
              <td><code>'email'</code></td>
            </tr>
            <tr>
              <td><code>phone</code></td>
              <td>手机号格式</td>
              <td><code>phone('手机号格式不正确')</code></td>
              <td><code>'phone'</code></td>
            </tr>
            <tr>
              <td><code>minLength</code></td>
              <td>最小长度</td>
              <td><code>minLength(6, '至少6个字符')</code></td>
              <td><code>'min:6'</code></td>
            </tr>
            <tr>
              <td><code>maxLength</code></td>
              <td>最大长度</td>
              <td><code>maxLength(20, '最多20个字符')</code></td>
              <td><code>'max:20'</code></td>
            </tr>
            <tr>
              <td><code>min</code></td>
              <td>最小值</td>
              <td><code>min(0, '不能小于0')</code></td>
              <td><code>'minVal:0'</code></td>
            </tr>
            <tr>
              <td><code>max</code></td>
              <td>最大值</td>
              <td><code>max(100, '不能大于100')</code></td>
              <td><code>'maxVal:100'</code></td>
            </tr>
            <tr>
              <td><code>pattern</code></td>
              <td>正则匹配</td>
              <td><code>pattern(/^[a-z]+$/, '只能小写字母')</code></td>
              <td><code>'pattern:/^[a-z]+$/'</code></td>
            </tr>
            <tr>
              <td><code>url</code></td>
              <td>URL 格式</td>
              <td><code>url('请输入有效URL')</code></td>
              <td><code>'url'</code></td>
            </tr>
            <tr>
              <td><code>custom</code></td>
              <td>自定义校验</td>
              <td><code>custom((v) => v ? '' : '错误信息')</code></td>
              <td>不支持</td>
            </tr>
          </tbody>
        </table>
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
</style>
