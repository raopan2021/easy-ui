<script setup lang="ts">
import { EasyAvatar, EasyImage } from '@raopan/easy-ui'

// 示例图片
const singleImage = 'https://picsum.photos/400/300?random=1'
const twoImages = ['https://picsum.photos/400/300?random=2', 'https://picsum.photos/400/300?random=3']
const threeImages = [
  'https://picsum.photos/400/300?random=4',
  'https://picsum.photos/400/300?random=5',
  'https://picsum.photos/400/300?random=6',
]
const fourImages = [
  'https://picsum.photos/400/300?random=7',
  'https://picsum.photos/400/300?random=8',
  'https://picsum.photos/400/300?random=9',
  'https://picsum.photos/400/300?random=10',
]
const manyImages = Array.from({ length: 12 }, (_, i) => `https://picsum.photos/400/300?random=${i + 20}`)
</script>

<template>
  <div class="image-doc">
    <!-- 页面标题 -->
    <div class="doc-header">
      <h1 class="doc-title">
        Image 图片
      </h1>
      <p class="doc-desc">
        图片展示组件，支持多种数据格式、懒加载加载、预览放大等功能。
      </p>
    </div>

    <!-- 基础用法 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        基础用法
      </h2>
      <p class="doc-section__desc">
        通过 <code>src</code> 属性传入图片地址，支持数组或逗号拼接的字符串。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyImage :src="singleImage" alt="单张图片" />
        </div>
        <EasyDocCode
          code="<!-- 单张图片 -->
<EasyImage :src=&quot;singleImage&quot; />

<!-- 数组形式 -->
<EasyImage :src=&quot;['url1', 'url2', 'url3']&quot; />

<!-- 逗号拼接字符串 -->
<EasyImage src=&quot;url1, url2, url3&quot; />"
        />
      </div>
    </section>

    <!-- 不同数量展示 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        不同数量展示
      </h2>
      <p class="doc-section__desc">
        根据图片数量自动调整布局，支持单图和多图展示。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <div class="image-row">
            <div class="image-item">
              <span class="image-label">单张</span>
              <EasyImage :src="singleImage" />
            </div>
            <div class="image-item">
              <span class="image-label">两张</span>
              <EasyImage :src="twoImages" />
            </div>
            <div class="image-item">
              <span class="image-label">三张</span>
              <EasyImage :src="threeImages" />
            </div>
            <div class="image-item">
              <span class="image-label">四张</span>
              <EasyImage :src="fourImages" />
            </div>
          </div>
        </div>
        <EasyDocCode
          code="<EasyImage :src=&quot;singleImage&quot; />
<EasyImage :src=&quot;twoImages&quot; />
<EasyImage :src=&quot;threeImages&quot; />
<EasyImage :src=&quot;fourImages&quot; />"
        />
      </div>
    </section>

    <!-- 自定义显示数量 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        自定义显示数量
      </h2>
      <p class="doc-section__desc">
        通过 <code>max</code> 属性设置多图模式下显示的图片数量，超出部分显示 +N 提示。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <div class="image-row">
            <div class="image-item">
              <span class="image-label">max = 1</span>
              <EasyImage :src="manyImages" :max="1" />
            </div>
            <div class="image-item">
              <span class="image-label">max = 2</span>
              <EasyImage :src="manyImages" :max="2" />
            </div>
          </div>
        </div>
        <EasyDocCode
          code="<EasyImage :src=&quot;manyImages&quot; :max=&quot;1&quot; />
<EasyImage :src=&quot;manyImages&quot; :max=&quot;2&quot; />"
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
        <div class="doc-preview__body">
          <div class="image-row">
            <div class="image-item">
              <span class="image-label">fill</span>
              <EasyImage :src="singleImage" fit="fill" />
            </div>
            <div class="image-item">
              <span class="image-label">contain</span>
              <EasyImage :src="singleImage" fit="contain" />
            </div>
            <div class="image-item">
              <span class="image-label">cover</span>
              <EasyImage :src="singleImage" fit="cover" />
            </div>
            <div class="image-item">
              <span class="image-label">scale-down</span>
              <EasyImage :src="singleImage" fit="scale-down" />
            </div>
          </div>
        </div>
        <EasyDocCode
          code="<EasyImage :src=&quot;singleImage&quot; fit=&quot;fill&quot; />
<EasyImage :src=&quot;singleImage&quot; fit=&quot;contain&quot; />
<EasyImage :src=&quot;singleImage&quot; fit=&quot;cover&quot; />
<EasyImage :src=&quot;singleImage&quot; fit=&quot;scale-down&quot; />"
        />
      </div>
    </section>

    <!-- 自定义尺寸 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        自定义尺寸
      </h2>
      <p class="doc-section__desc">
        通过 <code>width</code> 和 <code>height</code> 属性设置图片尺寸。<br>
        <strong>如果只设置其中一个，宽高将使用相同的值（正方形）。</strong>
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <div class="image-row">
            <div class="image-item">
              <span class="image-label">默认 120x120</span>
              <EasyImage :src="singleImage" />
            </div>
            <div class="image-item">
              <span class="image-label">width=80</span>
              <EasyImage :src="singleImage" :width="80" />
            </div>
            <div class="image-item">
              <span class="image-label">width=60</span>
              <EasyImage :src="singleImage" :width="60" />
            </div>
            <div class="image-item">
              <span class="image-label">width=48</span>
              <EasyImage :src="singleImage" :width="48" />
            </div>
          </div>
        </div>
        <EasyDocCode
          code="<!-- 只设置一个尺寸，宽高相同 -->
<EasyImage :src=&quot;singleImage&quot; :width=&quot;80&quot; />  <!-- 80x80 -->
<EasyImage :src=&quot;singleImage&quot; :width=&quot;60&quot; />  <!-- 60x60 -->

<!-- 同时设置宽高 -->
<EasyImage :src=&quot;singleImage&quot; :width=&quot;120&quot; :height=&quot;80&quot; />

<!-- 字符串形式 -->
<EasyImage :src=&quot;singleImage&quot; width=&quot;80px&quot; />
<EasyImage :src=&quot;singleImage&quot; width=&quot;100%&quot; />"
        />
      </div>
    </section>

    <!-- 预览功能 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        预览功能
      </h2>
      <p class="doc-section__desc">
        设置 <code>preview</code> 属性开启预览，点击图片可放大查看。支持滚轮缩放、拖拽移动、旋转、左右切换。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyImage :src="fourImages" :preview="true" />
        </div>
        <EasyDocCode code="<EasyImage :src=&quot;fourImages&quot; :preview=&quot;true&quot; />" />
      </div>
    </section>

    <!-- 自定义预览操作 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        自定义预览操作
      </h2>
      <p class="doc-section__desc">
        通过 <code>previewActions</code> 属性自定义预览界面的操作按钮。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <div class="image-row">
            <div class="image-item">
              <span class="image-label">仅缩放</span>
              <EasyImage :src="singleImage" :preview="true" :preview-actions="['zoomIn', 'zoomOut']" />
            </div>
            <div class="image-item">
              <span class="image-label">仅旋转</span>
              <EasyImage :src="singleImage" :preview="true" :preview-actions="['rotateLeft', 'rotateRight', 'reset']" />
            </div>
            <div class="image-item">
              <span class="image-label">完整功能</span>
              <EasyImage :src="fourImages" :preview="true" :preview-actions="true" />
            </div>
          </div>
        </div>
        <EasyDocCode
          code="<!-- 仅缩放 -->
<EasyImage :src=&quot;singleImage&quot; :preview=&quot;true&quot; :preview-actions=&quot;['zoomIn', 'zoomOut']&quot; />

<!-- 仅旋转 -->
<EasyImage :src=&quot;singleImage&quot; :preview=&quot;true&quot; :preview-actions=&quot;['rotateLeft', 'rotateRight', 'reset']&quot; />"
        />
      </div>
    </section>

    <!-- 业务场景 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        业务场景
      </h2>

      <h3 class="doc-subtitle">
        商品图片
      </h3>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <div class="product-card">
            <EasyImage :src="fourImages" />
            <div class="product-info">
              <div class="product-title">
                AirPods Pro 无线耳机
              </div>
              <div class="product-price">
                ¥1999.00
              </div>
            </div>
          </div>
        </div>
      </div>

      <h3 class="doc-subtitle">
        用户相册
      </h3>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <div class="user-album">
            <div class="album-header">
              <EasyAvatar>紫</EasyAvatar>
              <div class="album-info">
                <div class="album-title">
                  旅行照片
                </div>
                <div class="album-count">
                  12 张照片
                </div>
              </div>
            </div>
            <EasyImage :src="manyImages" :max="6" />
          </div>
        </div>
      </div>

      <h3 class="doc-subtitle">
        聊天消息中的图片
      </h3>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <div class="chat-messages">
            <div class="chat-message">
              <EasyAvatar>张</EasyAvatar>
              <div class="chat-content">
                <div class="chat-bubble">
                  这是现场的照片
                </div>
                <EasyImage :src="threeImages" :max="3" />
                <div class="chat-time">
                  10:30
                </div>
              </div>
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
              <td>图片地址，支持数组或逗号拼接的字符串</td>
              <td><code>string | string[]</code></td>
              <td><code>''</code></td>
            </tr>
            <tr>
              <td><code>alt</code></td>
              <td>图片 alt</td>
              <td><code>string</code></td>
              <td><code>''</code></td>
            </tr>
            <tr>
              <td><code>previewSrcList</code></td>
              <td>预览图片列表</td>
              <td><code>string[]</code></td>
              <td><code>[]</code></td>
            </tr>
            <tr>
              <td><code>preview</code></td>
              <td>是否开启预览</td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
            </tr>
            <tr>
              <td><code>previewActions</code></td>
              <td>预览操作按钮配置</td>
              <td><code>array | true</code></td>
              <td><code>true</code></td>
            </tr>
            <tr>
              <td><code>max</code></td>
              <td>多图模式显示数量</td>
              <td><code>number</code></td>
              <td><code>4</code></td>
            </tr>
            <tr>
              <td><code>fit</code></td>
              <td>图片填充模式</td>
              <td><code>'fill' | 'contain' | 'cover' | 'none' | 'scale-down'</code></td>
              <td><code>'cover'</code></td>
            </tr>
            <tr>
              <td><code>mode</code></td>
              <td>预览模式: 单图single/多图grid</td>
              <td><code>'single' | 'grid'</code></td>
              <td><code>'grid'</code></td>
            </tr>
            <tr>
              <td><code>width</code></td>
              <td>图片宽度，支持数字(px)或字符串</td>
              <td><code>number | string</code></td>
              <td><code>120</code></td>
            </tr>
            <tr>
              <td><code>height</code></td>
              <td>图片高度，支持数字(px)或字符串</td>
              <td><code>number | string</code></td>
              <td><code>120</code></td>
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
              <td><code>error</code></td>
              <td>图片加载失败时触发</td>
              <td><code>(event: Event)</code></td>
            </tr>
            <tr>
              <td><code>preview</code></td>
              <td>点击图片预览时触发</td>
              <td><code>(index: number)</code></td>
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
              <td><code>overlay</code></td>
              <td>图片遮罩层内容</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.image-doc {
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
  align-items: flex-start;
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

/* 图片演示行 */
.image-row {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.image-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.image-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

/* 商品卡片 */
.product-card {
  display: inline-flex;
  flex-direction: column;
  padding: 16px;
  border: 1px solid #e8e8f0;
  border-radius: 12px;
  gap: 12px;
  background: var(--el-bg-color-overlay);
}

.product-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.product-title {
  font-size: 14px;
  color: var(--el-text-color-regular);
}

.product-price {
  font-size: 16px;
  color: var(--el-color-danger);
  font-weight: 600;
}

/* 用户相册 */
.user-album {
  display: inline-flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  border: 1px solid #e8e8f0;
  border-radius: 12px;
  background: var(--el-bg-color-overlay);
}

.album-header {
  display: flex;
  align-items: center;
  gap: 12px;
}

.album-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.album-title {
  font-size: 14px;
  color: var(--el-text-color-regular);
  font-weight: 500;
}

.album-count {
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

/* 聊天消息 */
.chat-messages {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 400px;
}

.chat-message {
  display: flex;
  gap: 12px;
}

.chat-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.chat-bubble {
  padding: 10px 14px;
  background: var(--el-fill-color-light);
  border-radius: 12px;
  font-size: 14px;
  color: var(--el-text-color-regular);
  max-width: 240px;
}

.chat-time {
  font-size: 11px;
  color: var(--el-text-color-secondary);
}
</style>
