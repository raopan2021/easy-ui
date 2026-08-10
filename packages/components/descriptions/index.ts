import { withInstall } from '../../utils'

import _Descriptions from './src/descriptions.vue'
import _DescriptionsItem from './src/item.vue'

export const EasyDescriptions = withInstall(_Descriptions)
export const EasyDescriptionsItem = withInstall(_DescriptionsItem)
export default EasyDescriptions
export * from './src/descriptions'
