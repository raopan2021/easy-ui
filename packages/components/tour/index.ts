import { withInstall } from '../../utils'

import _Tour from './src/tour.vue'

export const EasyTour = withInstall(_Tour)
export default EasyTour
export { XlyTour as vEasyTour } from './src/tour'
export type { TourInstance, TourOptions } from './src/tour'
