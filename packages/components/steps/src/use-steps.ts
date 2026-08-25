import type { ComputedRef } from 'vue'

import type { StepsProps } from './steps'
import type { StepColor } from './use-step-color'
import { computed, provide, ref } from 'vue'
import { buildStepColorVars } from './use-step-color'

/** provide / inject key：步骤条上下文（steps → step 单向下发） */
export const STEPS_CONTEXT_KEY = 'easy-steps'

/** provide / inject key：子步骤计数（step 挂载时自增，用于判定最后一个步骤） */
export const STEPS_COUNT_KEY = 'easy-steps-count'

/** 步骤条上下文数据（由 steps 下发给任意层级的 step） */
export interface StepsContext {
  /** 当前激活步骤索引（从 0 开始） */
  active: number
  /** 排列方向 */
  direction: string
  /** 已完成步骤的状态 */
  finishStatus: string
  /** 当前步骤的状态 */
  processStatus: string
  /** 是否居中对齐 */
  alignCenter: boolean
  /** 子步骤总数 */
  stepCount: number
  /** 自定义状态颜色 */
  color?: StepColor
}

/** 步骤条上下文的响应式引用类型（inject 侧使用） */
export type StepsContextRef = ComputedRef<StepsContext>

/**
 * 步骤条核心逻辑：子步骤计数、自定义配色、上下文下发。
 *
 * 将原本内联在 steps.vue 中的 `provide` 与颜色变量计算抽离为独立 composable，
 * 让 .vue 仅承担「组合 + 模板」职责（对齐 markdown / progress 拆分规范）。
 * 行为与原实现完全一致。
 *
 * 注意：内部调用了 `provide`，因此必须在组件 setup 同步阶段调用。
 *
 * @param props 步骤条 props（响应式对象，computed 会自动追踪依赖）
 */
export function useSteps(props: StepsProps) {
  /** 子步骤总数（由 step 在挂载 / 卸载时自增自减） */
  const stepCount = ref(0)

  /** 自定义配色对应的 CSS 变量行内样式 */
  const customColorsStyle = computed(() => buildStepColorVars(props.color))

  provide(
    STEPS_CONTEXT_KEY,
    computed<StepsContext>(() => ({
      active: props.active,
      direction: props.direction,
      finishStatus: props.finishStatus,
      processStatus: props.processStatus,
      alignCenter: props.alignCenter,
      stepCount: stepCount.value,
      color: props.color,
    })),
  )

  provide(STEPS_COUNT_KEY, stepCount)

  return {
    stepCount,
    customColorsStyle,
  }
}
