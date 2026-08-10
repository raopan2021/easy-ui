import { withInstall } from '../../utils'

import { setupXlyLoading, XlyLoading } from './src/loading'
import _Loading from './src/loading.vue'

export const EasyLoading = withInstall(_Loading)
export default EasyLoading
export {
  setupXlyLoading as setupEasyLoading,
  setupXlyLoading,
  XlyLoading as vEasyLoading,
}
export type { LoadingInstance, LoadingOptions } from './src/loading'
