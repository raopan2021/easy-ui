/**
 * Badge 徽标组件 - 类型、命令式 API 与颜色映射。
 *
 * 组件展示逻辑（是否渲染 / 显示值 / 背景色）已抽离到 use-badge.ts，
 * 本文件保留 BadgeProps 类型与全局命令式 API（open / close / closeAll）。
 */

/** 命令式 open 的可选配置 */
export interface BadgeOptions {
  /** 显示值 */
  value?: number | string
  /** 徽标位置 */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  /** 预设类型（决定默认颜色） */
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  /** 自定义颜色（优先级高于 type） */
  color?: string
  /** 最大值 */
  max?: number
  /** 是否显示值为 0 的徽标 */
  showZero?: boolean
  /** 是否圆形徽标 */
  circle?: boolean
}

/** 命令式 API 返回的实例句柄 */
export interface BadgeInstance {
  /** 关闭并移除徽标 */
  close: () => void
  /** 动态更新显示值 */
  setValue: (value: number | string) => void
}

/** 徽标组件 props（全部可选，默认值在 badge.vue 的 withDefaults 中提供） */
export interface BadgeProps {
  /** 显示值（数字或字符串），undefined / null / 空串时不渲染 */
  value?: number | string
  /** 最大值，超过显示 max + overflowText */
  max?: number
  /** 超出最大值时的后缀文本 */
  overflowText?: string
  /** 预设类型（决定默认颜色） */
  type?: 'primary' | 'success' | 'warning' | 'danger' | 'info'
  /** 徽标位置 */
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
  /** 是否显示值为 0 的徽标 */
  showZero?: boolean
  /** 自定义颜色（优先级高于 type） */
  color?: string
  /** 是否圆形徽标 */
  circle?: boolean
}

/** 类型 → 颜色映射（命令式 open 与组件展示共用，避免重复定义） */
export const colorMap: Record<string, string> = {
  primary: '#409eff',
  success: '#67c23a',
  warning: '#e6a23c',
  danger: '#f56c6c',
  info: '#909399',
}

/** 记录每个宿主元素对应的包裹层与徽标节点，便于命令式关闭 */
const badgeMap = new Map<HTMLElement, { wrapper: HTMLElement, badge: HTMLElement }>()

/** 关闭并移除指定宿主元素上的徽标 */
export function close(el: HTMLElement): void {
  const item = badgeMap.get(el)
  if (item) {
    const { wrapper } = item
    if (wrapper.parentNode) {
      wrapper.parentNode.insertBefore(el, wrapper)
    }
    wrapper.remove()
    badgeMap.delete(el)
  }
}

/** 在宿主元素上命令式创建徽标，返回可操作的实例句柄 */
export function open(el: HTMLElement, options: BadgeOptions = {}): BadgeInstance {
  if (badgeMap.has(el)) {
    close(el)
  }

  const {
    value = 0,
    position = 'top-right',
    type = 'danger',
    color,
    max = 99,
    showZero = false,
    circle = false,
  } = options

  const bgColor = color || colorMap[type] || colorMap.danger

  let displayValue = ''
  if (value !== null && value !== undefined && value !== '') {
    if (typeof value === 'number' && value > max) {
      displayValue = `${String(max)}+`
    }
    else {
      displayValue = String(value)
    }
  }
  if (!showZero && (value === 0 || value === '0')) {
    displayValue = ''
  }

  const wrapper = document.createElement('span')
  wrapper.style.display = 'inline-flex'
  wrapper.style.position = 'relative'
  wrapper.style.verticalAlign = 'middle'

  el.parentNode?.insertBefore(wrapper, el)
  wrapper.appendChild(el)

  const badge = document.createElement('span')
  badge.className = `badge-mark ${position}${circle ? ' circle' : ''}`
  badge.style.cssText = `
    position: absolute;
    z-index: 100;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
    height: 20px;
    padding: 0 6px;
    border-radius: 10px;
    font-size: 12px;
    font-weight: bold;
    color: #fff;
    background-color: ${bgColor};
    border: 2px solid #fff;
    box-shadow: 0 0 0 1px rgba(0,0,0,0.1);
    white-space: nowrap;
    pointer-events: none;
  `

  if (circle) {
    badge.style.width = '20px'
    badge.style.padding = '0'
    badge.style.borderRadius = '50%'
  }

  if (position === 'top-left') {
    badge.style.top = '0'
    badge.style.left = '0'
    badge.style.transform = 'translate(-50%, -50%)'
  }
  else if (position === 'bottom-right') {
    badge.style.bottom = '0'
    badge.style.right = '0'
    badge.style.transform = 'translate(50%, 50%)'
  }
  else if (position === 'bottom-left') {
    badge.style.bottom = '0'
    badge.style.left = '0'
    badge.style.transform = 'translate(-50%, 50%)'
  }
  else {
    badge.style.top = '0'
    badge.style.right = '0'
    badge.style.transform = 'translate(50%, -50%)'
  }

  if (!displayValue) {
    badge.style.display = 'none'
  }

  badge.textContent = displayValue
  wrapper.appendChild(badge)

  badgeMap.set(el, { wrapper, badge })

  return {
    close: () => close(el),
    setValue: (newValue: number | string) => {
      let text = ''
      if (newValue !== null && newValue !== undefined && newValue !== '') {
        if (typeof newValue === 'number' && newValue > max) {
          text = `${String(max)}+`
        }
        else {
          text = String(newValue)
        }
      }
      if (!showZero && (newValue === 0 || newValue === '0')) {
        badge.style.display = 'none'
      }
      else {
        badge.style.display = 'inline'
        badge.textContent = text
      }
    },
  }
}

/** 关闭所有命令式创建的徽标 */
export function closeAll(): void {
  badgeMap.forEach((_, el) => close(el))
}

/** 统一对外暴露的命令式徽标 API */
export const easyBadge = {
  open,
  close,
  closeAll,
}
