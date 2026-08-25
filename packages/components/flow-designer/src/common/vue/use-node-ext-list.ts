import type { NodeExtListProps } from './node-ext-list-types'

/**
 * 节点扩展属性（NodeExtList）面板组合式逻辑。
 *
 * 从原 nodeExtList.vue 抽离：表单状态与必填校验。.vue 仅承担组合 + 模板渲染。
 */
import { ref } from 'vue'

export function useNodeExtList(props: NodeExtListProps) {
  const form = ref(props.modelValue)
  const nodeExtRef = ref()

  // 表单必填校验
  async function validate() {
    let isValid: boolean | null = null
    await nodeExtRef.value?.validate((valid: boolean) => {
      isValid = valid
    })
    return isValid
  }

  return {
    form,
    nodeExtRef,
    validate,
  }
}
