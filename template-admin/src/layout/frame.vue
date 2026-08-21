<script setup lang="ts">
import { hideLoading, showLoading } from '@/utils/xly'

defineOptions({
  name: 'LayFrame',
})

const props = defineProps<{
  frameInfo?: {
    frameSrc?: string
    fullPath?: string
  }
}>()

const loading = ref(true)
const currentRoute = useRoute()
const frameSrc = ref<string>('')
const frameRef = ref<HTMLElement | null>(null)
const fallbackTimer = ref<number | null>(null)

if (unref(currentRoute.meta)?.frameSrc) {
  frameSrc.value = unref(currentRoute.meta)?.frameSrc as string
}

/** 同步本地 loading 状态到 xly 全屏 loading */
function syncLoading(value: boolean) {
  if (value) {
    showLoading('加载中...')
  }
  else {
    hideLoading()
  }
}

function clearFallbackTimer() {
  if (fallbackTimer.value !== null) {
    clearTimeout(fallbackTimer.value)
    fallbackTimer.value = null
  }
}

function setLoadingFalse() {
  loading.value = false
  clearFallbackTimer()
}

function init() {
  nextTick(() => {
    const iframe = unref(frameRef)
    if (!iframe)
      return
    const _frame = iframe as any
    if (_frame.attachEvent) {
      _frame.attachEvent('onload', setLoadingFalse)
    }
    else {
      iframe.onload = setLoadingFalse
    }
  })
}

let isRedirect = false

watch(
  () => currentRoute.fullPath,
  (path) => {
    if (
      currentRoute.name === 'Redirect'
      && props.frameInfo?.fullPath
      && path.includes(props.frameInfo.fullPath)
    ) {
      isRedirect = true
      loading.value = true
      return
    }
    if (props.frameInfo?.fullPath === path && isRedirect) {
      loading.value = true
      clearFallbackTimer()
      const url = new URL(props.frameInfo.frameSrc, window.location.origin)
      const joinChar = url.search ? '&' : '?'
      frameSrc.value = `${props.frameInfo.frameSrc}${joinChar}t=${Date.now()}`
      fallbackTimer.value = window.setTimeout(() => {
        if (loading.value) {
          setLoadingFalse()
        }
      }, 1500)
      isRedirect = false
    }
  },
  { immediate: true },
)

// 首次进入时立即打开 loading
showLoading('加载中...')
// 监听 loading 变化，同步到 xly
watch(loading, syncLoading)

onMounted(() => {
  init()
})

onBeforeUnmount(() => {
  // 路由切换时确保 loading 关闭，避免卡住
  hideLoading()
})
</script>

<template>
  <div class="frame">
    <iframe ref="frameRef" :src="frameSrc" class="frame-iframe" />
  </div>
</template>

<style lang="scss" scoped>
.frame {
  position: absolute;
  inset: 0;

  .frame-iframe {
    box-sizing: border-box;
    width: 100%;
    height: 100%;
    overflow: hidden;
    border: 0;
  }
}

.main-content {
  margin: 2px 0 0 !important;
}
</style>
