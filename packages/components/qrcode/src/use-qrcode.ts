import type { QrcodeEmits, QrcodeProps } from './types'

import QRCode from 'qrcode'

import { nextTick, onMounted, ref, watch } from 'vue'

/**
 * 二维码绘制、Logo 合成与导出逻辑（qrcode 库 + Canvas）。
 *
 * 将原本内联在 qrcode.vue 中的绘制、Logo、监听逻辑抽离为独立 composable，
 * 让 .vue 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 *
 * @param props 二维码 props（需传入响应式对象，composable 内部 watch 会自动追踪依赖）
 * @param emit 二维码事件触发器（生成完成 / 失败）
 */
export function useQrcode(props: QrcodeProps, emit: QrcodeEmits) {
  /** Canvas 元素引用（由模板 ref 绑定） */
  const canvasRef = ref<HTMLCanvasElement | null>(null)

  /** 绘制二维码到 Canvas */
  async function drawQRCode(): Promise<void> {
    if (!canvasRef.value || !props.content)
      return

    try {
      const canvas = canvasRef.value
      canvas.width = props.size ?? 200
      canvas.height = props.size ?? 200
      canvas.style.width = `${props.size ?? 200}px`
      canvas.style.height = `${props.size ?? 200}px`

      // 使用 qrcode 库绘制
      await QRCode.toCanvas(canvas, props.content, {
        width: props.size ?? 200,
        margin: props.margin,
        errorCorrectionLevel: props.correctLevel,
        color: {
          dark: props.colorDark,
          light: props.colorLight,
        },
      })

      // 绘制 Logo
      if (props.logo) {
        await drawLogo(canvas)
      }

      // 触发完成事件
      const dataUrl = canvas.toDataURL('image/png')
      emit('generated', dataUrl)
    }
    catch (error) {
      emit('error', error as Error)
    }
  }

  /** 绘制 Logo */
  async function drawLogo(canvas: HTMLCanvasElement): Promise<void> {
    if (!props.logo)
      return

    const ctx = canvas.getContext('2d')
    if (!ctx)
      return

    const logoSize = props.logoSize || (props.size ?? 200) * 0.15
    const x = (canvas.width - logoSize) / 2
    const y = (canvas.height - logoSize) / 2
    const r = props.logoRadius ?? 8

    // 绘制白色背景
    ctx.fillStyle = props.logoBackgroundColor ?? '#ffffff'
    ctx.beginPath()
    ctx.moveTo(x + r, y)
    ctx.lineTo(x + logoSize - r, y)
    ctx.quadraticCurveTo(x + logoSize, y, x + logoSize, y + r)
    ctx.lineTo(x + logoSize, y + logoSize - r)
    ctx.quadraticCurveTo(x + logoSize, y + logoSize, x + logoSize - r, y + logoSize)
    ctx.lineTo(x + r, y + logoSize)
    ctx.quadraticCurveTo(x, y + logoSize, x, y + logoSize - r)
    ctx.lineTo(x, y + r)
    ctx.quadraticCurveTo(x, y, x + r, y)
    ctx.closePath()
    ctx.fill()

    // 加载并绘制 Logo 图片
    try {
      const img = await loadImage(props.logo)
      ctx.save()
      ctx.beginPath()
      ctx.moveTo(x + r, y)
      ctx.lineTo(x + logoSize - r, y)
      ctx.quadraticCurveTo(x + logoSize, y, x + logoSize, y + r)
      ctx.lineTo(x + logoSize, y + logoSize - r)
      ctx.quadraticCurveTo(x + logoSize, y + logoSize, x + logoSize - r, y + logoSize)
      ctx.lineTo(x + r, y + logoSize)
      ctx.quadraticCurveTo(x, y + logoSize, x, y + logoSize - r)
      ctx.lineTo(x, y + r)
      ctx.quadraticCurveTo(x, y, x + r, y)
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(img, x, y, logoSize, logoSize)
      ctx.restore()
    }
    catch {
      // Logo 加载失败，跳过
    }
  }

  /** 加载图片 */
  function loadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.crossOrigin = 'anonymous'
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = src
    })
  }

  /** 暴露：生成并返回 base64 数据 URL */
  function toDataURL(): string {
    return canvasRef.value?.toDataURL('image/png') || ''
  }

  /** 暴露：生成并返回 Blob 对象 */
  function toBlob(): Promise<Blob | null> {
    return new Promise((resolve) => {
      if (!canvasRef.value) {
        resolve(null)
        return
      }
      canvasRef.value.toBlob(resolve, 'image/png')
    })
  }

  /** 暴露：下载二维码图片 */
  function download(filename = 'qrcode.png'): void {
    const link = document.createElement('a')
    link.download = filename
    link.href = canvasRef.value?.toDataURL('image/png') || ''
    link.click()
  }

  // 监听属性变化
  watch(
    () => [
      props.content,
      props.size,
      props.colorDark,
      props.colorLight,
      props.correctLevel,
      props.logo,
      props.logoSize,
      props.logoBackgroundColor,
      props.logoRadius,
      props.margin,
    ],
    () => nextTick(drawQRCode),
    { deep: true },
  )

  onMounted(() => {
    nextTick(() => {
      if (props.content) {
        drawQRCode()
      }
    })
  })

  return {
    canvasRef,
    toDataURL,
    toBlob,
    download,
  }
}
