import { withInstall } from '../../utils'

import _Step from './src/step.vue'
import _Steps from './src/steps.vue'

export const EasySteps = withInstall(_Steps)
export const EasyStep = withInstall(_Step)
export default EasySteps
export * from './src/step'
export * from './src/steps'
