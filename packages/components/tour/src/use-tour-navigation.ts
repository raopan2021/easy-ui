import type { TourEmits, TourProps } from './types'
import type { TourPosition } from './use-tour-position'
import type { TourState } from './use-tour-state'

import { nextTick, watch } from 'vue'

/**
 * 引导流程控制：上一步 / 下一步 / 跳转 / 完成 / 关闭 / 遮罩跳过。
 *
 * 同时负责与外部 v-model 的同步：modelValue 变 true 时重置到 startStep 并开始
 * 监听目标元素；变 false 时停止监听并清理定位状态。步骤切换后统一「等两帧」
 * 再定位（第一帧更新内容 DOM，第二帧气泡尺寸稳定），与原实现一致。
 *
 * emit 以 TourEmits 可调用接口直接标注（不使用 EmitFn<>）。
 *
 * @param props 引导组件 props（响应式对象）
 * @param emit 组件事件（update:modelValue / change / finish / close / skip / next / prev）
 * @param state 步骤状态（useTourState 返回值）
 * @param position 定位上下文（useTourPosition 返回值）
 */
export function useTourNavigation(
  props: TourProps,
  emit: TourEmits,
  state: TourState,
  position: TourPosition,
) {
  const { visible, current, total } = state
  const { positionReady, targetRect, updatePosition, startObserving, stopObserving } = position

  /** 下一步 */
  function handleNext() {
    if (current.value < total.value - 1) {
      emit('next', current.value)
      current.value++
      emit('change', current.value)
      positionReady.value = false
      // 等两帧：第一帧更新 DOM（标题/描述变化），第二帧弹窗尺寸稳定后再定位
      nextTick(() => nextTick(() => updatePosition()))
    }
  }

  /** 上一步 */
  function handlePrev() {
    if (current.value > 0) {
      emit('prev', current.value)
      current.value--
      emit('change', current.value)
      positionReady.value = false
      nextTick(() => nextTick(() => updatePosition()))
    }
  }

  /** 完成引导 */
  function handleFinish() {
    visible.value = false
    positionReady.value = false
    stopObserving()
    targetRect.value = null
    emit('update:modelValue', false)
    emit('finish')
  }

  /** 关闭引导 */
  function handleClose() {
    visible.value = false
    positionReady.value = false
    stopObserving()
    targetRect.value = null
    emit('update:modelValue', false)
    emit('close')
  }

  /** 点击遮罩：按配置跳过引导 */
  function onOverlayClick() {
    if (props.closeOnOverlay) {
      visible.value = false
      positionReady.value = false
      stopObserving()
      targetRect.value = null
      emit('update:modelValue', false)
      emit('skip')
    }
  }

  /** 开始引导（命令式调用，同步 v-model） */
  function start(stepIndex = 0) {
    current.value = stepIndex
    visible.value = true
    emit('update:modelValue', true)
    positionReady.value = false
    nextTick(() =>
      nextTick(() => {
        updatePosition()
        startObserving()
      }),
    )
  }

  /** 跳到指定步骤 */
  function goTo(index: number) {
    if (index >= 0 && index < total.value) {
      current.value = index
      emit('change', current.value)
      positionReady.value = false
      nextTick(() => nextTick(() => updatePosition()))
    }
  }

  /** 监听外部 v-model */
  watch(
    () => props.modelValue,
    (val) => {
      visible.value = !!val
      if (val) {
        current.value = Math.min(props.startStep ?? 0, total.value - 1)
        positionReady.value = false
        // 等两帧确保弹窗渲染完成
        nextTick(() =>
          nextTick(() => {
            updatePosition()
            startObserving()
          }),
        )
      }
      else {
        stopObserving()
        positionReady.value = false
        targetRect.value = null
      }
    },
  )

  /** 步骤列表变化时重新定位 */
  watch(
    () => props.steps,
    () => {
      if (visible.value) {
        positionReady.value = false
        nextTick(() => nextTick(() => updatePosition()))
      }
    },
    { deep: true },
  )

  return {
    handleNext,
    handlePrev,
    handleFinish,
    handleClose,
    onOverlayClick,
    start,
    goTo,
  }
}
