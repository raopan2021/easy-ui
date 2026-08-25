<script setup lang="ts">
import type { OptionsType } from '@/components/ReSegmented'
import { ArrowLeft as LeftArrow, ArrowRight as RightArrow } from '@element-plus/icons-vue'
import { debounce, isNumber, useDark, useGlobal } from '@pureadmin/utils'
import Segmented from '@/components/ReSegmented'
import { useDataThemeChange } from '@/layout/hooks/useDataThemeChange'
import { useNav } from '@/layout/hooks/useNav'
import { useViewTransition } from '@/layout/hooks/useViewTransition'
import { useAppStoreHook } from '@/store/modules/app'
import { useMultiTagsStoreHook } from '@/store/modules/multiTags'
import { emitter } from '@/utils/mitt'

import { makeIcon } from '@/utils/svg-icons'
import LayPanel from '../lay-panel/index.vue'

const DayIcon = makeIcon('day')
const DarkIcon = makeIcon('dark')
const SystemIcon = makeIcon('system')

const { device } = useNav()
const { isDark } = useDark()
const { $storage } = useGlobal<GlobalPropertiesApi>()

const mixRef = ref()
const verticalRef = ref()
const horizontalRef = ref()

const {
  dataTheme,
  overallStyle,
  layoutTheme,
  toggleClass,
  dataThemeChange,
} = useDataThemeChange()

/** 暗色模式切换（带 View Transition 圆形扩散动画） */
const { recordPos, toggle: toggleThemeWithTransition } = useViewTransition(dataTheme)
async function handleThemeChange(theme: { option: OptionsType, index: number }) {
  const targetTheme = (theme.option as any).theme as string
  // "自动"模式：读取 OS 偏好；其他模式：index 1=暗色
  const isTargetDark
    = theme.index === 2
      ? window.matchMedia('(prefers-color-scheme: dark)').matches
      : theme.index === 1

  if (isTargetDark !== dataTheme.value) {
    await toggleThemeWithTransition()
  }
  overallStyle.value = targetTheme
  dataThemeChange(targetTheme)
  theme.index === 2 && watchSystemThemeChange()
}

/* body添加layout属性，作用于src/style/sidebar.scss */
if (unref(layoutTheme)) {
  const layout = unref(layoutTheme).layout
  const theme = unref(layoutTheme).theme
  document.documentElement.setAttribute('data-theme', theme)
  setLayoutModel(layout)
}

/** 默认灵动模式 */
const markValue = ref($storage.configure?.showModel ?? 'smart')

const logoVal = ref($storage.configure?.showLogo ?? true)

const settings = reactive({
  greyVal: $storage.configure.grey,
  weakVal: $storage.configure.weak,
  tabsVal: $storage.configure.hideTabs,
  showLogo: $storage.configure.showLogo,
  showModel: $storage.configure.showModel,
  hideFooter: $storage.configure.hideFooter,
  multiTagsCache: $storage.configure.multiTagsCache,
  stretch: $storage.configure.stretch,
})

function storageConfigureChange<T>(key: string, val: T): void {
  const storageConfigure = $storage.configure
  storageConfigure[key] = val
  $storage.configure = storageConfigure
}

/** 灰色模式设置 */
function greyChange(value): void {
  const htmlEl = document.querySelector('html')
  toggleClass(settings.greyVal, 'html-grey', htmlEl)
  storageConfigureChange('grey', value)
}

/** 色弱模式设置 */
function weekChange(value): void {
  const htmlEl = document.querySelector('html')
  toggleClass(settings.weakVal, 'html-weakness', htmlEl)
  storageConfigureChange('weak', value)
}

/** 隐藏标签页设置 */
function tagsChange() {
  const showVal = settings.tabsVal
  storageConfigureChange('hideTabs', showVal)
  emitter.emit('tagViewsChange', showVal as unknown as string)
}

/** 隐藏页脚设置 */
function hideFooterChange() {
  const hideFooter = settings.hideFooter
  storageConfigureChange('hideFooter', hideFooter)
}

/** 标签页持久化设置 */
function multiTagsCacheChange() {
  const multiTagsCache = settings.multiTagsCache
  storageConfigureChange('multiTagsCache', multiTagsCache)
  useMultiTagsStoreHook().multiTagsCacheChange(multiTagsCache)
}

function onChange({ option }) {
  const { value } = option
  markValue.value = value
  storageConfigureChange('showModel', value)
  emitter.emit('tagViewsShowModel', value)
}

/** 侧边栏Logo */
function logoChange() {
  unref(logoVal)
    ? storageConfigureChange('showLogo', true)
    : storageConfigureChange('showLogo', false)
  emitter.emit('logoChange', unref(logoVal))
}

function setFalse(Doms): any {
  Doms.forEach((v) => {
    toggleClass(false, 'is-select', unref(v))
  })
}

/** 页宽 */
const stretchTypeOptions = computed<Array<OptionsType>>(() => {
  return [
    {
      label: '固定',
      tip: '紧凑页面，轻松找到所需信息',
      value: 'fixed',
    },
    {
      label: '自定义',
      tip: '最小1280、最大1600',
      value: 'custom',
    },
  ]
})

function setStretch(value) {
  settings.stretch = value
  storageConfigureChange('stretch', value)
}

function stretchTypeChange({ option }) {
  const { value } = option
  value === 'custom' ? setStretch(1440) : setStretch(false)
}

const pClass = computed(() => {
  return ['mb-[12px]!', 'font-medium', 'text-sm', 'dark:text-white']
})

const themeOptions = computed<Array<OptionsType>>(() => {
  return [
    {
      label: '浅色',
      icon: DayIcon,
      theme: 'light',
      tip: '清新启航，点亮舒适的工作界面',
      iconAttrs: { fill: isDark.value ? '#fff' : '#000' },
    },
    {
      label: '深色',
      icon: DarkIcon,
      theme: 'dark',
      tip: '月光序曲，沉醉于夜的静谧雅致',
      iconAttrs: { fill: isDark.value ? '#fff' : '#000' },
    },
    {
      label: '自动',
      icon: SystemIcon,
      theme: 'system',
      tip: '同步时光，界面随晨昏自然呼应',
      iconAttrs: { fill: isDark.value ? '#fff' : '#000' },
    },
  ]
})

const markOptions = computed<Array<OptionsType>>(() => {
  return [
    {
      label: '灵动',
      tip: '灵动标签，添趣生辉',
      value: 'smart',
    },
    {
      label: '卡片',
      tip: '卡片标签，高效浏览',
      value: 'card',
    },
    {
      label: '谷歌',
      tip: '谷歌风格，经典美观',
      value: 'chrome',
    },
  ]
})

/** 设置导航模式 */
function setLayoutModel(layout: string) {
  layoutTheme.value.layout = layout
  window.document.body.setAttribute('layout', layout)
  $storage.layout = {
    layout,
    theme: layoutTheme.value.theme,
    darkMode: $storage.layout?.darkMode,
    sidebarStatus: $storage.layout?.sidebarStatus,
    overallStyle: $storage.layout?.overallStyle,
  }
  useAppStoreHook().setLayout(layout)
}

watch($storage, ({ layout }) => {
  switch (layout.layout) {
    case 'vertical':
      toggleClass(true, 'is-select', unref(verticalRef))
      debounce(setFalse([horizontalRef]), 50)
      debounce(setFalse([mixRef]), 50)
      break
    case 'horizontal':
      toggleClass(true, 'is-select', unref(horizontalRef))
      debounce(setFalse([verticalRef]), 50)
      debounce(setFalse([mixRef]), 50)
      break
    case 'mix':
      toggleClass(true, 'is-select', unref(mixRef))
      debounce(setFalse([verticalRef]), 50)
      debounce(setFalse([horizontalRef]), 50)
      break
  }
})

const mediaQueryList = window.matchMedia('(prefers-color-scheme: dark)')

/** 根据操作系统主题设置平台整体风格 */
function updateTheme() {
  if (overallStyle.value !== 'system')
    return
  if (mediaQueryList.matches) {
    dataTheme.value = true
  }
  else {
    dataTheme.value = false
  }
  dataThemeChange(overallStyle.value)
}

function removeMatchMedia() {
  mediaQueryList.removeEventListener('change', updateTheme)
}

/** 监听操作系统主题改变 */
function watchSystemThemeChange() {
  updateTheme()
  removeMatchMedia()
  mediaQueryList.addEventListener('change', updateTheme)
}

onBeforeMount(() => {
  /* 初始化系统配置 */
  nextTick(() => {
    watchSystemThemeChange()
    settings.greyVal
    && document.querySelector('html')?.classList.add('html-grey')
    settings.weakVal
    && document.querySelector('html')?.classList.add('html-weakness')
    settings.tabsVal && tagsChange()
    settings.hideFooter && hideFooterChange()
  })
})

onUnmounted(() => removeMatchMedia)
</script>

<template>
  <LayPanel>
    <div class="p-5">
      <p :class="pClass">
        整体风格
      </p>
      <div @pointerdown="recordPos">
        <Segmented resize class="select-none" :model-value="overallStyle === 'system' ? 2 : dataTheme ? 1 : 0"
          :options="themeOptions" @change="handleThemeChange" />
      </div>

      <p class="mt-5!" :class="[pClass]">
        导航模式
      </p>
      <ul class="pure-theme">
        <li
          ref="verticalRef"
          v-tippy="{
            content: '左侧菜单，亲切熟悉',
            zIndex: 41000,
          }"
          :class="layoutTheme.layout === 'vertical' ? 'is-select' : ''"
          @click="setLayoutModel('vertical')"
        >
          <div />
          <div />
        </li>
        <li
          v-if="device !== 'mobile'"
          ref="horizontalRef"
          v-tippy="{
            content: '顶部菜单，简洁概览',
            zIndex: 41000,
          }"
          :class="layoutTheme.layout === 'horizontal' ? 'is-select' : ''"
          @click="setLayoutModel('horizontal')"
        >
          <div />
          <div />
        </li>
        <li
          v-if="device !== 'mobile'"
          ref="mixRef"
          v-tippy="{
            content: '混合菜单，灵活多变',
            zIndex: 41000,
          }"
          :class="layoutTheme.layout === 'mix' ? 'is-select' : ''"
          @click="setLayoutModel('mix')"
        >
          <div />
          <div />
        </li>
      </ul>

      <span v-if="useAppStoreHook().getViewportWidth > 1280">
        <p class="mt-5!" :class="[pClass]">页宽</p>
        <Segmented resize class="mb-2 select-none" :model-value="isNumber(settings.stretch) ? 1 : 0"
          :options="stretchTypeOptions" @change="stretchTypeChange" />
        <el-input-number v-if="isNumber(settings.stretch)" v-model="settings.stretch as number" :min="1280" :max="1600"
          controls-position="right" @change="value => setStretch(value)" />
        <button v-else v-ripple="{ class: 'text-gray-300' }"
          class="bg-transparent flex-c w-full h-20 rounded-md border border-[var(--pure-border-color)]"
          @click="setStretch(!settings.stretch)">
          <div class="flex-bc transition-all duration-300" :class="[settings.stretch ? 'w-[24%]' : 'w-[50%]']"
            style="color: var(--el-color-primary)">
            <PureIcon :icon="settings.stretch ? RightArrow : LeftArrow" :size="20" />
            <div class="grow border-0 border-b border-dashed" style="border-color: var(--el-color-primary)" />
            <PureIcon :icon="settings.stretch ? LeftArrow : RightArrow" :size="20" />
          </div>
        </button>
      </span>

      <p class="mt-4!" :class="[pClass]">
        页签风格
      </p>
      <Segmented resize class="select-none" :model-value="markValue === 'smart' ? 0 : markValue === 'card' ? 1 : 2"
        :options="markOptions" @change="onChange" />

      <p class="mt-5! font-medium text-sm dark:text-white">
        界面显示
      </p>
      <ul class="setting">
        <li>
          <label class="setting-item">
            <span class="dark:text-white">灰色模式</span>
            <el-switch v-model="settings.greyVal" inline-prompt active-text="开" inactive-text="关" @change="greyChange" />
          </label>
        </li>
        <li>
          <label class="setting-item">
            <span class="dark:text-white">色弱模式</span>
            <el-switch v-model="settings.weakVal" inline-prompt active-text="开" inactive-text="关" @change="weekChange" />
          </label>
        </li>
        <li>
          <label class="setting-item">
            <span class="dark:text-white">隐藏标签页</span>
            <el-switch v-model="settings.tabsVal" inline-prompt active-text="开" inactive-text="关" @change="tagsChange" />
          </label>
        </li>
        <li>
          <label class="setting-item">
            <span class="dark:text-white">隐藏页脚</span>
            <el-switch v-model="settings.hideFooter" inline-prompt active-text="开" inactive-text="关"
              @change="hideFooterChange" />
          </label>
        </li>
        <li>
          <label class="setting-item">
            <span class="dark:text-white">Logo</span>
            <el-switch v-model="logoVal" inline-prompt :active-value="true" :inactive-value="false" active-text="开"
              inactive-text="关" @change="logoChange" />
          </label>
        </li>
        <li>
          <label class="setting-item">
            <span class="dark:text-white">页签持久化</span>
            <el-switch v-model="settings.multiTagsCache" inline-prompt active-text="开" inactive-text="关"
              @change="multiTagsCacheChange" />
          </label>
        </li>
      </ul>
    </div>
  </LayPanel>
</template>

<style lang="scss" scoped>
:deep(.el-divider__text) {
  font-size: 16px;
  font-weight: 700;
}

:deep(.el-switch__core) {
  --el-switch-off-color: var(--pure-switch-off-color);

  min-width: 36px;
  height: 18px;
}

:deep(.el-switch__core .el-switch__action) {
  height: 14px;
}

.pure-theme {
  display: flex;
  gap: 12px;

  li {
    position: relative;
    width: 46px;
    height: 36px;
    overflow: hidden;
    cursor: pointer;
    background: #f0f2f5;
    border-radius: 4px;
    box-shadow: 0 1px 2.5px 0 rgb(0 0 0 / 18%);

    &:nth-child(1) {
      div {
        &:nth-child(1) {
          width: 30%;
          height: 100%;
          background: #1b2a47;
        }

        &:nth-child(2) {
          position: absolute;
          top: 0;
          right: 0;
          width: 70%;
          height: 30%;
          background: #fff;
          box-shadow: 0 0 1px #888;
        }
      }
    }

    &:nth-child(2) {
      div {
        &:nth-child(1) {
          width: 100%;
          height: 30%;
          background: #1b2a47;
          box-shadow: 0 0 1px #888;
        }
      }
    }

    &:nth-child(3) {
      div {
        &:nth-child(1) {
          width: 100%;
          height: 30%;
          background: #1b2a47;
          box-shadow: 0 0 1px #888;
        }

        &:nth-child(2) {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 30%;
          height: 70%;
          background: #fff;
          box-shadow: 0 0 1px #888;
        }
      }
    }
  }
}

.is-select {
  border: 2px solid var(--el-color-primary);
}

.setting {
  li {
    padding: 3px 0;
    font-size: 14px;
  }

  .setting-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    cursor: pointer;
  }
}
</style>
