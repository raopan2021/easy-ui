<script setup lang="ts">
import { computed, reactive, ref } from 'vue'

// ===== 类型 =====
interface CalDay {
  date: string
  day: number
  dayOfWeek: number
  isOtherMonth: boolean
  isToday: boolean
  lunar?: string
}

interface CalEvent {
  id: number
  title: string
  date: string
  time: string
  color: string
  tag: string
  desc?: string
}

// ===== 常量 =====
const weekDays = ['日', '一', '二', '三', '四', '五', '六']
const weekDaysFull = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']
const eventColors = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4']
const tags = ['会议', '任务', '提醒', '评审', '休假']

// ===== 事件数据 =====
const events = ref<CalEvent[]>([
  {
    id: 1,
    title: '每周站会',
    date: '2026-07-27',
    time: '09:30',
    color: '#3b82f6',
    tag: '会议',
    desc: '各团队同步本周进度',
  },
  {
    id: 2,
    title: '需求评审',
    date: '2026-07-27',
    time: '14:00',
    color: '#f59e0b',
    tag: '评审',
    desc: 'Q3 产品需求评审会议',
  },
  {
    id: 3,
    title: '代码审查',
    date: '2026-07-28',
    time: '10:00',
    color: '#22c55e',
    tag: '任务',
    desc: 'review login 模块重构代码',
  },
  {
    id: 4,
    title: '技术分享',
    date: '2026-07-29',
    time: '15:00',
    color: '#8b5cf6',
    tag: '会议',
    desc: '微前端架构实践分享',
  },
  {
    id: 5,
    title: '版本发布',
    date: '2026-07-30',
    time: '20:00',
    color: '#ef4444',
    tag: '任务',
    desc: 'v2.5.0 版本上线',
  },
  {
    id: 6,
    title: '团建活动',
    date: '2026-07-31',
    time: '10:00',
    color: '#06b6d4',
    tag: '休假',
    desc: '部门团建 — 户外拓展',
  },
  {
    id: 7,
    title: 'Sprint 复盘',
    date: '2026-08-01',
    time: '11:00',
    color: '#f59e0b',
    tag: '评审',
    desc: 'Sprint 23 回顾与总结',
  },
  {
    id: 8,
    title: 'UI 走查',
    date: '2026-08-03',
    time: '14:30',
    color: '#8b5cf6',
    tag: '任务',
    desc: '新版设计稿走查反馈',
  },
  {
    id: 9,
    title: '月度汇报',
    date: '2026-08-05',
    time: '09:00',
    color: '#ef4444',
    tag: '会议',
    desc: '向 CTO 汇报本月项目进展',
  },
  {
    id: 10,
    title: '面试',
    date: '2026-08-10',
    time: '10:00',
    color: '#22c55e',
    tag: '会议',
    desc: '前端高级工程师面试',
  },
  {
    id: 11,
    title: '安全培训',
    date: '2026-08-12',
    time: '14:00',
    color: '#06b6d4',
    tag: '提醒',
    desc: '年度信息安全意识培训',
  },
  {
    id: 12,
    title: '线上问题复盘',
    date: '2026-08-15',
    time: '16:00',
    color: '#ef4444',
    tag: '评审',
    desc: '7.28 线上事故复盘',
  },
  {
    id: 13,
    title: '架构评审',
    date: '2026-08-18',
    time: '10:00',
    color: '#f59e0b',
    tag: '评审',
    desc: '新支付系统架构方案评审',
  },
  {
    id: 14,
    title: 'API 设计评审',
    date: '2026-08-20',
    time: '15:00',
    color: '#8b5cf6',
    tag: '评审',
    desc: '开放平台 API 设计讨论',
  },
  {
    id: 15,
    title: '年终规划',
    date: '2026-08-25',
    time: '09:00',
    color: '#3b82f6',
    tag: '会议',
    desc: 'Q4 与明年规划研讨',
  },
])

function getEventsForDate(dateStr: string): CalEvent[] {
  return events.value.filter(e => e.date === dateStr)
}

// ===== 日期状态 =====
const today = new Date()
const currentYear = ref(today.getFullYear())
const currentMonth = ref(today.getMonth()) // 0-based
const currentDate = ref(today.getDate())
const viewMode = ref('month')

function prev() {
  if (viewMode.value === 'month') {
    if (currentMonth.value === 0) {
      currentMonth.value = 11
      currentYear.value--
    }
    else {
      currentMonth.value--
    }
  }
  else if (viewMode.value === 'week') {
    const d = new Date(currentYear.value, currentMonth.value, currentDate.value)
    d.setDate(d.getDate() - 7)
    currentYear.value = d.getFullYear()
    currentMonth.value = d.getMonth()
    currentDate.value = d.getDate()
  }
  else {
    const d = new Date(currentYear.value, currentMonth.value, currentDate.value)
    d.setDate(d.getDate() - 1)
    currentYear.value = d.getFullYear()
    currentMonth.value = d.getMonth()
    currentDate.value = d.getDate()
  }
}

function next() {
  if (viewMode.value === 'month') {
    if (currentMonth.value === 11) {
      currentMonth.value = 0
      currentYear.value++
    }
    else {
      currentMonth.value++
    }
  }
  else if (viewMode.value === 'week') {
    const d = new Date(currentYear.value, currentMonth.value, currentDate.value)
    d.setDate(d.getDate() + 7)
    currentYear.value = d.getFullYear()
    currentMonth.value = d.getMonth()
    currentDate.value = d.getDate()
  }
  else {
    const d = new Date(currentYear.value, currentMonth.value, currentDate.value)
    d.setDate(d.getDate() + 1)
    currentYear.value = d.getFullYear()
    currentMonth.value = d.getMonth()
    currentDate.value = d.getDate()
  }
}

function goToday() {
  const t = new Date()
  currentYear.value = t.getFullYear()
  currentMonth.value = t.getMonth()
  currentDate.value = t.getDate()
}

function goDay(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  currentYear.value = y
  currentMonth.value = m - 1
  currentDate.value = d
  viewMode.value = 'day'
}

// ===== 月视图数据 =====
const monthDays = computed<CalDay[]>(() => {
  const year = currentYear.value
  const month = currentMonth.value
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  const startDayOfWeek = firstDay.getDay()
  const daysInMonth = lastDay.getDate()
  const prevMonthLastDay = new Date(year, month, 0).getDate()

  const days: CalDay[] = []

  // 上月末尾
  for (let i = startDayOfWeek - 1; i >= 0; i--) {
    const d = prevMonthLastDay - i
    days.push({
      date: formatDate(year, month - 1, d),
      day: d,
      dayOfWeek: (startDayOfWeek - i - 1 + 7) % 7,
      isOtherMonth: true,
      isToday: false,
    })
  }

  // 本月
  for (let d = 1; d <= daysInMonth; d++) {
    const date = new Date(year, month, d)
    days.push({
      date: formatDate(year, month, d),
      day: d,
      dayOfWeek: date.getDay(),
      isOtherMonth: false,
      isToday: isTodayCheck(year, month, d),
      lunar: getSimpleLunar(year, month + 1, d),
    })
  }

  // 下月开头
  const remaining = 42 - days.length
  for (let d = 1; d <= remaining; d++) {
    days.push({
      date: formatDate(year, month + 1, d),
      day: d,
      dayOfWeek: (startDayOfWeek + daysInMonth + d - 1) % 7,
      isOtherMonth: true,
      isToday: false,
    })
  }

  return days
})

// ===== 周视图数据 =====
const weekViewDays = computed(() => {
  const current = new Date(currentYear.value, currentMonth.value, currentDate.value)
  const dayOfWeek = current.getDay()
  const monday = new Date(current)
  monday.setDate(current.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1))

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday)
    d.setDate(d.getDate() + i)
    return {
      dateStr: formatDate(d.getFullYear(), d.getMonth(), d.getDate()),
      day: d.getDate(),
      dayName: weekDaysFull[d.getDay()],
      isToday: isTodayCheck(d.getFullYear(), d.getMonth(), d.getDate()),
    }
  })
})

// ===== 日视图数据 =====
const currentDayEvents = computed(() => {
  const dateStr = formatDate(currentYear.value, currentMonth.value, currentDate.value)
  return getEventsForDate(dateStr)
})

const dayViewTitle = computed(() => {
  const d = new Date(currentYear.value, currentMonth.value, currentDate.value)
  return `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${weekDaysFull[d.getDay()]}`
})

const viewTitle = computed(() => `${currentYear.value}年 ${currentMonth.value + 1}月`)
const currentDateStr = computed(() => formatDate(currentYear.value, currentMonth.value, currentDate.value))

// ===== 周视图事件定位 =====
function weekEventStyle(ev: CalEvent) {
  const [h, m] = ev.time.split(':').map(Number)
  const top = ((h + m / 60) / 24) * 100
  return { top: `${top}%`, background: ev.color }
}

function isCurrentHour(d: { dateStr: string, isToday: boolean }, hour: number) {
  if (!d.isToday)
    return false
  const now = new Date()
  return now.getHours() === hour
}

// ===== 事件详情 =====
const eventDetail = reactive({
  visible: false,
  title: '',
  date: '',
  time: '',
  color: '',
  tag: '',
  desc: '',
})

function openEvent(ev: CalEvent) {
  eventDetail.title = ev.title
  eventDetail.date = ev.date
  eventDetail.time = ev.time
  eventDetail.color = ev.color
  eventDetail.tag = ev.tag
  eventDetail.desc = ev.desc || ''
  eventDetail.visible = true
}

// ===== 添加事件 =====
let idCounter = 100
const newEvent = reactive({
  title: '',
  timeVal: '10:00' as string | null,
  tag: '会议',
})

function addEvent() {
  if (!newEvent.title.trim() || !newEvent.timeVal)
    return
  const tag = newEvent.tag
  const tagIdx = tags.indexOf(tag)
  events.value.push({
    id: ++idCounter,
    title: newEvent.title.trim(),
    date: currentDateStr.value,
    time: newEvent.timeVal,
    color: eventColors[tagIdx >= 0 ? tagIdx : 0],
    tag,
  })
  newEvent.title = ''
}

// ===== 工具函数 =====
function formatDate(y: number, m: number, d: number): string {
  const date = new Date(y, m, d)
  const yr = date.getFullYear()
  const mo = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${yr}-${mo}-${day}`
}

function isTodayCheck(y: number, m: number, d: number): boolean {
  const t = new Date()
  return t.getFullYear() === y && t.getMonth() === m && t.getDate() === d
}

// 简单农历模拟（仅演示用）
const lunarMap: Record<string, string> = {
  '2026-7-27': '六月十四',
  '2026-7-28': '六月十五',
  '2026-7-29': '六月十六',
  '2026-7-30': '六月十七',
  '2026-7-31': '六月十八',
  '2026-8-1': '六月十九',
  '2026-8-2': '六月二十',
  '2026-8-3': '六月廿一',
  '2026-8-4': '六月廿二',
  '2026-8-5': '六月廿三',
  '2026-8-6': '六月廿四',
  '2026-8-7': '六月廿五',
  '2026-8-8': '六月廿六',
  '2026-8-9': '六月廿七',
  '2026-8-10': '六月廿八',
  '2026-8-11': '六月廿九',
  '2026-8-12': '六月三十',
  '2026-8-13': '七月初一',
  '2026-8-14': '七月初二',
  '2026-8-15': '七月初三',
  '2026-8-16': '七月初四',
  '2026-8-17': '七月初五',
  '2026-8-18': '七月初六',
  '2026-8-19': '七月初七',
  '2026-8-20': '七月初八',
  '2026-8-21': '七月初九',
  '2026-8-22': '七月初十',
}

function getSimpleLunar(y: number, m: number, d: number): string {
  return lunarMap[`${y}-${m}-${d}`] || ''
}
</script>

<template>
  <div class="calendar-doc">
    <div class="doc-header">
      <h1 class="doc-title">
        Calendar 日历视图
      </h1>
      <p class="doc-desc">
        功能完整的日历组件，支持月视图、周视图、日视图切换，事件展示，拖拽调整，农历显示。
      </p>
    </div>

    <!-- 基础用法 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        基础用法
      </h2>
      <p class="doc-section__desc">
        默认展示月视图，通过顶部工具栏切换月份和时间粒度。事件以彩色标签形式展示。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body" style="flex-direction: column; align-items: stretch">
          <!-- 工具栏 -->
          <div class="cal-toolbar">
            <div class="cal-toolbar__left">
              <el-button-group>
                <el-button size="small" @click="prev">
                  ‹
                </el-button>
                <el-button size="small" @click="goToday">
                  今天
                </el-button>
                <el-button size="small" @click="next">
                  ›
                </el-button>
              </el-button-group>
              <span class="cal-toolbar__title">{{ viewTitle }}</span>
            </div>
            <div class="cal-toolbar__right">
              <el-radio-group v-model="viewMode" size="small">
                <el-radio-button value="month">
                  月
                </el-radio-button>
                <el-radio-button value="week">
                  周
                </el-radio-button>
                <el-radio-button value="day">
                  日
                </el-radio-button>
              </el-radio-group>
            </div>
          </div>

          <!-- 月视图 -->
          <div v-if="viewMode === 'month'" class="cal-month">
            <div class="cal-week-header">
              <div v-for="d in weekDays" :key="d" class="cal-week-header__item">
                {{ d }}
              </div>
            </div>
            <div class="cal-month-grid">
              <div
                v-for="(day, i) in monthDays"
                :key="i"
                class="cal-day-cell"
                :class="{
                  'is-other-month': day.isOtherMonth,
                  'is-today': day.isToday,
                  'is-weekend': day.dayOfWeek === 0 || day.dayOfWeek === 6,
                }"
                @click="goDay(day.date)"
              >
                <div class="cal-day-cell__header">
                  <span class="cal-day-cell__num" :class="{ 'cal-day-cell__num--today': day.isToday }">
                    {{ day.day }}
                  </span>
                  <span v-if="day.lunar" class="cal-day-cell__lunar">{{ day.lunar }}</span>
                </div>
                <div class="cal-day-cell__events">
                  <div
                    v-for="(ev, ei) in getEventsForDate(day.date).slice(0, 3)"
                    :key="ei"
                    class="cal-event"
                    :style="{ background: ev.color }"
                    :title="ev.title"
                    @click.stop="openEvent(ev)"
                  >
                    {{ ev.title }}
                  </div>
                  <div
                    v-if="getEventsForDate(day.date).length > 3"
                    class="cal-event-more"
                    @click.stop="goDay(day.date)"
                  >
                    +{{ getEventsForDate(day.date).length - 3 }} 更多
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 周视图 -->
          <div v-else-if="viewMode === 'week'" class="cal-week">
            <div class="cal-week-header cal-week-header--timeline">
              <div class="cal-week-header__gutter" />
              <div
                v-for="d in weekViewDays"
                :key="d.dateStr"
                class="cal-week-header__item"
                :class="{ 'is-today': d.isToday }"
              >
                <div class="cal-week-header__day">
                  {{ d.dayName }}
                </div>
                <div class="cal-week-header__date" :class="{ 'is-today-circle': d.isToday }">
                  {{ d.day }}
                </div>
              </div>
            </div>
            <div class="cal-week-body">
              <div class="cal-time-gutter">
                <div v-for="h in 24" :key="h" class="cal-time-label">
                  {{ String(h - 1).padStart(2, '0') }}:00
                </div>
              </div>
              <div class="cal-week-grid">
                <div v-for="(d, di) in weekViewDays" :key="di" class="cal-week-col">
                  <div
                    v-for="h in 24"
                    :key="h"
                    class="cal-week-hour"
                    :class="{ 'is-current': isCurrentHour(d, h - 1) }"
                  />
                  <!-- 事件条 -->
                  <div
                    v-for="(ev, ei) in getEventsForDate(d.dateStr)"
                    :key="ei"
                    class="cal-week-event"
                    :style="weekEventStyle(ev)"
                    @click="openEvent(ev)"
                  >
                    <span class="cal-week-event__title">{{ ev.title }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 日视图 -->
          <div v-else class="cal-day-view">
            <div class="cal-day-view__header">
              <h2>{{ dayViewTitle }}</h2>
            </div>
            <div class="cal-day-view__events">
              <div v-if="!currentDayEvents.length" class="cal-empty">
                当天暂无事件
              </div>
              <div
                v-for="(ev, ei) in currentDayEvents"
                :key="ei"
                class="cal-day-event"
                :style="{ borderLeftColor: ev.color }"
              >
                <div class="cal-day-event__time">
                  {{ ev.time }}
                </div>
                <div class="cal-day-event__content">
                  <div class="cal-day-event__title">
                    {{ ev.title }}
                  </div>
                  <div v-if="ev.desc" class="cal-day-event__desc">
                    {{ ev.desc }}
                  </div>
                </div>
                <EasyTag :style="{ background: ev.color, color: '#fff', border: 'none' }" size="small">
                  {{ ev.tag }}
                </EasyTag>
              </div>
            </div>
          </div>
        </div>
        <EasyDocCode
          code="<EasyCalendar
  :events=&quot;events&quot;
  :default-view=&quot;'month'&quot;
  @date-click=&quot;handleDateClick&quot;
  @event-click=&quot;handleEventClick&quot;
/>

const events = [
  { id: 1, title: '周会', date: '2026-07-27', time: '09:00', color: '#3b82f6', tag: '会议' },
  { id: 2, title: '项目评审', date: '2026-07-28', time: '14:00', color: '#f59e0b', tag: '评审' },
  ...
]"
        />
      </div>
    </section>

    <!-- 添加事件 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        添加事件
      </h2>
      <p class="doc-section__desc">
        快速向当前选中日期添加自定义事件。
      </p>
      <div class="doc-preview">
        <div class="doc-preview__body" style="justify-content: center">
          <div class="add-event-form">
            <span class="add-event-form__label">当前日期：</span>
            <span class="add-event-form__date">{{ currentDateStr }}</span>
            <EasyInput v-model="newEvent.title" placeholder="事件标题" style="width: 200px" size="small" />
            <el-time-picker
              v-model="newEvent.timeVal"
              placeholder="时间"
              format="HH:mm"
              value-format="HH:mm"
              size="small"
              style="width: 140px"
            />
            <EasySelect
              v-model="newEvent.tag"
              placeholder="标签"
              size="small"
              :options="[{ label: '会议', value: '会议' }, { label: '任务', value: '任务' }, { label: '提醒', value: '提醒' }, { label: '评审', value: '评审' }, { label: '休假', value: '休假' }]"
              style="width: 100px"
            />
            <EasyButton size="small" type="primary" @click="addEvent">
              添加
            </EasyButton>
          </div>
        </div>
        <EasyDocCode
          code="calendar.addEvent({
  title: '新事件',
  date: '2026-07-27',
  time: '14:00',
  tag: '会议',
  color: '#3b82f6'
})"
        />
      </div>
    </section>

    <!-- 事件详情弹窗 -->
    <el-dialog v-model="eventDetail.visible" title="事件详情" width="420px">
      <EasyDescriptions :column="1" :bordered="true">
        <EasyDescriptionsItem label="标题">
          {{ eventDetail.title }}
        </EasyDescriptionsItem>
        <EasyDescriptionsItem label="日期">
          {{ eventDetail.date }}
        </EasyDescriptionsItem>
        <EasyDescriptionsItem label="时间">
          {{ eventDetail.time }}
        </EasyDescriptionsItem>
        <EasyDescriptionsItem label="标签">
          <EasyTag :style="{ background: eventDetail.color, color: '#fff', border: 'none' }" size="small">
            {{ eventDetail.tag }}
          </EasyTag>
        </EasyDescriptionsItem>
        <EasyDescriptionsItem v-if="eventDetail.desc" label="描述">
          {{ eventDetail.desc }}
        </EasyDescriptionsItem>
      </EasyDescriptions>
    </el-dialog>

    <!-- API 文档 -->
    <section class="doc-section">
      <h2 class="doc-section__title">
        API
      </h2>
      <h3 class="doc-subtitle">
        Props
      </h3>
      <div class="doc-table">
        <table>
          <thead>
            <tr>
              <th>属性名</th>
              <th>说明</th>
              <th>类型</th>
              <th>默认值</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>events</td>
              <td>事件数据</td>
              <td><code>CalendarEvent[]</code></td>
              <td><code>[]</code></td>
            </tr>
            <tr>
              <td>default-view</td>
              <td>默认视图</td>
              <td><code>'month' | 'week' | 'day'</code></td>
              <td><code>'month'</code></td>
            </tr>
            <tr>
              <td>locale</td>
              <td>语言</td>
              <td><code>string</code></td>
              <td><code>'zh-CN'</code></td>
            </tr>
            <tr>
              <td>show-lunar</td>
              <td>显示农历</td>
              <td><code>boolean</code></td>
              <td><code>false</code></td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3 class="doc-subtitle">
        CalendarEvent
      </h3>
      <div class="doc-table">
        <table>
          <thead>
            <tr>
              <th>字段</th>
              <th>说明</th>
              <th>类型</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>id</td>
              <td>事件唯一标识</td>
              <td><code>string | number</code></td>
            </tr>
            <tr>
              <td>title</td>
              <td>事件标题</td>
              <td><code>string</code></td>
            </tr>
            <tr>
              <td>date</td>
              <td>日期（YYYY-MM-DD）</td>
              <td><code>string</code></td>
            </tr>
            <tr>
              <td>time</td>
              <td>时间（HH:mm）</td>
              <td><code>string</code></td>
            </tr>
            <tr>
              <td>color</td>
              <td>事件颜色</td>
              <td><code>string</code></td>
            </tr>
            <tr>
              <td>tag</td>
              <td>事件分类标签</td>
              <td><code>string</code></td>
            </tr>
            <tr>
              <td>desc</td>
              <td>事件描述</td>
              <td><code>string</code></td>
            </tr>
          </tbody>
        </table>
      </div>
      <h3 class="doc-subtitle">
        Events
      </h3>
      <div class="doc-table">
        <table>
          <thead>
            <tr>
              <th>事件名</th>
              <th>说明</th>
              <th>回调参数</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>date-click</td>
              <td>点击日期时触发</td>
              <td><code>(date: string)</code></td>
            </tr>
            <tr>
              <td>event-click</td>
              <td>点击事件时触发</td>
              <td><code>(event: CalendarEvent)</code></td>
            </tr>
            <tr>
              <td>view-change</td>
              <td>视图切换时触发</td>
              <td><code>(view: string)</code></td>
            </tr>
            <tr>
              <td>date-change</td>
              <td>月份切换时触发</td>
              <td><code>(year: number, month: number)</code></td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>

<style scoped lang="scss">
.calendar-doc {
  padding: 8px 0 40px;
}
.doc-header {
  margin-bottom: 36px;
}
.doc-title {
  font-size: 26px;
  font-weight: 700;
  margin: 0 0 8px;
  color: var(--el-text-color-primary);
}
.doc-desc {
  font-size: 14px;
  color: var(--el-text-color-secondary);
  margin: 0;
  line-height: 1.6;
  code {
    background: var(--el-color-primary-light-9);
    color: var(--el-color-primary);
    padding: 1px 6px;
    border-radius: 4px;
    font-size: 13px;
  }
}
.doc-section {
  margin-bottom: 32px;
  .doc-section__title {
    font-size: 18px;
    font-weight: 600;
    margin: 0 0 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid var(--el-border-color-lighter);
    color: var(--el-text-color-primary);
  }
  .doc-section__desc {
    font-size: 14px;
    color: var(--el-text-color-secondary);
    margin: 0 0 16px;
    line-height: 1.6;
    code {
      background: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
      padding: 1px 6px;
      border-radius: 4px;
      font-size: 13px;
    }
  }
}
.doc-preview {
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 12px;
  overflow: hidden;
  background: var(--el-bg-color-overlay);
  .doc-preview__body {
    display: flex;
    padding: 20px;
    gap: 16px;
    align-items: flex-start;
  }
}
.doc-code {
  border-top: 1px solid var(--el-border-color-lighter);
  background: var(--el-fill-color-light);
  padding: 16px 20px;
  overflow-x: auto;
  pre {
    margin: 0;
    font-size: 13px;
    line-height: 1.6;
    code {
      color: var(--el-text-color-primary);
      font-family: 'Fira Code', 'Cascadia Code', monospace;
    }
  }
}
.doc-subtitle {
  font-size: 15px;
  font-weight: 600;
  margin: 20px 0 10px;
  color: var(--el-text-color-primary);
}
.doc-table {
  overflow-x: auto;
  margin-bottom: 20px;
  table {
    width: 100%;
    border-collapse: collapse;
    font-size: 13px;
  }
  th {
    background: var(--el-fill-color-light);
    padding: 8px 14px;
    text-align: left;
    border: 1px solid var(--el-border-color-lighter);
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
  td {
    padding: 8px 14px;
    border: 1px solid var(--el-border-color-lighter);
    color: var(--el-text-color-regular);
    code {
      background: var(--el-color-primary-light-9);
      color: var(--el-color-primary);
      padding: 1px 6px;
      border-radius: 3px;
      font-size: 12px;
    }
  }
}

// ===== 日历工具栏 =====
.cal-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  .cal-toolbar__left {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .cal-toolbar__title {
    font-size: 18px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
  .cal-toolbar__right {
    display: flex;
    align-items: center;
    gap: 12px;
  }
}

// ===== 月视图 =====
.cal-week-header {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  text-align: center;
  .cal-week-header__item {
    padding: 8px 0;
    font-size: 13px;
    color: var(--el-text-color-secondary);
    font-weight: 500;
  }
}

.cal-month-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  border-top: 1px solid var(--el-border-color-lighter);
  border-left: 1px solid var(--el-border-color-lighter);
}

.cal-day-cell {
  min-height: 100px;
  border-right: 1px solid var(--el-border-color-lighter);
  border-bottom: 1px solid var(--el-border-color-lighter);
  padding: 4px 6px;
  cursor: pointer;
  transition: background 0.15s;
  &:hover {
    background: var(--el-fill-color-light);
  }
  &.is-other-month {
    opacity: 0.35;
  }
  &.is-today {
    background: var(--el-color-primary-light-9);
  }
  .cal-day-cell__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2px;
  }
  .cal-day-cell__num {
    font-size: 14px;
    font-weight: 500;
    color: var(--el-text-color-primary);
    &.cal-day-cell__num--today {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: var(--el-color-primary);
      color: #fff;
    }
  }
  .cal-day-cell__lunar {
    font-size: 10px;
    color: var(--el-text-color-placeholder);
  }
  .cal-day-cell__events {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
}

.cal-event {
  font-size: 11px;
  color: #fff;
  padding: 1px 6px;
  border-radius: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: opacity 0.15s;
  &:hover {
    opacity: 0.85;
  }
}

.cal-event-more {
  font-size: 11px;
  color: var(--el-color-primary);
  cursor: pointer;
  padding-left: 6px;
}

// ===== 周视图 =====
.cal-week-header--timeline {
  display: flex;
  .cal-week-header__gutter {
    width: 60px;
    flex-shrink: 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
  }
  .cal-week-header__item {
    flex: 1;
    text-align: center;
    padding: 8px 0;
    border-bottom: 1px solid var(--el-border-color-lighter);
    &.is-today {
      background: var(--el-color-primary-light-9);
    }
  }
  .cal-week-header__day {
    font-size: 12px;
    color: var(--el-text-color-secondary);
  }
  .cal-week-header__date {
    font-size: 20px;
    font-weight: 600;
    color: var(--el-text-color-primary);
    &.is-today-circle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--el-color-primary);
      color: #fff;
      font-size: 18px;
    }
  }
}

.cal-week-body {
  display: flex;
  max-height: 500px;
  overflow-y: auto;
}

.cal-time-gutter {
  width: 60px;
  flex-shrink: 0;
}

.cal-time-label {
  height: 48px;
  display: flex;
  align-items: flex-start;
  justify-content: flex-end;
  padding-right: 8px;
  font-size: 11px;
  color: var(--el-text-color-placeholder);
  margin-top: -8px;
}

.cal-week-grid {
  display: flex;
  flex: 1;
  border-left: 1px solid var(--el-border-color-lighter);
}

.cal-week-col {
  flex: 1;
  position: relative;
  border-right: 1px solid var(--el-border-color-lighter);
}

.cal-week-hour {
  height: 48px;
  border-bottom: 1px solid var(--el-border-color-extra-light);
  &.is-current {
    background: var(--el-color-danger-light-9);
  }
}

.cal-week-event {
  position: absolute;
  left: 2px;
  right: 2px;
  height: 22px;
  border-radius: 3px;
  padding: 0 6px;
  font-size: 11px;
  color: #fff;
  cursor: pointer;
  display: flex;
  align-items: center;
  overflow: hidden;
  z-index: 1;
  .cal-week-event__title {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}

// ===== 日视图 =====
.cal-day-view {
  width: 100%;
  .cal-day-view__header {
    text-align: center;
    margin-bottom: 16px;
    h2 {
      margin: 0;
      font-size: 20px;
      color: var(--el-text-color-primary);
    }
  }
  .cal-day-view__events {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
}

.cal-empty {
  text-align: center;
  padding: 40px;
  color: var(--el-text-color-placeholder);
  font-size: 14px;
}

.cal-day-event {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: var(--el-fill-color-lighter);
  border-radius: 8px;
  border-left: 3px solid var(--el-color-primary);
  cursor: pointer;
  transition: box-shadow 0.15s;
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
  .cal-day-event__time {
    font-size: 13px;
    color: var(--el-text-color-secondary);
    min-width: 48px;
  }
  .cal-day-event__content {
    flex: 1;
  }
  .cal-day-event__title {
    font-size: 14px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
  .cal-day-event__desc {
    font-size: 12px;
    color: var(--el-text-color-secondary);
    margin-top: 2px;
  }
}

// ===== 添加事件表单 =====
.add-event-form {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  .add-event-form__label {
    font-size: 13px;
    color: var(--el-text-color-secondary);
  }
  .add-event-form__date {
    font-size: 13px;
    font-weight: 600;
    color: var(--el-text-color-primary);
  }
}
</style>
