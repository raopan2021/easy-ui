export function getElement(target: string | HTMLElement): HTMLElement | undefined {
  if (typeof target === 'string') {
    return document.querySelector<HTMLElement>(target) ?? undefined
  }
  return target
}
