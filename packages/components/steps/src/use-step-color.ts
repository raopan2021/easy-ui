/**
 * 步骤条自定义状态颜色。
 *
 * 与 steps.ts 中 `color` prop 的结构保持一致（结构化类型，二者可互相赋值）。
 */
export interface StepColor {
  /** 进行中（process）主色 */
  primary?: string
  /** 完成（success / finish）主色 */
  success?: string
  /** 错误（error）主色 */
  error?: string
  /** 等待（wait）主色 */
  wait?: string
}

/**
 * 辅助函数：hex 颜色转 rgba。
 *
 * 同时兼容 `#rgb` 简写与 `#rrggbb` 完整写法，`#` 号可省略。
 *
 * @param hex hex 颜色值，如 `#4f6ef7` 或 `#48f`
 * @param alpha 透明度，0 ~ 1
 * @returns `rgba(r, g, b, a)` 字符串
 */
export function hexToRgba(hex: string, alpha: number): string {
  // 移除 # 号
  const cleanHex = hex.replace('#', '')

  // 处理简写格式 #rgb
  let r: number, g: number, b: number

  if (cleanHex.length === 3) {
    r = Number.parseInt(cleanHex[0] + cleanHex[0], 16)
    g = Number.parseInt(cleanHex[1] + cleanHex[1], 16)
    b = Number.parseInt(cleanHex[2] + cleanHex[2], 16)
  }
  else {
    r = Number.parseInt(cleanHex.substring(0, 2), 16)
    g = Number.parseInt(cleanHex.substring(2, 4), 16)
    b = Number.parseInt(cleanHex.substring(4, 6), 16)
  }

  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

/**
 * 由自定义状态颜色生成 CSS 变量行内样式对象。
 *
 * 每个主色会派生出「浅色底」与「阴影色」两个变量，供 step 的圆点、连接线、
 * 文本等样式复用；未配置的状态不写入变量，回退到 step-style.scss 中的默认值。
 *
 * 该函数由 steps.vue（读取自身 props.color）与 step.vue（读取 inject 到的上下文
 * color）共用，避免两处重复实现同一套映射规则。
 *
 * @param color 自定义状态颜色，未传时返回空对象（即完全使用默认配色）
 * @returns CSS 变量样式对象，可直接绑定到 `:style`
 */
export function buildStepColorVars(color?: StepColor): Record<string, string> {
  const style: Record<string, string> = {}

  if (!color)
    return style

  if (color.primary) {
    style['--step-primary'] = color.primary
    style['--step-primary-light'] = hexToRgba(color.primary, 0.15)
    style['--step-shadow-primary'] = hexToRgba(color.primary, 0.25)
  }

  if (color.success) {
    style['--step-success'] = color.success
    style['--step-success-light'] = hexToRgba(color.success, 0.15)
    style['--step-shadow-success'] = hexToRgba(color.success, 0.25)
  }

  if (color.error) {
    style['--step-error'] = color.error
    style['--step-error-light'] = hexToRgba(color.error, 0.15)
    style['--step-shadow-error'] = hexToRgba(color.error, 0.25)
  }

  if (color.wait) {
    style['--step-wait'] = color.wait
    style['--step-wait-bg'] = hexToRgba(color.wait, 0.2)
  }

  return style
}
