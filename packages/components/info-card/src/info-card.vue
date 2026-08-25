<script setup lang="ts">
import type { InfoCardEmits, InfoCardProps } from './types'

import EasyIcon from '../../icon'
import { useInfoCardStyle } from './use-card-style'
import { useInfoCard } from './use-info-card'

// 保持对外类型导出兼容（原内联定义在 info-card.vue）
export type { InfoCardDescItem, InfoCardEmits, InfoCardProps, InfoCardStatusType } from './types'

defineOptions({
  name: 'EasyInfoCard',
})

const props = withDefaults(
  defineProps<InfoCardProps>(),
  {
    image: '',
    icon: '',
    iconSize: 16,
    description: () => [],
    status: '',
    statusType: 'default',
    backgroundColor: '',
    textColor: '',
    titleColor: '',
    descriptionColor: '',
    statusBackgroundColor: '',
    statusTextColor: '',
    clickable: false,
    bordered: true,
    radius: 10,
  },
)

const emit = defineEmits<InfoCardEmits>()

// ──── 描述信息归一化 + 点击/图片兜底事件 ────
const { descriptionList, handleClick, handleImageError } = useInfoCard(props, emit)

// ──── 状态类名 + 自定义配色行内样式 ────
const { cardClass, cardStyle, titleStyle, iconStyle, descStyle, dotStyle, statusStyle } = useInfoCardStyle(props)
</script>

<template>
  <div class="easy-info-card" :class="cardClass" :style="cardStyle" @click="handleClick">
    <!-- 左侧图片 -->
    <div v-if="image" class="easy-info-card__image">
      <img :src="image" :alt="title" @error="handleImageError">
    </div>

    <!-- 中间内容区 -->
    <div class="easy-info-card__content">
      <!-- 标题行：图标 + 标题 + 状态标签 -->
      <div class="easy-info-card__header">
        <div class="easy-info-card__title-wrap">
          <span v-if="icon" class="easy-info-card__icon" :style="iconStyle">
            <EasyIcon :name="icon" :size="iconSize" />
          </span>
          <span class="easy-info-card__title" :style="titleStyle">{{ title }}</span>
        </div>
        <span
          v-if="status" class="easy-info-card__status" :class="[`easy-info-card__status--${statusType}`]"
          :style="statusStyle"
        >
          {{ status }}
        </span>
      </div>

      <!-- 描述信息列表 -->
      <div class="easy-info-card__body">
        <div v-for="(item, index) in descriptionList" :key="index" class="easy-info-card__desc-item" :style="descStyle">
          <EasyIcon v-if="item.icon" :name="item.icon" :size="12" class="easy-info-card__desc-icon" :style="descStyle" />
          <span v-else class="easy-info-card__desc-dot" :style="dotStyle" />
          <span class="easy-info-card__desc-text">{{ item.text }}</span>
        </div>
      </div>
    </div>

    <!-- 右侧额外操作区 -->
    <div v-if="$slots.action" class="easy-info-card__action">
      <slot name="action" />
    </div>
  </div>
</template>

<!-- 组件核心样式（scoped，独立维护在 info-card-style.scss） -->
<style scoped src="./info-card-style.scss" lang="scss"></style>
