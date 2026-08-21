/**
 * 通用异步加载 Hook
 *
 * 自动管理 loading 状态；支持在组件卸载时取消请求，避免在已卸载组件上 setState。
 *
 * @example
 * ```ts
 * const { loading, run } = useAsync();
 * const data = await run(() => api.getList());
 * ```
 */
export function useAsync() {
  const loading: Ref<boolean> = ref(false)
  /** 组件是否已卸载 */
  let disposed = false

  onUnmounted(() => {
    disposed = true
  })

  /**
   * 包裹一个异步函数，自动切换 loading，并在卸载后丢弃结果
   */
  async function run<T>(fn: () => Promise<T>): Promise<T | undefined> {
    loading.value = true
    try {
      const result = await fn()
      if (disposed)
        return undefined
      return result
    }
    finally {
      if (!disposed)
        loading.value = false
    }
  }

  return { loading, run }
}
