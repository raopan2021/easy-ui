import type { RateEmits, RateProps } from './rate'

import { computed, ref } from 'vue'

/**
 * 评分交互逻辑：hover 预览、半星判定、点击选中 / 取消。
 *
 * 将原本内联在 rate.vue 中的状态与事件处理抽离为独立 composable，
 * 让 .vue 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 *
 * @param props 评分组件 props（响应式对象，computed 会自动追踪依赖）
 * @param emit  评分组件事件触发函数（callable 形式，直接标注 RateEmits 类型）
 */
export function useRate(props: RateProps, emit: RateEmits) {
  /** hover 临时值（0 表示鼠标未悬停在当前星星上） */
  const hoverValue = ref(0)

  /** 当前展示值：hover 优先，否则回退到绑定值（modelValue 缺省兜底 0） */
  const displayValue = computed(() => hoverValue.value || (props.modelValue ?? 0))

  /** 辅助文字：texts 优先，其次为纯数字；两者皆无则空串 */
  const displayText = computed(() => {
    const idx = displayValue.value
    if (props.texts?.length) {
      return props.texts[Math.round(idx) - 1] || ''
    }
    if (props.showText)
      return `${idx}`
    return ''
  })

  /** 根据鼠标在星星内的水平位置判断半选值（左半边取半星，右半边取整星） */
  function getHalfValue(index: number, e: MouseEvent): number {
    if (!props.allowHalf)
      return index
    const el = e.currentTarget as HTMLElement
    const rect = el.getBoundingClientRect()
    return e.clientX - rect.left <= rect.width / 2 ? index - 0.5 : index
  }

  /** 鼠标进入星星：更新 hover 预览值（禁用态忽略） */
  function handleHover(index: number, e: MouseEvent) {
    if (props.disabled)
      return
    hoverValue.value = getHalfValue(index, e)
  }

  /** 鼠标在星星内移动：仅 allowHalf 时实时更新预览值 */
  function handleMouseMove(index: number, e: MouseEvent) {
    if (props.disabled || !props.allowHalf)
      return
    hoverValue.value = getHalfValue(index, e)
  }

  /** 鼠标离开：清空 hover 预览 */
  function handleLeave() {
    hoverValue.value = 0
  }

  /** 点击星星：计算目标值并 emit；点击已选中的值则取消（置 0） */
  function handleClick(index: number, e: MouseEvent) {
    if (props.disabled)
      return
    const value = getHalfValue(index, e)

    if (value === props.modelValue) {
      emit('update:modelValue', 0)
      emit('change', 0)
    }
    else {
      emit('update:modelValue', value)
      emit('change', value)
    }
  }

  return {
    displayValue,
    displayText,
    handleHover,
    handleMouseMove,
    handleLeave,
    handleClick,
  }
}
