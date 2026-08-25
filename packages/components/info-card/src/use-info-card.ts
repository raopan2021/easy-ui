import type { EmitFn } from 'vue'

import type { InfoCardDescItem, InfoCardEmits, InfoCardResolvedProps } from './types'
import { computed } from 'vue'

/**
 * 信息卡片核心逻辑：描述信息归一化 + 交互事件。
 *
 * 将原本内联在 info-card.vue 中的「数据解析」与「事件」两段逻辑抽离为独立
 * composable，便于单测复用，并让 .vue 仅承担「组合 + 模板」职责
 * （对齐 markdown / progress 拆分规范）。行为与原实现完全一致。
 *
 * @param props 信息卡片 props（withDefaults 处理后的响应式对象）
 * @param emit 信息卡片事件发射器（由 defineEmits 返回）
 */
export function useInfoCard(props: InfoCardResolvedProps, emit: EmitFn<InfoCardEmits>) {
  /**
   * 统一描述信息为对象数组，屏蔽三种入参形态的差异，模板只需按对象渲染：
   * - 空值 → 空数组（不渲染任何描述项）；
   * - 字符串 → 单项数组；
   * - 数组 → 逐项归一化（字符串项补成 { text }，对象项原样保留以保留 icon）。
   */
  const descriptionList = computed<InfoCardDescItem[]>(() => {
    const desc = props.description
    if (!desc)
      return []
    if (typeof desc === 'string')
      return [{ text: desc }]
    if (Array.isArray(desc)) {
      return desc.map((item) => {
        if (typeof item === 'string')
          return { text: item }
        return item
      })
    }
    return []
  })

  /** 点击卡片：仅在 clickable 为 true 时向外派发 click（非可点击态保持静默） */
  function handleClick(e: MouseEvent) {
    if (props.clickable) {
      emit('click', e)
    }
  }

  /** 图片加载失败兜底：隐藏该 img 元素，避免出现浏览器默认的破图占位 */
  function handleImageError(e: Event) {
    const img = e.target as HTMLImageElement
    img.style.display = 'none'
  }

  return { descriptionList, handleClick, handleImageError }
}
