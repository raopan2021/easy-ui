import type { Ref } from 'vue'

import type { DictItem, DictTagProps } from './types'
import { computed } from 'vue'

/**
 * DictTag 值解析与样式派生（纯 props + dictList 派生，无副作用）。
 *
 * 将原 dict-tag.vue 中的 `hasValue` / `multipleValues` / `singleItem` /
 * `multipleItems` / `buildColorStyle` 抽离为独立 composable。
 * 依赖 props（value / valueField / labelField / effect）与已加载的 dictList。
 *
 * @param props    字典标签 props（需响应式）
 * @param dictList 已加载的字典列表（来自 useDictData）
 */
export function useDictTag(props: DictTagProps, dictList: Ref<DictItem[]>) {
  /** 是否有值（空字符串 / 空数组 / null / undefined 均视为无值） */
  const hasValue = computed(() => {
    if (props.value === undefined || props.value === null || props.value === '')
      return false
    if (Array.isArray(props.value))
      return props.value.length > 0
    return true
  })

  /** 将多选值统一转为字符串数组（兼容数组 / 逗号拼接字符串 / 单值） */
  const multipleValues = computed<string[]>(() => {
    if (!hasValue.value)
      return []
    const v = props.value
    if (Array.isArray(v))
      return v.map(String)
    if (typeof v === 'string') {
      return v
        .split(',')
        .map(s => s.trim())
        .filter(Boolean)
    }
    return [String(v)]
  })

  /** 单选：根据 valueField 匹配到对应字典项 */
  const singleItem = computed<DictItem | null>(() => {
    if (!hasValue.value || dictList.value.length === 0)
      return null
    const strVal = String(props.value)
    return dictList.value.find(item => String(item[props.valueField ?? 'id']) === strVal) ?? null
  })

  /** 多选：匹配所有对应字典项 */
  const multipleItems = computed<DictItem[]>(() => {
    if (!hasValue.value || dictList.value.length === 0)
      return []
    return multipleValues.value
      .map(v => dictList.value.find(item => String(item[props.valueField ?? 'id']) === v))
      .filter((item): item is DictItem => Boolean(item))
  })

  /**
   * 根据自定义颜色生成 Tag 行内样式（区分 light / plain / dark 三种效果）。
   * @param color 自定义颜色值
   */
  function buildColorStyle(color: string) {
    if (props.effect === 'dark') {
      return { backgroundColor: color, borderColor: color, color: '#fff' }
    }
    if (props.effect === 'plain') {
      return { backgroundColor: 'transparent', borderColor: color, color }
    }
    return { backgroundColor: `${color}1a`, borderColor: `${color}40`, color }
  }

  return {
    hasValue,
    multipleValues,
    singleItem,
    multipleItems,
    buildColorStyle,
  }
}
