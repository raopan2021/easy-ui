/* eslint-disable node/prefer-global/process */
export function debugWarn(scope: string, message: string) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn(new Error(`[${scope}] ${message}`))
  }
}

export function throwError(scope: string, message: string) {
  throw new Error(`[${scope}] ${message}`)
}
