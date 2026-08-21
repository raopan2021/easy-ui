import { nextTick } from 'vue'

/**
 * 表单校验失败时，自动滚动到第一个报错项
 *
 * @example
 * ```ts
 * const { scrollToFirstError } = useScrollToError();
 *
 * async function submit() {
 *   const valid = await formRef.value?.validate().catch(() => false);
 *   if (!valid) {
 *     await scrollToFirstError();
 *     return;
 *   }
 *   // ...提交逻辑
 * }
 * ```
 */
export function useScrollToError() {
  function scrollToFirstError(): Promise<void> {
    // 取消当前焦点元素的 focus，触发 blur 后表单验证 class 才会正确更新
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur()
    }

    // 返回 Promise，确保 await 能正确等待 DOM 更新完成
    return new Promise((resolve) => {
      // 等待 Vue 响应式更新（errorMessage 变化 → v-if 渲染 → Transition 动画）
      setTimeout(async () => {
        await nextTick()

        // 先找第一个错误消息元素（更精确指向报错文字区域）
        const errorEl: HTMLElement | null = document.querySelector('.easy-form-item__error')
        if (errorEl) {
          const formItem = errorEl.closest('.easy-form-item');
          (formItem || errorEl).scrollIntoView({ behavior: 'smooth', block: 'center' })
          resolve()
          return
        }

        // 兜底：找第一个带 is-error 的 easy-form-item
        const firstErrorItem: HTMLElement | null = document.querySelector('.easy-form-item.is-error')
        if (firstErrorItem) {
          firstErrorItem.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }

        resolve()
      }, 150)
    })
  }

  return { scrollToFirstError }
}
