import type { InputProps } from './input'

import { computed } from 'vue'

/** sanitizeValue 的修正结果 */
export interface InputSanitizeResult {
  /** 修正后的输入值 */
  value: string
  /** 修正后的光标起点（null 表示无需恢复） */
  selectionStart: number | null
  /** 修正后的光标终点（null 表示无需恢复） */
  selectionEnd: number | null
}

/**
 * 解析 decimal 类型的小数位数：decimal=2，decimal4=4，其余返回 null。
 *
 * @param type 组件 type 值
 */
export function parseDecimalPlaces(type: string): number | null {
  if (type === 'decimal')
    return 2
  const m = type.match(/^decimal(\d+)$/)
  return m ? Number(m[1]) : null
}

/**
 * 按类型过滤输入值，返回合法字符串（用于 integer / positiveInteger / decimal(N)）。
 *
 * @param raw 原始输入串
 * @param type 组件 type 值
 */
export function filterByType(raw: string, type: string): string {
  if (type === 'integer') {
    return raw.replace(/\D/g, '')
  }
  if (type === 'positiveInteger') {
    return raw.replace(/\D/g, '').replace(/^0+/, '')
  }
  const places = parseDecimalPlaces(type)
  if (places !== null) {
    // 只保留数字和第一个小数点
    let s = raw.replace(/[^\d.]/g, '')
    const firstDot = s.indexOf('.')
    if (firstDot !== -1) {
      const intPart = s.slice(0, firstDot)
      const decPart = s
        .slice(firstDot + 1)
        .replace(/\./g, '')
        .slice(0, places)
      s = `${intPart}.${decPart}`
    }
    // 去除前导 0（保留单个 0 与 "0." 形式）
    s = s.replace(/^0+(\d)/, '$1')
    return s
  }
  return raw
}

/**
 * 输入值规范化：大写转换、字符白名单过滤、受限数值类型与 range 范围收敛。
 *
 * 从 input.vue 抽离，仅依赖 props，不产生副作用（不会 emit），
 * 由 use-input-events 负责把修正结果对外派发。
 *
 * @param props 输入框 props（响应式对象，computed 自动追踪依赖）
 */
export function useInputFormat(props: InputProps) {
  /** 是否为受限制的数值类型 */
  const isNumericType = computed(() => {
    return props.type === 'integer' || props.type === 'positiveInteger' || parseDecimalPlaces(props.type) !== null
  })

  /** range 有效最小值 */
  const effectiveMin = computed(() => props.range?.min)

  /** range 有效最大值 */
  const effectiveMax = computed(() => props.range?.max)

  /** 最小值是否包含等于 */
  const effectiveMinInclusive = computed(() => props.range?.minInclusive ?? true)

  /** 最大值是否包含等于 */
  const effectiveMaxInclusive = computed(() => props.range?.maxInclusive ?? true)

  /**
   * 校验并同步当前输入值（含光标位置处理）。
   *
   * 会直接回写 `target.value`（原生输入框需即时反映过滤结果），
   * 并返回修正后的值与光标位置。
   *
   * @param target 触发事件的原生输入元素
   */
  function sanitizeValue(target: HTMLInputElement | HTMLTextAreaElement): InputSanitizeResult {
    let value = target.value
    let selectionStart = target.selectionStart
    let selectionEnd = target.selectionEnd

    // 自动转大写
    if (props.toUpperCase && props.type !== 'textarea') {
      const uppered = value.toUpperCase()
      if (uppered !== value) {
        value = uppered
        target.value = uppered
      }
    }

    // 仅允许大写字母和数字
    if (props.alphaNumOnly && props.type !== 'textarea') {
      const filtered = value.replace(/[^A-Z0-9]/g, '')
      if (filtered !== value) {
        const beforeCursor = value.slice(0, selectionStart ?? 0)
        const keptBefore = beforeCursor.replace(/[^A-Z0-9]/g, '')
        const cursorPos = keptBefore.length
        value = filtered
        selectionStart = selectionEnd = cursorPos
        target.value = filtered
      }
    }

    // 受限数字类型
    if (isNumericType.value) {
      const result = filterByType(value, props.type)
      if (result !== value) {
        const beforeCursor = value.slice(0, selectionStart ?? 0)
        const keptBefore = filterByType(beforeCursor, props.type)
        const cursorPos = keptBefore.length
        value = result
        selectionStart = selectionEnd = cursorPos
        target.value = result
      }
      // 输入时仅限制最大值
      if (effectiveMax.value !== undefined) {
        const n = Number(value)
        const overMax = effectiveMaxInclusive.value ? n > effectiveMax.value : n >= effectiveMax.value
        if (!Number.isNaN(n) && overMax) {
          const clamped = String(effectiveMax.value)
          selectionStart = selectionEnd = clamped.length
          value = clamped
          target.value = clamped
        }
      }
    }

    return { value, selectionStart, selectionEnd }
  }

  /**
   * 失焦时应用 min / max 完整范围限制。
   *
   * @returns 需要提交的收敛值；无需修正时返回 null
   */
  function clampOnBlur(): string | null {
    if (!isNumericType.value || (effectiveMin.value === undefined && effectiveMax.value === undefined))
      return null

    const currentValue = String(props.modelValue ?? '')
    const n = Number(currentValue)
    if (currentValue === '' || Number.isNaN(n))
      return null

    let clamped: string | null = null
    if (effectiveMax.value !== undefined) {
      const overMax = effectiveMaxInclusive.value ? n > effectiveMax.value : n >= effectiveMax.value
      if (overMax)
        clamped = String(effectiveMax.value)
    }
    if (clamped === null && effectiveMin.value !== undefined) {
      const underMin = effectiveMinInclusive.value ? n < effectiveMin.value : n <= effectiveMin.value
      if (underMin)
        clamped = String(effectiveMin.value)
    }

    return clamped !== null && clamped !== currentValue ? clamped : null
  }

  return {
    isNumericType,
    effectiveMin,
    effectiveMax,
    effectiveMinInclusive,
    effectiveMaxInclusive,
    sanitizeValue,
    clampOnBlur,
  }
}
