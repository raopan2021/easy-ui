import type { CompressOptions, CompressResult } from './types'

import Compressor from 'compressorjs'
import { computed, ref } from 'vue'

/** 输出格式 → MIME 映射 */
const MIME_MAP: Record<string, string> = {
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}

/** MIME → 文件扩展名 */
const EXT_MAP: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'image/tiff': 'tiff',
}

/** 目录句柄的 window API（Chrome / Edge 支持） */
type DirectoryPickerWindow = Window & {
  showDirectoryPicker?: (options?: { mode?: 'read' | 'readwrite' }) => Promise<FileSystemDirectoryHandle>
}

/** 打开文件选择器的 window API（支持读取文件所在目录） */
type FilePickerWindow = Window & {
  showOpenFilePicker?: (options?: {
    multiple?: boolean
    types?: Array<{ description?: string, accept: Record<string, string[]> }>
  }) => Promise<Array<FileSystemFileHandle & { getParent?: () => Promise<FileSystemDirectoryHandle> }>>
}

/**
 * EasyImageCompressor 核心逻辑 composable
 *
 * 负责：待压缩文件管理、图片尺寸读取、目标尺寸计算（保持/像素/百分比/短边/长边/宽/高）、
 * compressorjs 压缩调用、输出目录选择与自动写入（File System Access API）、
 * 结果记录与选中对比预览。
 *
 * 说明：浏览器端无法实现桌面工具（Caesium）的"移动原始文件 / 保留文件时间戳"
 * 等文件系统能力；"输出文件夹选择 / 自动写入"通过 File System Access API 实现，
 * 仅在支持该 API 的浏览器（Chrome / Edge）可用。
 */
export function useImageCompressor() {
  // ============ 待压缩文件 ============
  const pendingFiles = ref<File[]>([])
  const inputRef = ref<HTMLInputElement>()

  /** 追加待压缩图片（自动过滤非图片） */
  function selectFiles(files: File[] | FileList) {
    const images = Array.from(files).filter(f => f.type.startsWith('image/'))
    pendingFiles.value.push(...images)
  }

  /** 移除单个待压缩文件 */
  function removePendingFile(index: number) {
    pendingFiles.value.splice(index, 1)
  }

  /** 清空待压缩列表 */
  function clearPendingFiles() {
    pendingFiles.value = []
  }

  // ============ 输出目录（File System Access API）============
  const outputDir = ref<FileSystemDirectoryHandle | null>(null)
  const outputDirName = computed(() => outputDir.value?.name ?? '')

  /** 是否支持目录选择 API */
  const supportsDirectoryPicker = computed(() => typeof (window as DirectoryPickerWindow).showDirectoryPicker === 'function')

  /** 选择输出文件夹（用户取消返回 false） */
  async function chooseOutputDir(): Promise<boolean> {
    const picker = (window as DirectoryPickerWindow).showDirectoryPicker
    if (typeof picker !== 'function')
      return false
    try {
      outputDir.value = await picker.call(window, { mode: 'readwrite' })
      return true
    }
    catch {
      return false // 用户取消选择
    }
  }

  /** 清除输出文件夹 */
  function clearOutputDir() {
    outputDir.value = null
  }

  /**
   * 通过 File System Access API 选图，并将"文件所在文件夹"设为默认输出文件夹
   * 仅在支持 showOpenFilePicker 的浏览器可用（Chrome / Edge）
   */
  async function pickImages(): Promise<boolean> {
    const picker = (window as FilePickerWindow).showOpenFilePicker
    if (typeof picker !== 'function')
      return false
    try {
      const handles = await picker.call(window, {
        multiple: true,
        types: [{
          description: 'Images',
          accept: {
            'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.svg'],
          },
        }],
      })
      if (handles.length === 0)
        return false

      // 默认输出文件夹 = 待压缩文件所在的文件夹（仅当用户尚未手动设置时）
      if (!outputDir.value && handles[0].getParent) {
        try {
          const parent = await handles[0].getParent()
          if (parent)
            outputDir.value = parent
        }
        catch {
          // 读取父目录失败时忽略，用户可手动选择输出文件夹
        }
      }

      const files: File[] = []
      for (const handle of handles)
        files.push(await handle.getFile())
      selectFiles(files)
      return true
    }
    catch {
      return false // 用户取消选择
    }
  }

  /** 带权限 API 的目录句柄类型（部分浏览器仅支持 getParent 返回无权限方法的句柄） */
  type PermissionedDirectoryHandle = FileSystemDirectoryHandle & {
    queryPermission?: (opts: { mode: 'readwrite' }) => Promise<PermissionState>
    requestPermission?: (opts: { mode: 'readwrite' }) => Promise<PermissionState>
  }

  /** 请求目录读写权限（getParent 返回的句柄首次写入前需授权） */
  async function ensureWritePermission(dir: FileSystemDirectoryHandle): Promise<boolean> {
    const handle = dir as PermissionedDirectoryHandle
    if (typeof handle.queryPermission === 'function') {
      if (await handle.queryPermission({ mode: 'readwrite' }) === 'granted')
        return true
    }
    if (typeof handle.requestPermission === 'function') {
      try {
        return (await handle.requestPermission({ mode: 'readwrite' })) === 'granted'
      }
      catch {
        return false
      }
    }
    return true // 无权限 API（showDirectoryPicker 已授权）时直接尝试写入
  }

  /** 将压缩结果写入输出目录 */
  async function writeToDirectory(item: CompressResult): Promise<void> {
    const dir = outputDir.value
    if (!dir)
      return
    if (!await ensureWritePermission(dir))
      return
    try {
      const fileHandle = await dir.getFileHandle(item.name, { create: true })
      const writable = await fileHandle.createWritable()
      await writable.write(item.file)
      await writable.close()
    }
    catch (e) {
      console.error(`[ImageCompressor] 写入输出目录失败: ${item.name}`, e)
    }
  }

  // ============ 结果管理 ============
  const results = ref<CompressResult[]>([])
  const compressing = ref(false)
  const progress = ref(0)
  let seq = 0

  /** 清空压缩历史（同时释放 objectURL 与选中预览） */
  function clearHistory() {
    for (const item of results.value) {
      URL.revokeObjectURL(item.originalUrl)
      URL.revokeObjectURL(item.compressedUrl)
    }
    results.value = []
    closePreview()
  }

  // ============ 图片尺寸读取 ============
  /** 读取图片自然尺寸 */
  function loadImageSize(file: File): Promise<{ width: number, height: number }> {
    return new Promise((resolve, reject) => {
      const url = URL.createObjectURL(file)
      const img = new Image()
      img.onload = () => {
        URL.revokeObjectURL(url)
        resolve({ width: img.naturalWidth, height: img.naturalHeight })
      }
      img.onerror = () => {
        URL.revokeObjectURL(url)
        reject(new Error('无法读取图片，请确认文件为有效图片'))
      }
      img.src = url
    })
  }

  // ============ 目标尺寸计算 ============
  /** 根据尺寸模式计算目标尺寸（返回 compressorjs 的 width/height 选项） */
  function calcTargetSize(naturalWidth: number, naturalHeight: number, options: CompressOptions) {
    switch (options.sizeMode) {
      case 'original':
        return {}
      case 'pixel':
        return { width: options.pixelWidth, height: options.pixelHeight }
      case 'percent': {
        const scale = options.sizeValue / 100
        return {
          width: Math.max(1, Math.round(naturalWidth * scale)),
          height: Math.max(1, Math.round(naturalHeight * scale)),
        }
      }
      case 'width':
        return { width: options.sizeValue }
      case 'height':
        return { height: options.sizeValue }
      case 'shortEdge': {
        const short = Math.min(naturalWidth, naturalHeight)
        const scale = short > 0 ? options.sizeValue / short : 1
        return {
          width: Math.max(1, Math.round(naturalWidth * scale)),
          height: Math.max(1, Math.round(naturalHeight * scale)),
        }
      }
      case 'longEdge': {
        const long = Math.max(naturalWidth, naturalHeight)
        const scale = long > 0 ? options.sizeValue / long : 1
        return {
          width: Math.max(1, Math.round(naturalWidth * scale)),
          height: Math.max(1, Math.round(naturalHeight * scale)),
        }
      }
      default:
        return {}
    }
  }

  // ============ 输出文件信息 ============
  /** 计算输出 MIME（auto 返回 undefined，让 compressorjs 保留原格式） */
  function getOutputMime(file: File, options: CompressOptions): string | undefined {
    if (options.outputFormat === 'auto')
      return undefined
    return MIME_MAP[options.outputFormat]
  }

  /** 计算输出扩展名 */
  function getOutputExt(file: File, options: CompressOptions): string {
    if (options.outputFormat !== 'auto')
      return EXT_MAP[MIME_MAP[options.outputFormat]] ?? 'jpg'
    const originalExt = file.name.split('.').pop()?.toLowerCase() || ''
    return EXT_MAP[file.type] ?? (originalExt || 'jpg')
  }

  /** 生成输出文件名（前缀 + 原名 + 后缀 + 扩展名） */
  function buildOutputName(file: File, options: CompressOptions): string {
    const base = file.name.replace(/\.[^.]+$/, '')
    const ext = getOutputExt(file, options)
    return `${options.prefix}${base}${options.suffix}.${ext}`
  }

  // ============ 压缩单张图片 ============
  function compressFile(file: File, options: CompressOptions): Promise<CompressResult> {
    // 先读原图自然尺寸（sizeMode 需要基于原图计算目标尺寸）
    return loadImageSize(file).then(natural => new Promise<CompressResult>((resolve, reject) => {
      const start = Date.now()
      const outputName = buildOutputName(file, options)
      const mimeType = getOutputMime(file, options)
      const finalTarget = calcTargetSize(natural.width, natural.height, options)

      // compressorjs 以构造调用触发异步压缩，结果通过 success/error 回调返回，故用 void 明确忽略返回值
      // canvasFillColor / resize 的 'scale' 运行时均支持，但类型定义未收录，通过 spread 绕过类型校验
      const extraOptions: Record<string, string> = {}
      if (options.canvasFillColor)
        extraOptions.canvasFillColor = options.canvasFillColor

      void new Compressor(file, {
        quality: options.lossless ? 1 : options.quality / 100,
        strict: options.skipLarger,
        checkOrientation: options.checkOrientation,
        retainExif: options.retainExif,
        width: finalTarget.width,
        height: finalTarget.height,
        resize: options.resize as 'contain' | 'cover',
        mimeType,
        convertTypes: options.convertTypes,
        convertSize: options.convertSize,
        ...extraOptions,
        success(result) {
          const duration = Date.now() - start
          const compressedUrl = URL.createObjectURL(result)
          const originalUrl = URL.createObjectURL(file)
          const savedPercent = (originalSize: number) =>
            originalSize > 0 ? Math.round(((originalSize - result.size) / originalSize) * 100) : 0

          const finish = (width: number, height: number) => {
            resolve({
              id: `ic-${Date.now()}-${seq++}`,
              name: outputName,
              originalName: file.name,
              originalSize: file.size,
              compressedSize: result.size,
              originalWidth: natural.width,
              originalHeight: natural.height,
              compressedWidth: width,
              compressedHeight: height,
              savedPercent: savedPercent(file.size),
              mimeType: result.type || file.type,
              skipped: result.size >= file.size && options.skipLarger,
              duration,
              info: buildInfo(file.size, result.size, file.type, result.type),
              originalUrl,
              compressedUrl,
              file: result as File,
            })
          }

          // 读取压缩后尺寸（用于展示分辨率）
          const img = new Image()
          img.onload = () => finish(img.naturalWidth, img.naturalHeight)
          img.onerror = () => finish(natural.width, natural.height)
          img.src = compressedUrl
        },
        error(err) {
          reject(err)
        },
      })
    }))
  }

  /** 构建压缩信息描述 */
  function buildInfo(originalSize: number, compressedSize: number, originalType: string, resultType: string): string {
    const ratio = originalSize > 0 ? ((originalSize - compressedSize) / originalSize) * 100 : 0
    const ratioText = `${ratio.toFixed(1)}%`
    if (originalType !== resultType)
      return `已转 ${resultType.split('/')[1]}，压缩 ${ratioText}`
    return `压缩 ${ratioText}`
  }

  // ============ 批量压缩 ============
  /**
   * 开始压缩待处理列表中的图片
   * 压缩完成后自动写入输出目录（若已选择），并清空待处理列表
   * @param options 压缩选项
   */
  async function startCompress(options: CompressOptions): Promise<void> {
    if (pendingFiles.value.length === 0 || compressing.value)
      return

    compressing.value = true
    progress.value = 0
    const files = [...pendingFiles.value]
    const hasDir = outputDir.value != null
    let done = 0

    for (const file of files) {
      try {
        const item = await compressFile(file, options)
        results.value.push(item)
        if (hasDir)
          await writeToDirectory(item)
      }
      catch (e) {
        // 单张失败不中断整体
        console.error(`[ImageCompressor] 压缩失败: ${file.name}`, e)
      }
      done++
      progress.value = Math.round((done / files.length) * 100)
    }

    compressing.value = false
    pendingFiles.value = []
  }

  // ============ 对比预览（非弹窗，选中即展示）============
  const selectedIndex = ref(-1)
  const selectedItem = computed(() => {
    if (selectedIndex.value < 0 || selectedIndex.value >= results.value.length)
      return null
    return results.value[selectedIndex.value]
  })
  const previewScale = ref(1)
  const previewRotation = ref(0)

  /** 选中一条结果展示对比预览 */
  function openPreview(index: number) {
    if (index < 0 || index >= results.value.length)
      return
    selectedIndex.value = index
    previewScale.value = 1
    previewRotation.value = 0
  }

  /** 关闭对比预览 */
  function closePreview() {
    selectedIndex.value = -1
    previewScale.value = 1
    previewRotation.value = 0
  }

  /** 移除单条记录 */
  function removeResult(index: number) {
    const item = results.value[index]
    if (item) {
      URL.revokeObjectURL(item.originalUrl)
      URL.revokeObjectURL(item.compressedUrl)
    }
    results.value.splice(index, 1)
    if (selectedIndex.value === index) {
      closePreview()
    }
    else if (selectedIndex.value > index) {
      selectedIndex.value--
    }
  }

  function previewPrev() {
    if (selectedIndex.value > 0) {
      selectedIndex.value--
      previewScale.value = 1
      previewRotation.value = 0
    }
  }

  function previewNext() {
    if (selectedIndex.value < results.value.length - 1) {
      selectedIndex.value++
      previewScale.value = 1
      previewRotation.value = 0
    }
  }

  function zoomIn() {
    previewScale.value = Math.min(previewScale.value + 0.25, 5)
  }

  function zoomOut() {
    previewScale.value = Math.max(previewScale.value - 0.25, 0.2)
  }

  function rotate() {
    previewRotation.value = (previewRotation.value + 90) % 360
  }

  return {
    // 待压缩文件
    inputRef,
    pendingFiles,
    selectFiles,
    pickImages,
    removePendingFile,
    clearPendingFiles,
    // 输出目录
    outputDir,
    outputDirName,
    supportsDirectoryPicker,
    chooseOutputDir,
    clearOutputDir,
    // 压缩
    compressing,
    progress,
    startCompress,
    // 结果
    results,
    clearHistory,
    removeResult,
    // 对比预览
    selectedIndex,
    selectedItem,
    previewScale,
    previewRotation,
    openPreview,
    closePreview,
    previewPrev,
    previewNext,
    zoomIn,
    zoomOut,
    rotate,
  }
}
