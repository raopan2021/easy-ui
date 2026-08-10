import { withInstall } from '../../utils'

import _RadioGroup from './src/radio-group.vue'
import _Radio from './src/radio.vue'

export const EasyRadio = withInstall(_Radio)
export const EasyRadioGroup = withInstall(_RadioGroup)
export default EasyRadio
export * from './src/radio'
