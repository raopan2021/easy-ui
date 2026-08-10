import { withInstall } from '../../utils'

import _FormItem from './src/form-item.vue'
import _Form from './src/form.vue'

export const EasyForm = withInstall(_Form)
export const EasyFormItem = withInstall(_FormItem)
export default EasyForm
export * from './src/utils'
