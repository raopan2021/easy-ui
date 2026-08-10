import type { ComponentSize } from '../../constants'

import { componentSizes, datePickTypes } from '../../constants'

export function isValidComponentSize(val: string): val is ComponentSize | '' {
  return ['', ...componentSizes].includes(val)
}

export function isValidDatePickType(val: string): val is (typeof datePickTypes)[number] {
  return ([...datePickTypes] as string[]).includes(val)
}
