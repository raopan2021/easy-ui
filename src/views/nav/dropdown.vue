<template>
  <div class="component-doc">
    <div class="doc-header">
      <h1 class="doc-title">下拉菜单 Dropdown</h1>
      <p class="doc-desc">通过点击或悬停触发的下拉菜单，用于展示链接、操作等。</p>
    </div>

    <section class="doc-section">
      <h2 class="doc-section__title">基础用法</h2>
      <p class="doc-section__desc">最简单的用法，通过 <code>label</code> 设置触发器文本，点击即可展开。</p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <XlyDropdown label="下拉菜单">
            <template #dropdown>
              <XlyDropdownItem>黄金糕</XlyDropdownItem>
              <XlyDropdownItem>狮子头</XlyDropdownItem>
              <XlyDropdownItem>螺蛳粉</XlyDropdownItem>
              <XlyDropdownItem disabled>双皮奶</XlyDropdownItem>
              <XlyDropdownItem divided>蚵仔煎</XlyDropdownItem>
            </template>
          </XlyDropdown>
        </div>
      </div>
      <XlyDocCode :code='`<XlyDropdown label="下拉菜单">
  <template #dropdown>
    <XlyDropdownItem>黄金糕</XlyDropdownItem>
    <XlyDropdownItem>狮子头</XlyDropdownItem>
    <XlyDropdownItem>螺蛳粉</XlyDropdownItem>
    <XlyDropdownItem disabled>双皮奶</XlyDropdownItem>
    <XlyDropdownItem divided>蚵仔煎</XlyDropdownItem>
  </template>
</XlyDropdown>`' />
    </section>

    <section class="doc-section">
      <h2 class="doc-section__title">触发方式</h2>
      <p class="doc-section__desc">可以配置为 hover 触发下拉菜单。</p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <XlyDropdown label="悬停展开" trigger="hover">
            <template #dropdown>
              <XlyDropdownItem>黄金糕</XlyDropdownItem>
              <XlyDropdownItem>狮子头</XlyDropdownItem>
              <XlyDropdownItem>螺蛳粉</XlyDropdownItem>
            </template>
          </XlyDropdown>
        </div>
      </div>
      <XlyDocCode :code='`<XlyDropdown label="悬停展开" trigger="hover">
  <template #dropdown>
    <XlyDropdownItem>黄金糕</XlyDropdownItem>
    <XlyDropdownItem>狮子头</XlyDropdownItem>
    <XlyDropdownItem>螺蛳粉</XlyDropdownItem>
  </template>
</XlyDropdown>`' />
    </section>

    <section class="doc-section">
      <h2 class="doc-section__title">菜单图标</h2>
      <p class="doc-section__desc">可以在菜单项中添加图标。</p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <XlyDropdown label="带图标">
            <template #dropdown>
              <XlyDropdownItem icon="el:Plus">黄金糕</XlyDropdownItem>
              <XlyDropdownItem icon="el:CirclePlus">狮子头</XlyDropdownItem>
              <XlyDropdownItem icon="el:Coffee">螺蛳粉</XlyDropdownItem>
            </template>
          </XlyDropdown>
        </div>
      </div>
      <XlyDocCode :code='`<XlyDropdown label="带图标">
  <template #dropdown>
    <XlyDropdownItem icon="el:Plus">黄金糕</XlyDropdownItem>
    <XlyDropdownItem icon="el:CirclePlus">狮子头</XlyDropdownItem>
    <XlyDropdownItem icon="el:Coffee">螺蛳粉</XlyDropdownItem>
  </template>
</XlyDropdown>`' />
    </section>

    <section class="doc-section">
      <h2 class="doc-section__title">分隔符</h2>
      <p class="doc-section__desc">使用 <code>divided</code> 属性添加分隔符。</p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <XlyDropdown label="分隔符示例">
            <template #dropdown>
              <XlyDropdownItem>黄金糕</XlyDropdownItem>
              <XlyDropdownItem>狮子头</XlyDropdownItem>
              <XlyDropdownItem>螺蛳粉</XlyDropdownItem>
              <XlyDropdownItem divided>双皮奶</XlyDropdownItem>
              <XlyDropdownItem>蚵仔煎</XlyDropdownItem>
            </template>
          </XlyDropdown>
        </div>
      </div>
      <XlyDocCode :code='`<XlyDropdown label="分隔符示例">
  <template #dropdown>
    <XlyDropdownItem>黄金糕</XlyDropdownItem>
    <XlyDropdownItem>狮子头</XlyDropdownItem>
    <XlyDropdownItem>螺蛳粉</XlyDropdownItem>
    <XlyDropdownItem divided>双皮奶</XlyDropdownItem>
    <XlyDropdownItem>蚵仔煎</XlyDropdownItem>
  </template>
</XlyDropdown>`' />
    </section>

    <section class="doc-section">
      <h2 class="doc-section__title">禁用选项</h2>
      <p class="doc-section__desc">使用 <code>disabled</code> 属性禁用菜单项。</p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <XlyDropdown label="禁用示例">
            <template #dropdown>
              <XlyDropdownItem>黄金糕</XlyDropdownItem>
              <XlyDropdownItem disabled>狮子头</XlyDropdownItem>
              <XlyDropdownItem>螺蛳粉</XlyDropdownItem>
            </template>
          </XlyDropdown>
        </div>
      </div>
      <XlyDocCode :code='`<XlyDropdown label="禁用示例">
  <template #dropdown>
    <XlyDropdownItem>黄金糕</XlyDropdownItem>
    <XlyDropdownItem disabled>狮子头</XlyDropdownItem>
    <XlyDropdownItem>螺蛳粉</XlyDropdownItem>
  </template>
</XlyDropdown>`' />
    </section>

    <section class="doc-section">
      <h2 class="doc-section__title">自定义触发器图标</h2>
      <p class="doc-section__desc">通过默认插槽可以完全自定义触发器内容，例如使用按钮或图标。</p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <XlyDropdown>
            <span class="custom-trigger">
              <XlyIcon name="el:Setting" :size="16" />
              设置
              <XlyIcon name="el:ArrowDown" :size="12" />
            </span>
            <template #dropdown>
              <XlyDropdownItem icon="el:User">个人信息</XlyDropdownItem>
              <XlyDropdownItem icon="el:Lock">修改密码</XlyDropdownItem>
              <XlyDropdownItem icon="el:SwitchButton" divided>退出登录</XlyDropdownItem>
            </template>
          </XlyDropdown>
        </div>
      </div>
      <XlyDocCode :code='`<XlyDropdown>
  <span class="custom-trigger">
    <XlyIcon name="el:Setting" :size="16" />
    设置
    <XlyIcon name="el:ArrowDown" :size="12" />
  </span>
  <template #dropdown>
    <XlyDropdownItem icon="el:User">个人信息</XlyDropdownItem>
    <XlyDropdownItem icon="el:Lock">修改密码</XlyDropdownItem>
    <XlyDropdownItem icon="el:SwitchButton" divided>退出登录</XlyDropdownItem>
  </template>
</XlyDropdown>`' />
    </section>

    <section class="doc-section">
      <h2 class="doc-section__title">点击事件</h2>
      <p class="doc-section__desc">通过 <code>@click</code> 监听菜单项的点击事件。当前点击：<strong>{{ clickedItem || '无' }}</strong></p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <XlyDropdown label="点击试试">
            <template #dropdown>
              <XlyDropdownItem @click="handleItemClick('黄金糕')">黄金糕</XlyDropdownItem>
              <XlyDropdownItem @click="handleItemClick('狮子头')">狮子头</XlyDropdownItem>
              <XlyDropdownItem @click="handleItemClick('螺蛳粉')">螺蛳粉</XlyDropdownItem>
            </template>
          </XlyDropdown>
        </div>
      </div>
      <XlyDocCode :code="`<XlyDropdown label=&quot;点击试试&quot;>
  <template #dropdown>
    <XlyDropdownItem @click=&quot;handleItemClick('黄金糕')&quot;>黄金糕</XlyDropdownItem>
    <XlyDropdownItem @click=&quot;handleItemClick('狮子头')&quot;>狮子头</XlyDropdownItem>
    <XlyDropdownItem @click=&quot;handleItemClick('螺蛳粉')&quot;>螺蛳粉</XlyDropdownItem>
  </template>
</XlyDropdown>`" />
    </section>

    <section class="doc-section">
      <h3 class="doc-subtitle">Attributes</h3>
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
              <td>label</td>
              <td>触发器显示文本</td>
              <td>string</td>
              <td>—</td>
              <td>下拉菜单</td>
            </tr>
            <tr>
              <td>trigger</td>
              <td>触发下拉菜单的方式</td>
              <td>string</td>
              <td>click / hover</td>
              <td>click</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="doc-section">
      <h3 class="doc-subtitle">Dropdown Slots</h3>
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
              <td>default</td>
              <td>自定义触发器内容（覆盖 label）</td>
            </tr>
            <tr>
              <td>dropdown</td>
              <td>下拉菜单，通常是 &lt;XlyDropdownItem&gt; 的列表</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="doc-section">
      <h3 class="doc-subtitle">Dropdown Item Attributes</h3>
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
              <td>icon</td>
              <td>菜单项图标</td>
              <td>string</td>
              <td>—</td>
              <td>—</td>
            </tr>
            <tr>
              <td>disabled</td>
              <td>是否禁用该项</td>
              <td>boolean</td>
              <td>—</td>
              <td>false</td>
            </tr>
            <tr>
              <td>divided</td>
              <td>是否显示分隔符</td>
              <td>boolean</td>
              <td>—</td>
              <td>false</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <section class="doc-section">
      <h3 class="doc-subtitle">Events</h3>
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
              <td>click</td>
              <td>点击菜单项时触发</td>
              <td>event: MouseEvent</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import XlyIcon from '@/components/xly-icon/index.vue'
import XlyDropdown from '@/components/xly-dropdown/index.vue'
import XlyDropdownItem from '@/components/xly-dropdown/dropdown-item.vue'

const clickedItem = ref('')

function handleItemClick(name: string) {
  clickedItem.value = name
}
</script>

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
}
.doc-subtitle {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0 0 12px;
}
.doc-preview {
  background-color: var(--el-bg-color-overlay);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 8px;
}
.doc-preview__body {
  padding: 24px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
}
.doc-code {
  margin-top: 12px;
  background-color: var(--el-fill-color-light);
  border-radius: 8px;
  overflow: hidden;
}
.doc-code pre {
  margin: 0;
  padding: 16px;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.5;
  font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
  color: var(--el-text-color-primary);
  background-color: var(--el-fill-color-light);
}
.doc-subtitle { font-size: 15px; font-weight: 600; color: var(--el-text-color-primary); margin: 20px 0 10px; }
.doc-table { overflow-x: auto;
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th, td { text-align: left; padding: 10px 14px; border-bottom: 1px solid var(--el-border-color-lighter); white-space: nowrap; }
  th { background: var(--el-fill-color-light); font-weight: 600; color: var(--el-text-color-primary); }
  td { color: var(--el-text-color-regular); }
  code {
    background: var(--el-fill-color-light); color: var(--el-color-primary); padding: 2px 6px;
    border-radius: 4px; font-size: 13px;
    font-family: 'SF Mono', 'Fira Code', Consolas, monospace;
  }
}
.custom-trigger {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #606266;
  padding: 6px 12px;
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 6px;
  transition: all 0.2s;
  &:hover {
    color: var(--el-color-primary);
    border-color: #4f6ef7;
  }
}
</style>
