import type { ComponentSize } from '../../constants'

import { componentSizeMap } from '../../constants'

export function getComponentSize(size?: ComponentSize) {
  return componentSizeMap[size || 'default']
}
