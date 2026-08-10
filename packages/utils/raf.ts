import { isClient } from './browser'

export function rAF(): ((cb: FrameRequestCallback) => number) {
  return isClient
    ? window.requestAnimationFrame
    : (cb: FrameRequestCallback) => setTimeout(cb, 16) as unknown as number
}

export function cAF(): ((handle: number) => void) {
  return isClient
    ? window.cancelAnimationFrame
    : (id: number) => clearTimeout(id)
}
