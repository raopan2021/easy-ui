import { withInstall } from '../../utils'

import _TimelineItem from './src/timeline-item.vue'
import _Timeline from './src/timeline.vue'

export const EasyTimeline = withInstall(_Timeline)
export const EasyTimelineItem = withInstall(_TimelineItem)
export default EasyTimeline
export * from './src/timeline'
export * from './src/timeline-item'
