import type { ImageUploadEmits, ImageUploadProps, UploadFile } from './types'

import { computed, ref, watch } from 'vue'

/**
 * 上传模式：
 * - local：本地上传（base64，纯前端预览，无需后端接口）
 * - network：网络上传（需要后端接口）
 */
const UPLOAD_MODE: 'local' | 'network' = 'local'

/**
 * 网络上传配置（mode = 'network' 时生效）
 * ⚠️ 修改这里的配置来自定义你的上传接口  此配置仅为参考示例，请根据实际业务需求进行修改
 */
const NETWORK_CONFIG = {
  /** 上传接口地址 */
  url: '/api/upload/image',
  /** 请求方法 */
  method: 'POST' as const,
  /** 上传字段名（FormData 的 key） */
  fieldName: 'file',
  /** 请求头 */
  headers: {
    // 'Authorization': 'Bearer xxx',
  },
  /** 额外表单参数 */
  data: {
    // 'scene': 'avatar',
  },
  /**
   * 如何从响应中提取图片 URL？
   * 支持三种路径写法（自动兼容）：
   * - 'url'          → response: { url: '...' }
   * - 'data'         → response: { data: '...' }
   * - 'data.url'     → response: { data: { url: '...' } }
   */
  responseUrlPath: 'data',
}

/**
 * EasyImageUpload 核心逻辑 composable
 *
 * 将原本内联在 image-upload.vue 中的内置校验、modelValue 同步、
 * 本地/网络上传、删除、图片预览（缩放/旋转/拖拽）等逻辑抽离为独立 composable，
 * 让 .vue 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 *
 * @param props 图片上传 props（需传入响应式对象）
 * @param emit  图片上传事件触发函数（callable 形式，见 ImageUploadEmits）
 */
export function useImageUpload(props: ImageUploadProps, emit: ImageUploadEmits) {
  // ===================== 内部状态 =====================
  const inputRef = ref<HTMLInputElement>()
  const isDragover = ref(false)
  const fileList = ref<UploadFile[]>([])

  /** 是否达到上传上限 */
  const isMaxReached = computed(() => {
    if (props.limit === undefined)
      return false
    return fileList.value.filter(f => f.status !== 'error').length >= props.limit
  })

  // ===================== 内置校验 =====================
  /** 内置校验：返回错误信息字符串，null 表示校验通过 */
  function validateFile(file: File): string | null {
    // 校验文件类型
    if (props.acceptTypes) {
      const allowed = props.acceptTypes.split(',').map(t => t.trim().toLowerCase())
      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      const mimeMatch = allowed.includes(file.type.toLowerCase())
      const extMatch = allowed.some(t => t === ext || t === `.${ext}`)
      if (!mimeMatch && !extMatch) {
        return `不支持 ${ext || file.type} 格式，请上传 ${props.acceptTypes} 格式`
      }
    }
    // 校验最小尺寸
    if (props.minSize && file.size < props.minSize * 1024 * 1024) {
      return `文件大小不能小于 ${props.minSize}MB`
    }
    // 校验最大尺寸
    if (props.maxSize && file.size > props.maxSize * 1024 * 1024) {
      return `文件大小不能超过 ${props.maxSize}MB`
    }
    return null
  }

  /** 缩略图尺寸样式 */
  const itemStyle = computed(() => ({
    width: `${props.size}px`,
    height: `${props.size}px`,
  }))

  // ===================== modelValue 同步 =====================
  /**
   * 将外部 modelValue 解析为 url 数组。
   * string 模式：每项经过 encodeURIComponent 编码后用逗号拼接，
   * 解析时 split(',') 再逐项 decodeURIComponent 还原。
   * base64 中的逗号被编码为 %2C，不会干扰分隔。
   * 普通 http URL 无 % 字符，decode 后原样还原，兼容旧数据。
   */
  function parseModelValue(val: string[] | string | undefined): string[] {
    if (!val)
      return []
    if (Array.isArray(val))
      return val.filter(Boolean)
    return val
      .split(',')
      .map((s) => {
        try {
          return decodeURIComponent(s.trim())
        }
        catch {
          return s.trim()
        }
      })
      .filter(Boolean)
  }

  /** 将内部 url 数组序列化为 modelValue 格式 */
  function serializeUrls(urls: string[]): string[] | string {
    if (props.valueMode === 'string')
      return urls.map(u => encodeURIComponent(u)).join(',')
    return urls
  }

  // 监听外部值变化 → 同步到 fileList（仅同步已有 URL）
  watch(
    () => props.modelValue,
    (val) => {
      const urls = parseModelValue(val)
      // 只有当外部值与内部不一致时才同步（避免循环更新）
      const currentUrls = fileList.value.filter(f => f.url && f.status === 'success').map(f => f.url!)
      const isSame = urls.length === currentUrls.length && urls.every((u, i) => u === currentUrls[i])
      if (isSame)
        return

      fileList.value = urls.map((url, i) => ({
        uid: `init-${i}-${url}`,
        name: url.split('/').pop() || `image-${i}`,
        url,
        status: 'success' as UploadFile['status'],
      }))
    },
    { immediate: true },
  )

  /** 向外 emit 更新 */
  function emitUpdate() {
    const successUrls = fileList.value.filter(f => f.status === 'success' && f.url).map(f => f.url!)
    emit('update:modelValue', serializeUrls(successUrls))
    emit('change', [...fileList.value])
  }

  // ===================== 触发选文件 =====================
  function handleTriggerClick() {
    if (props.disabled)
      return
    inputRef.value?.click()
  }

  // 处理 input 选文件
  function handleInputChange(e: Event) {
    const input = e.target as HTMLInputElement
    const files = Array.from(input.files || [])
    if (!files.length)
      return
    input.value = '' // 重置，以便重复选同一文件
    processFiles(files)
  }

  // 处理拖拽
  function handleDrop(e: DragEvent) {
    isDragover.value = false
    if (props.disabled)
      return
    const files = Array.from(e.dataTransfer?.files || []).filter(f => f.type.startsWith('image/'))
    processFiles(files)
  }

  // ===================== 文件处理 =====================
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

    for (const file of files) {
      await uploadFile(file)
    }
  }

  async function uploadFile(file: File) {
    // 内置校验
    const validateError = validateFile(file)
    if (validateError) {
      emit('validate-error', validateError, file)
      return
    }

    const uid = `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`
    const uploadItem: UploadFile = {
      uid,
      name: file.name,
      status: 'uploading',
      percent: 0,
      raw: file,
    }
    fileList.value.push(uploadItem)

    const item = fileList.value.find(f => f.uid === uid)!

    // 根据 mode 选择上传方式
    if (UPLOAD_MODE === 'network') {
      networkUpload({ file, item })
    }
    else {
      defaultLocalUpload({ file, item })
    }
  }

  /** 网络上传（mode = 'network' 时使用） 以下为示例，可根据实际开发中后端接口和代码风格修改上传逻辑 */
  async function networkUpload(opts: { file: File, item: UploadFile }) {
    const { file, item } = opts
    const { url, method, fieldName, headers, data, responseUrlPath } = NETWORK_CONFIG

    const formData = new FormData()
    formData.append(fieldName, file)
    // 添加额外参数
    Object.entries(data).forEach(([key, value]) => {
      formData.append(key, value as string | Blob)
    })

    try {
      const res = await fetch(url, {
        method,
        headers,
        body: formData,
      })

      if (!res.ok)
        throw new Error(`上传失败: ${res.status}`)

      const response = await res.json()

      // 从响应中提取 URL（兼容三种写法）
      let imageUrl: string
      if (responseUrlPath === 'url') {
        imageUrl = response.url
      }
      else if (responseUrlPath === 'data') {
        imageUrl = response.data
      }
      else if (responseUrlPath === 'data.url') {
        imageUrl = response.data?.url
      }
      else {
        imageUrl = (response as any)[responseUrlPath]
      }

      if (!imageUrl)
        throw new Error('响应中未找到图片地址')

      item.url = imageUrl
      item.status = 'success'
      item.percent = 100
      emit('success', imageUrl, { ...item })
      emitUpdate()
    }
    catch (error) {
      item.status = 'error'
      emit('error', error as Error, { ...item })
    }
  }

  /** 默认本地上传：模拟进度 + FileReader 读取 base64 */
  function defaultLocalUpload(opts: { file: File, item: UploadFile }) {
    const { file, item } = opts
    // 模拟进度
    let progress = 0
    const timer = setInterval(() => {
      progress += Math.random() * 30
      if (progress >= 90) {
        clearInterval(timer)
        item.percent = 90
      }
      else {
        item.percent = Math.floor(progress)
      }
    }, 80)

    const reader = new FileReader()
    reader.onload = (e) => {
      clearInterval(timer)
      item.url = e.target?.result as string
      item.status = 'success'
      item.percent = 100
      emit('success', item.url, { ...item })
      emitUpdate()
    }
    reader.onerror = () => {
      clearInterval(timer)
      item.status = 'error'
      emit('error', new Error('读取文件失败'), { ...item })
    }
    reader.readAsDataURL(file)
  }

  // ===================== 删除 =====================
  function handleRemove(index: number) {
    const removed = fileList.value.splice(index, 1)[0]
    emit('remove', removed, [...fileList.value])
    emitUpdate()
  }

  // ===================== 预览 =====================
  const previewVisible = ref(false)
  const previewIndex = ref(0)
  const previewScale = ref(1)
  const previewRotation = ref(0)
  const previewPos = ref({ x: 0, y: 0 })
  const previewDragOffset = ref({ x: 0, y: 0 })
  const previewIsDragging = ref(false)

  const previewUrlList = computed(() => fileList.value.filter(f => f.status === 'success' && f.url).map(f => f.url!))

  const previewImgStyle = computed(() => ({
    transform: `translate(${previewPos.value.x + previewDragOffset.value.x}px, ${previewPos.value.y + previewDragOffset.value.y}px) scale(${previewScale.value}) rotate(${previewRotation.value}deg)`,
    transition: previewIsDragging.value ? 'none' : 'transform 0.25s ease',
    cursor: previewScale.value > 1 ? (previewIsDragging.value ? 'grabbing' : 'grab') : 'default',
  }))

  function handlePreview(index: number) {
    if (!props.previewable)
      return
    // 映射到 success 图片的索引
    const successItems = fileList.value.filter(f => f.status === 'success' && f.url)
    const successIndex = successItems.findIndex((_, i) => {
      const allIndex = fileList.value.indexOf(successItems[i])
      return allIndex === index
    })
    previewIndex.value = Math.max(0, successIndex)
    previewReset()
    previewVisible.value = true
  }

  function previewPrev() {
    previewIndex.value = previewIndex.value > 0 ? previewIndex.value - 1 : previewUrlList.value.length - 1
    previewReset()
  }

  function previewNext() {
    previewIndex.value = previewIndex.value < previewUrlList.value.length - 1 ? previewIndex.value + 1 : 0
    previewReset()
  }

  function previewZoomIn() {
    previewScale.value = Math.min(previewScale.value + 0.25, 5)
  }
  function previewZoomOut() {
    previewScale.value = Math.max(previewScale.value - 0.25, 0.2)
  }
  function previewRotateLeft() {
    previewRotation.value -= 90
  }
  function previewRotateRight() {
    previewRotation.value += 90
  }
  function previewReset() {
    previewScale.value = 1
    previewRotation.value = 0
    previewPos.value = { x: 0, y: 0 }
    previewDragOffset.value = { x: 0, y: 0 }
  }

  function handlePreviewWheel(e: WheelEvent) {
    e.deltaY < 0 ? previewZoomIn() : previewZoomOut()
  }

  function handlePreviewDragStart(e: MouseEvent) {
    if (previewScale.value <= 1)
      return
    previewIsDragging.value = true
    const startX = e.clientX
    const startY = e.clientY
    const onMove = (me: MouseEvent) => {
      previewDragOffset.value = { x: me.clientX - startX, y: me.clientY - startY }
    }
    const onUp = () => {
      previewIsDragging.value = false
      previewPos.value = {
        x: previewPos.value.x + previewDragOffset.value.x,
        y: previewPos.value.y + previewDragOffset.value.y,
      }
      previewDragOffset.value = { x: 0, y: 0 }
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  // ESC 关闭预览
  watch(previewVisible, (val) => {
    const onKeydown = (e: KeyboardEvent) => {
      if (e.key === 'Escape')
        previewVisible.value = false
    }
    if (val) {
      document.addEventListener('keydown', onKeydown)
      document.body.style.overflow = 'hidden'
    }
    else {
      document.removeEventListener('keydown', onKeydown)
      document.body.style.overflow = ''
    }
  })

  return {
    // 状态
    inputRef,
    isDragover,
    fileList,
    isMaxReached,
    itemStyle,
    // 触发选文件
    handleTriggerClick,
    handleInputChange,
    handleDrop,
    // 删除
    handleRemove,
    // 预览
    previewVisible,
    previewIndex,
    previewUrlList,
    previewImgStyle,
    handlePreview,
    handlePreviewWheel,
    handlePreviewDragStart,
    previewPrev,
    previewNext,
    previewZoomIn,
    previewZoomOut,
    previewRotateLeft,
    previewRotateRight,
    previewReset,
    // 清空 / 列表（供 defineExpose 使用）
    clearFileList: () => {
      fileList.value = []
      emitUpdate()
    },
    getFileList: () => [...fileList.value],
  }
}
