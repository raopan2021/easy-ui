export const rangeArr = (n: number) => Array.from(Array.from({ length: n }).keys())

export function addUnit(value?: string | number, defaultUnit = 'px') {
  if (value == null || value === '')
    return undefined
  if (typeof value === 'number' || /^\d+(?:\.\d+)?$/.test(value))
    return `${value}${defaultUnit}`
  return value
}
