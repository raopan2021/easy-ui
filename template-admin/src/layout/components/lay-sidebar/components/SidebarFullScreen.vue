<script setup lang="ts">
import { Aim, FullScreen } from '@element-plus/icons-vue'
import { useNav } from '@/layout/hooks/useNav'

const { toggle, isFullscreen } = useNav()

isFullscreen.value = !!(
  document.fullscreenElement
  || document.webkitFullscreenElement
  || document.mozFullScreenElement
  || document.msFullscreenElement
)
</script>

<template>
  <span class="fullscreen-icon navbar-bg-hover" @click="toggle">
    <el-icon :size="20">
      <Aim v-if="isFullscreen" />
      <FullScreen v-else />
    </el-icon>
  </span>
</template>
