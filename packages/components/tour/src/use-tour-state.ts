import type { TourProps } from './types'

import { computed, ref } from 'vue'

/**
 * 引导步骤状态：显隐、当前步骤索引及其派生信息。
 *
 * 将原本内联在 tour.vue 中的基础状态抽离为独立 composable，作为位置计算、
 * 导航控制与样式派生的共享数据源（对齐 markdown / progress 拆分规范）。
 *
 * @param props 引导组件 props（响应式对象）
 */
export function useTourState(props: TourProps) {
  /** 引导是否可见（内部状态，与 v-model 双向同步） */
  const visible = ref(false)
  /** 当前步骤索引（0-indexed） */
  const current = ref(props.startStep ?? 0)

  /** 步骤总数 */
  const total = computed(() => props.steps?.length ?? 0)
  /** 当前步骤配置 */
  const currentStep = computed(() => props.steps?.[current.value] || null)
  /** 是否最后一步 */
  const isLast = computed(() => current.value >= total.value - 1)
  /** 是否第一步 */
  const isFirst = computed(() => current.value === 0)

  return {
    visible,
    current,
    total,
    currentStep,
    isLast,
    isFirst,
  }
}

/** 引导步骤状态上下文（供其余 composable 复用） */
export type TourState = ReturnType<typeof useTourState>
