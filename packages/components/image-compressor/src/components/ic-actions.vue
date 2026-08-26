<script setup lang="ts">
import EasyButton from '../../../button'

defineProps<{
  /** 是否压缩中 */
  compressing: boolean
  /** 压缩进度 0-100 */
  progress: number
  /** 待压缩文件数量 */
  fileCount: number
  /** 结果数量 */
  resultCount: number
}>()

const emit = defineEmits<{
  (e: 'select'): void
  (e: 'compress'): void
  (e: 'clear'): void
}>()
</script>

<template>
  <div class="ic-actions">
    <EasyButton type="primary" :disabled="compressing" @click="emit('select')">
      选择图片
      <template v-if="fileCount > 0">
        （{{ fileCount }}）
      </template>
    </EasyButton>

    <!-- 开始压缩：loading + 进度均内置于按钮 -->
    <EasyButton
      type="success"
      :loading="compressing"
      :disabled="fileCount === 0 || compressing"
      class="ic-actions__compress"
      @click="emit('compress')"
    >
      {{ compressing ? `${progress}%` : '开始压缩' }}
    </EasyButton>

    <EasyButton type="ghost" :disabled="resultCount === 0" @click="emit('clear')">
      清空压缩历史
    </EasyButton>
  </div>
</template>

<style scoped lang="scss">
.ic-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 16px 0;

  &__compress {
    min-width: 130px;
  }
}
</style>
