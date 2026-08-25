import type { LoadingEmits, LoadingResolvedProps } from './types'

import { onMounted, onUnmounted, ref, watch } from 'vue'

/**
 * Loading 可见性与滚动锁逻辑。
 *
 * 将原本内联在 loading.vue 中的 `visible` 状态、滚动锁（`lock`/`unlock`）、
 * `modelValue` ↔ `visible` 双向同步 watch，以及 `onMounted`/`onUnmounted`
 * 生命周期抽离为独立 composable，让 .vue 仅承担「组合 + 模板」职责。
 *
 * - 外部修改 `modelValue` 时同步内部 `visible` 并切换滚动锁；
 * - 内部 `visible` 变化时反向 emit `update:modelValue`，保证 v-model 双向绑定。
 *
 * @param props Loading props（需传入响应式对象，已应用默认值）
 * @param emit  Loading 事件触发函数（类型直接为 `LoadingEmits` callable interface）
 */
export function useLoadingVisibility(props: LoadingResolvedProps, emit: LoadingEmits) {
  /** 内部可见状态（由 modelValue 初始化，关闭时由 visible watch 反向同步） */
  const visible = ref(props.modelValue)

  /** 锁滚动前记录的 body 原始 overflow，用于解锁时还原 */
  const bodyOverflow = ref('')

  /** 锁定滚动（仅 fullscreen + lock 时生效） */
  function lockScroll() {
    if (props.lock && props.fullscreen) {
      bodyOverflow.value = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
  }

  /** 解锁滚动（仅 fullscreen + lock 时生效） */
  function unlockScroll() {
    if (props.lock && props.fullscreen) {
      document.body.style.overflow = bodyOverflow.value
    }
  }

  // 外部 v-model 同步到内部 visible
  watch(
    () => props.modelValue,
    (val) => {
      visible.value = val
      if (val) {
        lockScroll()
      }
      else {
        unlockScroll()
      }
    },
  )

  // 内部 visible 变化反向同步 v-model
  watch(visible, (val) => {
    emit('update:modelValue', val)
    if (val) {
      lockScroll()
    }
    else {
      unlockScroll()
    }
  })

  // 挂载时若已显示则立即锁滚动
  onMounted(() => {
    if (props.modelValue) {
      lockScroll()
    }
  })

  // 卸载时解锁，避免残留 body overflow:hidden
  onUnmounted(() => {
    unlockScroll()
  })

  return {
    visible,
    lockScroll,
    unlockScroll,
  }
}
