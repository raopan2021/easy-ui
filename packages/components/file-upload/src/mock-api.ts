/**
 * 【Mock】上传相关接口（组件库演示用，未接入真实后端）
 *
 * 接入业务系统时，将以下函数替换为真实接口调用即可，
 * 函数签名保持不变，networkUpload / handleRemove 逻辑无需改动。
 */

/** 上传响应结构（与 RESPONSE_URL_PATH 对应） */
export interface MockUploadResponse {
  retCode: number
  data: {
    filePath: string
    fileName: string
    fileSize: number
    fileMd5: string
  }
}

/** 如何从响应中提取文件 URL（支持点号分隔路径，如 'data.filePath'） */
export const RESPONSE_URL_PATH = 'data.filePath'

/**
 * 【Mock】上传文件：本地生成预览地址并模拟上传进度
 * @param file - 待上传文件
 * @param onProgress - 进度回调（0-100）
 */
export function uploadFileApi(file: File, onProgress?: (percent: number) => void): Promise<MockUploadResponse> {
  return new Promise((resolve) => {
    let percent = 0
    const timer = setInterval(() => {
      percent += Math.random() * 30
      if (percent >= 100) {
        percent = 100
        clearInterval(timer)
        onProgress?.(100)
        resolve({
          retCode: 0,
          data: {
            // 本地对象 URL，可在浏览器直接预览
            filePath: URL.createObjectURL(file),
            fileName: file.name,
            fileSize: file.size,
            fileMd5: `mock-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          },
        })
      }
      else {
        onProgress?.(Math.round(percent))
      }
    }, 200)
  })
}

/**
 * 【Mock】删除服务器文件：模拟网络延迟后成功
 * @param _url - 文件地址（mock 忽略）
 */
export function deleteFileApi(_url: string): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 200))
}

/**
 * 【Mock】删除档案记录：模拟网络延迟后成功
 * @param _id - 档案 id（mock 忽略）
 */
export function deleteArchiveAndFile(_id: string): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, 200))
}
