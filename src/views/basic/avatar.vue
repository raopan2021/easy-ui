<script setup lang="ts">
import { EasyAvatar, EasyButton, EasyTag } from 'easy-ui'
import { ref } from 'vue'

// 头像组数据
const users = ref([
  { id: 1, name: '张明', avatar: 'https://i.pravatar.cc/150?img=11' },
  { id: 2, name: '李华', avatar: 'https://i.pravatar.cc/150?img=12' },
  { id: 3, name: '王芳', avatar: 'https://i.pravatar.cc/150?img=13' },
  { id: 4, name: '赵伟', avatar: 'https://i.pravatar.cc/150?img=14' },
  { id: 5, name: '钱娜', avatar: 'https://i.pravatar.cc/150?img=15' },
])

// 评论数据
const comments = ref([
  {
    id: 1,
    name: '前端开发者',
    avatar: 'https://i.pravatar.cc/150?img=16',
    time: '3小时前',
    text: '这个组件库设计得非常精美，使用体验很好！',
  },
  {
    id: 2,
    name: 'UI设计师',
    avatar: 'https://i.pravatar.cc/150?img=17',
    time: '5小时前',
    text: '配色方案很专业，期待更多组件上线。',
  },
  {
    id: 3,
    name: '产品经理',
    avatar: 'https://i.pravatar.cc/150?img=18',
    time: '1天前',
    text: '文档写得很详细，开发效率提升不少。',
  },
])

// 团队成员数据
const teamMembers = ref([
  { id: 1, name: '张明', role: '前端负责人', avatar: 'https://i.pravatar.cc/150?img=19' },
  { id: 2, name: '李华', role: 'UI设计师', avatar: 'https://i.pravatar.cc/150?img=20' },
  { id: 3, name: '王芳', role: '产品经理', avatar: 'https://i.pravatar.cc/150?img=21' },
  { id: 4, name: '赵伟', role: '后端工程师', avatar: 'https://i.pravatar.cc/150?img=22' },
])
</script>

<template>
  <div class="avatar-doc">
    <!-- 页面标题 -->
    <div class="doc-header">
      <h1 class="doc-title">
        Avatar 头像
      </h1>
      <p class="doc-desc">
        用于展示用户头像、图标或文字，支持图片、文字、图标三种形式。
      </p>
    </div>

    <!-- 基础用法 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        基础用法
      </h2>
      <p class="doc-section__desc">
        支持三种类型：图片avatar、文字avatar、图标avatar。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyAvatar>
            <svg viewBox="0 0 24 24" width="100%" height="100%" fill="none" stroke="currentColor" stroke-width="1.5">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </EasyAvatar>
          <EasyAvatar>U</EasyAvatar>
          <EasyAvatar src="https://i.pravatar.cc/150?img=1" />
        </div>
        <EasyDocCode
          code="<!-- 图标头像 -->
<EasyAvatar>
  <svg>...</svg>
</EasyAvatar>

<!-- 文字头像 -->
<EasyAvatar>U</EasyAvatar>

<!-- 图片头像 -->
<EasyAvatar src=&quot;https://...&quot; />"
        />
      </div>
    </section>

    <!-- 不同尺寸 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        不同尺寸
      </h2>
      <p class="doc-section__desc">
        通过 <code>size</code> 属性设置头像尺寸，提供 <code>small</code> / <code>default</code> /
        <code>large</code> 三种预设尺寸，也支持自定义数字或字符串。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyAvatar size="small" src="https://i.pravatar.cc/150?img=2" />
          <EasyAvatar src="https://i.pravatar.cc/150?img=3" />
          <EasyAvatar size="large" src="https://i.pravatar.cc/150?img=4" />
          <EasyAvatar :size="80" src="https://i.pravatar.cc/150?img=5" />
        </div>
        <EasyDocCode
          code="<EasyAvatar size=&quot;small&quot; src=&quot;...&quot; />
<EasyAvatar src=&quot;...&quot; />
<EasyAvatar size=&quot;large&quot; src=&quot;...&quot; />
<EasyAvatar :size=&quot;80&quot; src=&quot;...&quot; />"
        />
      </div>
    </section>

    <!-- 不同形状 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        不同形状
      </h2>
      <p class="doc-section__desc">
        通过 <code>shape</code> 属性设置头像形状，支持 <code>circle</code>（圆形）和 <code>square</code>（圆角方形）。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyAvatar src="https://i.pravatar.cc/150?img=6" shape="circle" />
          <EasyAvatar src="https://i.pravatar.cc/150?img=7" shape="square" />
          <EasyAvatar size="small" src="https://i.pravatar.cc/150?img=8" shape="circle" />
          <EasyAvatar size="small" src="https://i.pravatar.cc/150?img=9" shape="square" />
        </div>
        <EasyDocCode
          code="<EasyAvatar src=&quot;...&quot; shape=&quot;circle&quot; />
<EasyAvatar src=&quot;...&quot; shape=&quot;square&quot; />"
        />
      </div>
    </section>

    <!-- 文字头像 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        文字头像
      </h2>
      <p class="doc-section__desc">
        通过默认插槽传入文字内容。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyAvatar>张</EasyAvatar>
          <EasyAvatar>李</EasyAvatar>
          <EasyAvatar>王</EasyAvatar>
          <EasyAvatar>陈</EasyAvatar>
          <EasyAvatar size="large">
            张明
          </EasyAvatar>
          <EasyAvatar :size="80" color="#4f6ef7" shape="circle">
            紫
          </EasyAvatar>
        </div>
        <EasyDocCode
          code="<EasyAvatar>张</EasyAvatar>
<EasyAvatar>李</EasyAvatar>
<EasyAvatar>王</EasyAvatar>
<EasyAvatar>陈</EasyAvatar>
<EasyAvatar size=&quot;large&quot;>张明</EasyAvatar>
<EasyAvatar :size=&quot;80&quot; color=&quot;#4f6ef7&quot;>紫</EasyAvatar>"
        />
      </div>
    </section>

    <!-- 自定义颜色 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        自定义颜色
      </h2>
      <p class="doc-section__desc">
        通过 <code>color</code> 属性设置头像背景色。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyAvatar color="#4f6ef7" shape="circle">
            蓝
          </EasyAvatar>
          <EasyAvatar color="#67c23a" shape="circle">
            绿
          </EasyAvatar>
          <EasyAvatar color="#f56c6c" shape="circle">
            红
          </EasyAvatar>
          <EasyAvatar color="#e6a23c" shape="circle">
            橙
          </EasyAvatar>
          <EasyAvatar color="#909399" shape="circle">
            灰
          </EasyAvatar>
        </div>
        <EasyDocCode
          code="<EasyAvatar color=&quot;#4f6ef7&quot; shape=&quot;circle&quot;>蓝</EasyAvatar>
<EasyAvatar color=&quot;#67c23a&quot; shape=&quot;circle&quot;>绿</EasyAvatar>
<EasyAvatar color=&quot;#f56c6c&quot; shape=&quot;circle&quot;>红</EasyAvatar>"
        />
      </div>
    </section>

    <!-- 图片填充模式 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        图片填充模式
      </h2>
      <p class="doc-section__desc">
        通过 <code>fit</code> 属性设置图片的填充方式。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body demo-fit">
          <div class="demo-fit__item">
            <EasyAvatar :size="100" fit="fill" src="https://picsum.photos/200/300" shape="square" />
            <span>fill</span>
          </div>
          <div class="demo-fit__item">
            <EasyAvatar :size="100" fit="contain" src="https://picsum.photos/200/300" shape="square" />
            <span>contain</span>
          </div>
          <div class="demo-fit__item">
            <EasyAvatar :size="100" fit="cover" src="https://picsum.photos/200/300" shape="square" />
            <span>cover</span>
          </div>
          <div class="demo-fit__item">
            <EasyAvatar :size="100" fit="none" src="https://picsum.photos/200/300" shape="square" />
            <span>none</span>
          </div>
          <div class="demo-fit__item">
            <EasyAvatar :size="100" fit="scale-down" src="https://picsum.photos/200/300" shape="square" />
            <span>scale-down</span>
          </div>
        </div>
        <EasyDocCode
          code="<EasyAvatar :size=&quot;100&quot; fit=&quot;fill&quot; src=&quot;...&quot; />
<EasyAvatar :size=&quot;100&quot; fit=&quot;contain&quot; src=&quot;...&quot; />
<EasyAvatar :size=&quot;100&quot; fit=&quot;cover&quot; src=&quot;...&quot; />
<EasyAvatar :size=&quot;100&quot; fit=&quot;none&quot; src=&quot;...&quot; />
<EasyAvatar :size=&quot;100&quot; fit=&quot;scale-down&quot; src=&quot;...&quot; />"
        />
      </div>
    </section>

    <!-- 头像组 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        头像组
      </h2>
      <p class="doc-section__desc">
        多个头像组合展示，hover 时可看到完整信息。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <div class="avatar-group">
            <div
              v-for="(user, index) in users"
              :key="user.id"
              class="avatar-group__item"
              :style="{ zIndex: users.length - index }"
            >
              <EasyAvatar :src="user.avatar" :size="40" :title="user.name" />
            </div>
            <div class="avatar-group__more" :style="{ zIndex: 0 }">
              <EasyAvatar :size="40" color="#909399">
                +5
              </EasyAvatar>
            </div>
          </div>
        </div>
        <EasyDocCode
          code="<div class=&quot;avatar-group&quot;>
  <EasyAvatar v-for=&quot;user in users&quot; :key=&quot;user.id&quot; :src=&quot;user.avatar&quot; />
  <EasyAvatar>+5</EasyAvatar>
</div>"
        />
      </div>
    </section>

    <!-- 业务场景 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        业务场景
      </h2>
      <p class="doc-section__desc">
        头像在实际业务中的常见用法。
      </p>

      <!-- 用户卡片 -->
      <h3 class="doc-subsection__title">
        用户信息卡片
      </h3>
      <div class="doc-preview doc-preview--noborder">
        <div class="user-card">
          <div class="user-card__avatar">
            <EasyAvatar :size="64" src="https://i.pravatar.cc/150?img=10" shape="circle" />
          </div>
          <div class="user-card__info">
            <h3>张明</h3>
            <p>高级前端工程师 · 5年经验</p>
            <div class="user-card__tags">
              <EasyTag type="primary" size="small">
                Vue
              </EasyTag>
              <EasyTag type="success" size="small">
                React
              </EasyTag>
              <EasyTag type="warning" size="small">
                TypeScript
              </EasyTag>
            </div>
          </div>
          <EasyButton type="primary" size="small">
            关注
          </EasyButton>
        </div>
      </div>

      <!-- 评论列表 -->
      <h3 class="doc-subsection__title">
        评论列表
      </h3>
      <div class="doc-preview doc-preview--noborder">
        <div class="comment-list">
          <div v-for="comment in comments" :key="comment.id" class="comment-item">
            <EasyAvatar :size="36" :src="comment.avatar" shape="circle" />
            <div class="comment-item__content">
              <div class="comment-item__header">
                <span class="comment-item__name">{{ comment.name }}</span>
                <span class="comment-item__time">{{ comment.time }}</span>
              </div>
              <p class="comment-item__text">
                {{ comment.text }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- 团队成员 -->
      <h3 class="doc-subsection__title">
        团队成员
      </h3>
      <div class="doc-preview doc-preview--noborder">
        <div class="team-list">
          <div v-for="member in teamMembers" :key="member.id" class="team-item">
            <EasyAvatar :size="48" :src="member.avatar" shape="circle" />
            <div class="team-item__info">
              <span class="team-item__name">{{ member.name }}</span>
              <span class="team-item__role">{{ member.role }}</span>
            </div>
          </div>
        </div>
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
              <td><code>src</code></td>
              <td>图片地址</td>
              <td><code>string</code></td>
              <td>—</td>
            </tr>
            <tr>
              <td><code>src-set</code></td>
              <td>图片地址集合（响应式图片）</td>
              <td><code>string</code></td>
              <td>—</td>
            </tr>
            <tr>
              <td><code>alt</code></td>
              <td>图片描述</td>
              <td><code>string</code></td>
              <td><code>''</code></td>
            </tr>
            <tr>
              <td><code>size</code></td>
              <td>头像尺寸</td>
              <td><code>'small' | 'default' | 'large' | number | string</code></td>
              <td><code>'default'</code></td>
            </tr>
            <tr>
              <td><code>shape</code></td>
              <td>头像形状</td>
              <td><code>'circle' | 'square'</code></td>
              <td><code>'circle'</code></td>
            </tr>
            <tr>
              <td><code>color</code></td>
              <td>背景色</td>
              <td><code>string</code></td>
              <td>—</td>
            </tr>
            <tr>
              <td><code>fit</code></td>
              <td>图片填充模式</td>
              <td><code>'fill' | 'contain' | 'cover' | 'none' | 'scale-down'</code></td>
              <td><code>'cover'</code></td>
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
              <td>头像内容（文字或图标）</td>
            </tr>
            <tr>
              <td><code>icon</code></td>
              <td>自定义图标（当没有 src 且无默认插槽时显示）</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h3 class="doc-subtitle">
        Events
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
              <td><code>click</code></td>
              <td>点击头像时触发</td>
              <td><code>(event: MouseEvent)</code></td>
            </tr>
            <tr>
              <td><code>error</code></td>
              <td>图片加载失败时触发</td>
              <td><code>(event: Event)</code></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.avatar-doc {
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
.doc-subsection__title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-regular);
  margin: 24px 0 12px;
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
  &.doc-preview--noborder {
    border: none;
    background: var(--el-fill-color-light);
  }
}
.doc-preview__body {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 16px;
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

// 头像组
.avatar-group {
  display: flex;
  align-items: center;
  .avatar-group__item {
    margin-left: -10px;
    border: 2px solid var(--el-bg-color-overlay);
    border-radius: 50%;
    transition: transform 0.2s;
    &:hover {
      transform: translateY(-4px);
      z-index: 10 !important;
    }
    &:first-child {
      margin-left: 0;
    }
  }
  .avatar-group__more {
    margin-left: -10px;
    border: 2px solid var(--el-bg-color-overlay);
    border-radius: 50%;
  }
}

// 业务场景样式
.user-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 24px;
  .user-card__info {
    flex: 1;
    h3 {
      margin: 0 0 4px;
      font-size: 16px;
      font-weight: 600;
      color: var(--el-text-color-primary);
    }
    p {
      margin: 0 0 8px;
      font-size: 13px;
      color: var(--el-text-color-secondary);
    }
  }
  .user-card__tags {
    display: flex;
    gap: 6px;
  }
}

.comment-list {
  padding: 16px 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  display: flex;
  gap: 12px;
  .comment-item__content {
    flex: 1;
  }
  .comment-item__header {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 4px;
  }
  .comment-item__name {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }
  .comment-item__time {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
  .comment-item__text {
    margin: 0;
    font-size: 14px;
    color: var(--el-text-color-regular);
    line-height: 1.6;
  }
}

.team-list {
  padding: 16px 24px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

.team-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--el-bg-color-overlay);
  border-radius: 8px;
  .team-item__info {
    display: flex;
    flex-direction: column;
  }
  .team-item__name {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
  }
  .team-item__role {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
}

// 图片填充模式演示
.demo-fit {
  gap: 24px;
  .demo-fit__item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    span {
      font-size: 12px;
      color: var(--el-text-color-secondary);
    }
  }
}
</style>
