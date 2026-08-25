import type { EndProps } from './end-types'

/**
 * 结束节点（End）属性设置面板组合式逻辑。
 *
 * 从原 end.vue 抽离：表单状态（节点编码）。.vue 仅承担组合 + 模板渲染。
 */
import { ref } from 'vue'

export function useEnd(props: EndProps) {
  const form = ref(props.modelValue)
  const formRef = ref()

  return {
    form,
    formRef,
  }
}
