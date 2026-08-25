import type { ModalEmits, ModalProps } from './types'

import { ref, watch } from 'vue'

/**
 * 弹窗交互与生命周期事件。
 *
 * 将原 modal.vue 中的确认 / 取消 / 关闭事件派发、打开时的 `open`/`opened`
 * 事件，以及 ESC 快捷键关闭监听抽离为独立 composable。
 *
 * - `handleClose`：派发 `update:modelValue(false)` 与 `close`。
 * - `handleConfirm` / `handleCancel`：派发对应业务事件。
 * - 打开时派发 `open`，并在下一帧派发 `opened`（确保 DOM 已渲染）。
 * - ESC 监听在打开时挂载，关闭后自动移除并派发 `afterClose`。
 *
 * @param props 弹窗 props（需响应式，用于读取 modelValue / closeOnClickModal）
 * @param emit  弹窗事件发射器（类型为 ModalEmits）
 */
export function useModalActions(props: ModalProps, emit: ModalEmits) {
  /** 弹窗根节点 ref（供外部 / 模板引用） */
  const modalRef = ref<HTMLDivElement>()

  /** 关闭弹窗：同步 v-model 并派发 close */
  function handleClose() {
    emit('update:modelValue', false)
    emit('close')
  }

  /** 点击遮罩：仅当 closeOnClickModal 为 true 时关闭 */
  function handleMaskClick() {
    if (props.closeOnClickModal) {
      handleClose()
    }
  }

  /** 确认按钮：派发 confirm */
  function handleConfirm() {
    emit('confirm')
  }

  /** 取消按钮：先关闭再派发 cancel */
  function handleCancel() {
    handleClose()
    emit('cancel')
  }

  // 打开事件：visible 变 true 时派发 open，下一帧派发 opened
  watch(
    () => props.modelValue,
    (val) => {
      if (val) {
        emit('open')
        // 等 DOM 渲染完后触发 opened
        requestAnimationFrame(() => {
          emit('opened')
        })
      }
    },
  )

  // ESC 关闭：打开时挂载监听器，关闭后移除并派发 afterClose
  watch(
    () => props.modelValue,
    (val) => {
      if (!val)
        return
      const handler = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && props.modelValue) {
          handleClose()
        }
      }
      window.addEventListener('keydown', handler)
      // 关闭后移除
      watch(
        () => props.modelValue,
        (v) => {
          if (!v) {
            window.removeEventListener('keydown', handler)
            emit('afterClose')
          }
        },
        { once: true },
      )
    },
  )

  return {
    modalRef,
    handleClose,
    handleMaskClick,
    handleConfirm,
    handleCancel,
  }
}
