<script setup lang="ts">
import { EasyImageCompressor } from '@raopan/easy-ui'
</script>

<template>
  <div class="image-compressor-doc">
    <!-- 页面标题 -->
    <div class="doc-header">
      <h1 class="doc-title">
        ImageCompressor 图片压缩
      </h1>
      <p class="doc-desc">
        浏览器端图片压缩组件，基于 compressorjs（HTMLCanvasElement.toBlob）。支持多图上传、质量/尺寸/格式调整、批量压缩、结果表格与压缩前后对比预览。
      </p>
    </div>

    <!-- 组件演示 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        基础演示
      </h2>
      <p class="doc-section__desc">
        点击或拖拽图片到上传区（支持多选），按需调整压缩选项后开始压缩。压缩完成后可通过表格行查看对比预览、下载或删除。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body">
          <EasyImageCompressor />
        </div>
        <EasyDocCode
          code="<EasyImageCompressor />"
        />
      </div>
    </section>

    <!-- 压缩选项说明 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        压缩选项
      </h2>
      <p class="doc-section__desc">
        压缩选项参考 Caesium Image Compressor 的能力模型，浏览器端由 compressorjs 实现。
      </p>
      <div class="doc-table">
        <table>
          <thead>
            <tr>
              <th>选项</th>
              <th>说明</th>
              <th>默认值</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><code>质量</code></td>
              <td>图片压缩质量 0-100%，映射 compressorjs <code>quality</code>（0-1）</td>
              <td><code>80</code></td>
            </tr>
            <tr>
              <td><code>一键无损压缩</code></td>
              <td>质量固定为 100%，输出更接近原图（可能使体积变大）</td>
              <td><code>false</code></td>
            </tr>
            <tr>
              <td><code>尺寸调整方式</code></td>
              <td>保持原始尺寸 / 指定像素 / 百分比 / 短边 / 长边 / 宽度 / 高度</td>
              <td><code>保持原始尺寸</code></td>
            </tr>
            <tr>
              <td><code>输出格式</code></td>
              <td>和输入保持一致 / JPG / PNG / WebP</td>
              <td><code>和输入保持一致</code></td>
            </tr>
            <tr>
              <td><code>前缀 / 后缀</code></td>
              <td>重命名输出文件，如 <code>comp_photo_min.jpg</code></td>
              <td><code>空</code></td>
            </tr>
            <tr>
              <td><code>跳过更大文件</code></td>
              <td>压缩后文件大于源文件时输出原图（compressorjs <code>strict</code>）</td>
              <td><code>true</code></td>
            </tr>
            <tr>
              <td><code>修正 EXIF 方向</code></td>
              <td>读取并修正 JPEG 的 EXIF 方向（compressorjs <code>checkOrientation</code>）</td>
              <td><code>true</code></td>
            </tr>
            <tr>
              <td><code>保留 EXIF 信息</code></td>
              <td>压缩后保留 EXIF 信息（compressorjs <code>retainExif</code>）</td>
              <td><code>false</code></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 能力说明 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        功能说明
      </h2>
      <div class="doc-table">
        <table>
          <thead>
            <tr>
              <th>能力</th>
              <th>说明</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>多图批量压缩</td>
              <td>支持单个 / 多个图片一次性上传并批量压缩，带进度提示</td>
            </tr>
            <tr>
              <td>压缩结果表格</td>
              <td>展示名称、大小（原 → 压缩后）、分辨率、已节省百分比、压缩信息</td>
            </tr>
            <tr>
              <td>对比预览</td>
              <td>点击表格行打开对比预览弹窗，原图 / 压缩后左右对比，支持缩放、旋转、全屏、上一张 / 下一张</td>
            </tr>
            <tr>
              <td>下载 / 删除 / 清空</td>
              <td>单条下载、单条删除、一键清空压缩历史</td>
            </tr>
            <tr>
              <td>浏览器限制</td>
              <td>Caesium 的「输出目录选择 / 移动原始文件 / 保留文件时间戳」等文件系统能力在浏览器不可实现，组件聚焦压缩本身 + 本地预览 / 下载</td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.image-compressor-doc {
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
  padding: 24px;
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
