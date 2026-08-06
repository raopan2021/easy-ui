<template>
  <div class="drawer-doc">
    <!-- 页面标题 -->
    <div class="doc-header">
      <h1 class="doc-title">Drawer 抽屉</h1>
      <p class="doc-desc">
        从侧边滑入的面板组件，支持左、右、上、下四个方向弹出，常用于详情查看、表单填写、配置面板等场景。
      </p>
    </div>

    <!-- 基础用法 -->
    <section class="doc-section">
      <h2 class="doc-section__title">基础用法</h2>
      <p class="doc-section__desc">
        通过 <code>v-model</code> 控制抽屉显示与隐藏，<code>title</code> 设置标题。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <XlyButton @click="basicVisible = true">打开抽屉</XlyButton>
          <XlyDrawer v-model="basicVisible" title="基础抽屉">
            <p>这是一个基础抽屉，支持从右侧滑入。点击遮罩或关闭按钮可关闭。</p>
          </XlyDrawer>
        </div>
        <XlyDocCode :code='`<XlyButton @click="visible = true">打开抽屉</XlyButton>
<XlyDrawer v-model="visible" title="基础抽屉">
  <p>这是一个基础抽屉。</p>
</XlyDrawer>`' />
      </div>
    </section>

    <!-- 不同方向 -->
    <section class="doc-section">
      <h2 class="doc-section__title">不同方向</h2>
      <p class="doc-section__desc">
        通过 <code>direction</code> 属性设置抽屉弹出方向，支持 <code>left</code>（左侧）、
        <code>right</code>（右侧，默认）、<code>top</code>（顶部）、<code>bottom</code>（底部）四种方向。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <XlyButton @click="leftVisible = true">左侧抽屉</XlyButton>
          <XlyButton @click="rightVisible = true">右侧抽屉</XlyButton>
          <XlyButton @click="topVisible = true">顶部抽屉</XlyButton>
          <XlyButton @click="bottomVisible = true">底部抽屉</XlyButton>
        </div>
        <XlyDocCode :code='`<XlyDrawer v-model="visible" title="左侧" direction="left">...</XlyDrawer>
<XlyDrawer v-model="visible" title="右侧" direction="right">...</XlyDrawer>
<XlyDrawer v-model="visible" title="顶部" direction="top">...</XlyDrawer>
<XlyDrawer v-model="visible" title="底部" direction="bottom">...</XlyDrawer>`' />
      </div>

      <XlyDrawer v-model="leftVisible" title="左侧抽屉" direction="left">
        <p>从左侧滑入的抽屉，适用于导航菜单或列表详情。</p>
      </XlyDrawer>
      <XlyDrawer v-model="rightVisible" title="右侧抽屉" direction="right">
        <p>从右侧滑入的抽屉（默认），适用于详情查看或表单填写。</p>
      </XlyDrawer>
      <XlyDrawer v-model="topVisible" title="顶部抽屉" direction="top">
        <p>从顶部滑入的抽屉，适用于筛选面板或工具栏。</p>
      </XlyDrawer>
      <XlyDrawer v-model="bottomVisible" title="底部抽屉" direction="bottom">
        <p>从底部滑入的抽屉，适用于操作确认或快捷操作。</p>
      </XlyDrawer>
    </section>

    <!-- 自定义尺寸 -->
    <section class="doc-section">
      <h2 class="doc-section__title">自定义尺寸</h2>
      <p class="doc-section__desc">
        通过 <code>size</code> 属性设置抽屉宽度或高度。接受数字（像素）或字符串（百分比/任意CSS单位）。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <XlyButton @click="sizeSmall = true">小型 (300px)</XlyButton>
          <XlyButton @click="sizeMedium = true">中型 (50%)</XlyButton>
          <XlyButton @click="sizeLarge = true">大型 (80%)</XlyButton>
        </div>
        <XlyDocCode :code='`<!-- 固定宽度 -->
<XlyDrawer v-model="visible" title="小型" :size="300">...</XlyDrawer>
<!-- 百分比宽度 -->
<XlyDrawer v-model="visible" title="中型" size="50%">...</XlyDrawer>
<!-- 大尺寸 -->
<XlyDrawer v-model="visible" title="大型" size="80%">...</XlyDrawer>`' />
      </div>

      <XlyDrawer v-model="sizeSmall" title="小型抽屉" direction="left" :size="300">
        <p>宽度固定为 300px，适用于简单的信息展示。</p>
      </XlyDrawer>
      <XlyDrawer v-model="sizeMedium" title="中型抽屉" direction="right" size="50%">
        <p>宽度为视口的 50%，适用于中等复杂度的内容展示。</p>
      </XlyDrawer>
      <XlyDrawer v-model="sizeLarge" title="大型抽屉" direction="right" size="80%">
        <p>宽度为视口的 80%，适用于需要较大空间的场景。</p>
      </XlyDrawer>
    </section>

    <!-- 自定义内容 -->
    <section class="doc-section">
      <h2 class="doc-section__title">自定义内容</h2>
      <p class="doc-section__desc">
        通过 <code>#header</code>、默认插槽和 <code>#footer</code> 完全自定义抽屉内容。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <XlyButton type="primary" @click="customVisible = true">自定义抽屉</XlyButton>
        </div>
        <XlyDocCode :code='`<XlyDrawer v-model="visible" :show-header="false">
  <template #header>
    <div class="custom-header">
      <el-icon color="#4f6ef7"><Setting /></el-icon>
      <span>系统设置</span>
    </div>
  </template>
  <div class="settings-form">
    <p>在这里配置系统参数...</p>
  </div>
  <template #footer>
    <div class="custom-footer">
      <XlyButton @click="visible = false">取消</XlyButton>
      <XlyButton type="primary">保存配置</XlyButton>
    </div>
  </template>
</XlyDrawer>`' />
      </div>

      <XlyDrawer v-model="customVisible" direction="right" :show-header="false">
        <template #header>
          <div class="custom-header">
            <el-icon color="#4f6ef7" :size="20"><Setting /></el-icon>
            <span class="custom-header__text">系统设置</span>
          </div>
        </template>
        <div class="settings-form">
          <div class="settings-form__item">
            <label class="settings-form__label">通知推送</label>
            <p class="settings-form__desc">接收系统通知和更新提醒</p>
          </div>
          <div class="settings-form__item">
            <label class="settings-form__label">邮件订阅</label>
            <p class="settings-form__desc">接收定期邮件摘要</p>
          </div>
          <div class="settings-form__item">
            <label class="settings-form__label">深色模式</label>
            <p class="settings-form__desc">开启深色主题显示</p>
          </div>
        </div>
        <template #footer>
          <div class="custom-footer">
            <XlyButton @click="customVisible = false">取消</XlyButton>
            <XlyButton type="primary" @click="customVisible = false">保存配置</XlyButton>
          </div>
        </template>
      </XlyDrawer>
    </section>

    <!-- 无遮罩 -->
    <section class="doc-section">
      <h2 class="doc-section__title">无遮罩抽屉</h2>
      <p class="doc-section__desc">
        通过 <code>:show-mask="false"</code> 隐藏遮罩层，适用于固定侧边栏或辅助面板。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <XlyButton @click="noMaskVisible = true">无遮罩抽屉</XlyButton>
        </div>
        <XlyDocCode :code='`<XlyDrawer v-model="visible" title="固定面板" :show-mask="false">
  <p>这是一个没有遮罩的抽屉，背景完全透明。</p>
</XlyDrawer>`' />
      </div>

      <XlyDrawer
        v-model="noMaskVisible"
        title="固定面板"
        direction="left"
        :show-mask="false"
        :show-footer="false"
        :size="260"
      >
        <div class="fixed-panel">
          <div class="fixed-panel__nav">
            <div class="fixed-panel__nav-item active">
              <el-icon><HomeFilled /></el-icon>
              <span>首页</span>
            </div>
            <div class="fixed-panel__nav-item">
              <el-icon><Document /></el-icon>
              <span>文档</span>
            </div>
            <div class="fixed-panel__nav-item">
              <el-icon><Setting /></el-icon>
              <span>设置</span>
            </div>
          </div>
        </div>
      </XlyDrawer>
    </section>

    <!-- 隐藏头尾 -->
    <section class="doc-section">
      <h2 class="doc-section__title">隐藏头尾</h2>
      <p class="doc-section__desc">
        通过 <code>:show-header="false"</code> 隐藏抽屉头部，通过 <code>#footer</code> 插槽自定义底部区域。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <XlyButton @click="noHeaderVisible = true">无头部抽屉</XlyButton>
        </div>
        <XlyDocCode :code='`<XlyDrawer v-model="visible" :show-header="false">
  <div class="custom-content">
    <p>自定义内容区域</p>
  </div>
  <template #footer>
    <div class="actions">
      <XlyButton>取消</XlyButton>
      <XlyButton type="primary">确认</XlyButton>
    </div>
  </template>
</XlyDrawer>`' />
      </div>

      <XlyDrawer v-model="noHeaderVisible" :show-header="false" direction="right" :show-footer="false">
        <div class="custom-content">
          <div class="success-icon">
            <el-icon color="#34c759" :size="48"><CircleCheckFilled /></el-icon>
          </div>
          <p class="success-title">操作成功</p>
          <p class="success-desc">您的设置已成功保存</p>
        </div>
        <template #footer>
          <div class="custom-footer">
            <XlyButton type="primary" @click="noHeaderVisible = false">我知道了</XlyButton>
          </div>
        </template>
      </XlyDrawer>
    </section>

    <!-- 事件监听 -->
    <section class="doc-section">
      <h2 class="doc-section__title">事件监听</h2>
      <p class="doc-section__desc">
        监听抽屉的打开、关闭等事件，执行相应逻辑。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <XlyButton type="primary" @click="eventVisible = true">带事件的抽屉</XlyButton>
        </div>
        <XlyDocCode :code="`<XlyDrawer v-model=&quot;visible&quot; title=&quot;事件监听&quot;
  @open=&quot;handleOpen&quot;
  @opened=&quot;handleOpened&quot;
  @close=&quot;handleClose&quot;
  @after-close=&quot;handleAfterClose&quot;>
  <p>打开控制台查看事件日志</p>
</XlyDrawer>

// JS
function handleOpen() {
  console.log('抽屉即将打开')
}
function handleOpened() {
  console.log('抽屉已完全打开')
}
function handleClose() {
  console.log('抽屉即将关闭')
}
function handleAfterClose() {
  console.log('抽屉已完全关闭')
}`" />
      </div>

      <XlyDrawer
        v-model="eventVisible"
        title="事件监听"
        @open="handleOpen"
        @opened="handleOpened"
        @close="handleClose"
        @after-close="handleAfterClose"
      >
        <p>请打开浏览器控制台，查看事件触发日志。</p>
        <div class="event-log">
          <div v-for="(log, index) in eventLogs" :key="index" class="event-log__item">
            <span class="event-log__time">{{ log.time }}</span>
            <span class="event-log__name">{{ log.name }}</span>
          </div>
        </div>
      </XlyDrawer>
    </section>

    <!-- 业务场景 -->
    <section class="doc-section">
      <h2 class="doc-section__title">业务场景</h2>
      <p class="doc-section__desc">抽屉在实际业务中的常见用法。</p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <XlyButton type="primary" @click="detailVisible = true">查看详情</XlyButton>
          <XlyButton type="success" @click="formVisible = true">表单填写</XlyButton>
          <XlyButton type="warning" @click="confirmVisible = true">确认操作</XlyButton>
        </div>
      </div>

      <!-- 详情抽屉 -->
      <XlyDrawer v-model="detailVisible" title="用户详情" direction="right" size="45%">
        <div class="detail-info">
          <div class="detail-info__header">
            <div class="detail-info__avatar">
              <el-icon color="#fff" :size="28"><UserFilled /></el-icon>
            </div>
            <div class="detail-info__title">
              <h3>张明</h3>
              <p>ID: 10001</p>
            </div>
          </div>
          <div class="detail-info__list">
            <div class="detail-info__item">
              <span class="detail-info__label">邮箱</span>
              <span class="detail-info__value">zhangming@example.com</span>
            </div>
            <div class="detail-info__item">
              <span class="detail-info__label">部门</span>
              <span class="detail-info__value">产品研发部</span>
            </div>
            <div class="detail-info__item">
              <span class="detail-info__label">职位</span>
              <span class="detail-info__value">高级前端工程师</span>
            </div>
            <div class="detail-info__item">
              <span class="detail-info__label">入职日期</span>
              <span class="detail-info__value">2023-06-15</span>
            </div>
            <div class="detail-info__item">
              <span class="detail-info__label">状态</span>
              <XlyTag type="success">在职</XlyTag>
            </div>
          </div>
        </div>
      </XlyDrawer>

      <!-- 表单抽屉 -->
      <XlyDrawer v-model="formVisible" title="编辑用户" direction="right">
        <div class="demo-form">
          <div class="demo-form__item">
            <label class="demo-form__label">用户名 <span class="required">*</span></label>
            <el-input v-model="formData.username" placeholder="请输入用户名" size="default" />
          </div>
          <div class="demo-form__item">
            <label class="demo-form__label">邮箱 <span class="required">*</span></label>
            <el-input v-model="formData.email" placeholder="请输入邮箱" size="default" />
          </div>
          <div class="demo-form__item">
            <label class="demo-form__label">部门</label>
            <el-select v-model="formData.department" placeholder="请选择部门" size="default" style="width: 100%">
              <el-option label="产品研发部" value="product" />
              <el-option label="市场营销部" value="marketing" />
              <el-option label="人力资源部" value="hr" />
            </el-select>
          </div>
          <div class="demo-form__item">
            <label class="demo-form__label">角色</label>
            <el-select v-model="formData.role" placeholder="请选择角色" size="default" style="width: 100%">
              <el-option label="管理员" value="admin" />
              <el-option label="编辑者" value="editor" />
              <el-option label="查看者" value="viewer" />
            </el-select>
          </div>
          <div class="demo-form__item">
            <label class="demo-form__label">备注</label>
            <el-input v-model="formData.remark" type="textarea" placeholder="请输入备注" :rows="3" />
          </div>
        </div>
        <template #footer>
          <div class="custom-footer">
            <XlyButton @click="formVisible = false">取消</XlyButton>
            <XlyButton type="primary" @click="formVisible = false">保存</XlyButton>
          </div>
        </template>
      </XlyDrawer>

      <!-- 确认抽屉 -->
      <XlyDrawer v-model="confirmVisible" title="操作确认" direction="bottom" :size="320" :show-header="false" :show-footer="false">
        <div class="confirm-content">
          <div class="confirm-icon">
            <el-icon color="#f56c6c" :size="40"><WarningFilled /></el-icon>
          </div>
          <p class="confirm-title">确认删除</p>
          <p class="confirm-desc">确定要删除选中的 3 条记录吗？此操作不可撤销。</p>
        </div>
        <template #footer>
          <div class="confirm-footer">
            <XlyButton @click="confirmVisible = false">取消</XlyButton>
            <XlyButton type="danger" @click="confirmVisible = false">确认删除</XlyButton>
          </div>
        </template>
      </XlyDrawer>
    </section>

    <!-- API 文档 -->
    <section class="doc-section">
      <h2 class="doc-section__title">API</h2>
      <h3 class="doc-subtitle">Props</h3>
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
              <td><code>model-value / v-model</code></td>
              <td>是否显示抽屉</td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
            </tr>
            <tr>
              <td><code>title</code></td>
              <td>抽屉标题</td>
              <td><code>string</code></td>
              <td><code>''</code></td>
            </tr>
            <tr>
              <td><code>direction</code></td>
              <td>抽屉弹出方向</td>
              <td><code>'left' | 'right' | 'top' | 'bottom'</code></td>
              <td><code>'right'</code></td>
            </tr>
            <tr>
              <td><code>size</code></td>
              <td>抽屉宽度或高度（方向决定）</td>
              <td><code>string | number</code></td>
              <td><code>'30%'</code></td>
            </tr>
            <tr>
              <td><code>show-close</code></td>
              <td>是否显示关闭按钮</td>
              <td><code>boolean</code></td>
              <td><code>true</code></td>
            </tr>
            <tr>
              <td><code>show-header</code></td>
              <td>是否显示头部</td>
              <td><code>boolean</code></td>
              <td><code>true</code></td>
            </tr>
            <tr>
              <td><code>show-mask</code></td>
              <td>是否显示遮罩层</td>
              <td><code>boolean</code></td>
              <td><code>true</code></td>
            </tr>
            <tr>
              <td><code>close-on-click-modal</code></td>
              <td>点击遮罩是否关闭</td>
              <td><code>boolean</code></td>
              <td><code>true</code></td>
            </tr>
            <tr>
              <td><code>custom-class</code></td>
              <td>自定义类名</td>
              <td><code>string</code></td>
              <td><code>''</code></td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 class="doc-subtitle">Slots</h3>
      <div class="doc-table">
        <table>
          <thead>
            <tr><th>插槽名</th><th>说明</th></tr>
          </thead>
          <tbody>
            <tr><td><code>default</code></td><td>抽屉主体内容</td></tr>
            <tr><td><code>header</code></td><td>自定义头部内容（替换默认标题）</td></tr>
            <tr><td><code>footer</code></td><td>自定义底部内容</td></tr>
          </tbody>
        </table>
      </div>

      <h3 class="doc-subtitle">Events</h3>
      <div class="doc-table">
        <table>
          <thead>
            <tr><th>事件名</th><th>说明</th><th>参数</th></tr>
          </thead>
          <tbody>
            <tr><td><code>update:model-value</code></td><td>抽屉显示状态变化时触发</td><td><code>(value: boolean)</code></td></tr>
            <tr><td><code>close</code></td><td>抽屉关闭时触发</td><td>—</td></tr>
            <tr><td><code>open</code></td><td>抽屉打开前触发</td><td>—</td></tr>
            <tr><td><code>opened</code></td><td>抽屉打开动画结束后触发</td><td>—</td></tr>
            <tr><td><code>after-close</code></td><td>抽屉关闭动画结束后触发</td><td>—</td></tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CircleCheckFilled, WarningFilled, Setting, HomeFilled, Document, UserFilled } from '@element-plus/icons-vue'
import XlyButton from '@/components/xly-button/index.vue'
import XlyDrawer from '@/components/xly-drawer/index.vue'
import XlyTag from '@/components/xly-tag/index.vue'

// 基础用法
const basicVisible = ref(false)

// 不同方向
const leftVisible = ref(false)
const rightVisible = ref(false)
const topVisible = ref(false)
const bottomVisible = ref(false)

// 自定义尺寸
const sizeSmall = ref(false)
const sizeMedium = ref(false)
const sizeLarge = ref(false)

// 自定义内容
const customVisible = ref(false)

// 无遮罩
const noMaskVisible = ref(false)

// 隐藏头尾
const noHeaderVisible = ref(false)

// 事件监听
const eventVisible = ref(false)
const eventLogs = ref<Array<{ time: string; name: string }>>([])

function addLog(name: string) {
  const now = new Date()
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
  eventLogs.value.unshift({ time, name })
}

function handleOpen() {
  addLog('open - 抽屉即将打开')
}

function handleOpened() {
  addLog('opened - 抽屉已完全打开')
}

function handleClose() {
  addLog('close - 抽屉即将关闭')
}

function handleAfterClose() {
  addLog('after-close - 抽屉已完全关闭')
}

// 业务场景
const detailVisible = ref(false)
const formVisible = ref(false)
const confirmVisible = ref(false)

const formData = ref({
  username: '张明',
  email: 'zhangming@example.com',
  department: 'product',
  role: 'editor',
  remark: '',
})
</script>

<style scoped lang="scss">
.drawer-doc { padding: 8px 0 40px; }
.doc-header { margin-bottom: 36px; }
.doc-title { font-size: 26px; font-weight: 700; color: var(--el-text-color-primary); margin: 0 0 8px; letter-spacing: -0.3px; }
.doc-desc { font-size: 14px; color: var(--el-text-color-secondary); margin: 0; line-height: 1.6; }
.doc-section { margin-bottom: 32px; }
.doc-section__title { font-size: 18px; font-weight: 600; color: var(--el-text-color-primary); margin: 0 0 8px; padding-bottom: 10px; border-bottom: 1px solid var(--el-border-color-lighter); }
.doc-section__desc { font-size: 14px; color: var(--el-text-color-secondary); margin: 0 0 16px; line-height: 1.6; code { background: var(--el-fill-color-light); color: var(--el-color-primary); padding: 2px 6px; border-radius: 4px; font-size: 13px; font-family: 'SF Mono', 'Fira Code', Consolas, monospace; } }
.doc-preview { border: 1px solid var(--el-border-color-lighter); border-radius: 12px; overflow: hidden; background: var(--el-bg-color-overlay); }
.doc-preview__body { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; padding: 24px; }
.doc-code { border-top: 1px solid var(--el-border-color-lighter); background: var(--el-fill-color-light); padding: 16px 20px; overflow-x: auto; pre { margin: 0; padding: 0; } code { font-family: 'SF Mono', 'Fira Code', Consolas, monospace; font-size: 13px; line-height: 1.7; color: var(--el-text-color-regular); white-space: pre; } }
.doc-subtitle { font-size: 15px; font-weight: 600; color: var(--el-text-color-primary); margin: 20px 0 10px; }
.doc-table { overflow-x: auto; table { width: 100%; border-collapse: collapse; font-size: 14px; } th, td { text-align: left; padding: 10px 14px; border-bottom: 1px solid var(--el-border-color-lighter); white-space: nowrap; } th { background: var(--el-fill-color-light); font-weight: 600; color: var(--el-text-color-primary); } td { color: var(--el-text-color-regular); } code { background: var(--el-fill-color-light); color: var(--el-color-primary); padding: 2px 6px; border-radius: 4px; font-size: 13px; font-family: 'SF Mono', 'Fira Code', Consolas, monospace; } }

// 通用样式
.custom-header {
  display: flex;
  align-items: center;
  gap: 8px;
  &__text {
    font-size: 17px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}
.custom-footer {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 10px;
}
.demo-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
  &__item {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }
  &__label {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    .required { color: var(--el-color-danger); }
  }
}

// 设置表单
.settings-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
  &__item {
    padding: 12px 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }
  &__label {
    font-size: 15px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    margin-bottom: 4px;
  }
  &__desc {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    margin: 0;
  }
}

// 固定面板
.fixed-panel {
  &__nav {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }
  &__nav-item {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border-radius: 8px;
    cursor: pointer;
    color: var(--el-text-color-regular);
    transition: all 0.2s;
    &:hover {
      background: var(--el-fill-color-light);
    }
    &.active {
      background: rgba(79, 110, 247, 0.1);
      color: var(--el-color-primary);
    }
    span {
      font-size: 14px;
    }
  }
}

// 自定义内容
.custom-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  text-align: center;
}
.success-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  background: rgba(52, 199, 89, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 20px;
}
.success-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px;
}
.success-desc {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0;
}

// 事件日志
.event-log {
  margin-top: 20px;
  padding: 16px;
  background: var(--el-fill-color-light);
  border-radius: 8px;
  max-height: 200px;
  overflow-y: auto;
  &__item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 6px 0;
    font-size: 13px;
  }
  &__time {
    color: var(--el-text-color-secondary);
    font-family: 'SF Mono', 'Fira Code', monospace;
  }
  &__name {
    color: var(--el-text-color-regular);
  }
}

// 详情信息
.detail-info {
  &__header {
    display: flex;
    align-items: center;
    gap: 16px;
    padding-bottom: 20px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    margin-bottom: 20px;
  }
  &__avatar {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--el-color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
  }
  &__title {
    h3 {
      margin: 0 0 4px;
      font-size: 18px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
    p {
      margin: 0;
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }
  }
  &__list {
    display: flex;
    flex-direction: column;
    gap: 16px;
  }
  &__item {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  &__label {
    font-size: 14px;
    color: var(--el-text-color-secondary);
  }
  &__value {
    font-size: 14px;
    color: var(--el-text-color-primary);
    font-weight: 500;
  }
}

// 确认内容
.confirm-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px;
}
.confirm-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: rgba(245, 108, 108, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}
.confirm-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 8px;
}
.confirm-desc {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0;
}
.confirm-footer {
  display: flex;
  justify-content: center;
  gap: 12px;
}
</style>
