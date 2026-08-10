import { withInstall } from '../../utils'

import { EasyLoading as LoadingApi, setupEasyLoading } from './src/loading'
import _Loading from './src/loading.vue'

export const EasyLoading = withInstall(_Loading)
export default EasyLoading
export {
  setupEasyLoading,
  LoadingApi as vEasyLoading,
}
export type { LoadingInstance, LoadingOptions } from './src/loading'
