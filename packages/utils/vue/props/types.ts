import type { PropType } from 'vue'
import type { EpPropKey } from './runtime'

export type EpPropInput<Type, Value, Validator> = {
  type?: PropType<Type>
  required?: true
  values?: readonly Type[]
  validator?: Validator | ((val: any) => val is Type)
  default?: (() => Value) | Value
} & (undefined extends Value ? { default?: (() => Value) | Value } : { default: (() => Value) | Value })

export interface EpPropFinalized<Type, Value, Validator> {
  type: PropType<Type>
  required?: true
  values?: readonly Type[]
  validator?: Validator | ((val: any) => val is Type)
  default?: (() => Value) | Value
}

export interface EpProp<Type, Default extends Type & {}, Result extends Type, Validator = unknown> {
  readonly key: EpPropKey
  readonly value: unknown
  readonly type: EpPropInput<Type, Default, Validator>
  readonly default: Default
  readonly result: Result
}

export type NativePropType = ((...args: any) => any) | (new (...args: any) => any) | (() => any) | {
  [NativePropKey: string]: any
} | [new (...args: any) => any, ...Array<(...args: any) => any>]
