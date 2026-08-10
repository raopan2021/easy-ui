import { withInstall } from '../../utils'

import _TabPane from './src/tab-pane.vue'
import _Tabs from './src/tabs.vue'

export const EasyTabs = withInstall(_Tabs)
export const EasyTabPane = withInstall(_TabPane)
export default EasyTabs
export * from './src/tab-pane'
export * from './src/tabs'
