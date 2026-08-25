/**
 * EasyChinaMap 中国地图类型定义
 *
 * 原内联在 china-map.vue 中的类型（MapDataItem / MapDataSet / ProvinceInfo / Props / Emits）
 * 收敛到此文件，供 .vue 与 use-china-map.ts 共用，
 * 并通过 china-map.vue 的 `export type { ... } from './types'` 保持对外导出兼容。
 */

/** 单个省份数据项 */
export interface MapDataItem {
  name: string // 省份名称（支持全称或缩写，内部自动匹配）
  value: number // 数值
  label?: string // 自定义 tooltip 标签
  extra?: string // 额外信息
}

/** 数据集（用于多组数据切换，如2023年/2024年） */
export interface MapDataSet {
  name: string // 数据集名称，如 "2023年"
  data: MapDataItem[]
  colorRange?: [string, string] // 可选的自定义颜色
}

/** 省份信息（由 provinces.ts 的 GeoJSON 数据转换而来） */
export interface ProvinceInfo {
  name: string
  shortName: string
  path: string
  labelX: number
  labelY: number
  scale?: number
  extensionLine?: {
    fromX: number
    fromY: number
    toX: number
    toY: number
  }
}

/** 组件 props */
export interface ChinaMapProps {
  /** 标题 */
  title?: string
  /** 副标题 */
  subtitle?: string
  /** 数据列表 - 支持 MapDataItem[]（单组）或 MapDataSet[]（多组切换） */
  data?: MapDataItem[] | MapDataSet[]
  /** 组件宽度 */
  width?: number | string
  /** 组件高度 */
  height?: number | string
  /** 颜色范围 [最小色, 最大色] */
  colorRange?: [string, string]
  /** 无数据时填充颜色 */
  emptyColor?: string
  /** 描边颜色 */
  strokeColor?: string
  /** 描边宽度 */
  strokeWidth?: number
  /** 是否显示省份名称 */
  showLabel?: boolean
  /** 标签模式：'short' 显示简称，'full' 显示完整名称 */
  labelMode?: 'short' | 'full'
  /** 是否显示图例 */
  showLegend?: boolean
  /** 图例标题 */
  legendTitle?: string
  /** 数值标签文字 */
  valueLabel?: string
  /** 是否显示气泡 */
  showBubble?: boolean
  /** 气泡颜色 */
  bubbleColor?: string
  /** 当前激活省份 */
  activeProvince?: string
  /** 是否可缩放 */
  zoomable?: boolean
  /** 最小缩放比例 */
  minScale?: number
  /** 最大缩放比例 */
  maxScale?: number
  /** Tooltip 模式：'compare' 同时展示所有数据，'switch' Tab 切换模式 */
  tooltipMode?: 'compare' | 'switch'
}

/** 组件事件 */
export interface ChinaMapEmits {
  (e: 'click', province: string, data: MapDataItem | null): void
}
