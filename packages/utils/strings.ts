import { isArray, isObject, isString } from './types'

export {
  isArray,
  isObject,
  isString,
}

export function camelize(str: string): string {
  return str.replace(/-(\w)/g, (_, c) => (c ? c.toUpperCase() : ''))
}

export function hyphenate(str: string): string {
  return str.replace(/\B([A-Z])/g, '-$1').toLowerCase()
}

export function capitalize<T extends string>(str: T) {
  return (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<T>
}

export function escapeStringRegexp(string = '') {
  return string.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d')
}
