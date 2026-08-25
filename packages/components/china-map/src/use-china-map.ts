import type { ChinaMapEmits, ChinaMapProps, MapDataItem, MapDataSet, ProvinceInfo } from './types'

import { computed, onMounted, ref } from 'vue'

import { PROVINCE_PATHS } from './provinces'

/** 气泡最大半径 */
const MAX_BUBBLE_RADIUS = 28
/** 气泡最小半径 */
const MIN_BUBBLE_RADIUS = 6

/** 简称 → 完整名称映射 */
const NAME_ALIAS: Record<string, string> = {
  北京: '北京市',
  天津: '天津市',
  上海: '上海市',
  重庆: '重庆市',
  河北: '河北省',
  山西: '山西省',
  辽宁: '辽宁省',
  吉林: '吉林省',
  黑龙江: '黑龙江省',
  江苏: '江苏省',
  浙江: '浙江省',
  安徽: '安徽省',
  福建: '福建省',
  江西: '江西省',
  山东: '山东省',
  河南: '河南省',
  湖北: '湖北省',
  湖南: '湖南省',
  广东: '广东省',
  海南: '海南省',
  四川: '四川省',
  贵州: '贵州省',
  云南: '云南省',
  陕西: '陕西省',
  甘肃: '甘肃省',
  青海: '青海省',
  内蒙古: '内蒙古',
  广西: '广西',
  西藏: '西藏',
  宁夏: '宁夏',
  新疆: '新疆',
  台湾: '台湾省',
  台湾省: '台湾省',
  香港: '香港',
  澳门: '澳门',
}

/**
 * EasyChinaMap 核心逻辑 composable
 *
 * 将原本内联在 china-map.vue 中的数据集解析、颜色插值、tooltip、
 * 缩放/拖拽、事件处理等逻辑抽离为独立 composable，
 * 让 .vue 仅承担「组合 + 模板」职责（对齐 markdown 组件拆分规范）。
 *
 * @param props 中国地图 props（需传入响应式对象）
 * @param emit  中国地图事件触发函数（callable 形式，见 ChinaMapEmits）
 */
export function useChinaMap(props: ChinaMapProps, emit: ChinaMapEmits) {
  // ===================== 响应式状态 =====================
  const containerRef = ref<HTMLElement>()
  const svgRef = ref<SVGElement>()
  const tooltipRef = ref<HTMLElement>()

  // 调试用：鼠标在 SVG 上的坐标
  const mouseX = ref<number | null>(null)
  const mouseY = ref<number | null>(null)

  const hoverProvince = ref<string>('')
  const tooltip = ref({
    visible: false,
    x: 0,
    y: 0,
    title: '',
    // 多数据集支持：存储所有数据集的该省份数据
    datasets: [] as Array<{
      name: string
      value: number | null
      label?: string
      color?: string
    }>,
  })

  // 缩放状态
  const scale = ref(1)
  const translateX = ref(0)
  const translateY = ref(0)

  // 拖拽状态
  const isDragging = ref(false)
  const dragStart = ref({ x: 0, y: 0 })

  // 多数据集状态
  const currentDatasetIndex = ref(0)

  const uid = Math.random().toString(36).slice(2, 8)

  // ===================== 计算属性 =====================
  /** 判断是否为多组数据格式 */
  const isMultiDataset = computed(() => {
    if (!props.data || props.data.length === 0)
      return false
    return 'data' in props.data[0] && 'name' in props.data[0]
  })

  /** 数据集列表（用于 Tab 切换），单组数据包装为数组格式 */
  const datasets = computed(() => {
    if (isMultiDataset.value) {
      return props.data as MapDataSet[]
    }
    return [{ name: '', data: props.data || [] }] as MapDataSet[]
  })

  /** 当前选中的数据集 */
  const currentDataset = computed(() => {
    return datasets.value[currentDatasetIndex.value]
  })

  /** 当前数据集的颜色范围 */
  const currentColorRange = computed(() => {
    return currentDataset.value?.colorRange || props.colorRange || ['#e0f2fe', '#0369a1']
  })

  /** 当前数据集的数据列表 */
  const currentDataList = computed(() => {
    return currentDataset.value?.data || []
  })

  const computedWidth = computed(() => {
    const w = props.width
    return typeof w === 'number' ? `${w}px` : w
  })

  const computedHeight = computed(() => {
    const heightVal = props.height
    return typeof heightVal === 'number' ? `${heightVal}px` : heightVal
  })

  /** 构建数据 Map，支持全称/简称匹配 */
  const dataMap = computed(() => {
    const map = new Map<string, MapDataItem>()
    for (const item of currentDataList.value) {
      const fullName = NAME_ALIAS[item.name] || item.name
      // 优先用完整名称匹配
      const province = PROVINCE_PATHS.find(p => p.name === fullName)
      if (province) {
        map.set(province.name, item)
      }
    }
    return map
  })

  const legendMin = computed(() => {
    if (currentDataList.value.length === 0)
      return 0
    return Math.min(...currentDataList.value.map(d => d.value))
  })

  const legendMax = computed(() => {
    if (currentDataList.value.length === 0)
      return 100
    return Math.max(...currentDataList.value.map(d => d.value))
  })

  const legendItems = computed(() => currentDataList.value)

  const provinces = computed(() => PROVINCE_PATHS as unknown as ProvinceInfo[])

  // ===================== 方法 =====================
  function getProvinceColor(name: string): string {
    const item = dataMap.value.get(name)
    if (!item)
      return props.emptyColor ?? '#e2e8f0'

    const { value } = item
    const min = legendMin.value
    const max = legendMax.value
    const range = max - min

    if (range === 0)
      return currentColorRange.value[1]

    // 插值计算颜色
    const t = Math.max(0, Math.min(1, (value - min) / range))
    return interpolateColor(currentColorRange.value[0], currentColorRange.value[1], t)
  }

  function interpolateColor(c1: string, c2: string, t: number): string {
    const r1 = Number.parseInt(c1.slice(1, 3), 16)
    const g1 = Number.parseInt(c1.slice(3, 5), 16)
    const b1 = Number.parseInt(c1.slice(5, 7), 16)
    const r2 = Number.parseInt(c2.slice(1, 3), 16)
    const g2 = Number.parseInt(c2.slice(3, 5), 16)
    const b2 = Number.parseInt(c2.slice(5, 7), 16)
    const r = Math.round(r1 + (r2 - r1) * t)
    const g = Math.round(g1 + (g2 - g1) * t)
    const b = Math.round(b1 + (b2 - b1) * t)
    return `rgb(${r}, ${g}, ${b})`
  }

  function getBubbleRadius(name: string): number {
    const item = dataMap.value.get(name)
    if (!item)
      return 0
    const min = legendMin.value
    const max = legendMax.value
    const range = max - min
    if (range === 0)
      return MAX_BUBBLE_RADIUS
    const t = (item.value - min) / range
    return MIN_BUBBLE_RADIUS + (MAX_BUBBLE_RADIUS - MIN_BUBBLE_RADIUS) * t
  }

  function formatValue(val: number | null): string {
    if (val === null || val === undefined)
      return '-'
    if (val >= 100000000)
      return `${(val / 100000000).toFixed(1)}亿`
    if (val >= 10000)
      return `${(val / 10000).toFixed(1)}万`
    return val.toLocaleString()
  }

  /** 辅助函数：根据省份名称查找数据 */
  function findProvinceData(dataList: MapDataItem[], provinceName: string): MapDataItem | undefined {
    return dataList.find((d) => {
      const fullName = NAME_ALIAS[d.name] || d.name
      const provinceMatch = PROVINCE_PATHS.find(p => p.name === fullName)
      return provinceMatch && provinceMatch.name === provinceName
    })
  }

  function onProvinceEnter(province: ProvinceInfo, event: MouseEvent) {
    hoverProvince.value = province.name

    // 对比模式：收集所有数据集的该省份数据
    if (props.tooltipMode === 'compare') {
      const datasetsData = datasets.value.map((ds) => {
        const item = findProvinceData(ds.data, province.name)
        return {
          name: ds.name || props.valueLabel || '数值',
          value: item ? item.value : null,
          label: item?.label,
          color: ds.colorRange ? ds.colorRange[1] : undefined,
        }
      })
      tooltip.value = {
        visible: true,
        x: event.clientX + 12,
        y: event.clientY - 8,
        title: province.name,
        datasets: datasetsData,
      }
    }
    else {
      // 切换模式：只显示当前选中数据集的数据
      const item = findProvinceData(currentDataList.value, province.name)
      tooltip.value = {
        visible: true,
        x: event.clientX + 12,
        y: event.clientY - 8,
        title: province.name,
        datasets: [
          {
            name: props.valueLabel ?? '数值',
            value: item ? item.value : null,
            label: item?.label,
          },
        ],
      }
    }
  }

  function onProvinceLeave() {
    hoverProvince.value = ''
    tooltip.value.visible = false
  }

  function hideTooltip() {
    tooltip.value.visible = false
    hoverProvince.value = ''
    mouseX.value = null
    mouseY.value = null
  }

  /** 调试用：追踪鼠标在 SVG 上的坐标 */
  function onSvgMouseMove(e: MouseEvent) {
    if (!svgRef.value)
      return
    const rect = svgRef.value.getBoundingClientRect()
    const svgScaleX = 1000 / rect.width
    const svgScaleY = 800 / rect.height
    mouseX.value = (e.clientX - rect.left) * svgScaleX
    mouseY.value = (e.clientY - rect.top) * svgScaleY
  }

  function onProvinceClick(province: ProvinceInfo) {
    const item = dataMap.value.get(province.name) || null
    emit('click', province.name, item)
  }

  // ===================== 缩放/平移方法 =====================
  function onWheel(e: WheelEvent) {
    if (!props.zoomable)
      return

    const oldScale = scale.value
    const delta = e.deltaY > 0 ? -0.15 : 0.15
    const newScale = Math.max(props.minScale ?? 0.5, Math.min(props.maxScale ?? 4, oldScale + delta))

    if (newScale === oldScale)
      return

    const svgRect = svgRef.value?.getBoundingClientRect()
    const containerRect = containerRef.value?.getBoundingClientRect()
    if (svgRect && containerRect) {
      // 鼠标相对于 SVG 的位置
      const mouseX = e.clientX - svgRect.left
      const mouseY = e.clientY - svgRect.top

      // SVG 会自动缩放 viewBox 以适应容器
      // svgScale = SVG 实际尺寸 / viewBox 尺寸
      const svgScale = svgRect.width / 1000

      translateX.value = translateX.value + (mouseX / svgScale) * (1 / newScale - 1 / oldScale)
      translateY.value = translateY.value + (mouseY / svgScale) * (1 / newScale - 1 / oldScale)
    }

    scale.value = newScale
  }

  function onMouseDown(e: MouseEvent) {
    if (!props.zoomable || e.button !== 0)
      return
    isDragging.value = true
    dragStart.value = { x: e.clientX - translateX.value, y: e.clientY - translateY.value }
  }

  function onMouseMove(e: MouseEvent) {
    if (!isDragging.value)
      return
    translateX.value = e.clientX - dragStart.value.x
    translateY.value = e.clientY - dragStart.value.y
  }

  function onMouseUp() {
    isDragging.value = false
  }

  function zoomIn() {
    if (!props.zoomable)
      return
    scale.value = Math.min(props.maxScale ?? 4, scale.value + 0.2)
  }

  function zoomOut() {
    if (!props.zoomable)
      return
    scale.value = Math.max(props.minScale ?? 0.5, scale.value - 0.2)
  }

  function resetZoom() {
    scale.value = 1
    translateX.value = 0
    translateY.value = 0
  }

  // 鼠标移动时更新 tooltip 位置
  onMounted(() => {
    document.addEventListener('mousemove', (e: MouseEvent) => {
      if (tooltip.value.visible) {
        tooltip.value.x = e.clientX + 12
        tooltip.value.y = e.clientY - 8
      }
    })
  })

  return {
    // DOM 引用
    containerRef,
    svgRef,
    tooltipRef,
    // 状态
    mouseX,
    mouseY,
    hoverProvince,
    tooltip,
    scale,
    translateX,
    translateY,
    isDragging,
    currentDatasetIndex,
    // 常量
    uid,
    // 计算
    isMultiDataset,
    datasets,
    currentColorRange,
    computedWidth,
    computedHeight,
    dataMap,
    legendMin,
    legendMax,
    legendItems,
    provinces,
    // 方法
    getProvinceColor,
    getBubbleRadius,
    formatValue,
    onProvinceEnter,
    onProvinceLeave,
    hideTooltip,
    onSvgMouseMove,
    onProvinceClick,
    onWheel,
    onMouseDown,
    onMouseMove,
    onMouseUp,
    zoomIn,
    zoomOut,
    resetZoom,
  }
}
