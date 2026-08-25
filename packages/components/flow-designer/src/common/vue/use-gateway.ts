import type { GatewayEmits, GatewayProps } from './gateway-types'

/**
 * 网关节点（Gateway）属性设置面板组合式逻辑。
 *
 * 从原 gateway.vue 抽离：表单状态与变更回传。.vue 仅承担组合 + 模板渲染。
 */
import { ref, watch } from 'vue'

export function useGateway(props: GatewayProps, emit: GatewayEmits) {
  const form = ref(props.modelValue)
  const formRef = ref()
  const nodeInput = ref()

  watch(
    () => form,
    (n) => {
      if (n)
        emit('change', n)
    },
    { deep: true },
  )

  function nodeNameChange() {
    nodeInput.value?.focus?.()
  }

  return {
    form,
    formRef,
    nodeInput,
    nodeNameChange,
  }
}
