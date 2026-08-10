import { isClient } from '../browser'

export function isScroll(el: HTMLElement, isVertical?: boolean): boolean {
  if (!isClient)
    return false
  const key = (
    { undefined: 'overflow', true: 'overflow-y', false: 'overflow-x' } as const
  )[String(isVertical)]!

  const overflow = getComputedStyle(el)[key]
  return /scroll|auto|overlay/.test(overflow)
}

export function getScrollContainer(el: HTMLElement, isVertical?: boolean): Window | HTMLElement | undefined {
  if (!isClient)
    return

  let parent: HTMLElement = el
  while (parent) {
    if ([window, document, document.documentElement].includes(parent))
      return window

    if (isScroll(parent, isVertical))
      return parent

    parent = parent.parentNode as HTMLElement
  }

  return parent
}
