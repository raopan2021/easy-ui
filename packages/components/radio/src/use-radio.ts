import type { RadioEmits, RadioGroupContext, RadioProps } from './radio'

import { computed, inject } from 'vue'
import { RADIO_GROUP_KEY } from './radio'

/**
 * Radio 选中逻辑：与 RadioGroup 联动（优先读取组值/禁用），
 * 并封装选中时的 emit（组内走 changeEvent，独立使用走 emit）。
 *
 * 注意：模板中 `size` 仍直接取自 props（与改造前一致，组尺寸不向下传递），
 * 故此处不处理 size，保持行为完全不变。
 *
 * @param props Radio props
 * @param emit  Radio 事件（callable 形式，与 RadioEmits 一致）
 */
export function useRadio(props: RadioProps, emit: RadioEmits) {
  /** 注入 RadioGroup 上下文（非组内使用时为 null） */
  const radioGroup = inject<RadioGroupContext | null>(RADIO_GROUP_KEY, null)

  /** 组绑定值（无组时为 undefined） */
  const groupValue = computed(() => radioGroup?.modelValue.value)

  /** 组禁用状态（与自身 disabled 做或运算） */
  const groupDisabled = computed(() => radioGroup?.disabled.value ?? false)

  /** 实际禁用态 = 自身 disabled || 组 disabled */
  const isActuallyDisabled = computed(() => props.disabled || groupDisabled.value)

  /** 是否选中：组内比较组值，否则比较自身 modelValue */
  const isChecked = computed(() => {
    const val = radioGroup ? groupValue.value : props.modelValue
    return val === props.label
  })

  /** 选中处理：组内走 changeEvent，独立使用走 emit */
  function select() {
    if (isActuallyDisabled.value)
      return
    const val = props.label as string | number | boolean
    if (radioGroup) {
      radioGroup.changeEvent(val)
    }
    else {
      emit('update:modelValue', val)
      emit('change', val)
    }
  }

  return {
    isActuallyDisabled,
    isChecked,
    select,
  }
}
