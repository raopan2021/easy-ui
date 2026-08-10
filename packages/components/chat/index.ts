import { withInstall } from '../../utils'

import _ChatInput from './src/chat-input.vue'
import _Chat from './src/chat.vue'

export const EasyChat = withInstall(_Chat)
export const EasyChatInput = withInstall(_ChatInput)
export default EasyChat
export type { ChatAttachment, ChatMessage } from './src/chat-message.vue'
