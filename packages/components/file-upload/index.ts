import { withInstall } from '../../utils'

import _FileUpload from './src/file-upload.vue'

export const EasyFileUpload = withInstall(_FileUpload)
/** 兼容旧名 EasyUpload / EasyUpload */
export { EasyFileUpload as EasyUpload }
export default EasyFileUpload
export type { UploadFileItem } from './src/file-upload.vue'
