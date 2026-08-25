<script setup>
import { nextTick, onMounted, ref, watch } from 'vue'
import { useGanttData } from './use-gantt-data'
import { useGanttLinks } from './use-gantt-links'
import { useGanttTimeline } from './use-gantt-timeline'

defineOptions({ name: 'EasyGantt' })

const props = defineProps({
  data: { type: Array, default: () => [] },
  title: { type: String, default: '' },
  taskListTitle: { type: String, default: '任务名称' },
  width: { type: String, default: '100%' },
  height: { type: String, default: '100%' },
  sidebarWidth: { type: [Number, String], default: 280 },
  rowHeight: { type: Number, default: 44 },
  barHeight: { type: Number, default: 24 },
  minBarWidth: { type: Number, default: 20 },
  dayWidth: { type: Number, default: 40 },
  showViewSwitch: { type: Boolean, default: true },
  zoomable: { type: Boolean, default: true },
  defaultView: { type: String, default: 'day', validator: v => ['day', 'week', 'month'].includes(v) },
  dateFormat: { type: String, default: 'YYYY-MM-DD' },
  showToday: { type: Boolean, default: true },
  columns: {
    type: Array,
    default: () => [{ prop: 'name', label: '任务名称', width: 'auto' }],
  },
})

const emit = defineEmits(['click', 'change', 'task-click'])

const views = [
  { label: '日', value: 'day' },
  { label: '周', value: 'week' },
  { label: '月', value: 'month' },
]

const currentView = ref(props.defaultView)
const rootRef = ref(null)
const timelineRef = ref(null)
const timelineBodyRef = ref(null)
const sidebarBodyRef = ref(null)
const headerHeight = 60
const scrollLeft = ref(0)
const tooltipVisible = ref(false)
const tooltipX = ref(0)
const tooltipY = ref(0)
const tooltipData = ref(null)

// ──── 数据派生（日期范围 / 时间轴 / 扁平任务 / 今日红线 / 缩放）────
const {
  scale,
  parseDate,
  dateRange,
  timelineWidth,
  getTimeX,
  flatTasks,
  todayX,
  getTaskById,
  toggleTask,
} = useGanttData(props, emit)

// ──── 时间轴表头（按视图生成两级单元格）────
const { timelineHeaders } = useGanttTimeline(props, currentView, { getTimeX, dateRange, scale })

// ──── 依赖连线（路径规划 / 里程碑 / 颜色）────
const { getDependencyPath, getMilestonePoints, getDepColor, clearCornerUsage } = useGanttLinks(props, {
  flatTasks,
  getTimeX,
  parseDate,
})

function getColumnStyle(col, index, task = null) {
  const style = {}
  // 第一列特殊处理：带层级缩进
  if (index === 0) {
    style.paddingLeft = `${(task?.level || 0) * 20 + 8}px`
    style.flex = '1'
    style.minWidth = '0'
  }
  else {
    // 其他列：支持固定宽度或 auto
    if (col.width && col.width !== 'auto') {
      style.width = typeof col.width === 'number' ? `${col.width}px` : col.width
      style.flex = `0 0 ${style.width}`
    }
    else {
      style.flex = '1'
    }
  }
  // 对齐方式
  if (col.align) {
    style.justifyContent = col.align === 'left' ? 'flex-start' : col.align === 'right' ? 'flex-end' : 'center'
  }
  return style
}
function getHeaderColumnStyle(col, index) {
  const style = {}
  // 第一列
  if (index === 0) {
    style.flex = '1'
    style.minWidth = '0'
  }
  else {
    // 其他列
    if (col.width && col.width !== 'auto') {
      style.width = typeof col.width === 'number' ? `${col.width}px` : col.width
      style.flex = `0 0 ${style.width}`
    }
    else {
      style.flex = '1'
    }
  }
  return style
}
function zoomIn() {
  scale.value = Math.min(scale.value + 0.25, 3)
}
function zoomOut() {
  scale.value = Math.max(scale.value - 0.25, 0.5)
}
function showTooltip(event, task) {
  tooltipData.value = task
  // 使用 fixed 定位，直接基于视口坐标
  tooltipX.value = event.clientX + 15
  tooltipY.value = event.clientY - 10
  tooltipVisible.value = true
}
function hideTooltip() {
  tooltipVisible.value = false
}
function handleBarClick(task) {
  emit('task-click', task)
  emit('click', task)
}
function onTimelineScroll(e) {
  scrollLeft.value = e.target.scrollLeft
  // 同步头部水平滚动
  const header = timelineRef.value?.querySelector('.easy-gantt__timeline-header')
  if (header)
    header.scrollLeft = e.target.scrollLeft
}
function onTimelineBodyScroll(e) {
  // 同步左侧任务列表垂直滚动
  if (sidebarBodyRef.value) {
    sidebarBodyRef.value.scrollTop = e.target.scrollTop
  }
}
function onSidebarScroll(e) {
  // 同步右侧时间轴垂直滚动
  if (timelineBodyRef.value) {
    timelineBodyRef.value.scrollTop = e.target.scrollTop
  }
}
function scrollToToday() {
  if (timelineRef.value && todayX.value > 0) {
    const header = timelineRef.value.querySelector('.easy-gantt__timeline-header')
    const body = timelineRef.value.querySelector('.easy-gantt__timeline-body')
    const containerWidth = header ? header.clientWidth : timelineRef.value.clientWidth
    if (header)
      header.scrollLeft = todayX.value - containerWidth / 2
    if (body)
      body.scrollLeft = todayX.value - containerWidth / 2
  }
}
function scrollToDate(date) {
  if (timelineRef.value) {
    const x = getTimeX(parseDate(date))
    const header = timelineRef.value.querySelector('.easy-gantt__timeline-header')
    const containerWidth = header ? header.clientWidth : timelineRef.value.clientWidth
    header.scrollLeft = x - containerWidth / 2
  }
}

defineExpose({ scrollToToday, scrollToDate, zoomIn, zoomOut })

onMounted(() => {
  nextTick(() => {
    scrollToToday()
  })
})
watch(
  () => props.data,
  () => {
    nextTick(() => {
      scrollToToday()
    })
  },
  { deep: true },
)
</script>

<template>
  <div ref="rootRef" class="easy-gantt">
    <!-- 头部工具栏 -->
    <div class="easy-gantt__header">
      <div v-if="title" class="easy-gantt__title">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        {{ title }}
      </div>
      <div class="easy-gantt__actions">
        <div v-if="showViewSwitch" class="easy-gantt__view-switch">
          <button v-for="view in views" :key="view.value" :class="{ 'is-active': currentView === view.value }"
            @click="currentView = view.value">
            {{ view.label }}
          </button>
        </div>
        <div v-if="zoomable" class="easy-gantt__zoom">
          <button :disabled="scale <= 0.5" title="缩小" @click="zoomOut">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
          <span class="easy-gantt__zoom-level">{{ Math.round(scale * 100) }}%</span>
          <button :disabled="scale >= 3" title="放大" @click="zoomIn">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <div class="easy-gantt__body">
      <!-- 左侧任务列表 -->
      <div class="easy-gantt__sidebar" :class="{ 'is-auto': sidebarWidth === 'auto' }"
        :style="sidebarWidth !== 'auto' ? { width: `${sidebarWidth}px` } : {}">
        <!-- 多列表头 -->
        <div class="easy-gantt__sidebar-header">
          <div v-for="(col, ci) in columns" :key="ci" class="easy-gantt__sidebar-header-cell"
            :style="getHeaderColumnStyle(col, ci)">
            {{ col.label }}
          </div>
        </div>
        <!-- 多列内容 -->
        <div ref="sidebarBodyRef" class="easy-gantt__sidebar-body" @scroll="onSidebarScroll">
          <div
            v-for="task in flatTasks"
            :key="task.id"
            class="easy-gantt__task-row"
            :class="{
              'is-group': task.isGroup,
              'is-milestone': task.isMilestone,
              'is-expanded': task.expanded,
              'is-collapsed': task.collapsed,
            }"
            :style="{ height: `${rowHeight}px` }"
          >
            <!-- 遍历渲染每列 -->
            <div v-for="(col, ci) in columns" :key="ci" class="easy-gantt__task-cell" :class="{ 'is-first': ci === 0 }"
              :style="getColumnStyle(col, ci, task)">
              <!-- 第一列特殊处理：包含展开按钮和图标 -->
              <template v-if="ci === 0">
                <button v-if="task.children && task.children.length > 0" class="easy-gantt__toggle"
                  @click="toggleTask(task)">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                    <polyline v-if="task.expanded" points="6 9 12 15 18 9" />
                    <polyline v-else points="9 18 15 12 9 6" />
                  </svg>
                </button>

                <span class="easy-gantt__task-icon">
                  <template v-if="task.isMilestone">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="none">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </template>
                  <template v-else-if="task.isGroup">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                    </svg>
                  </template>
                  <template v-else>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                    </svg>
                  </template>
                </span>

                <span class="easy-gantt__task-name" :title="task.name">{{ task.name }}</span>
              </template>
              <!-- 其他列：显示对应字段 -->
              <template v-else>
                <slot :name="col.prop" :row="task" :value="task?.[col.prop]">
                  {{ task?.[col.prop] }}
                </slot>
              </template>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧时间轴 -->
      <div ref="timelineRef" class="easy-gantt__timeline" @scroll="onTimelineScroll">
        <!-- 固定头部 -->
        <div class="easy-gantt__timeline-header">
          <svg :width="timelineWidth * scale" :height="headerHeight" class="easy-gantt__svg-header">
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="var(--el-text-color-placeholder)" />
              </marker>
            </defs>
            <!-- 头部背景 -->
            <rect x="0" y="0" :width="timelineWidth * scale" :height="headerHeight" fill="var(--el-fill-color-lighter)" />
            <!-- 年/月/周 头部 -->
            <g v-for="(header, hi) in timelineHeaders" :key="`h${hi}`">
              <text v-if="header.yearLabel" :x="getTimeX(parseDate(header.year)) + 8" y="22"
                class="easy-gantt__header-year">
                {{ header.yearLabel }}
              </text>
              <g v-for="(cell, ci) in header.cells" :key="`c${hi}-${ci}`">
                <rect :x="cell.x" :y="cell.y" :width="cell.width - 1" :height="cell.height - 1"
                  class="easy-gantt__header-cell" :class="{ 'is-weekend': cell.isWeekend }" />
                <text :x="cell.x + cell.width / 2" :y="cell.y + cell.height / 2" class="easy-gantt__header-text"
                  text-anchor="middle" dominant-baseline="middle">
                  {{ cell.label }}
                </text>
              </g>
            </g>
            <!-- 头部底部边框 -->
            <line x1="0" :y1="headerHeight" :x2="timelineWidth * scale" :y2="headerHeight"
              stroke="var(--el-border-color)" stroke-width="1" />
            <!-- 今日红线头部 -->
            <g v-if="todayX >= 0">
              <line :x1="todayX" :y1="0" :x2="todayX" :y2="headerHeight" class="easy-gantt__today-line" />
              <circle :cx="todayX" cy="0" r="3" fill="#ef4444" />
              <text :x="todayX + 8" y="14" class="easy-gantt__today-label">今天</text>
            </g>
          </svg>
        </div>

        <!-- 可滚动内容 -->
        <div ref="timelineBodyRef" class="easy-gantt__timeline-body" @scroll="onTimelineBodyScroll">
          <svg :width="timelineWidth * scale" :height="flatTasks.length * rowHeight" class="easy-gantt__svg-body">
            <!-- SVG 定义 -->
            <defs>
              <marker id="body-arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="var(--el-text-color-placeholder)" />
              </marker>
            </defs>
            <!-- 任务条 -->
            <g v-for="(task, ti) in flatTasks" :key="`t${task.id}`">
              <!-- 行背景 -->
              <rect :x="0" :y="ti * rowHeight" :width="timelineWidth * scale" :height="rowHeight"
                class="easy-gantt__row-bg" :class="{ 'is-even': ti % 2 === 0 }" />

              <!-- 任务条 -->
              <g v-if="!task.isMilestone && task.startDate && task.endDate">
                <!-- 阴影 -->
                <rect
                  :x="getTimeX(parseDate(task.startDate)) + 2"
                  :y="ti * rowHeight + (rowHeight - barHeight) / 2 + 2"
                  :width="
                    Math.max(getTimeX(parseDate(task.endDate)) - getTimeX(parseDate(task.startDate)), minBarWidth)
                  "
                  :height="barHeight"
                  :rx="6"
                  fill="var(--el-text-color-primary)"
                  opacity="0.08"
                />
                <!-- 基础条 -->
                <rect
                  :x="getTimeX(parseDate(task.startDate))"
                  :y="ti * rowHeight + (rowHeight - barHeight) / 2"
                  :width="
                    Math.max(getTimeX(parseDate(task.endDate)) - getTimeX(parseDate(task.startDate)), minBarWidth)
                  "
                  :height="barHeight"
                  :rx="6"
                  class="easy-gantt__bar"
                  :class="task.colorClass || 'is-default'"
                  @click="handleBarClick(task)"
                  @mouseenter="(e) => showTooltip(e, task)"
                  @mouseleave="hideTooltip"
                />
                <!-- 进度条遮罩 -->
                <rect
                  v-if="task.progress !== undefined && task.progress > 0"
                  :x="getTimeX(parseDate(task.startDate))"
                  :y="ti * rowHeight + (rowHeight - barHeight) / 2"
                  :width="
                    Math.max(
                      (getTimeX(parseDate(task.endDate)) - getTimeX(parseDate(task.startDate))) * (task.progress / 100),
                      6,
                    )
                  "
                  :height="barHeight"
                  :rx="6"
                  class="easy-gantt__bar-progress"
                />
                <!-- 进度文字 -->
                <text v-if="task.progress !== undefined && task.progress > 0"
                  :x="getTimeX(parseDate(task.startDate)) + 10" :y="ti * rowHeight + rowHeight / 2"
                  class="easy-gantt__bar-progress-text" dominant-baseline="middle">
                  {{ task.progress }}%
                </text>
                <!-- 依赖箭头 -->
                <g v-if="task.dependencies && task.dependencies.length > 0">
                  <!-- 渲染前清空角使用记录 -->
                  <path v-for="(depId, di) in (clearCornerUsage(), task.dependencies)" :key="`${depId}-${di}`"
                    :d="getDependencyPath(task, getTaskById(depId), ti)" :stroke="getDepColor(depId)" fill="none"
                    stroke-width="1.5" marker-end="url(#body-arrowhead)" />
                </g>
              </g>

              <!-- 里程碑 -->
              <g v-if="task.isMilestone && task.startDate">
                <polygon :points="getMilestonePoints(ti)" class="easy-gantt__milestone"
                  :class="task.colorClass || 'is-default'" @click="handleBarClick(task)"
                  @mouseenter="(e) => showTooltip(e, task)" @mouseleave="hideTooltip" />
              </g>

              <!-- 行底部边框 -->
              <line :x1="0" :y1="(ti + 1) * rowHeight" :x2="timelineWidth * scale" :y2="(ti + 1) * rowHeight"
                class="easy-gantt__row-border" />
            </g>

            <!-- 今日红线 - 内容区 -->
            <g v-if="todayX >= 0">
              <line :x1="todayX" :y1="0" :x2="todayX" :y2="flatTasks.length * rowHeight" class="easy-gantt__today-line" />
            </g>
          </svg>
        </div>

        <!-- Tooltip -->
        <Transition name="easy-gantt-fade">
          <div v-if="tooltipVisible" class="easy-gantt__tooltip"
            :style="{ left: `${tooltipX}px`, top: `${tooltipY}px` }">
            <div class="easy-gantt__tooltip-header">
              <span class="easy-gantt__tooltip-icon" :class="tooltipData?.colorClass || 'is-default'">
                <svg v-if="tooltipData?.isMilestone" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                  stroke-width="2">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                </svg>
              </span>
              {{ tooltipData?.name }}
            </div>
            <div class="easy-gantt__tooltip-body">
              <div v-if="tooltipData?.startDate" class="easy-gantt__tooltip-row">
                <span class="label">开始时间</span>
                <span class="value">{{ tooltipData?.startDate }}</span>
              </div>
              <div v-if="tooltipData?.endDate" class="easy-gantt__tooltip-row">
                <span class="label">结束时间</span>
                <span class="value">{{ tooltipData?.endDate }}</span>
              </div>
              <div v-if="tooltipData?.progress !== undefined" class="easy-gantt__tooltip-row">
                <span class="label">完成进度</span>
                <span class="value-progress">{{ tooltipData?.progress }}%</span>
              </div>
              <div v-if="tooltipData?.assignee" class="easy-gantt__tooltip-row">
                <span class="label">负责人</span>
                <span class="value">{{ tooltipData?.assignee }}</span>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.easy-gantt {
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  overflow: hidden;
  background: var(--el-fill-color-light);
  font-size: 13px;
  color: var(--el-text-color-regular);
  border: 1px solid var(--el-border-color);
  width: v-bind(width);
  height: v-bind(height);

  // 现代白色头部
  .easy-gantt__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    height: 60px;
    background: var(--el-fill-color-light);
    border-bottom: 1px solid var(--el-border-color);
  }

  .easy-gantt__title {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 15px;
    font-weight: 600;
    color: var(--el-text-color-regular);
    letter-spacing: -0.2px;

    svg {
      color: var(--el-color-primary);
    }
  }

  .easy-gantt__actions {
    display: flex;
    align-items: center;
    gap: 16px;
  }

  // 极简按钮组
  .easy-gantt__view-switch {
    display: flex;
    background: var(--el-fill-color-light);
    border-radius: 10px;
    padding: 4px;
    gap: 2px;

    button {
      padding: 8px 16px;
      border: none;
      background: transparent;
      color: var(--el-text-color-secondary);
      cursor: pointer;
      font-size: 13px;
      font-weight: 500;
      border-radius: 8px;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

      &.is-active {
        background: var(--el-fill-color-light);
        color: var(--el-text-color-regular);
        box-shadow:
          0 1px 3px rgba(0, 0, 0, 0.08),
          0 0 0 1px rgba(0, 0, 0, 0.04);
      }

      &:hover:not(.is-active) {
        color: var(--el-text-color-regular);
        background: var(--el-fill-color-light);
      }
    }
  }

  .easy-gantt__zoom {
    display: flex;
    align-items: center;
    gap: 4px;

    button {
      width: 32px;
      height: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      border: none;
      border-radius: 8px;
      background: transparent;
      color: var(--el-text-color-secondary);
      cursor: pointer;
      transition: all 0.2s;

      &:hover:not(:disabled) {
        background: var(--el-color-primary-light-9);
        color: var(--el-color-primary);
      }

      &:disabled {
        opacity: 0.3;
        cursor: not-allowed;
      }
    }
  }

  .easy-gantt__zoom-level {
    font-size: 12px;
    color: var(--el-text-color-regular)-tertiary;
    min-width: 40px;
    text-align: center;
    font-weight: 500;
  }

  .easy-gantt__body {
    display: flex;
    overflow: hidden;
    height: calc(100% - 60px);
  }

  .easy-gantt__sidebar {
    flex-shrink: 0;
    border-right: 1px solid var(--el-border-color);
    background: var(--el-fill-color-light);
    display: flex;
    flex-direction: column;

    &.is-auto {
      flex: 0 0 auto;
      max-width: 70%;
    }
  }

  .easy-gantt__sidebar-header {
    display: flex;
    height: 52px;
    border-bottom: 1px solid var(--el-border-color);
    background: var(--el-fill-color-light);
    overflow: hidden;
  }

  .easy-gantt__sidebar-header-cell {
    display: flex;
    align-items: center;
    padding: 0 12px;
    font-weight: 600;
    color: var(--el-text-color-regular);
    font-size: 12px;
    letter-spacing: 0.2px;
    text-transform: uppercase;
    border-right: 1px solid var(--el-border-color)-light;
    white-space: nowrap;

    &:last-child {
      border-right: none;
    }
  }

  .easy-gantt__sidebar-body {
    flex: 1;
    overflow-y: auto;
    background: var(--el-fill-color-light);

    &::-webkit-scrollbar {
      width: 6px;
    }
    &::-webkit-scrollbar-track {
      background: transparent;
    }
    &::-webkit-scrollbar-thumb {
      background: var(--el-border-color);
      border-radius: 3px;
      &:hover {
        background: var(--el-text-color-regular)-tertiary;
      }
    }
  }

  .easy-gantt__task-row {
    display: flex;
    align-items: center;
    border-bottom: 1px solid var(--el-border-color)-light;
    transition: all 0.15s ease;
    position: relative;

    &.is-group {
      font-weight: 600;
      background: var(--el-fill-color-light);
    }

    &.is-milestone {
      .easy-gantt__task-name {
        color: var(--el-color-warning);
        font-weight: 500;
      }
      .easy-gantt__task-icon {
        color: var(--el-color-warning);
      }
    }

    &:hover {
      background: var(--el-color-primary-light-9);
    }
  }

  .easy-gantt__task-cell {
    display: flex;
    align-items: center;
    padding: 0 12px;
    min-height: 100%;
    border-right: 1px solid var(--el-border-color)-light;
    overflow: hidden;

    &:last-child {
      border-right: none;
    }

    &.is-first {
      gap: 8px;
      padding-right: 8px;
    }
  }

  .easy-gantt__toggle {
    width: 20px;
    height: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    background: transparent;
    border-radius: 6px;
    color: var(--el-text-color-regular)-tertiary;
    cursor: pointer;
    padding: 0;
    transition: all 0.15s;

    &:hover {
      background: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
    }
  }

  .easy-gantt__task-icon {
    display: flex;
    align-items: center;
    color: var(--el-text-color-regular)-tertiary;
  }

  .easy-gantt__task-name {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--el-text-color-regular);
    font-size: 13px;
  }

  .easy-gantt__timeline {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    background: var(--el-fill-color-light);
  }

  .easy-gantt__timeline-header {
    flex-shrink: 0;
    overflow-x: auto;
    overflow-y: hidden;
    background: var(--el-fill-color-light);

    &::-webkit-scrollbar {
      display: none;
    }
  }

  .easy-gantt__timeline-body {
    flex: 1;
    overflow: auto;
    background: var(--el-fill-color-light);
  }

  .easy-gantt__svg-header {
    display: block;
  }
  .easy-gantt__svg-body {
    display: block;
  }

  .easy-gantt__header-year {
    font-size: 12px;
    font-weight: 600;
    fill: var(--el-text-color-regular);
    letter-spacing: -0.2px;
  }

  .easy-gantt__header-cell {
    fill: var(--el-fill-color-light);
    stroke: var(--el-border-color)-light;
    stroke-width: 1;

    &.is-weekend {
      fill: var(--el-fill-color-light);
    }
  }

  .easy-gantt__header-text {
    font-size: 11px;
    fill: var(--el-text-color-secondary);
    font-weight: 500;
    letter-spacing: 0.2px;
  }

  .easy-gantt__today-line {
    stroke: var(--el-color-danger);
    stroke-width: 1.5;
    stroke-dasharray: 4 2;
    opacity: 0.8;
  }

  .easy-gantt__today-label {
    font-size: 11px;
    fill: var(--el-color-danger);
    font-weight: 600;
    letter-spacing: 0.3px;
  }

  .easy-gantt__row-bg {
    fill: var(--el-fill-color-light);

    &.is-even,
    &.is-weekend {
      fill: var(--el-fill-color-light);
    }
  }

  .easy-gantt__row-border {
    stroke: var(--el-border-color)-light;
    stroke-width: 1;
  }

  // 扁平化任务条
  .easy-gantt__bar {
    cursor: pointer;
    transition:
      filter 0.15s ease,
      opacity 0.15s ease;

    &:hover {
      filter: brightness(1.1);
    }

    &.is-default {
      fill: var(--el-color-primary);
    }
    &.is-success {
      fill: var(--el-color-success);
    }
    &.is-warning {
      fill: var(--el-color-warning);
    }
    &.is-danger {
      fill: var(--el-color-danger);
    }
    &.is-info {
      fill: var(--el-color-info);
    }
  }

  .easy-gantt__bar-progress {
    fill: rgba(255, 255, 255, 0.35);
    pointer-events: none;
  }

  .easy-gantt__bar-progress-text {
    font-size: 10px;
    fill: var(--el-color-white);
    font-weight: 600;
    letter-spacing: 0.2px;
  }

  .easy-gantt__milestone {
    cursor: pointer;
    transition: filter 0.15s ease;

    &.is-default {
      fill: var(--el-color-primary);
    }
    &.is-success {
      fill: var(--el-color-success);
    }
    &.is-warning {
      fill: var(--el-color-warning);
    }
    &.is-danger {
      fill: var(--el-color-danger);
    }
    &.is-info {
      fill: var(--el-color-info);
    }

    &:hover {
      filter: brightness(1.15);
    }
  }

  .easy-gantt__dependency {
    fill: none;
    stroke: var(--el-text-color-placeholder);
    stroke-width: 1.5;
    marker-end: url(#body-arrowhead);
  }

  // 极简Tooltip
  .easy-gantt__tooltip {
    position: fixed;
    z-index: 99999;
    background: rgba(0, 0, 0, 0.85);
    border-radius: 12px;
    color: var(--el-color-white);
    font-size: 12px;
    pointer-events: none;
    min-width: 160px;
    box-shadow:
      0 8px 30px rgba(0, 0, 0, 0.2),
      0 0 0 1px rgba(255, 255, 255, 0.05);
    overflow: hidden;
  }

  .easy-gantt__tooltip-header {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 12px 14px;
    background: rgba(255, 255, 255, 0.06);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    font-weight: 600;
    font-size: 13px;
  }

  .easy-gantt__tooltip-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 18px;
    height: 18px;
    border-radius: 4px;

    &.is-default {
      background: rgba(var(--el-color-primary-light-3), 0.3);
      color: var(--el-color-primary-light-3);
    }
    &.is-success {
      background: var(--el-color-success-light-9);
      color: var(--el-color-success-light-3);
    }
    &.is-warning {
      background: var(--el-color-warning)-bg;
      color: var(--el-color-warning-light-3);
    }
    &.is-danger {
      background: var(--el-color-danger)-bg;
      color: var(--el-color-danger-light-3);
    }
    &.is-info {
      background: var(--el-color-info-light-9);
      color: var(--el-color-info-light-3);
    }
  }

  .easy-gantt__tooltip-body {
    padding: 10px 14px;
  }

  .easy-gantt__tooltip-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 4px 0;
    gap: 16px;

    .label {
      color: rgba(255, 255, 255, 0.5);
      font-size: 11px;
    }
    .value {
      font-weight: 500;
      font-size: 12px;
    }
    .value-progress {
      color: var(--el-color-success-light-3);
      font-weight: 600;
    }
  }
}

.easy-gantt-fade-enter-active,
.easy-gantt-fade-leave-active {
  transition:
    opacity 0.15s,
    transform 0.15s;
}
.easy-gantt-fade-enter-from,
.easy-gantt-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
