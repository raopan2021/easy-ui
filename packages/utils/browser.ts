export const isClient = typeof window !== 'undefined'

export function isFirefox(): boolean {
  return typeof navigator !== 'undefined' && /firefox/i.test(navigator.userAgent)
}

export function NOOP() {}
