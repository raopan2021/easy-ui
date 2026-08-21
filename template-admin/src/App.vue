<script lang="ts">
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import { ReDialog } from '@/components/ReDialog'

export default defineComponent({
  name: 'App',
  components: {
    ReDialog,
  },
  computed: {
    currentLocale() {
      return zhCn
    },
  },
})
</script>

<template>
  <el-config-provider :locale="currentLocale">
    <router-view />
    <ReDialog />
  </el-config-provider>
</template>
