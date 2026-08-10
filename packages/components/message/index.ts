import { withInstall } from '../../utils'

import _Message from './src/message.vue'

export const EasyMessage = withInstall(_Message)
export default EasyMessage
export { setupXlyMessage as setupEasyMessage } from './src/install'
export { XlyMsg as EasyMsg } from './src/message'
export type { MessageOptions, MessagePosition, MessageType } from './src/message'
