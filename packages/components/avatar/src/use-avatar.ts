import type { AvatarEmits, AvatarProps } from './avatar'

import { computed, ref } from 'vue'

/**
 * 头像展示与事件逻辑：根节点类名 / 行内样式、点击与图片加载失败处理。
 *
 * 将原本内联在 avatar.vue 中的状态与计算属性抽离为独立 composable，
 * 让 .vue 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 *
 * @param props 头像组件 props（响应式对象，computed 会自动追踪依赖）
 * @param emit  头像组件事件触发函数（callable 形式，直接标注 AvatarEmits 类型）
 */
export function useAvatar(props: AvatarProps, emit: AvatarEmits) {
  /** 图片是否加载出错（出错后回退到 icon / 文字） */
  const hasLoadError = ref(false)
  /** 是否展示文字兜底（保留原 props 行为，默认 false） */
  const isShowText = ref(false)

  /** 根节点组合类名：尺寸 / 形状 / 自定义 class */
  const avatarClass = computed(() => [
    `easy-avatar--${props.size ?? 'default'}`,
    `easy-avatar--${props.shape ?? 'circle'}`,
    props.customClass,
  ])

  /** 根节点行内样式：尺寸 / 背景色 / 图片填充模式 */
  const avatarStyle = computed(() => {
    const style: Record<string, string> = {}

    // 数值尺寸：设置为具体 px，字号取一半
    if (typeof props.size === 'number') {
      style.width = `${props.size}px`
      style.height = `${props.size}px`
      style.fontSize = `${props.size / 2}px`
    }
    // 非常规字符串尺寸：按自定义长度处理（small/default/large 已由 CSS class 控制）
    else if (typeof props.size === 'string' && !['small', 'default', 'large'].includes(props.size)) {
      style.width = props.size
      style.height = props.size
    }

    // 背景色（无图片时生效）
    if (props.color) {
      style.backgroundColor = props.color
    }

    // 图片填充模式
    style.objectFit = props.fit ?? 'cover'

    return style
  })

  /** 点击头像，向上 emit click 事件 */
  function handleClick(e: MouseEvent) {
    emit('click', e)
  }

  /** 图片加载失败：标记错误并向上 emit error 事件 */
  function handleError(e: Event) {
    hasLoadError.value = true
    emit('error', e)
  }

  return {
    hasLoadError,
    isShowText,
    avatarClass,
    avatarStyle,
    handleClick,
    handleError,
  }
}
