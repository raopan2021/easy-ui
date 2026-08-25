import type { SkipProps } from './skip-types'

/**
 * 跳转边（Skip）属性设置面板组合式逻辑。
 *
 * 从原 skip.vue 抽离：条件拼接逻辑、spel 标识切换。.vue 仅承担组合 + 模板渲染。
 */
import { ref, watch } from 'vue'

export function useSkip(props: SkipProps) {
  const spelFlag = ref(false)
  const form = ref(props.modelValue)
  const formRef = ref()

  const conditionTypeOptions = [
    { label: '默认', value: 'default' },
    { label: 'spel', value: 'spel' },
    { label: '大于', value: 'gt' },
    { label: '大于等于', value: 'ge' },
    { label: '等于', value: 'eq' },
    { label: '不等于', value: 'ne' },
    { label: '小于', value: 'lt' },
    { label: '小于等于', value: 'le' },
    { label: '包含', value: 'like' },
    { label: '不包含', value: 'notLike' },
  ]

  watch(
    () => form,
    (n) => {
      const v = n.value
      if (v.conditionType) {
        let skipCondition = `${v.conditionType}@@`
        if (!v.conditionType.startsWith('spel') && !v.conditionType.startsWith('default')) {
          skipCondition = `${skipCondition + (v.condition ? v.condition : '')}|`
        }
        v.skipCondition = skipCondition + (v.conditionValue ? v.conditionValue : '')
      }
    },
    { deep: true },
  )

  function changeOper(obj: string) {
    spelFlag.value = obj === 'spel' || obj === 'default'
  }

  if (props.modelValue?.conditionType === 'spel' || props.modelValue?.conditionType === 'default') {
    spelFlag.value = true
  }

  return {
    spelFlag,
    form,
    formRef,
    conditionTypeOptions,
    changeOper,
  }
}
