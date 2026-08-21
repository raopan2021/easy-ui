<script setup lang="ts">
import { ArrowDown as ArrowDownLine, ArrowUp as ArrowUpLine } from '@element-plus/icons-vue'
import { useNav } from '@/layout/hooks/useNav'

withDefaults(defineProps<{ total?: number }>(), {
  total: 0,
})

const { device } = useNav()
</script>

<template>
  <div class="search-footer text-[#333] dark:text-white">
    <span class="search-footer-item">
      <SvgIcon name="enter_outlined" class="icon" />
      确认
    </span>
    <span class="search-footer-item">
      <PureIcon :icon="ArrowUpLine" :size="20" class="icon" />
      <PureIcon :icon="ArrowDownLine" :size="20" class="icon" />
      切换
    </span>
    <span class="search-footer-item">
      <SvgIcon name="keyboard_esc" class="icon" />
      关闭
    </span>
    <p v-if="device !== 'mobile' && total > 0" class="search-footer-total">
      {{ `共 ${total} 项` }}
    </p>
  </div>
</template>

<style lang="scss" scoped>
.search-footer {
  display: flex;

  .search-footer-item {
    display: flex;
    align-items: center;
    margin-right: 14px;
  }

  .icon {
    padding: 2px;
    margin-right: 3px;
    font-size: 20px;
    box-shadow:
      inset 0 -2px #cdcde6,
      inset 0 0 1px 1px #fff,
      0 1px 2px 1px #1e235a66;
  }

  .search-footer-total {
    position: absolute;
    right: 20px;
  }
}
</style>
