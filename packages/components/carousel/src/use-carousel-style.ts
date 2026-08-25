import type { CarouselResolvedProps } from './types'

import type { CarouselNavigation } from './use-carousel-navigation'
import { computed } from 'vue'

/**
 * 轮播展示层派生：过渡动画名、标题文本、容器高度与 3D 变换样式。
 *
 * 将原本内联在 carousel.vue 中的展示类 computed 与 getItem3dStyle 抽离为独立
 * composable（对齐 markdown / progress 拆分规范），均为纯派生、无副作用。
 * 行为与原实现完全一致。
 *
 * @param props 轮播组件 props（withDefaults 填充后的响应式对象）
 * @param navigation 索引状态机（useCarouselNavigation 返回值，提供 currentIndex / slideDirection）
 */
export function useCarouselStyle(props: CarouselResolvedProps, navigation: CarouselNavigation) {
  const { currentIndex, slideDirection } = navigation

  /**
   * 当前生效的过渡动画名。
   *
   * 垂直方向使用 `easy-slide-v-*` 前缀，水平方向使用 `easy-slide-*`，
   * 再按本次切换方向拼接 forward / backward 后缀。
   */
  const transitionName = computed(() => {
    const prefix = props.direction === 'vertical' ? 'easy-slide-v' : 'easy-slide'
    return slideDirection.value === 'forward' ? `${prefix}-forward` : `${prefix}-backward`
  })

  /** 当前标题文本（items 为字符串数组时无标题，对象数组时取 titleField 字段） */
  const currentTitle = computed(() => {
    const item = props.items[currentIndex.value]
    if (typeof item === 'string')
      return ''
    return ((item as Record<string, unknown>)[props.titleField] as string) || ''
  })

  /** 容器自定义高度样式（未传 height 时返回 undefined，交由 CSS 默认高度接管） */
  const containerStyle = computed(() => {
    if (!props.height)
      return undefined
    const val = typeof props.height === 'number' ? `${props.height}px` : props.height
    return { height: val }
  })

  /** 3D 模式轨道样式（轨道本身不旋转，透视由各 item 自行变换实现） */
  const track3dStyle = computed(() => ({
    transform: `rotateY(0deg)`,
  }))

  /**
   * 计算 3D 模式下单个 item 的变换样式。
   *
   * 先把索引换算为相对当前项的偏移量（超过半程时回绕，保证首尾相邻项也在视觉两侧），
   * 再按偏移量线性推导横向位移、Y 轴旋转、透明度、层级与缩放：
   * 偏移越大越靠边、越透明、越小，层级越低。
   *
   * @param index 目标 item 在 items 中的索引
   */
  function getItem3dStyle(index: number) {
    const len = props.items.length
    const current = currentIndex.value

    // 计算相对位置（考虑循环）
    let offset = index - current
    if (offset > Math.floor(len / 2))
      offset -= len
    if (offset < -Math.floor(len / 2))
      offset += len

    const translateZ = 0
    const translateX = offset * 65
    const rotateY = -offset * 25
    const opacity = offset === 0 ? 1 : Math.max(0.3, 1 - Math.abs(offset) * 0.3)
    const zIndex = len - Math.abs(offset)
    const scale = offset === 0 ? 1 : Math.max(0.75, 1 - Math.abs(offset) * 0.1)

    return {
      transform: `translateX(${translateX}%) rotateY(${rotateY}deg) translateZ(${translateZ}px) scale(${scale})`,
      opacity,
      zIndex,
    }
  }

  return {
    transitionName,
    currentTitle,
    containerStyle,
    track3dStyle,
    getItem3dStyle,
  }
}

/** 轮播展示层上下文 */
export type CarouselStyle = ReturnType<typeof useCarouselStyle>
