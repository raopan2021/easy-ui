import type { MsgBoxInstance } from './msgbox'

import { computed, nextTick, ref, watch } from 'vue'

/**
 * MsgBox 视图层交互逻辑。
 *
 * 将原 msgbox.vue 中的输入框自动聚焦、头部图标显隐、遮罩 / Esc / 关闭 /
 * 取消 / 确认 事件处理，以及输入内容变化清除错误提示等逻辑抽离为独立 composable。
 *
 * 全局状态 `msgboxState`（来自 ./msgbox）承载 visible / options / inputValue
 * 等数据，本 composable 只做视图层编排，不负责对外服务 API（alert/confirm/prompt）。
 *
 * @param state 全局 MsgBox 响应式状态（MsgBoxInstance）
 */
export function useMsgbox(state: MsgBoxInstance) {
  /** 输入框 ref（prompt 模式自动聚焦用） */
  const inputRef = ref<HTMLInputElement | HTMLTextAreaElement | null>(null)

  // 输入框出现时自动聚焦
  watch(
    () => state.visible,
    async (v) => {
      if (v && state.options.showInput) {
        await nextTick()
        inputRef.value?.focus()
      }
    },
  )

  // 是否显示头部图标（有 type 才显示）
  const showIcon = computed(() => !!state.options.type)

  /** 点击遮罩：仅当 closeOnClickModal 为 true 时关闭 */
  function handleOverlayClick() {
    if (state.options.closeOnClickModal) {
      handleClose()
    }
  }

  /** 按下 Esc：未显式关闭时关闭弹框 */
  function handleEsc() {
    if (state.options.closeOnPressEscape !== false) {
      handleClose()
    }
  }

  /**
   * 关闭弹框。
   * distinguishCancelAndClose 为 true 时作为 'close' 动作，
   * 否则统一作为 'cancel' 动作（对齐 Element Plus 行为）。
   */
  function handleClose() {
    if (state.options.distinguishCancelAndClose) {
      state._reject('close')
      state.options.onCancel?.()
    }
    else {
      state._reject('cancel')
      state.options.onCancel?.()
    }
  }

  /** 取消按钮：作为 'cancel' 动作关闭 */
  function handleCancel() {
    state._reject('cancel')
    state.options.onCancel?.()
  }

  /**
   * 确认按钮：prompt 模式下先做输入校验（正则 + 非空），
   * 校验通过后再派发 onConfirm 回调并 resolve('confirm', value)。
   */
  async function handleConfirm() {
    // Prompt 模式校验
    if (state.options.showInput) {
      const pattern = state.options.input?.pattern
      if (pattern) {
        const reg = new RegExp(pattern)
        if (!reg.test(state.inputValue)) {
          state.inputError = state.options.input?.patternMessage || '输入内容不符合要求'
          return
        }
      }
      if (!state.inputValue.trim() && state.options.input?.inputType !== 'number') {
        state.inputError = '请输入内容'
        return
      }
    }

    state.inputError = ''
    state.options.onConfirm?.(state.inputValue)
    state._resolve('confirm', state.inputValue)
  }

  // 输入内容变化时清除错误提示
  watch(
    () => state.inputValue,
    () => {
      if (state.inputError)
        state.inputError = ''
    },
  )

  return {
    inputRef,
    showIcon,
    handleOverlayClick,
    handleEsc,
    handleClose,
    handleCancel,
    handleConfirm,
  }
}
