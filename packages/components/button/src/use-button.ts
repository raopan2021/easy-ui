import type { ButtonEmits, ButtonProps } from './button'

import { computed } from 'vue'

/**
 * 按钮类名派生与点击逻辑。
 *
 * 将原本内联在 button.vue 中的 computed（buttonClass）与 handleClick 抽离为独立
 * composable，让 .vue 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 * emit 以 ButtonEmits 可调用接口直接标注（不使用 EmitFn<>）。
 *
 * @param props 按钮 props
 * @param emit 按钮事件（click），直接以 ButtonEmits 可调用接口类型标注
 */
export function useButton(props: ButtonProps, emit: ButtonEmits) {
  /** 根节点组合类名（类型 / 尺寸 / 形状 / 状态） */
  const buttonClass = computed(() => [
    `easy-button--${props.type}`,
    `easy-button--${props.size}`,
    `easy-button--${props.shape}`,
    {
      'is-loading': props.loading,
      'is-disabled': props.disabled,
      'is-bold': props.bold,
      'is-link': props.link,
    },
  ])

  /** 点击处理：禁用或加载中时拦截，否则回传原生 MouseEvent */
  function handleClick(event: MouseEvent) {
    if (props.disabled || props.loading)
      return
    emit('click', event)
  }

  return {
    buttonClass,
    handleClick,
  }
}
