import type { Component, CSSProperties } from 'vue'
import type { EasyIconEmits, EasyIconProps } from './types'
import * as EpIcons from '@element-plus/icons-vue'

import { computed, markRaw } from 'vue'
import { getSvgContent } from './svg-map'

/** 图标解析模式（与 types.ts 中的 IconMode 一致） */
type IconMode = 'element' | 'svg' | 'image'

/**
 * 图标组件核心逻辑 composable。
 *
 * 将原本内联在 icon.vue 中的「名称前缀解析 / EP 图标动态映射 / SVG 内容获取 /
 * 图片路径解析 / 根节点样式 / 点击与图片加载错误处理」抽离为独立 composable，
 * 便于单测复用，也让 .vue 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 *
 * @param props 组件 props（需传入响应式对象，computed 会自动追踪依赖）
 * @param emit  组件 emit（callable 形式，见 EasyIconEmits）
 */
export function useIcon(props: EasyIconProps, emit: EasyIconEmits) {
  /** 解析前缀和实际名称 */
  const parsed = computed(() => {
    const n = props.name.trim()
    if (n.startsWith('el:')) {
      return { type: 'element' as IconMode, value: n.slice(3) }
    }
    if (n.startsWith('svg:')) {
      return { type: 'svg' as IconMode, value: n.slice(4) }
    }
    // 无前缀：图片 URL
    return { type: 'image' as IconMode, value: n }
  })

  /** 解析后的图标模式 */
  const mode = computed<IconMode>(() => parsed.value.type)

  /** Element Plus 图标映射（避免重复导入） */
  const epIconsMap = markRaw(EpIcons) as Record<string, Component>

  /** 动态解析 Element Plus 图标组件 */
  const epComponent = computed<Component | null>(() => {
    if (mode.value !== 'element')
      return null
    const name = parsed.value.value
    // 将 kebab-case 转为 PascalCase：arrow-down → ArrowDown
    const pascalName = name.replace(/(?:^|-)(\w)/g, (_, c: string) => c.toUpperCase())
    return epIconsMap[pascalName] || epIconsMap[name] || null
  })

  /** SVG 内容（svg: 前缀生效） */
  const svgContent = computed(() => {
    if (mode.value !== 'svg')
      return ''
    return getSvgContent(parsed.value.value) || ''
  })

  /** 解析图片路径（支持网络 URL / Vite 别名 @ / 相对路径） */
  const resolvedImageSrc = computed<string>(() => {
    const src = parsed.value.value
    console.warn('[EasyIcon] Original src:', src)

    // http(s):// 开头的网络图片，直接使用
    if (src.startsWith('http://') || src.startsWith('https://')) {
      console.warn('[EasyIcon] Using as network URL')
      return src
    }

    // @/ 开头的 Vite 别名路径，使用 new URL() 解析
    if (src.startsWith('@/')) {
      try {
        // 将 @/ 替换为 /src/，new URL 需要绝对路径
        const absolutePath = src.replace(/^@\//, '/src/')
        console.warn('[EasyIcon] Converting @/ path:', absolutePath, 'from', import.meta.url)
        const result = new URL(absolutePath, import.meta.url).href
        console.warn('[EasyIcon] Resolved to:', result)
        return result
      }
      catch (error) {
        console.error('[EasyIcon] Failed to resolve @/ path:', src, error)
        return src
      }
    }

    // 相对路径和其他情况，直接使用
    console.warn('[EasyIcon] Using as-is (relative path)')
    return src
  })

  /** 根元素样式（当前仅承载 color，预留扩展） */
  const rootStyle = computed<CSSProperties>(() => {
    const style: CSSProperties = {}
    if (props.color) {
      style.color = props.color
    }
    return style
  })

  /** 点击图标（仅 clickable 时触发 emit） */
  function handleClick(event: MouseEvent) {
    if (props.clickable) {
      emit('click', event)
    }
  }

  /** 图片加载成功回调（调试日志） */
  function handleImageLoad(event: Event) {
    const img = event.target as HTMLImageElement
    console.warn('[EasyIcon] Image loaded successfully:', props.name, '→', img.src)
  }

  /** 图片加载失败回调（打印诊断信息并隐藏 img） */
  function handleImageError(event: Event) {
    const img = event.target as HTMLImageElement
    console.error(
      '[EasyIcon] Failed to load image:',
      props.name,
      '\n尝试加载的 URL:',
      img.src,
      '\n支持的用法：',
      '- 网络图片: <EasyIcon name="https://example.com/icon.png" />',
      '- Vite 别名: <EasyIcon name="@/assets/icon/img.png" />',
      '- import URL: import imgUrl from "@/assets/icon.png?url"',
    )
    img.style.display = 'none'
  }

  return {
    mode,
    epComponent,
    svgContent,
    resolvedImageSrc,
    rootStyle,
    handleClick,
    handleImageLoad,
    handleImageError,
  }
}
