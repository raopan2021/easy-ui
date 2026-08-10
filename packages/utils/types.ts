import { isClient } from './browser'

export { isClient }

export const isString = (val: unknown): val is string => typeof val === 'string'
export const isNumber = (val: unknown): val is number => typeof val === 'number'

// eslint-disable-next-line ts/no-unsafe-function-type
export const isFunction = (val: unknown): val is Function => typeof val === 'function'
export function isObject(val: unknown): val is Record<any, any> {
  return val !== null && typeof val === 'object'
}
export const isArray = Array.isArray

export function isEmpty(val: unknown) {
  return (!val && val !== 0)
    || (isArray(val) && val.length === 0)
    || (isObject(val) && !Object.keys(val).length)
}

export function isElement(e: unknown): e is Element {
  if (typeof Element === 'undefined')
    return false
  return e instanceof Element
}

export function isPropAbsent(prop: unknown): prop is null | undefined {
  return prop == null
}

export const isBoolean = (val: unknown): val is boolean => typeof val === 'boolean'

export const isUndefined = (val: unknown): val is undefined => val === undefined
