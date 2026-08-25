import type { Ref } from 'vue'
import type { UploadEmits, UploadFileItem, UploadProps, UploadStatus } from './types'

import { computed, ref, watch } from 'vue'

import { downloadFile, previewFile } from '../../../easy-ui/src/utils/file'
import { EasyMsg } from '../../message'
import { deleteArchiveAndFile, deleteFileApi, RESPONSE_URL_PATH, uploadFileApi } from './mock-api'

/**
 * EasyUpload 核心逻辑 composable
 *
 * 将原本内联在 file-upload.vue 中的文件列表状态、modelValue 同步、
 * 校验、上传、删除、预览、下载等逻辑抽离为独立 composable，
 * 让 .vue 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 *
 * @param props    上传组件 props（需传入响应式对象，computed/watch 自动追踪依赖）
 * @param emit     上传组件事件触发函数（callable 形式，见 UploadEmits）
 * @param inputRef 隐藏文件输入框引用（由模板 ref 绑定，供触发选文件使用）
 */
export function useUploadCore(props: UploadProps, emit: UploadEmits, inputRef: Ref<HTMLInputElement | undefined>) {
  /** 是否正在拖拽 */
  const isDragover = ref(false)
  /** 内部文件列表 */
  const fileList = ref<UploadFileItem[]>([])

  /** 是否达到上传上限 */
  const isMaxReached = computed(() => {
    if (props.limit === undefined)
      return false
    return fileList.value.filter(f => f.status !== 'error').length >= props.limit
  })

  // ============================================================
  // modelValue 同步
  // ============================================================

  /**
   * 判断文件项是否为有效项
   * - 自动上传模式：必须有 url（已上传到服务器）
   * - 非自动上传模式：必须有 id（仅本地暂存，等待父组件处理 raw 文件）
   * @param f - 文件项
   */
  function isValidItem(f: UploadFileItem): boolean {
    return props.autoNetworkUpload ? Boolean(f.url) : Boolean(f.id)
  }

  /**
   * 将外部 modelValue 解析为对象数组
   * @param val - 外部传入的值
   * @returns 解析后的对象数组
   */
  function parseModelValue(val: UploadFileItem[] | string | undefined): UploadFileItem[] {
    if (!val)
      return []
    // 数组直接返回
    if (Array.isArray(val))
      return val.filter(isValidItem)
    // JSON 字符串解析
    try {
      const parsed = JSON.parse(val)
      return Array.isArray(parsed) ? parsed.filter(isValidItem) : []
    }
    catch {
      return []
    }
  }

  /**
   * 将内部文件列表序列化为 modelValue 格式
   * @param items - 文件列表
   * @returns 序列化后的值
   */
  function serializeValue(items: UploadFileItem[]): UploadFileItem[] | string {
    const successItems = items.filter(f => f.status !== 'error' && isValidItem(f))
    if (props.valueMode === 'string')
      return JSON.stringify(successItems)
    return successItems
  }

  /**
   * 向外 emit 更新（v-model + change）
   */
  function emitUpdate() {
    const successItems = fileList.value.filter(f => f.status === 'success' && isValidItem(f))
    emit('update:modelValue', serializeValue(successItems))
    emit('change', [...fileList.value])
  }

  // 监听外部值变化 → 同步到 fileList
  watch(
    () => props.modelValue,
    (val) => {
      const items = parseModelValue(val)
      // 比较 ID 列表（保持原始顺序），避免不必要的更新
      const currentIds = fileList.value.filter(f => f.status === 'success' && isValidItem(f)).map(f => f.id)
      const newIds = items.map(f => f.id)
      const isSame = currentIds.length === newIds.length && currentIds.every((id, i) => id === newIds[i])
      if (isSame)
        return

      fileList.value = items.map(item => ({
        ...item,
        status: 'success' as UploadStatus,
      }))
    },
    { immediate: true },
  )

  // ============================================================
  // 内置校验
  // ============================================================

  /**
   * 内置文件校验
   * @param file - 待校验的文件
   * @returns 错误信息字符串，null 表示校验通过
   */
  function validateFile(file: File): string | null {
    // 校验文件类型
    if (props.acceptTypes) {
      const allowed = props.acceptTypes.split(',').map(t => t.trim().toLowerCase())
      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      const mimeMatch = allowed.includes(file.type.toLowerCase())
      const extMatch = allowed.some(t => t === ext || t === `.${ext}`)
      if (!mimeMatch && !extMatch)
        return `不支持 ${ext || file.type} 格式`
    }
    // 校验最小尺寸（转换为 KB）
    const sizeKB = file.size / 1024
    if (props.minSize && sizeKB < props.minSize) {
      return `文件不能小于 ${formatSize(props.minSize * 1024)}`
    }
    // 校验最大尺寸（转换为 KB）
    if (props.maxSize && sizeKB > props.maxSize) {
      return `文件不能超过 ${formatSize(props.maxSize * 1024)}`
    }
    return null
  }

  /** 校验提示用的大小格式化（字节 → 可读字符串） */
  function formatSize(bytes: number): string {
    const k = 1024
    if (bytes < k)
      return `${bytes} B`
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${(bytes / k ** i).toFixed(i > 1 ? 1 : 0)} ${['B', 'KB', 'MB', 'GB', 'TB'][i]}`
  }

  // ============================================================
  // 触发选文件
  // ============================================================

  /** 触发文件选择 */
  function handleTriggerClick() {
    if (props.disabled)
      return
    inputRef.value?.click()
  }

  /** 处理 input 选文件 */
  function handleInputChange(e: Event) {
    const input = e.target as HTMLInputElement
    const files = Array.from(input.files || [])
    if (!files.length)
      return
    input.value = '' // 重置，以便重复选同一文件
    processFiles(files)
  }

  /** 处理拖拽 */
  function handleDrop(e: DragEvent) {
    isDragover.value = false
    if (props.disabled)
      return
    const files = Array.from(e.dataTransfer?.files || [])
    processFiles(files)
  }

  // ============================================================
  // 文件处理
  // ============================================================

  /**
   * 处理文件列表（数量限制 → 逐个上传）
   * @param files - 文件列表
   */
  async function processFiles(files: File[]) {
    // 检查上限
    if (props.limit !== undefined) {
      const currentValid = fileList.value.filter(f => f.status !== 'error').length
      const allowed = props.limit - currentValid
      if (allowed <= 0) {
        emit('exceed', files, props.limit)
        return
      }
      if (files.length > allowed) {
        emit('exceed', files.slice(allowed), props.limit)
        files = files.slice(0, allowed)
      }
    }

    // 逐个上传
    for (const file of files) {
      await uploadFile(file)
    }
  }

  /**
   * 上传单个文件（内置校验 → 加入列表 → 按模式处理）
   * @param file - 文件对象
   */
  async function uploadFile(file: File) {
    // 内置校验
    const validateError = validateFile(file)
    if (validateError) {
      EasyMsg.warning(validateError)
      emit('validate-error', validateError, file)
      return
    }

    // 生成唯一 ID
    const id = `upload-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
    const uploadItem: UploadFileItem = {
      id,
      name: file.name,
      url: '',
      size: file.size, // 字节
      status: 'uploading',
      percent: 0,
      raw: file,
    }
    fileList.value.push(uploadItem)

    const item = fileList.value.find(f => f.id === id)!

    // 非自动上传模式：仅本地暂存，直接标记为成功，保留 raw 供父组件处理
    if (!props.autoNetworkUpload) {
      item.status = 'success'
      item.percent = 100
      EasyMsg.success(`${item.name} 添加成功`)
      emit('success', { ...item })
      emitUpdate()
      return
    }

    networkUpload({ file, item })
  }

  /**
   * 网络上传（autoNetworkUpload = true 时使用）
   * 以下为示例，可根据实际开发中后端接口和代码风格修改上传逻辑
   * @param opts - 上传参数
   * @param opts.file - 原始文件
   * @param opts.item - 上传列表项（用于回填 URL / 状态 / 进度）
   */
  async function networkUpload(opts: { file: File, item: UploadFileItem }) {
    const { file, item } = opts

    try {
      const response = await uploadFileApi(file, (percent) => {
        item.percent = percent
      })

      // 业务状态码检查
      if (response.retCode !== undefined && response.retCode !== 0) {
        throw new Error(`上传失败(retCode=${response.retCode})`)
      }

      // 从响应中提取 URL（支持点号分隔路径，如 'data.filePath'）
      let fileUrl: any = response
      for (const key of RESPONSE_URL_PATH.split('.')) {
        fileUrl = fileUrl?.[key]
      }

      if (!fileUrl)
        throw new Error('响应中未找到文件地址')

      // 提取嵌套的 data 对象（兼容 { retCode, data: { ... } } 结构）
      const fileData: Record<string, any> = (response as any).data || response

      // 更新文件信息
      item.url = fileUrl
      item.name = fileData.fileName || fileData.name || item.name
      item.size = fileData.fileSize ?? fileData.size ?? item.size
      if (fileData.fileMd5)
        (item as any).fileMd5 = fileData.fileMd5
      item.status = 'success'
      item.percent = 100
      item.justUploaded = true

      EasyMsg.success(`${item.name} 上传成功`)
      emit('success', { ...item })
      emitUpdate()
    }
    catch (error) {
      item.status = 'error'
      EasyMsg.danger(`${item.name} 上传失败`)
      emit('error', error as Error, { ...item })
    }
  }

  // ============================================================
  // 删除 / 预览 / 下载
  // ============================================================

  /**
   * 删除文件（服务器 → 档案记录 → 本地列表）
   * @param index - 文件索引
   */
  async function handleRemove(index: number) {
    const item = fileList.value[index]
    if (!item)
      return

    // 1. 删除服务器上的文件（始终调用）
    if (item.url) {
      try {
        await deleteFileApi(item.url)

        // 2. 删除档案记录（id 不以 "upload" 开头时调用，说明是已保存到项目的附件）
        if (item.id && !item.id.startsWith('upload')) {
          try {
            await deleteArchiveAndFile(item.id)
          }
          catch {
            // 删除失败不阻塞本地移除
          }
        }

        // 3. 删除本地页面文件
        const removed = fileList.value.splice(index, 1)[0]
        EasyMsg.success(`${removed.name} 已删除`)
        emit('remove', removed, [...fileList.value])
        emitUpdate()
      }
      catch {
        EasyMsg.danger(`${item.name} 删除失败`)
      }
    }
  }

  /**
   * 预览文件
   * @param item - 文件项
   */
  async function handlePreview(item: UploadFileItem) {
    await previewFile(item.url, item.name)
  }

  /**
   * 下载文件
   * @param item - 文件项
   */
  function handleDownload(item: UploadFileItem) {
    downloadFile(item.url, item.name)
  }

  // ============================================================
  // 暴露方法（通过 ref 调用）
  // ============================================================

  /** 手动触发选文件 */
  function open() {
    handleTriggerClick()
  }

  /** 清空所有文件 */
  function clear() {
    fileList.value = []
    emitUpdate()
  }

  /** 获取文件列表 */
  function getFileList() {
    return [...fileList.value]
  }

  return {
    isDragover,
    fileList,
    isMaxReached,
    handleTriggerClick,
    handleInputChange,
    handleDrop,
    handleRemove,
    handlePreview,
    handleDownload,
    open,
    clear,
    getFileList,
  }
}
