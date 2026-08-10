import { withInstall } from '../../utils'

import _TreeChart from './src/tree-chart.vue'

export const EasyTreeChart = withInstall(_TreeChart)
export default EasyTreeChart
export type { NodeConfig, TreeChartNode, TreeNodeData } from './src/types'
