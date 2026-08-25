import type { EmitFn } from 'vue'

import type { StatisticEmits, StatisticProps } from './types'
import { computed, onMounted, ref, watch } from 'vue'

/**
 * 千分位格式化（含小数位补零）。
 *
 * - NaN 统一降级为 '0'，避免模板出现 "NaN"；
 * - 按 precision 做四舍五入，再对整数部分插入千分位分隔符；
 * - 存在小数部分时用 0 补齐到 precision 位（如 precision=2 时 3.1 → 3.10）。
 *
 * @param num 待格式化的数值
 * @param precision 保留小数位数，默认 0
 */
function formatNumber(num: number, precision: number = 0): string {
  // 等价于原实现的全局 isNaN(num)：先转数字再判断，非数字入参同样降级为 '0'
  if (Number.isNaN(Number(num)))
    return '0'

  const factor = 10 ** precision
  const rounded = Math.round(num * factor) / factor
  const [integerPart, decimalPart] = rounded.toString().split('.')

  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',')

  if (decimalPart) {
    const paddedDecimal = decimalPart.padEnd(precision, '0')
    return `${formattedInteger}.${paddedDecimal}`
  }

  return formattedInteger
}

/**
 * 统计数值核心逻辑：展示值格式化 + 数值增长动画。
 *
 * 将原本内联在 statistic.vue 中的 formatNumber / formattedValue / startAnimate
 * 及其生命周期（onMounted 首次播放、watch value 重播）抽离为独立 composable，
 * 便于单测复用，并让 .vue 仅承担「组合 + 模板」职责
 * （对齐 markdown / progress 拆分规范）。行为与原实现完全一致。
 *
 * @param props 统计数值 props（响应式对象，computed 会自动追踪依赖）
 * @param emit 统计数值事件发射器（由 defineEmits 返回）
 */
export function useStatistic(props: StatisticProps, emit: EmitFn<StatisticEmits>) {
  /** 动画过程中的中间值（仅 animated 且 value 为 number 时被写入） */
  const animatedValue = ref(0)

  /**
   * 模板实际展示的值：
   * - string 类型 value 原样输出（如 '99.99%'），不做任何格式化；
   * - 开启动画时展示动画中间值；否则直接格式化目标值。
   */
  const formattedValue = computed(() => {
    if (typeof props.value === 'string') {
      return props.value
    }

    if (props.animated) {
      return formatNumber(animatedValue.value, props.precision)
    }

    return formatNumber(props.value, props.precision)
  })

  /**
   * 启动数值增长动画：从 0 递增到目标值。
   *
   * 使用 requestAnimationFrame 逐帧推进，配合指数缓出（ease-out expo）
   * 让末段趋于平缓；进度满 1 时派发 animationComplete。
   * 未开启 animated 或 value 非数字时直接返回（不产生任何副作用）。
   */
  function startAnimate() {
    if (!props.animated || typeof props.value !== 'number')
      return
    const startTime = Date.now()
    const startValue = 0
    const endValue = props.value

    const animate = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / props.animationDuration!, 1)

      // 缓动函数
      const easeProgress = progress === 1 ? 1 : 1 - 2 ** (-10 * progress)
      animatedValue.value = startValue + (endValue - startValue) * easeProgress

      if (progress < 1) {
        requestAnimationFrame(animate)
      }
      else {
        emit('animationComplete')
      }
    }

    requestAnimationFrame(animate)
  }

  // 挂载后播放首次增长动画
  onMounted(startAnimate)

  // 监听数值变化：数值型 + 开启动画时归零并重新播放
  watch(
    () => props.value,
    (newVal) => {
      if (props.animated && typeof newVal === 'number') {
        animatedValue.value = 0
        startAnimate()
      }
    },
  )

  return { animatedValue, formattedValue, startAnimate }
}
