import type { EmptyProps } from './empty'

import { computed } from 'vue'

import { useEmptyIllustrations } from './use-empty-illustrations'

/** 各类型的默认描述文案 */
const defaultDescMap: Record<NonNullable<EmptyProps['type']>, string> = {
  default: '暂无数据',
  data: '暂无数据',
  search: '没有找到相关内容',
  network: '网络连接异常',
  permission: '暂无权限访问',
  list: '列表为空',
}

/**
 * 空状态组件核心逻辑：图片尺寸派生 + 默认描述解析 + 内置插图选择。
 *
 * 将原本内联在 empty.vue 中的 computed（wrapStyle / imageStyle / currentSvg）
 * 与描述文案映射抽离为独立 composable，便于单测复用，并让 .vue 仅承担
 * 「组合 + 模板」职责（对齐 markdown / progress 拆分规范）。
 *
 * @param props 空状态 props（响应式对象，computed 会自动追踪依赖）
 */
export function useEmpty(props: EmptyProps) {
  /** 根节点样式（预留扩展，当前无额外样式） */
  const wrapStyle = computed<Record<string, string>>(() => ({}))

  /** 图片区域尺寸样式（按 imageSize 决定宽度，数值自动补 px） */
  const imageStyle = computed<Record<string, string>>(() => {
    if (!props.imageSize)
      return {} as Record<string, string>
    const size = typeof props.imageSize === 'number' ? `${props.imageSize}px` : props.imageSize
    return { width: size }
  })

  /** 最终展示的描述文案（优先 props.description，否则取类型默认文案） */
  const descriptionText = computed(() => props.description || defaultDescMap[props.type as NonNullable<EmptyProps['type']>])

  const { svgMap } = useEmptyIllustrations()

  /** 当前类型对应的内置插图渲染函数（缺省回退到 default） */
  const currentSvg = computed(() => svgMap[props.type as NonNullable<EmptyProps['type']>] || svgMap.default)

  return { wrapStyle, imageStyle, descriptionText, currentSvg }
}
