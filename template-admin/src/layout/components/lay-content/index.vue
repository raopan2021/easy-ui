<script setup lang="ts">
import { isNumber, useGlobal } from '@pureadmin/utils'
import { useScroll } from '@vueuse/core'
import { Transition } from 'vue'
import { useTags } from '@/layout/hooks/useTag'
import { usePermissionStoreHook } from '@/store/modules/permission'
import LayFooter from '../lay-footer/index.vue'
import LayFrame from '../lay-frame/index.vue'

const props = defineProps({
  fixedHeader: Boolean,
})

const { showModel } = useTags()
const { $storage, $config } = useGlobal<GlobalPropertiesApi>()

const isKeepAlive = computed(() => {
  return $config?.KeepAlive
})

const transitions = computed(() => {
  return (route) => {
    return route.meta.transition
  }
})

const hideTabs = computed(() => {
  return $storage?.configure.hideTabs
})

const hideFooter = computed(() => {
  return $storage?.configure.hideFooter
})

const stretch = computed(() => {
  return $storage?.configure.stretch
})

const layout = computed(() => {
  return $storage?.layout.layout === 'vertical'
})

const getMainWidth = computed(() => {
  return isNumber(stretch.value)
    ? `${stretch.value}px`
    : stretch.value
      ? '1440px'
      : '100%'
})

const getSectionStyle = computed(() => {
  return [
    hideTabs.value && layout ? 'padding-top: 48px;' : '',
    !hideTabs.value && layout
      ? showModel.value == 'chrome'
        ? 'padding-top: 85px;'
        : 'padding-top: 81px;'
      : '',
    hideTabs.value && !layout.value ? 'padding-top: 48px;' : '',
    !hideTabs.value && !layout.value
      ? showModel.value == 'chrome'
        ? 'padding-top: 85px;'
        : 'padding-top: 81px;'
      : '',
    props.fixedHeader
      ? ''
      : `padding-top: 0;${hideTabs.value
        ? 'min-height: calc(100vh - 48px);'
        : 'min-height: calc(100vh - 86px);'
      }`,
  ]
})

const transitionMain = defineComponent({
  props: {
    route: {
      type: undefined,
      required: true,
    },
  },
  render() {
    const transitionName
      = transitions.value(this.route)?.name || 'fade-transform'
    const enterTransition = transitions.value(this.route)?.enterTransition
    const leaveTransition = transitions.value(this.route)?.leaveTransition
    return h(
      Transition,
      {
        name: enterTransition ? 'pure-classes-transition' : transitionName,
        enterActiveClass: enterTransition
          ? `animate__animated ${enterTransition}`
          : undefined,
        leaveActiveClass: leaveTransition
          ? `animate__animated ${leaveTransition}`
          : undefined,
        mode: 'out-in',
        appear: true,
      },
      {
        default: () => [this.$slots.default()],
      },
    )
  },
})

// ==================== 滚动容器 + 回到顶部 ====================
const scrollContainerRef = ref<HTMLElement>()
const { y: scrollY } = useScroll(scrollContainerRef)
const showBackTop = computed(() => (scrollY.value ?? 0) > 300)

function scrollToTop() {
  scrollContainerRef.value?.scrollTo({ top: 0, behavior: 'smooth' })
}
</script>

<template>
  <section :class="[fixedHeader ? 'app-main' : 'app-main-nofixed-header']" :style="getSectionStyle">
    <router-view>
      <template #default="{ Component, route }">
        <div class="grow-main">
          <LayFrame :curr-comp="Component" :curr-route="route">
            <template #default="{ Comp, fullPath, frameInfo }">
              <div
                v-if="fixedHeader" ref="scrollContainerRef" class="scroll-container" :style="{
                  'max-width': getMainWidth,
                  'margin': '0 auto',
                  'transition': 'all 300ms cubic-bezier(0.4, 0, 0.2, 1)',
                }"
              >
                <div v-show="showBackTop" class="back-top-btn" title="回到顶部" @click="scrollToTop">
                  <SvgIcon name="back_top" />
                </div>
                <div class="grow">
                  <transitionMain :route="route">
                    <keep-alive v-if="isKeepAlive" :include="usePermissionStoreHook().cachePageList">
                      <component :is="Comp" :key="fullPath" :frame-info="frameInfo" class="main-content" />
                    </keep-alive>
                    <component :is="Comp" v-else :key="fullPath" :frame-info="frameInfo" class="main-content" />
                  </transitionMain>
                </div>
                <LayFooter v-if="!hideFooter" />
              </div>
              <div v-else class="grow">
                <transitionMain :route="route">
                  <keep-alive v-if="isKeepAlive" :include="usePermissionStoreHook().cachePageList">
                    <component :is="Comp" :key="fullPath" :frame-info="frameInfo" class="main-content" />
                  </keep-alive>
                  <component :is="Comp" v-else :key="fullPath" :frame-info="frameInfo" class="main-content" />
                </transitionMain>
              </div>
            </template>
          </LayFrame>
        </div>
      </template>
    </router-view>

    <!-- 页脚 -->
    <LayFooter v-if="!hideFooter && !fixedHeader" />
  </section>
</template>

<style scoped>
.app-main {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.app-main-nofixed-header {
  position: relative;
  display: flex;
  flex-direction: column;
  width: 100%;
}

.grow-main {
  flex: 1;
  min-height: 0;
}

.scroll-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
  overflow: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;

  &::-webkit-scrollbar {
    display: none;
  }
}

.main-content {
  margin: 24px;
}

.back-top-btn {
  position: fixed;
  right: 40px;
  bottom: 40px;
  z-index: 100;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: var(--el-bg-color);
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.12);
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: var(--el-color-primary-light-9);
  }
}
</style>
