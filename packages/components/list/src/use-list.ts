import type { ListEmits, ListItem, ListProps } from './types'

/**
 * 列表组件核心逻辑 composable。
 *
 * 将原本内联在 list.vue 中的「行 key 解析 / 字段取值 / 点击上报 /
 * 图片 URL 判定」抽离为独立 composable，便于单测复用，
 * 也让 .vue 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 *
 * @param props 组件 props（需传入响应式对象）
 * @param emit  组件 emit（callable 形式，见 ListEmits）
 */
export function useList(props: ListProps, emit: ListEmits) {
  /** 计算列表项唯一 key（rowKey 取值失败回退到索引） */
  function getKey(item: ListItem, index: number): string | number {
    return item[props.rowKey ?? 'id'] ?? index
  }

  /** 按字段名从列表项安全取值（缺字段返回空串） */
  function getFieldValue(item: ListItem, field: string): string {
    return item?.[field] ?? ''
  }

  /** 列表项点击：上报 item 与索引 */
  function handleItemClick(item: ListItem, index: number) {
    emit('item-click', item, index)
  }

  /** 判断字符串是否为可渲染的图片 URL（扩展名或 http(s):// 前缀） */
  function isImageUrl(url: string): boolean {
    if (!url)
      return false
    return /\.(?:jpg|jpeg|png|gif|webp|svg|bmp)$/i.test(url) || url.startsWith('http')
  }

  return {
    getKey,
    getFieldValue,
    handleItemClick,
    isImageUrl,
  }
}
