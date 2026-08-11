import { isClient } from '../browser'

export function getStyle(element: HTMLElement, styleName: keyof CSSStyleDeclaration): string | undefined {
  if (!isClient || !element)
    return

  const value = element.style[styleName]
  if (value)
    return typeof value === 'string' ? value : undefined

  const computed = document.defaultView?.getComputedStyle(element, '')
  const v = computed ? computed[styleName] : undefined
  return typeof v === 'string' ? v : undefined
}

export function classNameToArray(cls = '') {
  return cls.split(' ').filter(item => !!item.trim())
}

export function hasClass(el: Element, cls: string): boolean {
  if (!el || !cls)
    return false
  if (cls.includes(' '))
    throw new Error('className should not contain space.')
  return el.classList.contains(cls)
}

export function addClass(el: Element, cls: string) {
  if (!el || !cls.trim())
    return
  el.classList.add(...classNameToArray(cls))
}

export function removeClass(el: Element, cls: string) {
  if (!el || !cls.trim())
    return
  el.classList.remove(...classNameToArray(cls))
}

export function getScrollBarWidth(namespace: string): number {
  if (!isClient || document.documentElement.classList.contains(`${namespace}-hide-scrollbar`))
    return 0
  const outer = document.createElement('div')
  outer.className = `${namespace}-scrollbar__wrap`
  outer.style.visibility = 'hidden'
  outer.style.position = 'absolute'
  outer.style.top = '-9999px'
  outer.style.width = '100px'
  outer.style.height = '100%'
  outer.style.overflow = 'scroll'

  document.body.appendChild(outer)
  const width = outer.offsetWidth - outer.clientWidth
  outer.remove()
  return width
}
