import type { FieldNames, FileInputType, FileItem } from './types'

import { init as initPptxPreview } from 'pptx-preview'
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'

import { getFileName, getFileType } from './file-utils'
import { getFileIcon } from './use-file-icons'

/**
 * EasyFilePreview 核心逻辑 composable
 *
 * 将原本内联在 file-preview.vue 中的文件规范化、弹窗状态、内容加载、
 * 资源清理、ESC 关闭等逻辑抽离为独立 composable，
 * 让 .vue 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 *
 * @param props 文件预览 props
 * @param props.files 文件列表（URL 字符串 / 文件对象 / 对象数组）
 * @param props.fieldNames 自定义字段名映射（name / url / size）
 */
export function useFilePreview(props: {
  files?: FileInputType | FileInputType[]
  fieldNames?: FieldNames
}) {
  // ──── 文件规范化（统一为 FileItem[]）────
  const normalizedFiles = computed<FileItem[]>(() => {
    const { name: nf = 'name', url: uf = 'url', size: sf = 'size' } = props.fieldNames ?? {}
    const raw = props.files
    if (!raw)
      return []
    if (typeof raw === 'string') {
      return raw
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
        .map(url => ({ name: getFileName(url), url, size: undefined }))
    }
    if (Array.isArray(raw)) {
      if (raw.length === 0)
        return []
      return raw.map((item) => {
        if (typeof item === 'string')
          return { name: getFileName(item), url: item, size: undefined }
        const url = String((item as any)[uf] ?? '')
        return { name: String((item as any)[nf] ?? getFileName(url)), url, size: (item as any)[sf] }
      })
    }
    if (typeof raw === 'object') {
      const url = String((raw as any)[uf] ?? '')
      return [{ name: String((raw as any)[nf] ?? getFileName(url)), url, size: (raw as any)[sf] }]
    }
    return []
  })

  // ──── 弹窗状态 ────
  const visible = ref(false)
  const currentIndex = ref(0)
  const loading = ref(false)
  const loadingText = ref('加载中...')
  const officeSrc = ref<string | ArrayBuffer | Blob>('')
  const officeError = ref('')
  const pptContainerRef = ref<HTMLElement | null>(null)
  let pptPreviewer: ReturnType<typeof initPptxPreview> | null = null

  /** 当前预览文件 */
  const currentFile = computed(() => normalizedFiles.value[currentIndex.value])
  /** 当前文件类型（pdf / word / excel / ppt / image / video / file） */
  const currentType = computed(() => getFileType(currentFile.value?.url ?? ''))
  /** 当前文件图标组件 */
  const currentIcon = computed(() => getFileIcon(currentFile.value?.url ?? ''))

  // ──── 资源清理（PPT 实例 / Office 地址 / 错误信息）────
  function cleanupResources() {
    officeSrc.value = ''
    officeError.value = ''
    if (pptPreviewer) {
      pptPreviewer.destroy()
      pptPreviewer = null
    }
    if (pptContainerRef.value)
      pptContainerRef.value.innerHTML = ''
  }

  /** 打开预览 */
  async function openPreview(file: FileItem) {
    const idx = normalizedFiles.value.findIndex(f => f.url === file.url)
    currentIndex.value = idx >= 0 ? idx : 0
    cleanupResources()
    loading.value = true
    loadingText.value = '加载中...'
    visible.value = true
    await nextTick()
    await loadFileContent()
  }

  /** 关闭预览 */
  function closePreview() {
    visible.value = false
  }

  /** 切换上一个 / 下一个文件 */
  async function navigate(dir: 1 | -1) {
    const next = currentIndex.value + dir
    if (next < 0 || next >= normalizedFiles.value.length)
      return
    currentIndex.value = next
    cleanupResources()
    loading.value = true
    loadingText.value = '加载中...'
    await loadFileContent()
  }

  /** 加载当前文件内容（按类型分派渲染方式） */
  async function loadFileContent() {
    const url = currentFile.value?.url
    if (!url) {
      loading.value = false
      return
    }
    const type = currentType.value

    // vue-office 支持 pdf/word/excel，直接传 URL 即可
    if (type === 'pdf' || type === 'word' || type === 'excel') {
      const typeLabel = type === 'pdf' ? 'PDF' : type === 'word' ? 'Word' : 'Excel'
      loadingText.value = `正在加载 ${typeLabel} 文档...`
      try {
        officeSrc.value = url
      }
      catch (e: any) {
        officeError.value = e.message || '文件加载失败'
      }
    }
    else if (type === 'ppt') {
      loadingText.value = '正在加载 PPT 文档...'
      try {
        // 需要先等 DOM 就绪（pptContainerRef 存在）
        await nextTick()
        const container = pptContainerRef.value
        if (!container) {
          console.error('[FilePreview] PPT 容器 ref 为 null')
          throw new Error('PPT 渲染容器未就绪')
        }

        // 先 init，再 fetch + preview
        if (pptPreviewer) {
          pptPreviewer.destroy()
          pptPreviewer = null
        }
        pptPreviewer = initPptxPreview(container, { mode: 'list', width: 960 })

        const res = await fetch(url)
        if (!res.ok)
          throw new Error(`HTTP ${res.status}`)
        const buffer = await res.arrayBuffer()
        console.warn('[FilePreview] PPT ArrayBuffer loaded:', buffer.byteLength, 'bytes')
        await pptPreviewer.preview(buffer)
        console.warn(
          '[FilePreview] PPT preview() done, wrapper children:',
          container.querySelectorAll('.pptx-preview-wrapper').length,
          container.innerHTML.length,
        )
      }
      catch (e: any) {
        console.error('[FilePreview] PPT 渲染失败:', e)
        officeError.value = typeof e === 'string' ? e : e?.message || 'PPT 加载失败'
      }
    }

    loading.value = false
  }

  /** 文档渲染完成回调（vue-office 组件触发） */
  function onRendered() {
    loading.value = false
  }

  /** 文档渲染失败回调（vue-office 组件触发） */
  function onError(e: any) {
    loading.value = false
    officeError.value = typeof e === 'string' ? e : e?.message || '文件渲染失败'
  }

  // ──── ESC 关闭 / 清理 ────
  watch(visible, (val) => {
    if (!val)
      return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closePreview()
        window.removeEventListener('keydown', handler)
      }
    }
    window.addEventListener('keydown', handler)
    watch(
      visible,
      (v) => {
        if (!v)
          window.removeEventListener('keydown', handler)
      },
      { once: true },
    )
  })

  watch(visible, (v) => {
    if (!v)
      cleanupResources()
  })

  onBeforeUnmount(() => cleanupResources())

  return {
    normalizedFiles,
    visible,
    currentIndex,
    loading,
    loadingText,
    officeSrc,
    officeError,
    pptContainerRef,
    currentFile,
    currentType,
    currentIcon,
    openPreview,
    closePreview,
    navigate,
    onRendered,
    onError,
  }
}
