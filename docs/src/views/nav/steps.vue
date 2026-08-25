<script setup lang="ts">
import { EasyIcon, EasyStep, EasySteps } from '@raopan/easy-ui'
import { computed, ref } from 'vue'

const basicActive = ref(1)
const basicSteps = [
  { title: '创建账号', desc: '填写基本信息' },
  { title: '身份验证', desc: '验证手机号' },
  { title: '设置密码', desc: '设置登录密码' },
  { title: '完成注册', desc: '' },
]

function basicPrev() {
  if (basicActive.value > 0)
    basicActive.value--
}

function basicNext() {
  if (basicActive.value < basicSteps.length - 1)
    basicActive.value++
}

// 颜色预设
const currentColorPreset = ref('purple')
const colorPresets = [
  {
    name: 'blue',
    label: '默认蓝',
    color: { primary: '#4f6ef7', success: '#10b981', error: '#ef4444', wait: '#d1d5db' },
  },
  {
    name: 'purple',
    label: '优雅紫',
    color: { primary: '#8b5cf6', success: '#10b981', error: '#f43f5e', wait: '#d1d5db' },
  },
  {
    name: 'orange',
    label: '活力橙',
    color: { primary: '#f97316', success: '#22c55e', error: '#ef4444', wait: '#d1d5db' },
  },
  {
    name: 'pink',
    label: '浪漫粉',
    color: { primary: '#ec4899', success: '#10b981', error: '#f43f5e', wait: '#d1d5db' },
  },
]

const currentColorConfig = computed(() => {
  return colorPresets.find(p => p.name === currentColorPreset.value)?.color
})
</script>

<template>
  <div class="steps-doc">
    <div class="doc-header">
      <h1 class="doc-title">
        步骤条 Steps
      </h1>
      <p class="doc-desc">
        引导用户按照流程完成任务的导航条，可根据实际场景设定步骤数，支持水平/垂直方向、多种状态展示。
      </p>
    </div>

    <!-- 基础用法 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        基础用法
      </h2>
      <p class="doc-section__desc">
        通过 <code>active</code> 属性设置当前激活步骤（从 0 开始）。点击按钮可切换步骤查看效果。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body doc-preview__body--column">
          <EasySteps :active="basicActive">
            <EasyStep v-for="(step, i) in basicSteps" :key="i" :index="i" :title="step.title" :description="step.desc" />
          </EasySteps>
          <div class="demo-actions">
            <button class="demo-btn" :disabled="basicActive <= 0" @click="basicPrev">
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="15 18 9 12 15 6" />
              </svg>
              上一步
            </button>
            <span class="step-indicator">步骤 {{ basicActive + 1 }} / {{ basicSteps.length }}</span>
            <button class="demo-btn demo-btn--primary" :disabled="basicActive >= basicSteps.length - 1"
              @click="basicNext">
              下一步
              <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
        <EasyDocCode
          code="<EasySteps :active=&quot;active&quot;>
  <EasyStep :index=&quot;0&quot; title=&quot;创建账号&quot; description=&quot;填写基本信息&quot; />
  <EasyStep :index=&quot;1&quot; title=&quot;身份验证&quot; description=&quot;验证手机号&quot; />
  <EasyStep :index=&quot;2&quot; title=&quot;设置密码&quot; description=&quot;设置登录密码&quot; />
  <EasyStep :index=&quot;3&quot; title=&quot;完成注册&quot; />
</EasySteps>"
        />
      </div>
    </section>

    <!-- 带描述的步骤条 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        带描述的步骤条
      </h2>
      <p class="doc-section__desc">
        每个步骤可以添加描述信息，用于展示更多详情。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body doc-preview__body--column">
          <EasySteps :active="1">
            <EasyStep :index="0" title="下单成功" description="2024-01-01 12:00:00" />
            <EasyStep :index="1" title="商家接单" description="预计30分钟送达" />
            <EasyStep :index="2" title="配送中" description="骑手正在赶来" />
            <EasyStep :index="3" title="已送达" description="订单已完成" />
          </EasySteps>
        </div>
        <EasyDocCode
          code="<EasySteps :active=&quot;1&quot;>
  <EasyStep :index=&quot;0&quot; title=&quot;下单成功&quot; description=&quot;2024-01-01 12:00:00&quot; />
  <EasyStep :index=&quot;1&quot; title=&quot;商家接单&quot; description=&quot;预计30分钟送达&quot; />
  <EasyStep :index=&quot;2&quot; title=&quot;配送中&quot; description=&quot;骑手正在赶来&quot; />
  <EasyStep :index=&quot;3&quot; title=&quot;已送达&quot; />
</EasySteps>"
        />
      </div>
    </section>

    <!-- 错误状态 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        错误状态
      </h2>
      <p class="doc-section__desc">
        通过 <code>process-status="error"</code> 设置当前步骤为错误状态，适用于表单验证失败等场景。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body doc-preview__body--column">
          <EasySteps :active="2" process-status="error">
            <EasyStep :index="0" title="提交申请" />
            <EasyStep :index="1" title="资料审核" />
            <EasyStep :index="2" title="实名认证" description="认证失败，请重新上传" />
            <EasyStep :index="3" title="审核通过" />
          </EasySteps>
        </div>
        <EasyDocCode
          code="<EasySteps :active=&quot;2&quot; process-status=&quot;error&quot;>
  <EasyStep :index=&quot;0&quot; title=&quot;提交申请&quot; />
  <EasyStep :index=&quot;1&quot; title=&quot;资料审核&quot; />
  <EasyStep :index=&quot;2&quot; title=&quot;实名认证&quot; description=&quot;认证失败，请重新上传&quot; />
  <EasyStep :index=&quot;3&quot; title=&quot;审核通过&quot; />
</EasySteps>"
        />
      </div>
    </section>

    <!-- 竖式步骤条 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        竖式步骤条
      </h2>
      <p class="doc-section__desc">
        通过 <code>direction="vertical"</code> 设置为竖直方向，适用于内容较多的场景。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasySteps :active="1" direction="vertical" style="height: 320px">
            <EasyStep :index="0" title="项目创建" description="项目已创建，等待开发" />
            <EasyStep :index="1" title="开发中" description="前端和后端功能开发中" />
            <EasyStep :index="2" title="测试阶段" description="功能测试和Bug修复" />
            <EasyStep :index="3" title="已上线" description="项目已成功部署上线" />
          </EasySteps>
        </div>
        <EasyDocCode
          code="<EasySteps :active=&quot;1&quot; direction=&quot;vertical&quot;>
  <EasyStep :index=&quot;0&quot; title=&quot;项目创建&quot; description=&quot;项目已创建&quot; />
  <EasyStep :index=&quot;1&quot; title=&quot;开发中&quot; description=&quot;功能开发中&quot; />
  <EasyStep :index=&quot;2&quot; title=&quot;测试阶段&quot; description=&quot;等待测试&quot; />
  <EasyStep :index=&quot;3&quot; title=&quot;已上线&quot; description=&quot;等待部署&quot; />
</EasySteps>"
        />
      </div>
    </section>

    <!-- 自定义图标 - 方式1：icon 属性 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        自定义图标（方式1：icon 属性）
      </h2>
      <p class="doc-section__desc">
        通过 <code>icon</code> 属性直接传入图标名称，支持 <code>el:</code> 前缀使用 Element Plus 图标，简洁方便。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body doc-preview__body--column">
          <EasySteps :active="1">
            <EasyStep :index="0" title="购物车" icon="el:ShoppingCart" />
            <EasyStep :index="1" title="填写地址" icon="el:MapLocation" />
            <EasyStep :index="2" title="支付" icon="el:CreditCard" />
            <EasyStep :index="3" title="完成" icon="el:CircleCheck" />
          </EasySteps>
        </div>
        <EasyDocCode
          code="<EasySteps :active=&quot;1&quot;>
  <EasyStep :index=&quot;0&quot; title=&quot;购物车&quot; icon=&quot;el:ShoppingCart&quot; />
  <EasyStep :index=&quot;1&quot; title=&quot;填写地址&quot; icon=&quot;el:MapLocation&quot; />
  <EasyStep :index=&quot;2&quot; title=&quot;支付&quot; icon=&quot;el:CreditCard&quot; />
  <EasyStep :index=&quot;3&quot; title=&quot;完成&quot; icon=&quot;el:CircleCheck&quot; />
</EasySteps>"
        />
      </div>
    </section>

    <!-- 自定义图标 - 方式2：icon 插槽 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        自定义图标（方式2：icon 插槽）
      </h2>
      <p class="doc-section__desc">
        通过 <code>icon</code> 插槽自定义图标内容，适合需要更复杂图标或自定义样式的场景。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body doc-preview__body--column">
          <EasySteps :active="1">
            <EasyStep :index="0" title="上传文件">
              <template #icon>
                <EasyIcon name="el:Upload" :size="16" color="currentColor" />
              </template>
            </EasyStep>
            <EasyStep :index="1" title="处理中">
              <template #icon>
                <EasyIcon name="el:Loading" :size="16" color="currentColor" />
              </template>
            </EasyStep>
            <EasyStep :index="2" title="完成">
              <template #icon>
                <EasyIcon name="el:CircleCheckFilled" :size="16" color="currentColor" />
              </template>
            </EasyStep>
          </EasySteps>
        </div>
        <EasyDocCode
          code="<EasySteps :active=&quot;1&quot;>
  <EasyStep :index=&quot;0&quot; title=&quot;上传文件&quot;>
    <template #icon>
      <EasyIcon name=&quot;el:Upload&quot; :size=&quot;16&quot; color=&quot;currentColor&quot; />
    </template>
  </EasyStep>
  <EasyStep :index=&quot;1&quot; title=&quot;处理中&quot;>
    <template #icon>
      <EasyIcon name=&quot;el:Loading&quot; :size=&quot;16&quot; color=&quot;currentColor&quot; />
    </template>
  </EasyStep>
</EasySteps>"
        />
      </div>
    </section>

    <!-- 自定义颜色 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        自定义颜色
      </h2>
      <p class="doc-section__desc">
        通过 <code>color</code> 属性自定义步骤条的主题色，支持 primary、success、error、wait 四种状态颜色。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body doc-preview__body--column">
          <div class="color-tabs">
            <button v-for="preset in colorPresets" :key="preset.name" type="button" class="color-tab"
              :class="{ 'is-active': currentColorPreset === preset.name }" @click="currentColorPreset = preset.name">
              <span class="color-dot" :style="{ background: preset.color.primary }" />
              {{ preset.label }}
            </button>
          </div>
          <EasySteps :active="1" :color="currentColorConfig">
            <EasyStep :index="0" title="提交申请" description="申请已提交" />
            <EasyStep :index="1" title="审核中" description="正在审核" />
            <EasyStep :index="2" title="处理完成" />
          </EasySteps>
        </div>
        <EasyDocCode
          code="// 自定义主题色
<EasySteps :active=&quot;1&quot; :color=&quot;{ primary: '#8b5cf6', success: '#10b981', error: '#f43f5e' }&quot;>
  <EasyStep :index=&quot;0&quot; title=&quot;提交申请&quot; />
  <EasyStep :index=&quot;1&quot; title=&quot;审核中&quot; />
  <EasyStep :index=&quot;2&quot; title=&quot;处理完成&quot; />
</EasySteps>"
        />
      </div>
    </section>

    <!-- API 文档 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        API
      </h2>

      <h3 class="doc-subtitle">
        Steps Attributes
      </h3>
      <div class="doc-table">
        <table>
          <thead>
            <tr>
              <th>参数</th>
              <th>说明</th>
              <th>类型</th>
              <th>可选值</th>
              <th>默认值</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>active</td>
              <td>当前激活步骤（从 0 开始）</td>
              <td>number</td>
              <td>—</td>
              <td>0</td>
            </tr>
            <tr>
              <td>direction</td>
              <td>步骤条方向</td>
              <td>string</td>
              <td>horizontal / vertical</td>
              <td>horizontal</td>
            </tr>
            <tr>
              <td>process-status</td>
              <td>当前步骤的状态</td>
              <td>string</td>
              <td>process / error</td>
              <td>process</td>
            </tr>
            <tr>
              <td>finish-status</td>
              <td>已完成步骤的状态</td>
              <td>string</td>
              <td>success / finish</td>
              <td>success</td>
            </tr>
            <tr>
              <td>align-center</td>
              <td>是否居中对齐</td>
              <td>boolean</td>
              <td>—</td>
              <td>false</td>
            </tr>
            <tr>
              <td>color</td>
              <td>自定义状态颜色</td>
              <td>object</td>
              <td>{ primary, success, error, wait }</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 class="doc-subtitle">
        Step Attributes
      </h3>
      <div class="doc-table">
        <table>
          <thead>
            <tr>
              <th>参数</th>
              <th>说明</th>
              <th>类型</th>
              <th>可选值</th>
              <th>默认值</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>title</td>
              <td>步骤标题</td>
              <td>string</td>
              <td>—</td>
              <td>—</td>
            </tr>
            <tr>
              <td>description</td>
              <td>步骤描述</td>
              <td>string</td>
              <td>—</td>
              <td>—</td>
            </tr>
            <tr>
              <td>index</td>
              <td>步骤索引（从 0 开始）</td>
              <td>number</td>
              <td>—</td>
              <td>—</td>
            </tr>
            <tr>
              <td>status</td>
              <td>手动指定步骤状态（覆盖自动计算）</td>
              <td>string</td>
              <td>wait / process / success / error / finish</td>
              <td>—</td>
            </tr>
            <tr>
              <td>icon</td>
              <td>自定义图标名称（支持 el: 前缀）</td>
              <td>string</td>
              <td>—</td>
              <td>—</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 class="doc-subtitle">
        Step Slots
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
              <td>icon</td>
              <td>自定义步骤图标</td>
            </tr>
            <tr>
              <td>title</td>
              <td>自定义步骤标题内容</td>
            </tr>
            <tr>
              <td>description</td>
              <td>自定义步骤描述内容</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.steps-doc {
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
.doc-preview__body--column {
  flex-direction: column;
  align-items: stretch;
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

// Demo actions
.demo-actions {
  margin-top: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding-top: 24px;
  border-top: 1px solid var(--el-border-color-lighter);
}

.step-indicator {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  font-weight: 500;
  min-width: 100px;
  text-align: center;
}

.demo-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: var(--el-bg-color-overlay);
  color: var(--el-text-color-regular);
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    border-color: #4f6ef7;
    color: var(--el-color-primary);
    background: var(--el-fill-color-light);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

.demo-btn--primary {
  background: var(--el-color-primary);
  border-color: #4f6ef7;
  color: #fff;

  &:hover:not(:disabled) {
    background: #3d5ce5;
    border-color: #3d5ce5;
    color: #fff;
  }
}

.btn-icon {
  width: 16px;
  height: 16px;
}

// Custom icon in demo
.custom-icon {
  width: 16px;
  height: 16px;
}

// Color tabs
.color-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  flex-wrap: wrap;
}

.color-tab {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 20px;
  background: var(--el-bg-color-overlay);
  color: var(--el-text-color-regular);
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #d1d5db;
    background: var(--el-fill-color-light);
  }

  &.is-active {
    border-color: currentColor;
    background: var(--el-fill-color-light);
  }
}

.color-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
</style>
