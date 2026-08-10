import { withInstall } from '../../utils'

import _Watermark from './src/watermark.vue'

export const EasyWatermark = withInstall(_Watermark)
export default EasyWatermark
export { setupWatermarkDirective } from './src/directive'
