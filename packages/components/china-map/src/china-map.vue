<script setup lang="ts">
import type { ChinaMapEmits, ChinaMapProps } from './types'
import { useChinaMap } from './use-china-map'

// 保持对外类型导出兼容（原定义在 china-map.vue）
export type { ChinaMapEmits, ChinaMapProps, MapDataItem, MapDataSet } from './types'

defineOptions({ name: 'EasyChinaMap' })

const props = withDefaults(defineProps<ChinaMapProps>(), {
  data: () => [],
  width: '100%',
  height: 520,
  colorRange: () => ['#bfdbfe', '#1d4ed8'],
  emptyColor: '#e2e8f0',
  strokeColor: '#ffffff',
  strokeWidth: 0.8,
  showLabel: true,
  labelMode: 'short',
  showLegend: true,
  legendTitle: '数值',
  valueLabel: '数值',
  showBubble: false,
  bubbleColor: '#ef4444',
  zoomable: true,
  minScale: 0.5,
  maxScale: 4,
  tooltipMode: 'compare',
})

const emit = defineEmits<ChinaMapEmits>()

// SVG viewBox 尺寸
const SVG_W = 1000
const SVG_H = 800

// ──── 核心逻辑（数据集 / 颜色插值 / tooltip / 缩放拖拽 / 事件）────
const {
  containerRef,
  svgRef,
  tooltipRef,
  hoverProvince,
  tooltip,
  scale,
  translateX,
  translateY,
  isDragging,
  currentDatasetIndex,
  uid,
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
} = useChinaMap(props, emit)
</script>

<template>
  <div class="easy-china-map" :style="{ width: computedWidth, height: computedHeight }">
    <!-- 标题区域 -->
    <div class="easy-china-map__header">
      <div v-if="title || subtitle" class="easy-china-map__title-wrap">
        <span v-if="title" class="easy-china-map__title">{{ title }}</span>
        <span v-if="subtitle" class="easy-china-map__subtitle">{{ subtitle }}</span>
      </div>
      <!-- 切换模式 Tab（tooltip-mode="switch" 时显示） -->
      <div v-if="isMultiDataset && tooltipMode === 'switch'" class="easy-china-map__dataset-tabs">
        <button
          v-for="(ds, index) in datasets" :key="index" class="dataset-tab"
          :class="{ 'is-active': currentDatasetIndex === index }" @click="currentDatasetIndex = index"
        >
          {{ ds.name }}
        </button>
      </div>
      <!-- 对比模式标签（tooltip-mode="compare" 时显示） -->
      <div v-else-if="isMultiDataset && tooltipMode === 'compare'" class="easy-china-map__dataset-tags">
        <span
          v-for="(ds, index) in datasets" :key="index" class="dataset-tag"
          :style="ds.colorRange ? { background: ds.colorRange[1], borderColor: ds.colorRange[1] } : {}"
        >
          {{ ds.name }}
        </span>
      </div>
    </div>

    <!-- 地图主体 -->
    <div
      ref="containerRef" class="easy-china-map__body" :class="{ 'is-dragging': isDragging }" @wheel.prevent="onWheel"
      @mousedown="onMouseDown" @mousemove="onMouseMove" @mouseup="onMouseUp" @mouseleave="onMouseUp"
    >
      <svg
        ref="svgRef" class="easy-china-map__svg" :viewBox="`0 0 ${SVG_W} ${SVG_H}`"
        xmlns="http://www.w3.org/2000/svg" @mouseleave="hideTooltip" @mousemove="onSvgMouseMove"
      >
        <!-- 阴影滤镜 -->
        <defs>
          <filter id="map-shadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(0,0,0,0.15)" />
          </filter>
          <linearGradient :id="`grad-${uid}`" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" :stop-color="currentColorRange[0]" />
            <stop offset="100%" :stop-color="currentColorRange[1]" />
          </linearGradient>
        </defs>

        <!-- 地图内容（带缩放变换） -->
        <g :transform="`translate(${translateX}, ${translateY}) scale(${scale})`">
          <!-- 省份路径 -->
          <g class="easy-china-map__provinces">
            <g
              v-for="province in provinces"
              :key="province.name"
              :transform="
                province.scale
                  ? `translate(${province.labelX}, ${province.labelY}) scale(${province.scale}) translate(${-province.labelX}, ${-province.labelY})`
                  : ''
              "
            >
              <path
                :d="province.path" :fill="getProvinceColor(province.name)" :stroke="strokeColor"
                :stroke-width="province.scale ? strokeWidth / province.scale : strokeWidth"
                class="easy-china-map__province"
                :class="{ 'is-active': activeProvince === province.name, 'is-hover': hoverProvince === province.name }"
                @mouseenter="onProvinceEnter(province, $event)" @mouseleave="onProvinceLeave"
                @click="onProvinceClick(province)"
              />
            </g>
          </g>

          <!-- 扩展线（用于港澳台等小区域） -->
          <g class="easy-china-map__extension-lines">
            <template v-for="province in provinces" :key="`ext-${province.name}`">
              <g v-if="province.extensionLine">
                <!-- 扩展线本身 -->
                <line
                  :x1="province.extensionLine.fromX" :y1="province.extensionLine.fromY"
                  :x2="province.extensionLine.toX" :y2="province.extensionLine.toY" class="easy-china-map__extension-line"
                />
              </g>
            </template>
          </g>

          <!-- 省份名称标签 -->
          <g v-if="showLabel" class="easy-china-map__labels">
            <text
              v-for="province in provinces" :key="`label-${province.name}`" :x="province.labelX"
              :y="province.labelY" class="easy-china-map__label" :class="{ 'is-full': labelMode === 'full' }"
              text-anchor="middle" dominant-baseline="middle"
            >
              {{ labelMode === 'full' ? province.name : province.shortName }}
            </text>
          </g>

          <!-- 数据标记气泡 -->
          <g v-if="showBubble && dataMap.size" class="easy-china-map__bubbles">
            <template v-for="province in provinces" :key="`bubble-${province.name}`">
              <circle
                v-if="dataMap.get(province.name)" :cx="province.labelX" :cy="province.labelY"
                :r="getBubbleRadius(province.name)" class="easy-china-map__bubble" :fill="bubbleColor" :fill-opacity="0.5"
                @mouseenter="onProvinceEnter(province, $event)" @mouseleave="onProvinceLeave"
                @click="onProvinceClick(province)"
              />
            </template>
          </g>
        </g>
      </svg>

      <!-- 图例 -->
      <div v-if="showLegend && legendItems.length" class="easy-china-map__legend">
        <div class="legend-title">
          {{ legendTitle }}
        </div>
        <div class="legend-gradient">
          <div
            class="legend-gradient__bar"
            :style="{ background: `linear-gradient(to right, ${colorRange[0]}, ${colorRange[1]})` }"
          />
          <div class="legend-gradient__labels">
            <span>{{ formatValue(legendMin) }}</span>
            <span>{{ formatValue(legendMax) }}</span>
          </div>
        </div>
      </div>

      <!-- 缩放控制 -->
      <div v-if="zoomable" class="easy-china-map__zoom-controls">
        <button class="zoom-btn" title="放大" @click.stop="zoomIn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="11" y1="8" x2="11" y2="14" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>
        <div class="zoom-level">
          {{ Math.round(scale * 100) }}%
        </div>
        <button class="zoom-btn" title="缩小" @click.stop="zoomOut">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
            <line x1="8" y1="11" x2="14" y2="11" />
          </svg>
        </button>
        <button class="zoom-btn" title="重置" @click.stop="resetZoom">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Tooltip -->
    <Teleport to="body">
      <div
        v-show="tooltip.visible" ref="tooltipRef" class="easy-china-map__tooltip"
        :style="{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }"
      >
        <div class="tooltip-title">
          {{ tooltip.title }}
        </div>
        <!-- 多数据集展示 -->
        <template v-if="tooltip.datasets.length > 1">
          <div v-for="(ds, index) in tooltip.datasets" :key="index" class="tooltip-value">
            <span class="tooltip-label">{{ ds.name }}</span>
            <span class="tooltip-num" :style="ds.color ? { color: ds.color } : {}">
              {{ ds.value !== null ? formatValue(ds.value) : '-' }}
            </span>
          </div>
        </template>
        <!-- 单数据集展示 -->
        <template v-else-if="tooltip.datasets.length === 1">
          <div class="tooltip-value">
            <span class="tooltip-label">{{ tooltip.datasets[0].label || valueLabel }}</span>
            <span class="tooltip-num">{{
              tooltip.datasets[0].value !== null ? formatValue(tooltip.datasets[0].value) : '-'
            }}</span>
          </div>
        </template>
        <div v-else class="tooltip-empty">
          暂无数据
        </div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped lang="scss">
.easy-china-map {
  display: flex;
  flex-direction: column;
  position: relative;
  font-family: inherit;
  user-select: none;

  .easy-china-map__header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    margin-bottom: 8px;
    padding: 0 4px;
  }

  .easy-china-map__title-wrap {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .easy-china-map__title {
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    line-height: 1.4;
  }

  .easy-china-map__subtitle {
    font-size: 12px;
    color: #8e8ea0;
    line-height: 1.4;
  }

  // 数据集标签（纯展示）
  .easy-china-map__dataset-tags {
    display: flex;
    gap: 6px;
    flex-shrink: 0;
  }

  .easy-china-map__body {
    flex: 1;
    position: relative;
    overflow: hidden;
    cursor: grab;

    &.is-dragging {
      cursor: grabbing;
    }
  }

  .easy-china-map__svg {
    width: 100%;
    height: 100%;
    display: block;
  }

  .easy-china-map__province {
    cursor: pointer;
    transition:
      filter 0.2s ease,
      opacity 0.2s ease;

    &.is-hover {
      filter: brightness(0.88);
    }

    &.is-active {
      filter: brightness(0.82) drop-shadow(0 0 4px rgba(59, 130, 246, 0.5));
    }
  }

  .easy-china-map__label {
    font-size: 10px;
    fill: #374151;
    pointer-events: none;
    font-weight: 500;

    &.is-full {
      font-size: 8px;
    }
  }

  // 扩展线样式（用于港澳台等小区域）
  .easy-china-map__extension-line {
    stroke: #9ca3af;
    stroke-width: 1;
    stroke-dasharray: 3 2;
    pointer-events: none;
  }

  .easy-china-map__bubble {
    cursor: pointer;
    transition: r 0.3s ease;
    stroke: var(--el-color-white);
    stroke-width: 1.5;
  }

  // 图例
  .easy-china-map__legend {
    position: absolute;
    right: 12px;
    bottom: 12px;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    padding: 10px 14px;
    min-width: 140px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .legend-title {
      font-size: 11px;
      color: #8e8ea0;
      margin-bottom: 7px;
      font-weight: 500;
    }

    .legend-gradient {
      .legend-gradient__bar {
        height: 8px;
        border-radius: 4px;
        margin-bottom: 4px;
      }

      .legend-gradient__labels {
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        color: #6b7280;
      }
    }
  }

  // 缩放控件
  .easy-china-map__zoom-controls {
    position: absolute;
    left: 12px;
    bottom: 12px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    background: rgba(255, 255, 255, 0.92);
    border: 1px solid #f0f0f0;
    border-radius: 8px;
    padding: 6px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

    .zoom-btn {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      background: transparent;
      border-radius: 6px;
      cursor: pointer;
      color: #4b5563;
      transition: all 0.15s ease;

      svg {
        width: 18px;
        height: 18px;
      }

      &:hover {
        background: #f3f4f6;
        color: #1d4ed8;
      }

      &:active {
        background: #e5e7eb;
        transform: scale(0.95);
      }
    }

    .zoom-level {
      font-size: 11px;
      color: #6b7280;
      font-weight: 500;
      padding: 2px 0;
      min-width: 40px;
      text-align: center;
    }
  }
}

// Tooltip（非 scoped，Teleport 到 body）
</style>

<style lang="scss">
.easy-china-map__tooltip {
  position: fixed;
  z-index: 9999;
  background: rgba(30, 32, 50, 0.92);
  color: var(--el-color-white);
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  pointer-events: none;
  white-space: nowrap;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(4px);
  transition: opacity 0.15s;

  .tooltip-title {
    font-weight: 600;
    margin-bottom: 4px;
    font-size: 13px;
  }

  .tooltip-value {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;

    .tooltip-label {
      color: rgba(255, 255, 255, 0.7);
    }

    .tooltip-num {
      font-weight: 700;
      font-size: 14px;
      color: #60a5fa;
    }
  }

  .tooltip-empty {
    font-size: 12px;
    color: rgba(255, 255, 255, 0.5);
  }
}

// 数据集标签样式
.dataset-tag {
  padding: 3px 10px;
  font-size: 11px;
  font-weight: 500;
  color: var(--el-color-white);
  background: #3b82f6;
  border: 1px solid #3b82f6;
  border-radius: 4px;
}

// 数据集切换 Tab 样式
.dataset-tab {
  padding: 6px 16px;
  font-size: 13px;
  font-weight: 500;
  color: #6b7280;
  background: var(--el-bg-color);
  border: 1px solid #e5e7eb;
  cursor: pointer;
  transition: all 0.2s ease;

  &:first-child {
    border-radius: 8px 0 0 8px;
  }

  &:last-child {
    border-radius: 0 8px 8px 0;
  }

  &:not(:first-child) {
    margin-left: -1px;
  }

  &:hover {
    color: #374151;
    background: #f9fafb;
  }

  &.is-active {
    background: #3b82f6;
    border-color: #3b82f6;
    color: var(--el-color-white);
    position: relative;
    z-index: 1;
  }
}
</style>
