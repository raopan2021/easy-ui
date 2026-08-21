import type { CSSProperties } from 'vue'
import type { tagsViewsType } from '../types'
import { Close, RefreshRight } from '@element-plus/icons-vue'
import {
  hasClass,
  isBoolean,
  isEqual,
  storageLocal,
  toggleClass,
} from '@pureadmin/utils'
import { markRaw } from 'vue'
import { responsiveStorageNameSpace } from '@/config'
import { useBoolean } from '@/layout/hooks/useBoolean'
import { useMultiTagsStoreHook } from '@/store/modules/multiTags'

import { useSettingStoreHook } from '@/store/modules/settings'
import { makeIcon } from '@/utils/svg-icons'

const Fullscreen = makeIcon('full_screen')
const CloseAllTags = makeIcon('close-all-tags')
const CloseOtherTags = makeIcon('close-other-tags')
const CloseRightTags = makeIcon('close-right-tags')
const CloseLeftTags = makeIcon('close-left-tags')

export function useTags() {
  const route = useRoute()
  const router = useRouter()
  const instance = getCurrentInstance()
  const pureSetting = useSettingStoreHook()

  const buttonTop = ref(0)
  const buttonLeft = ref(0)
  const translateX = ref(0)
  const { bool: visible, setTrue: showMenu, setFalse: closeMenu } = useBoolean()
  const activeIndex = ref(-1)
  // 当前右键选中的路由信息
  const currentSelect = ref({})
  const isScrolling = ref(false)

  /** 显示模式，默认灵动模式 */
  const showModel = ref(
    storageLocal().getItem<StorageConfigs>(
      `${responsiveStorageNameSpace()}configure`,
    )?.showModel || 'smart',
  )
  /** 是否隐藏标签页，默认显示 */
  const showTags
    = ref(
      storageLocal().getItem<StorageConfigs>(
        `${responsiveStorageNameSpace()}configure`,
      ).hideTabs,
    ) ?? ref('false')
  const multiTags: any = computed(() => {
    return useMultiTagsStoreHook().multiTags
  })

  const tagsViews = reactive<Array<tagsViewsType>>([
    {
      icon: markRaw(RefreshRight),
      text: '重新加载',
      divided: false,
      disabled: false,
      show: true,
    },
    {
      icon: markRaw(Close),
      text: '关闭当前标签页',
      divided: false,
      disabled: !(multiTags.value.length > 1),
      show: true,
    },
    {
      icon: markRaw(CloseLeftTags),
      text: '关闭左侧标签页',
      divided: true,
      disabled: !(multiTags.value.length > 1),
      show: true,
    },
    {
      icon: markRaw(CloseRightTags),
      text: '关闭右侧标签页',
      divided: false,
      disabled: !(multiTags.value.length > 1),
      show: true,
    },
    {
      icon: markRaw(CloseOtherTags),
      text: '关闭其他标签页',
      divided: true,
      disabled: !(multiTags.value.length > 2),
      show: true,
    },
    {
      icon: markRaw(CloseAllTags),
      text: '关闭全部标签页',
      divided: false,
      disabled: !(multiTags.value.length > 1),
      show: true,
    },
    {
      icon: markRaw(Fullscreen),
      text: '内容区全屏',
      divided: true,
      disabled: false,
      show: true,
    },
  ])

  function conditionHandle(item, previous, next) {
    const currentName = route.name || ''
    const itemName = item.name || ''

    if (isBoolean(route?.meta?.showLink) && route?.meta?.showLink === false) {
      if (Object.keys(route.query).length > 0) {
        return currentName === itemName && isEqual(route.query, item.query)
          ? previous
          : next
      }
      else {
        return currentName === itemName && isEqual(route.params, item.params)
          ? previous
          : next
      }
    }
    else {
      return currentName === itemName ? previous : next
    }
  }

  const isFixedTag = computed(() => {
    return (item) => {
      return isBoolean(item?.meta?.fixedTag) && item?.meta?.fixedTag === true
    }
  })

  const iconIsActive = computed(() => {
    return (item, index) => {
      if (index === 0)
        return
      return conditionHandle(item, true, false)
    }
  })

  const linkIsActive = computed(() => {
    return (item) => {
      return conditionHandle(item, 'is-active', '')
    }
  })

  const scheduleIsActive = computed(() => {
    return (item) => {
      return conditionHandle(item, 'schedule-active', '')
    }
  })

  const getTabStyle = computed((): CSSProperties => {
    return {
      transform: `translateX(${translateX.value}px)`,
      transition: isScrolling.value ? 'none' : 'transform 0.5s ease-in-out',
    }
  })

  const getContextMenuStyle = computed((): CSSProperties => {
    return { left: `${buttonLeft.value}px`, top: `${buttonTop.value}px` }
  })

  /** 鼠标移入添加激活样式 */
  function onMouseenter(index) {
    if (index)
      activeIndex.value = index
    if (unref(showModel) === 'smart') {
      if (hasClass(instance.refs[`schedule${index}`][0], 'schedule-active'))
        return
      toggleClass(true, 'schedule-in', instance.refs[`schedule${index}`][0])
      toggleClass(false, 'schedule-out', instance.refs[`schedule${index}`][0])
    }
    else {
      if (hasClass(instance.refs[`dynamic${index}`][0], 'is-active'))
        return
      toggleClass(true, 'card-in', instance.refs[`dynamic${index}`][0])
      toggleClass(false, 'card-out', instance.refs[`dynamic${index}`][0])
    }
  }

  /** 鼠标移出恢复默认样式 */
  function onMouseleave(index) {
    activeIndex.value = -1
    if (unref(showModel) === 'smart') {
      if (hasClass(instance.refs[`schedule${index}`][0], 'schedule-active'))
        return
      toggleClass(false, 'schedule-in', instance.refs[`schedule${index}`][0])
      toggleClass(true, 'schedule-out', instance.refs[`schedule${index}`][0])
    }
    else {
      if (hasClass(instance.refs[`dynamic${index}`][0], 'is-active'))
        return
      toggleClass(false, 'card-in', instance.refs[`dynamic${index}`][0])
      toggleClass(true, 'card-out', instance.refs[`dynamic${index}`][0])
    }
  }

  function onContentFullScreen() {
    pureSetting.hiddenSideBar
      ? pureSetting.changeSetting({ key: 'hiddenSideBar', value: false })
      : pureSetting.changeSetting({ key: 'hiddenSideBar', value: true })
  }

  onMounted(() => {
    if (!showModel.value) {
      const configure = storageLocal().getItem<StorageConfigs>(
        `${responsiveStorageNameSpace()}configure`,
      )
      configure.showModel = 'card'
      storageLocal().setItem(
        `${responsiveStorageNameSpace()}configure`,
        configure,
      )
    }
  })

  return {
    Close,
    route,
    router,
    visible,
    showTags,
    instance,
    multiTags,
    showModel,
    tagsViews,
    buttonTop,
    buttonLeft,
    translateX,
    isFixedTag,
    pureSetting,
    activeIndex,
    getTabStyle,
    isScrolling,
    iconIsActive,
    linkIsActive,
    currentSelect,
    scheduleIsActive,
    getContextMenuStyle,
    closeMenu,
    showMenu,
    onMounted,
    onMouseenter,
    onMouseleave,
    onContentFullScreen,
  }
}
