<script setup lang="ts">
import { useSlots } from 'vue'

import EasyIcon from '../../icon'
import { useDescriptions } from './use-descriptions'

defineOptions({ name: 'EasyDescriptions' })

const props = withDefaults(
  defineProps<{
    title?: string
    column?: number
    colon?: boolean
    bordered?: boolean
    layout?: 'horizontal' | 'vertical'
    size?: 'small' | 'default' | 'large'
    labelWidth?: string | number
    labelAlign?: 'left' | 'right' | 'center'
  }>(),
  {
    title: '',
    column: 3,
    colon: false,
    bordered: false,
    layout: 'horizontal',
    size: 'default',
    labelWidth: '',
    labelAlign: 'left',
  },
)

const slots = useSlots()

// ──── 布局 / 样式派生（插槽解析、行分组、行列索引、类名、CSS 变量）────
const {
  items,
  rows,
  lastRowPadding,
  getItemClass,
  descriptionsClass,
  cssVars,
  labelCellStyle,
} = useDescriptions(props, slots)
</script>

<template>
  <div class="easy-descriptions" :class="descriptionsClass" :style="cssVars">
    <!-- 标题栏 -->
    <div v-if="title || $slots.title || $slots.extra" class="easy-descriptions__header">
      <div class="easy-descriptions__title">
        <slot name="title">
          {{ title }}
        </slot>
      </div>
      <div v-if="$slots.extra" class="easy-descriptions__extra">
        <slot name="extra" />
      </div>
    </div>

    <!-- 内容表格 (水平布局) -->
    <div v-if="layout === 'horizontal'" class="easy-descriptions__body">
      <table class="easy-descriptions__table">
        <tbody>
          <tr v-for="(row, rowIndex) in rows" :key="rowIndex" class="easy-descriptions__row">
            <template v-for="(cell, cellIndex) in row" :key="cellIndex">
              <td class="easy-descriptions__label" :style="labelCellStyle">
                <EasyIcon v-if="cell.icon" :name="cell.icon" :size="13" class="label-icon" />
                <span class="label-text">{{ cell.label }}</span>
              </td>
              <td class="easy-descriptions__content" :colspan="cell.span * 2 - 1">
                <component :is="() => cell.children" />
              </td>
            </template>
            <!-- 末行补齐空白 -->
            <template v-if="rowIndex === rows.length - 1 && lastRowPadding > 0">
              <td class="easy-descriptions__label is-empty" />
              <td class="easy-descriptions__content" :colspan="lastRowPadding * 2 - 1" />
            </template>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 内容网格 (垂直布局) -->
    <div v-else class="easy-descriptions__body easy-descriptions__body--vertical">
      <div class="easy-descriptions__grid">
        <div
          v-for="(item, idx) in items" :key="idx" class="easy-descriptions__item" :class="getItemClass(idx)"
          :style="{ gridColumn: `span ${item.span}` }"
        >
          <div class="easy-descriptions__label easy-descriptions__label--vertical">
            <EasyIcon v-if="item.icon" :name="item.icon" :size="13" class="label-icon" />
            <span class="label-text">{{ item.label }}</span>
          </div>
          <div class="easy-descriptions__content easy-descriptions__content--vertical">
            <component :is="() => item.children" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 descriptions-style.scss，含 html.dark 暗色覆盖） -->
<style scoped src="./descriptions-style.scss" lang="scss"></style>
