import { withInstall } from '../../utils'

import _Message from './src/message.vue'

export const EasyMessage = withInstall(_Message)
export default EasyMessage
export { setupEasyMessage } from './src/install'
export { EasyMsg } from './src/message'
export type { MessageOptions, MessagePosition, MessageType } from './src/message'
