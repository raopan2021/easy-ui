import type { PropType } from 'vue'
import type { EpPropInput } from './types'
import { debugWarn } from '../../error'

import { hasOwn } from '../../objects'
import { isObject } from '../../types'

export const epPropKey = '__epPropKey__'

export type EpPropKey = typeof epPropKey

export const definePropType = <T>(val: any): PropType<T> => val as PropType<T>

export function buildProp<
  Type = never,
  Value = never,
  Validator = never,
  Default extends Type = never,
>(prop: EpPropInput<Type, Value, Validator> & {
  default?: (() => Default) | Default
}, _key?: string): object {
  if (!isObject(prop) || !!(prop as any)[epPropKey]) {
    return prop as any
  }

  const { values, required, default: defaultValue, type, validator } = prop as any

  const _validator
    = values || validator
      ? (val: unknown) => {
          let valid = false
          let allowedValues: unknown[] = []

          if (values) {
            allowedValues = Array.from(values)
            if (hasOwn(prop, 'default')) {
              allowedValues.push(defaultValue)
            }
            valid ||= allowedValues.includes(val)
          }
          if (validator)
            valid ||= validator(val)

          if (!valid && allowedValues.length > 0) {
            const allowValuesText = [...new Set(allowedValues)]
              .map(val => JSON.stringify(val))
              .join(', ')
            debugWarn(
              'PropValue',
              `invalid prop value: ${JSON.stringify(val)}, expected one of [${allowValuesText}].`,
            )
          }
          return valid
        }
      : undefined

  const epProp: any = {
    type,
    required: !!required,
    validator: _validator,
    [epPropKey]: true,
  }
  if (hasOwn(prop, 'default'))
    epProp.default = defaultValue
  return epProp
}

export function buildProps<
  T extends Record<string, any>,
>(props: T): T {
  return Object.entries(props).reduce(
    (obj, [key, val]) => ({
      ...obj,
      [key]: buildProp(val as any, key),
    }),
    {} as any,
  )
}
