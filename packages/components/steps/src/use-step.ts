import type { Ref } from 'vue'

import type { StepProps } from './step'
import type { StepsContextRef } from './use-steps'
import { computed, inject, onMounted, onUnmounted } from 'vue'
import { buildStepColorVars } from './use-step-color'
import { STEPS_CONTEXT_KEY, STEPS_COUNT_KEY } from './use-steps'

/**
 * 单个步骤的核心逻辑：注入父级上下文、注册计数、派生状态与配色。
 *
 * 将原本内联在 step.vue 中的 `inject`、计数注册、状态推导与颜色变量计算抽离为
 * 独立 composable，让 .vue 仅承担「组合 + 模板」职责（对齐 markdown / progress
 * 拆分规范）。行为与原实现完全一致。
 *
 * 注意：内部调用了 `inject` 与生命周期钩子，必须在组件 setup 同步阶段调用。
 *
 * @param props 步骤 props（响应式对象，computed 会自动追踪依赖）
 */
export function useStep(props: StepProps) {
  /** 父级步骤条上下文（脱离 EasySteps 单独使用时为 undefined） */
  const stepsInfo = inject<StepsContextRef>(STEPS_CONTEXT_KEY)

  /** 上下文快照，模板与下方计算统一从此处取值 */
  const stepsData = computed(() => stepsInfo?.value)

  /** 父级维护的子步骤计数 */
  const stepCount = inject<Ref<number>>(STEPS_COUNT_KEY)

  /** 步骤自定义配色对应的 CSS 变量行内样式（继承父级 color 配置） */
  const stepStyle = computed(() => buildStepColorVars(stepsData.value?.color))

  // 注册到父组件
  onMounted(() => {
    if (stepCount) {
      stepCount.value++
    }
  })

  onUnmounted(() => {
    if (stepCount) {
      stepCount.value--
    }
  })

  /** 当前步骤索引（未显式传入时回退为 0） */
  const index = computed(() => props.index ?? 0)

  /** 是否为最后一个步骤（最后一个不渲染连接线） */
  const isLast = computed(() => {
    return stepsData.value ? index.value === stepsData.value.stepCount - 1 : false
  })

  /**
   * 当前步骤状态。
   *
   * 优先级：手动指定的 `status` > 依据 `active` 推导
   * （索引小于 active → finishStatus；等于 active → processStatus；否则 wait）。
   */
  const currentStatus = computed(() => {
    if (props.status)
      return props.status
    if (!stepsData.value)
      return 'wait'
    const { active, finishStatus, processStatus } = stepsData.value
    if (index.value < active)
      return finishStatus
    if (index.value === active)
      return processStatus
    return 'wait'
  })

  /** 连接线状态：仅已完成的步骤（索引小于 active）显示完成态进度 */
  const lineStatus = computed(() => {
    if (!stepsData.value)
      return 'wait'
    const { active, finishStatus } = stepsData.value
    if (index.value < active)
      return finishStatus
    return 'wait'
  })

  return {
    stepsData,
    stepStyle,
    index,
    isLast,
    currentStatus,
    lineStatus,
  }
}
