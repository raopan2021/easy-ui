import { withInstall } from '../../utils'

import _Msgbox from './src/msgbox.vue'

export const EasyMsgbox = withInstall(_Msgbox)
export default EasyMsgbox
export { setupEasyMsgBox } from './src/install'
export { EasyMsgBox } from './src/msgbox'
export type { MsgBoxAction, MsgBoxInputConfig, MsgBoxOptions, MsgBoxType } from './src/msgbox'
