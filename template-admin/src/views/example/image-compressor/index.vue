<template>
  <el-card shadow="never" class="image-compressor-demo">
    <template #header>
      <div class="demo-header">
        <span class="demo-title">图片压缩 ImageCompressor</span>
        <span class="demo-desc">基于 compressorjs，支持压缩质量、尺寸调整、格式转换与本地批量压缩。</span>
      </div>
    </template>
    <EasyImageCompressor />
  </el-card>
</template>

<script setup lang="ts">
import { EasyImageCompressor } from '@raopan/easy-ui'
</script>

<style scoped>
.image-compressor-demo {
  margin: 16px;
}
.demo-header {
  display: flex;
  align-items: baseline;
  gap: 12px;
  flex-wrap: wrap;
}
.demo-title {
  font-size: 16px;
  font-weight: 600;
}
.demo-desc {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}
</style>
