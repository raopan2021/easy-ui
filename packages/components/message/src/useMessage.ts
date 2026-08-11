import type { Ref } from 'vue'
import type { MessageOptions } from './message'
import type EasyMessage from './message.vue'
import { ref } from 'vue'

export type { MessageOptions }

export function useMessage() {
  const messageRef = ref<InstanceType<typeof EasyMessage> | null>(null)

  function success(message: string, opts?: Omit<MessageOptions, 'message' | 'type'>) {
    messageRef.value?.success(message, opts)
  }

  function warning(message: string, opts?: Omit<MessageOptions, 'message' | 'type'>) {
    messageRef.value?.warning(message, opts)
  }

  function danger(message: string, opts?: Omit<MessageOptions, 'message' | 'type'>) {
    messageRef.value?.danger(message, opts)
  }

  function info(message: string, opts?: Omit<MessageOptions, 'message' | 'type'>) {
    messageRef.value?.info(message, opts)
  }

  function text(message: string, opts?: Omit<MessageOptions, 'message' | 'type'>) {
    messageRef.value?.text(message, opts)
  }

  function closeAll() {
    messageRef.value?.closeAll()
  }

  return {
    messageRef: messageRef as Ref<InstanceType<typeof EasyMessage> | null>,
    success,
    warning,
    danger,
    info,
    text,
    closeAll,
  }
}
