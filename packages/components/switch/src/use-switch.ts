import type { SwitchEmits, SwitchProps } from './switch'

import { computed } from 'vue'

/**
 * 开关交互逻辑：根据绑定值判断是否选中，点击切换 active / inactive 并 emit 新值。
 *
 * 将原本内联在 switch.vue 中的计算属性与事件处理抽离为独立 composable，
 * 让 .vue 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 *
 * @param props 开关组件 props（响应式对象，computed 会自动追踪依赖）
 * @param emit  开关组件事件触发函数（callable 形式，直接标注 SwitchEmits 类型）
 */
export function useSwitch(props: SwitchProps, emit: SwitchEmits) {
  /** 当前是否选中（绑定值 === activeValue） */
  const isChecked = computed(() => props.modelValue === props.activeValue)

  /** 点击切换选中态：禁用 / 加载中忽略，否则在 active / inactive 间切换并对外 emit */
  function handleClick() {
    if (props.disabled || props.loading)
      return

    const newValue = isChecked.value ? (props.inactiveValue ?? false) : (props.activeValue ?? true)
    emit('update:modelValue', newValue)
    emit('change', newValue)
  }

  return {
    isChecked,
    handleClick,
  }
}
